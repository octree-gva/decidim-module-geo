import configStore from "../../stores/configStore";
import closeFullscreen from "./closeFullscreen";
import openFullscreen from "./openFullscreen";
/**
 * Register to config events to watch isFullscreen
 * attribute, and fire open/close on change.
 */
const registerMobile = () => {
  const [mobileBtn] = document.getElementsByClassName(
    "decidimGeo__mobile_btn__mobile_btn"
  );
  if (!mobileBtn)
    throw new Error("Can't find mobile button .decidimGeo__mobile_btn__mobile_btn");

  mobileBtn.addEventListener("click", () => {
    configStore.setState(() => ({ isFullscreen: true }));
  });
  configStore.subscribe(
    (state) => [state.isFullscreen, state.mapReady],
    ([isFullscreen, mapReady], [wasFullscreen, wasMapReady]) => {
      const { map } = configStore.getState();
      if (mapReady && !wasMapReady) {
        map.on("enterFullscreen", () => {
          setTimeout(() => map.invalidateSize(), 64);
        });
        map.on("exitFullscreen", () => {
          setTimeout(() => map.invalidateSize(), 64);
          configStore.setState(() => ({ isFullscreen: false, isAsideOpen: false }));
        });
      }
      if (isFullscreen === wasFullscreen) {
        console.warn("no change, was fullscreen=", wasFullscreen);
        return;
      }
      if (isFullscreen) {
        console.warn("open fullscreen");
        openFullscreen();
      } else {
        closeFullscreen();
      }
      map.invalidateSize();
    }
  );
};
export default registerMobile;
