export const getNewPlan = async (product, amount) => {
  const response = await fetch(`/api/plan/new/${product}?amount=${amount}`);
  return response.json();
};

export const getPlanById = async (id) => {
  const response = await fetch(`/api/plan/${id}`);
  if (response.status === 401) {
    throw new Error("Not logged in");
  } else if (response.status === 403) {
    throw new Error("Wrong account");
  }
  return response.json();
};

export const authorise = async (username, password) => {
  const response = await fetch(`/api/authorise`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return response.ok;
};

const authenticationRequiredApi = async (path, headers) => {
  const response = await fetch(path, headers);
  if (response.status === 401) {
    throw new Error("Not logged in");
  } else {
    return response;
  }
};

export const authenticate = async () => {
  const response = await fetch("/api/authenticate", {
    method: "GET",
  });
  return response;
};

export const putPlan = async (
  plan,
  username,
  id,
  name,
  description,
  isPublic
) => {
  const response = await authenticationRequiredApi(
    `/api/plan/${username}/${id}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plan,
        name,
        description,
        isPublic,
      }),
    }
  );

  return response;
};

export const deletePlanApi = async (planId) => {
  const response = await fetch(`/api/plan/${planId}`, { method: "DELETE" });
  if (response.status === 403) {
    throw new Error("Wrong account");
  }
};

export const putFavouritePlan = async (planId) => {
  const response = await authenticationRequiredApi(
    `/api/plan/favourite/${planId}`,
    {
      method: "PUT",
    }
  );
  if (response.status === 403) {
    throw new Error("Wrong account");
  }
};

export const putSharedPlan = async (planId, username) => {
  const response = await authenticationRequiredApi(
    `/api/plan/${planId}?username=${username}`
  );
};
