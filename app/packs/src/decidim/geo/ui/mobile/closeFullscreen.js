import configStore from "../../models/configStore";

const closeFullscreen = () => {
  const { map } = configStore.getState();

  map.toggleFullscreen();
  $("body").removeClass("noscroll");
};

export default closeFullscreen;
