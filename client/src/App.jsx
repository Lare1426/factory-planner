import { Routes, Route } from "react-router-dom";
import { Header } from "@/components";
import { Home, Create, Plan } from "@/routes";

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<Header />}>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<Create />} />
          <Route path="/plan" element={<Plan />} />
        </Route>
      </Routes>
    </>
  );
}
