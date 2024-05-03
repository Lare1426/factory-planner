import {
  redirect,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { useState } from "react";
import { Header } from "@/components";
import { Home, Create, Plan } from "@/routes";
import { AuthContext } from "./utils/AuthContext";

const router = createBrowserRouter([
  {
    element: <Header />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/create",
        element: <Create />,
      },
      {
        path: "/plan/new",
        element: <Plan />,
      },
      {
        path: "/plan/:id",
        element: <Plan />,
      },
      {
        path: "*",
        loader: () => redirect("/"),
      },
    ],
  },
]);

export const App = () => {
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);
  console.log("isLoginSuccess:", isLoginSuccess);

  return (
    <AuthContext.Provider value={{ isLoginSuccess, setIsLoginSuccess }}>
      <RouterProvider router={router} />
    </AuthContext.Provider>
  );
};
