import { Link, Outlet } from "react-router-dom";

export default function Navigation() {
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
      <Outlet />
    </>
  );
}
