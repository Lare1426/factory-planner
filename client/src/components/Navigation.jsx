import { NavLink, Outlet } from "react-router-dom";
import styles from "./Navigation.module.scss";

export default function Navigation() {
  return (
    <>
      <nav className={styles.navigation}>
        <ul>
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/books"
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              Books
            </NavLink>
          </li>
        </ul>
      </nav>
      <Outlet />
    </>
  );
}
