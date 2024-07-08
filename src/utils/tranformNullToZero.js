export const transformNullToZero = (field) => {
  return field === null || field === undefined ? 0 : field;
};
