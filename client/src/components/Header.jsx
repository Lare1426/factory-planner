import { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { logoPng } from "@/assets";
import { Button, Input, LoginModal } from "@/components";
import { useAuthContext } from "@/utils/AuthContext";
import styles from "./Header.module.scss";

export const Header = () => {
  const { isLoggedIn, setIsLoginModalShow } = useAuthContext();

  const navigate = useNavigate();

  return (
    <>
      <header>
        <div className={styles.leftContainer}>
          <Link to="/">
            <img src={logoPng} className={styles.logo} />
          </Link>
        </div>
        <div className={styles.rightContainer}>
          <Button
            size="medium"
            color="tertiary"
            onClick={() =>
              isLoggedIn ? navigate("/account") : setIsLoginModalShow(true)
            }
          >
            {isLoggedIn ? "Account" : "Login"}
          </Button>
        </div>
        <LoginModal />
      </header>
      <Outlet />
    </>
  );
};
