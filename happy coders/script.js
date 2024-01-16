"use strict";

navigator.geolocation.getCurrentPosition(function (position) {
  const map = L.map("map").setView([49.0022563, 12.1003174], 18);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  L.marker([49.0022563, 12.1003174])
    .addTo(map)
    .bindPopup("Happy Coder's Office")
    .openPopup();
});
