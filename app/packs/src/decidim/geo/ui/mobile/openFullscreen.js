import configStore from "../../stores/configStore";

const openFullscreen = () => {
  const { map } = configStore.getState();
  map.toggleFullscreen();
  $("body").addClass("noscroll");
  $("#DecidimGeoContainer").addClass("decidimGeo__container--fullscreen");
};

export default openFullscreen;
