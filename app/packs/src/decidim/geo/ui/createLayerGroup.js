const createLayerGroup = (collection, createEntityMarkers) => {
  var layerGroup = [];
  collection.forEach(entity => {
    var markers = createEntityMarkers(entity);
    if (markers.length > 0) {
      markers.forEach(marker => layerGroup.push(marker));
    }
  });
  return L.layerGroup(layerGroup);
};

export default createLayerGroup;
