import { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { logoPng } from "@/assets";
import styles from "./Header.module.scss";
import { Button, Input, LoginModal } from "@/components";

export const Header = () => {
  const [searchValue, setSearchValue] = useState("");
  const [isLoginModalShow, setIsLoginModalShow] = useState(false);

  return (
    <>
      <header>
        <div className={styles.leftContainer}>
          <Link to="/">
            <img src={logoPng} className={styles.logo} />
          </Link>
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
          <Button
            size="small"
            color="tertiary"
            onClick={() => setIsLoginModalShow(true)}
          >
            Login
          </Button>
        </div>
        <LoginModal
          isModalShown={isLoginModalShow}
          onHide={() => setIsLoginModalShow(false)}
        />
      </header>
      <Outlet />
    </>
  );
};
