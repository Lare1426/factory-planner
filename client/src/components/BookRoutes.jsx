import { Route, Routes } from "react-router-dom";
import { BookList, Book, NewBook, NotFound, BooksLayout } from "@/components";

export default function BookRoutes() {
  return (
    <Routes>
      <Route element={<BooksLayout />}>
        <Route index element={<BookList />} />
        <Route path="new" element={<NewBook />} />
        <Route path=":id" element={<Book />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
