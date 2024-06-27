import { throwCustomError } from ".";

export const getProducts = async () => {
  const response = await fetch("/api/products");
  return response.json();
};

export const getNewPlan = async (product, amount) => {
  const response = await fetch(`/api/plan/new/${product}?amount=${amount}`);
  return response.json();
};

export const getItemRecipe = async (item, recipe, amount) => {
  const response = await fetch(
    `/api/plan/new/${item}/${recipe}?amount=${amount}`
  );
  return response.json();
};

export const getPlanById = async (id) => {
  const response = await fetch(`/api/plan/${id}`);

  switch (response.status) {
    case 401:
      throwCustomError("Not logged in", 401);
    case 403:
      throwCustomError("Wrong account", 403);
    case 404:
      throwCustomError("Plan not found", 404);
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
    throwCustomError("Not logged in", 401);
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

export const postPlan = async (plan, name, description, isPublic) => {
  const response = await authenticationRequiredApi("/api/plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      plan,
      name,
      description,
      isPublic,
    }),
  });

  return response.json();
};

export const putPlan = async (plan, id, name, description, isPublic) => {
  const response = await authenticationRequiredApi(`/api/plan/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      plan,
      name,
      description,
      isPublic,
    }),
  });

  return response;
};

export const deletePlanApi = async (planId) => {
  const response = await fetch(`/api/plan/${planId}`, { method: "DELETE" });
  if (response.status === 403) {
    throwCustomError("Wrong account", 403);
  }
};

export const postToggleFavouritePlan = async (planId) => {
  const response = await authenticationRequiredApi(
    `/api/plan/toggle-favourite/${planId}`,
    {
      method: "POST",
    }
  );
  if (response.status === 403) {
    throwCustomError("Wrong account", 403);
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

export const postToggleSharedPlan = async (planId, username) => {
  const response = await authenticationRequiredApi(
    `/api/plan/toggle-shared/${planId}?username=${username}`,
    { method: "POST" }
  );
  if (response.status === 403) {
    throwCustomError("Wrong account", 403);
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
