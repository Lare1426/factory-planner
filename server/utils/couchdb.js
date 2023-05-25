const baseUrl = "https://couchdb-lare.alwaysdata.net:6984/lare_factory-planner";
const authHeaders = {
  Authorization: `Basic ${process.env.ENCODED_DB_CREDENTIALS}`,
};

export const getDocument = async (id) => {
  const response = await fetch(`${baseUrl}/${id}`, {
    method: "GET",
    headers: authHeaders,
  });
  return response.json();
};

export const updateDocument = async (id, rev, document) => {
  const response = await fetch(`${baseUrl}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
    },
    body: JSON.stringify({
      _rev: rev,
      ...document,
    }),
  });
  return response.json();
};

export const createDocument = async (id, document) => {
  const response = await fetch(`${baseUrl}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
    },
    body: JSON.stringify(document),
  });
  return response.json();
};

export const deleteDocument = async (id, rev) => {
  const response = await fetch(`${baseUrl}/${id}?rev=${rev}`, {
    method: "DELETE",
    headers: authHeaders,
  });
  return response.json();
};
