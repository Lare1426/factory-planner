import {
  getCurrentTimeDate,
  getCurrentTimeSeconds,
  getCurrentTimeString,
} from "./dates.js";

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
  const date = getCurrentTimeDate(getCurrentTimeSeconds()).slice(0, 7);
  const rev = await getRevision(date);
  const revString = rev ? `?rev=${rev}` : "";

  const previousData = await get(date);
  const newData = {
    entries: [],
  };
  if (previousData?.entries) {
    newData.entries = previousData.entries;
  }
  newData.entries.push(newEntry);

  const response = await fetch(`${baseUrl}/${date}${revString}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
    },
    body: JSON.stringify(newData),
  });
};

const getRevision = async (name) => {
  const response = await fetch(`${baseUrl}/${name}`, {
    method: "HEAD",
    headers: authHeaders,
  });
  return response.headers.get("Etag")?.slice(1, -1);
};

export const addUsageEvent = (user, event) => {
  const entry = {
    time: getCurrentTimeString(),
    user,
    event,
  };
  put(entry);
};
