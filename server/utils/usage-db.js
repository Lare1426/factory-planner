import { getCurrentTimeDate, getCurrentTimeString } from "./dates";

const baseUrl =
  "https://couchdb-lare.alwaysdata.net:6984/lare_factory-planner_usage";
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

const put = async (newEntry) => {
  const date = getCurrentTimeDate().slice(0, 7);
  const rev = getRevision(date);
  const revString = rev ? `?rev=${rev}` : "";

  const previousData = get(date);

  const response = await fetch(`${baseUrl}/${date}${revString}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
    },
    body: JSON.stringify(document),
  });
  return response.json();
};

const getRevision = async (name) => {
  const response = await fetch(`${baseUrl}/${name}`, {
    method: "HEAD",
    headers: authHeaders,
  });
  return response.headers.get("Etag").slice(1, -1);
};

export const addUsageEvent = (username, event) => {
  const entry = {
    time: getCurrentTimeString(),
    username,
    event,
  };
};
