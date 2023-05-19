import { Route, Routes } from "react-router-dom";
import "./App.module.scss";
import {
  BookList,
  Home,
  Book,
  NewBook,
  NotFound,
  BooksLayout,
  Navigation,
} from "@/components";

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<Navigation />}>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<BooksLayout />}>
            <Route index element={<BookList />} />
            <Route path="new" element={<NewBook />} />
            <Route path=":id" element={<Book />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
