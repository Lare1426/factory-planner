import { useState } from "react";

export const useLocalStorage = (key) => {
  const [storedValue, setStoredValue] = useState(localStorage.getItem(key));

  const setValue = (value) => {
    try {
      setStoredValue(value);
      localStorage.setItem(key, value);
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
};
