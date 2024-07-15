import configStore from "../../models/configStore";
import closeFullscreen from "./closeFullscreen";
import openFullscreen from "./openFullscreen";
/**
 * Register to config events to watch isFullscreen
 * attribute, and fire open/close on change.
 */
const register = () => {
  configStore.subscribe(
    (state) => [state.isFullscreen, state.mapReady],
    ([isFullscreen, isReady]) => {
      if (!isReady) return;

      if (isFullscreen) {
        openFullscreen();
      } else {
        closeFullscreen();
      }
    }
  );
};
export default register;
