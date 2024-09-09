export const getCurrentTimeSeconds = () => {
  return Math.floor(Date.now() / 1000);
};

export const getCurrentTimeDate = (currentTimeSeconds) => {
  return new Date(currentTimeSeconds * 1000).toISOString().slice(0, 10);
};

export const getCurrentTimeString = () => {
  const currentTimeSeconds = Math.floor(Date.now() / 1000);
  const dateObject = new Date(currentTimeSeconds * 1000);
  const time = dateObject.toString().slice(16, 24);
  const date = dateObject.toISOString().slice(0, 10);
  return `${date}_${time}`;
};
