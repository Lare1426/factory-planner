const baseUrl =
  "https://couchdb-lare.alwaysdata.net:6984/lare_factory-planner_recipes";
const authHeaders = {
  Authorization: `Basic ${process.env.ENCODED_DB_CREDENTIALS}`,
};

const get = async (name) => {
  const response = await fetch(`${baseUrl}/${name}`, {
    method: "GET",
    headers: authHeaders,
  });
  return response.json();
};

const put = async (id, document) => {
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

const map = async () => {
  const response = await fetch(`${baseUrl}/_design/views/_view/products`, {
    method: "GET",
    headers: authHeaders,
  });
  return response.json();
};

export default { get, put, map };
