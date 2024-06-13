import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { Header } from "@/components";
import { Home, Create, Plan, Account } from "@/routes";
import { AuthContext } from "./utils/AuthContext";
import { authenticate } from "./utils/api";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Header />}>
      <Route path="/" element={<Home />} />
      <Route path="/create" element={<Create />} />
      <Route path="/plan/new" element={<Plan />} />
      <Route path="/plan/:id" element={<Plan />} />
      <Route path="/account" element={<Account />} />
    </Route>
  )
);

export const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUsername, setLoggedInUsername] = useState("");
  const [isLoginModalShow, setIsLoginModalShow] = useState(false);
  const [loginModalMessage, setLoginModalMessage] = useState("");

  useEffect(() => {
    (async () => {
      const response = await authenticate();
      if (response.status === 200) {
        setIsLoggedIn(true);
        setLoggedInUsername(await response.json());
      }
    })();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        loggedInUsername,
        setLoggedInUsername,
        isLoginModalShow,
        setIsLoginModalShow,
        loginModalMessage,
        setLoginModalMessage,
      }}
    >
      <RouterProvider router={router} />
    </AuthContext.Provider>
  );
};
