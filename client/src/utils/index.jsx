export const throwCustomError = (message, status) => {
  const error = new Error(message);
  error.status = status; // from stack overflow and couldn't find on mdn. Alternative way?
  throw error;
};
