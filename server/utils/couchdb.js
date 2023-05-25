const baseUrl = "https://couchdb-lare.alwaysdata.net:6984/lare_factory-planner";

export const getDocument = async (id) => {
  const response = await fetch(`${baseUrl}/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Basic ${process.env.ENCODED_DB_CREDENTIALS}`,
    },
  });
  return response.json();
};

export const updateDocument = async (id, rev, document) => {
  const response = await fetch(`${baseUrl}/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Basic ${process.env.ENCODED_DB_CREDENTIALS}`,
    },
    body: {
      rev,
      ...document,
    },
  });
  return response.json();
};

export const createDocument = async (id, document) => {
  const response = await fetch(`${baseUrl}/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Basic ${process.env.ENCODED_DB_CREDENTIALS}`,
    },
    body: document,
  });
  return response.json();
};

export const deleteDocument = async (id, rev) => {
  const response = await fetch(`${baseUrl}/${id}?rev=${rev}`, {
    method: "DELETE",
    headers: {
      Authorization: `Basic ${process.env.ENCODED_DB_CREDENTIALS}`,
    },
  });
  return response.json();
};
