import {
  redirect,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { Header } from "@/components";
import { Home, Create, Plan } from "@/routes";

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

export const App = () => <RouterProvider router={router} />;
