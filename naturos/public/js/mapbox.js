/* eslint-disable */
// console.log('hello');

export const displayMap = locations => {
  // const locations = JSON.parse(
  //   document.getElementById('map').dataset.locations
  // );
  // // console.log(locations);

  mapboxgl.accessToken =
    'pk.eyJ1IjoicmlwYWw5NCIsImEiOiJjbHJnOWo3cngwZG02MmxvMmZvcmdndXB4In0.WQ49g1d8U00EW8accKFueQ';
  const map = new mapboxgl.Map({
    container: 'map', // container ID
    scrollZoom: false
    //   center: [-74.5, 40], // starting position [lng, lat]
    //   zoom: 1, // starting zoom
    //   interactive: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    //create marker
    const el = document.createElement('div');
    el.className = 'marker';

    //add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    //popup
    //when anywhere click on map  then popup is closed

    new mapboxgl.Popup({
      offset: 35
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    //extends map
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  });
};
