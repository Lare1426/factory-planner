import { useState } from "react";
import { Outlet } from "react-router-dom";
import { logoPng } from "@/assets";
import styles from "./Header.module.scss";
import { Button, Input } from "@/components";

export default function Header() {
  const [searchValue, setSearchValue] = useState("");

  return (
    <>
      <header>
        <div className={styles.leftContainer}>
          <img src={logoPng} className={styles.logo} />
        </div>
        <div className={styles.rightContainer}>
          <Input
            type="text"
            placeholder="Search"
            className={styles.search}
            size="large"
            setValue={setSearchValue}
            value={searchValue}
          />
          <Button size="small" color="tertiary">
            Login
          </Button>
        </div>
      </header>
      <Outlet />
    </>
  );
}
