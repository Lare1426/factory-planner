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
  let revString = rev ? `?rev=${rev}` : "";

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

export const del = async (name) => {
  const rev = await getRevision(name);

  const response = await fetch(`${baseUrl}/${name}?rev=${rev}`, {
    method: "DELETE",
    headers: authHeaders,
  });
  return await response.json();
};

const getRevision = async (name) => {
  const response = await fetch(`${baseUrl}/${name}`, {
    method: "HEAD",
    headers: authHeaders,
  });
  return response.headers.get("Etag").slice(1, -1); // once errored, fix if happens
};

export default { get, put, del, getRevision };
