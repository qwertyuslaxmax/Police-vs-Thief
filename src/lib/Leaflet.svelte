<script lang='ts'>
    import { onDestroy, onMount, setContext } from 'svelte';
    import L from 'leaflet';
    import "leaflet/dist/leaflet.css";

    export let bounds: L.LatLngBoundsExpression | undefined = undefined;
    export let view: L.LatLngExpression = [51.505, -0.09]; // Default to London
    export let zoom: number = 13; // Default zoom level

    let map: L.Map | undefined;
    let mapElement: HTMLDivElement;

    onMount(() => {
        if (!mapElement) return; // Ensure the element exists

        map = new L.Map(mapElement);
        map.doubleClickZoom.disable();

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> | &copy; <a href="https://carto.com/attributions">CartoDB</a>'
        }).addTo(map);

        if (bounds) {
            map.fitBounds(bounds);
        } else if (view && zoom) {
            map.setView(view, zoom);
        }
    });

    onDestroy(() => {
        map?.remove();
        map = undefined;
    });

    setContext('map', {
        getMap: () => map
    });

    $: if (map) {
        map.invalidateSize();
    }
</script>

<style>
    div {
        width: 100%;
        height: 100vh; /* Ensure full height */
    }
</style>

<div class="w-full h-full" bind:this={mapElement}>
    {#if map}
        <slot />
    {/if}  
</div>
