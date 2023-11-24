export const createDom = (tag, classes, container = undefined) => L.DomUtil.create(
    tag,
    classes,
    container
  );