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

				(layer as L.Path).setStyle(
				isAvailable
					? {
						color: '#6b9ea0',
						fillColor: '#cfe4e2',
						fillOpacity: 0.55,
						weight: 1.5,
						opacity: 1
					}
					: {
						opacity: 0,
						fillOpacity: 0,
						weight: 0,
						interactive: false
					}
				);

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

			if (!availableCountries.includes(code)) return;

			const isSelected = tempSelectedCode === code;

			(layer as L.Path).setStyle({
				fillColor: isSelected ? '#66ff66' : '#cfe4e2',
				fillOpacity: isSelected ? 0.7 : 0.55
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
