import { Route, Routes } from "react-router-dom";
import "./App.module.scss";
import { Home, NotFound, Navigation, BookRoutes } from "@/components";

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<Navigation />}>
          <Route path="/" element={<Home />} />
          <Route path="/books/*" element={<BookRoutes />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
