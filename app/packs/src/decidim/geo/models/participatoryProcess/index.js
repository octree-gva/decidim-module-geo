export function getNodes(participatoryProcess) {
    var components = participatoryProcess.components;
  
    if (components && components.length > 0) {
      var meetingsComponent = components.find(
        ({ meetings }) => meetings && meetings.nodes.length > 0
      );
  
      if (meetingsComponent) {
        return meetingsComponent.meetings.nodes;
      }
    }
    return [];
  }