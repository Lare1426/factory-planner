import { Link } from "react-router-dom";

export default function BookList() {
  return (
    <>
      <h1>BookList</h1>
      <ul>
        <li>
          <Link to="/books/1">Book 1</Link>
        </li>
        <li>
          <Link to="/books/Hello World">Book Hello World</Link>
        </li>
      </ul>
    </>
  );
}
