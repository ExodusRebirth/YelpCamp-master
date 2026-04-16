
mapboxgl.accessToken = maptoken;
const map = new mapboxgl.Map({
    container: 'map', 
    style: 'mapbox://styles/mapbox/standard',
    center: campground.geometry.coordinates,
    zoom: 9, 


});


new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(new mapboxgl.Popup({ closeOnClick : false, closeButton: false, offset: 35})
    .setHTML(`<h4>${campground.sitename} </h4><p> ${campground.city},  ${campground.state}`))
    .addTo(map);

