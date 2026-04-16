



mapboxgl.accessToken = maptoken;
const map = new mapboxgl.Map({
    container: 'cluster-map',
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: 'mapbox://styles/mapbox/standard',
    config: {
        basemap: {
            theme: 'monochrome',
            lightPreset: 'night'
        }
    },
    center: [-96.5917, 40.6699],
    zoom: 3.8,
    minZoom: 3.8,
    maxBounds: [-125.0011, 24.9493, -66.9326, 49.5904]
});

map.on('load', () => {
    const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });
   




    map.addSource('campground', {
        type: 'geojson',
        generateId: true,
        data: mapData,
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    });

    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'campground',
        filter: ['has', 'point_count'],
        paint: {

            'circle-color': [
                'step',
                ['get', 'point_count'],
                '#8aa29e',
                100,
                '#f1f075',
                750,
                '#f28cb1'
            ],
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,
                100,
                30,
                750,
                40
            ],
            'circle-emissive-strength': 1
        }
    });

    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'campground',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': ['get', 'point_count_abbreviated'],
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        }
    });

    map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'campground',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-color': '#8fb78a',
            'circle-radius': 7,
            'circle-stroke-width': 3,
            'circle-stroke-color': '#f2f6f0',
            'circle-emissive-strength': 1
        }
    });

    // inspect a cluster on click
    map.addInteraction('click-clusters', {
        type: 'click',
        target: { layerId: 'clusters' },
        handler: (e) => {
            const features = map.queryRenderedFeatures(e.point, {
                layers: ['clusters']
            });
            const clusterId = features[0].properties.cluster_id;
            map.getSource('campground').getClusterExpansionZoom(
                clusterId,
                (err, zoom) => {
                    if (err) return;

                    map.easeTo({
                        center: features[0].geometry.coordinates,
                        zoom: zoom
                    });
                }
            );

        }

    });

   map.addControl(new mapboxgl.NavigationControl());

    map.addInteraction('click-unclustered-point', {
        type: 'click',
        target: { layerId: 'unclustered-point' },
        handler: (e) => {

            const url = e.feature.properties.url;
            if (url) {
                window.location.href = `campgrounds/${url}`;
            }

        }

    });

    // Change the cursor to a pointer when the mouse is over a cluster of POIs.
    map.addInteraction('clusters-mouseenter', {
        type: 'mouseenter',
        target: { layerId: 'clusters' },
        handler: () => {
            map.getCanvas().style.cursor = 'pointer';

        }
    });

    // Change the cursor back to a pointer when it stops hovering over a cluster of POIs.
    map.addInteraction('clusters-mouseleave', {
        type: 'mouseleave',
        target: { layerId: 'clusters' },
        handler: () => {
            map.getCanvas().style.cursor = '';

        }
    });

    // Change the cursor to a pointer when the mouse is over an individual POI.
    map.addInteraction('unclustered-mouseenter', {
        type: 'mouseenter',
        target: { layerId: 'unclustered-point' },
        handler: (e) => {
            const coordinates = e.feature.geometry.coordinates.slice();
            const image = e.feature.properties.image;
            const sitename = e.feature.properties.sitename;
            map.getCanvas().style.cursor = 'pointer';
            popup
                .setLngLat(coordinates)
                .setHTML(
                    `<img class="justify-content-center" src='${image}'style="max-width:140px;max-height:180px;"></img>${sitename}<br>click to view</br>`)
                .addTo(map);
        }
    });

    // Change the cursor back to a pointer when it stops hovering over an individual POI.
    map.addInteraction('unclustered-mouseleave', {
        type: 'mouseleave',
        target: { layerId: 'unclustered-point' },
        handler: () => {
            map.getCanvas().style.cursor = '';
            popup.remove()
        }
    });
});
