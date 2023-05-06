const { createMarker } = require(".");

const createParticipatoryProcessLayer = ({ participatoryProcess }) => {
  var components = participatoryProcess.components;

  if (components && components.length > 0) {
    var meetingsComponent = components.find(
      ({ meetings }) => meetings && meetings.nodes.length > 0
    );

    if (meetingsComponent) {
      let markers = [];

      meetingsComponent.meetings.nodes.forEach(node => {
        const marker = createMarker({
          title: node.title.translation,
          description: node.description.translation,
          location: [node.coordinates.latitude, node.coordinates.longitude],
          href: `/processes/${participatoryProcess.slug}/f/${participatoryProcess.components[0].id}/meetings/${node.id}`,
        });
        markers.push(marker);
      });

      if (markers.length > 0) return L.layerGroup(markers);
    }
  }
  return null;
};

export default createParticipatoryProcessLayer;
