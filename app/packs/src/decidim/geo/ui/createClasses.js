
const createClasses = (classname, modifiers = []) =>
  [classname, ...modifiers.filter(Boolean).map(modifier => `${classname}--${modifier}`)].join(
    " "
  );

export default createClasses;