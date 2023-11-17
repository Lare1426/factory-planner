export const round = (num, decimals) => {
  return Math.round((num + Number.EPSILON) * 10 ** decimals) / 10 ** decimals;
};
