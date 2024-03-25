export const getNewPlan = async (product, amount) => {
  const response = await fetch(`/api/plan/new/${product}?amount=${amount}`);
  return response.json();
};

export const getPlanById = async (id) => {
  const response = await fetch(`/api/plan/${id}`);
  return response.json();
};

export const authorize = async (username, password) => {
  const response = await fetch(`/api/authorize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return response.status();
};
