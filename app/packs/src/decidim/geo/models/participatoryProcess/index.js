const { createMarker } = require("../../ui");

export async function getMarkers(participatoryProcess) {
  var components = participatoryProcess.components;

  if (components && components.length > 0) {
    var meetingsComponent = components.find(
      ({ meetings }) => meetings && meetings.nodes.length > 0
    );

    if (meetingsComponent) {
      const markers = meetingsComponent.meetings.nodes.map(node => {
        if (node.location) {
          var marker = createMarker({
            title: node.title.translation,
            description: node.shortDescription.translation,
            location: node.location,
            image: node.image,
            href: node.href,
          });
        }
      });
    }
  }
  return [];
}
