<script lang="ts">
	import { onMount, afterUpdate, getContext } from 'svelte';
	import type { Map } from 'leaflet';
	import L from 'leaflet';

	export let availableCountries: string[] = [];
	export let onSelect: (code: string) => void;

	let geoJsonLayer: L.GeoJSON | null = null;
	let tempSelectedCode: string | null = null; // track first click (highlight)
	const { getMap } = getContext('map') as { getMap: () => Map | undefined };

	onMount(async () => {
		const map = getMap();
		if (!map) return;

		const response = await fetch('/custom.geo.json');
		const geojsonData = await response.json();

		geoJsonLayer?.remove();

		geoJsonLayer = L.geoJSON(geojsonData, {
			onEachFeature(feature, layer) {
				const code = feature.properties?.adm0_a3;
				const isAvailable = availableCountries.includes(code);

				(layer as L.Path).setStyle({
					color: isAvailable ? '#6b9ea0' : '#b5b5b5', // border
					fillColor: isAvailable ? '#cfe4e2' : '#eeeeee',
					fillOpacity: isAvailable ? 0.55 : 0.25,
					weight: isAvailable ? 1.5 : 0.8,
					opacity: 1
				});

				if (!isAvailable) return;

				// Handle highlighting and double-click-like selection
				layer.on('click', () => {
					if (tempSelectedCode === code) {
						// Second click → submit
						onSelect(code);
						tempSelectedCode = null;
						resetHighlight(); // optional: reset all highlights
					} else {
						// First click → highlight
						tempSelectedCode = code;
						highlightSelected(code);
					}
				});

				layer.on('mouseover', () => {
					if (tempSelectedCode !== code) {
						(layer as L.Path).setStyle({ fillOpacity: 0.7 });
					}
				});

				layer.on('mouseout', () => {
					if (tempSelectedCode !== code) {
						(layer as L.Path).setStyle({
							fillOpacity: 0.55
						});
					}
				});
			}
		}).addTo(map);

		// Click outside the map → clear selection
		map.on('click', (e) => {
			if (!(e.originalEvent.target as HTMLElement).closest('.leaflet-interactive')) {
				tempSelectedCode = null;
				resetHighlight();
			}
		});
	});

	afterUpdate(() => {
		if (!geoJsonLayer) return;

		geoJsonLayer.eachLayer((layer) => {
			const feature = (layer as any).feature;
			const code = feature?.properties?.adm0_a3;
			const isAvailable = availableCountries.includes(code);

			const isSelected = tempSelectedCode === code;

			(layer as L.Path).setStyle({
				color: '#6b9ea0',
				fillColor: isSelected ? '#66ff66' : (isAvailable ? '#cfe4e2' : '#eeeeee'),
				fillOpacity: isSelected ? 0.7 : (isAvailable ? 0.55 : 0.25),
				weight: isAvailable ? 1.5 : 0.8,
				opacity: 1
			});
		});
	});

	function highlightSelected(code: string) {
		geoJsonLayer?.eachLayer((layer) => {
			const c = (layer as any).feature?.properties?.adm0_a3;
			const isAvailable = availableCountries.includes(c);
			if (!isAvailable) return;

			(layer as L.Path).setStyle({
				fillColor: c === code ? '#66ff66' : '#cfe4e2',
				fillOpacity: c === code ? 0.7 : 0.55
			});
		});
	}

	function resetHighlight() {
		geoJsonLayer?.eachLayer((layer) => {
			const feature = (layer as any).feature;
			const code = feature?.properties?.adm0_a3;
			const isAvailable = availableCountries.includes(code);
			if (!isAvailable) return;

			(layer as L.Path).setStyle({
				fillColor: '#cfe4e2',
				fillOpacity: 0.55
			});
		});
	}
</script>
