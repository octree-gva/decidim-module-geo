import configStore from '../../models/configStore'


const openFullscreen = () => {
    const {map} = configStore.getState();
    map.toggleFullscreen();
    $("body").addClass("noscroll")
}

export default openFullscreen;