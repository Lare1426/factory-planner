import { useState } from "react";
import { Input, Button, Modal } from "@/components";
import { authorise } from "@/utils/api";
import { useAuthContext } from "@/utils/AuthContext";
import styles from "./LoginModal.module.scss";

export const LoginModal = () => {
  const {
    setIsLoggedIn,
    setLoggedInUsername,
    loginModalMessage,
    isLoginModalShow,
    setIsLoginModalShow,
  } = useAuthContext();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isCredentialError, setIsCredentialError] = useState(false);

  const authoriseUser = async () => {
    if (await authorise(username, password)) {
      setIsLoggedIn(true);
      setLoggedInUsername(username);
      hide();
    } else {
      setIsCredentialError(true);
    }
  };

  const hide = () => {
    setUsername("");
    setPassword("");
    setIsCredentialError(false);
    setIsLoginModalShow(false);
  };

  return (
    <Modal hide={hide} open={isLoginModalShow}>
      <div className={styles.modalComponents}>
        {loginModalMessage && (
          <label className={styles.error}>{loginModalMessage}</label>
        )}
        <label>Login or contact Lare to get an account!</label>
        <Input
          type="text"
          placeholder="Username"
          size={"large"}
          value={username}
          setValue={setUsername}
        />
        <Input
          type="password"
          placeholder="Password"
          size={"large"}
          value={password}
          setValue={setPassword}
        />
        {isCredentialError && (
          <p className={styles.error}>Invalid credentials!</p>
        )}
        <div className={styles.buttons}>
          <Button size={"small"} color={"tertiary"} onClick={authoriseUser}>
            Login
          </Button>
          <Button size={"small"} color={"tertiary"} onClick={hide}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
