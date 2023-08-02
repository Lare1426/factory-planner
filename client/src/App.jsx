import { Routes, Route } from "react-router-dom";
import { Header } from "@/components";
import { Home } from "@/routes";

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<Header />}>
          <Route path="/" element={<Home />} />
        </Route>
      </Routes>
    </>
  );
}
