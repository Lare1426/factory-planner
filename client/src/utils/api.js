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

export const deauthorise = async () => {
  const response = await fetch("/api/deauthorise", { method: "DELETE" });
  return;
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
  creator,
  id,
  name,
  description,
  isPublic
) => {
  const response = await authenticationRequiredApi(`/api/plan/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      plan,
      name,
      creator,
      description,
      isPublic,
    }),
  });

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

export const getPlanFavourite = async (planId) => {
  const response = await authenticationRequiredApi(
    `/api/plan/favourite/${planId}`,
    { method: "GET" }
  );
  if (response.status === 403) {
    throw new Error("Wrong account");
  } else if (response.status === 404) {
    return;
  } else {
    return response.json();
  }
};

export const putSharedPlan = async (planId, username) => {
  const response = await authenticationRequiredApi(
    `/api/plan/shared/${planId}?username=${username}`,
    { method: "PUT" }
  );
  if (response.status === 403) {
    throw new Error("Wrong account");
  }
};

export const getPlanSharedTo = async (planId) => {
  const response = await authenticationRequiredApi(
    `/api/plan/shared/${planId}`,
    { method: "GET" }
  );
  if (response.status === 403) {
    throw new Error("Wrong account");
  } else {
    return response.json();
  }
};

export const getAccountPlans = async () => {
  const response = await authenticationRequiredApi("/api/account/plan", {
    method: "GET",
  });
  return response.json();
};
