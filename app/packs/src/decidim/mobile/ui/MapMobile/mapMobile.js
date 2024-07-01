
function showDecidimGeo() {
  const decidimGeoElement = document.querySelector('.decidimgeo__map');
  if (decidimGeoElement) {
    decidimGeoElement.classList.add("decidimgeo__map--fullscreen")
  } else {
    console.error('Can\'t find .decidimgeo__map ');
  }
}
window.addEventListener('load', function() {
  // display fullscreen map on click
  document.getElementById('DecidimGeoContainer').addEventListener('click', showDecidimGeo);
});