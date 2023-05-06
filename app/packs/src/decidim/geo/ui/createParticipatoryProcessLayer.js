const { createMeetingMarker } = require(".");

const createParticipatoryProcessLayer = ({ participatoryProcess }) => {
  let markers = [];
  var components = participatoryProcess.components;

  if (components && components.length > 0) {
    var meetingsComponent = components.find(
      ({ meetings }) => meetings && meetings.nodes.length > 0
    );

    if (meetingsComponent) {
      meetingsComponent.meetings.nodes.forEach(node => {
        const marker = createMeetingMarker({
          title: node.title.translation,
          description: node.description.translation,
          location: [46.531342, 6.623329],
          href: `/processes/${participatoryProcess.slug}/f/${participatoryProcess.components[0].id}/meetings/${node.id}`,
        });
        markers.push(marker);
      });

      var proposalsComponent = components.find(
        ({ proposals }) => proposals && proposals.nodes.length > 0
      );

      if (proposalsComponent) {
        proposalsComponent.proposals.nodes.forEach(node => {});
      }

      var debatesComponent = components.find(
        ({ debates }) => debates && debates.nodes.length > 0
      );

      if (debatesComponent) {
        debatesComponent.debates.nodes.forEach(node => {});
      }
    }

    if (markers.length > 0) return L.layerGroup(markers);
  }
  return null;
};

export default createParticipatoryProcessLayer;
