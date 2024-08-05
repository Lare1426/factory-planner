import { useState } from "react";

export const useLocalStorage = (key) => {
  const [storedValue, setStoredValue] = useState(
    JSON.parse(localStorage.getItem(key))
  );

  const setValue = (value) => {
    try {
      setStoredValue(value);
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
};
