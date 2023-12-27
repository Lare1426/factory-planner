const baseUrl =
  "https://couchdb-lare.alwaysdata.net:6984/lare_factory-planner_plans";
const authHeaders = {
  Authorization: `Basic ${process.env.ENCODED_DB_CREDENTIALS}`,
};

export const get = async (name) => {
  const response = await fetch(`${baseUrl}/${name}`, {
    method: "GET",
    headers: authHeaders,
  });
  return response.json();
};

export const put = async (name, document, rev) => {
  let revString = "";
  if (rev) {
    revString = `?rev=${rev}`;
  }

  const response = await fetch(`${baseUrl}/${name}${revString}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
    },
    body: JSON.stringify(document),
  });
  return response.json();
};

export const del = async (name, rev) => {
  const response = await fetch(`${baseUrl}/${name}?rev=${rev}`, {
    method: "DELETE",
    headers: authHeaders,
  });
  return response.json();
};
