export const getCurrentTimeSeconds = () => {
  return Math.floor(Date.now() / 1000);
};

export const getCurrentTimeDate = (currentTimeSeconds) => {
  return new Date(currentTimeSeconds * 1000).toISOString().slice(0, 10);
};
