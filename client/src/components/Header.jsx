import { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { logoPng } from "@/assets";
import { Button, Input, LoginModal } from "@/components";
import { useAuthContext } from "@/utils/AuthContext";
import styles from "./Header.module.scss";

export const Header = () => {
  const { isLoggedIn, isLoginModalShow, setIsLoginModalShow } =
    useAuthContext();

  const [searchValue, setSearchValue] = useState("");

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
            onClick={() => !isLoggedIn && setIsLoginModalShow(true)}
          >
            {isLoggedIn ? "Account" : "Login"}
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
