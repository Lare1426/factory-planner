import { Route, Routes, Link } from "react-router-dom";
import "./App.module.scss";
import {
  BookList,
  Home,
  Book,
  NewBook,
  NotFound,
  BooksLayout,
} from "@/components";

export default function App() {
  return (
    <>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/books">Books</Link>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/books" element={<BooksLayout />}>
          <Route index element={<BookList />} />
          <Route path="new" element={<NewBook />} />
          <Route path=":id" element={<Book />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
