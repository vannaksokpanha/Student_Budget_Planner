// Single API base for the whole app. Built from wherever the page was loaded
// from, so it works from any device without config: on the laptop it resolves
// to localhost, on a phone on the same Wi-Fi it resolves to the laptop's IP.
export const API = `http://${window.location.hostname}:3000/api`;
