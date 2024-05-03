import { useEffect, useRef, useState } from "react";
import { Input, Button } from "@/components";
import { authenticate } from "@/utils/api";
import { useAuthContext } from "@/utils/AuthContext";
import styles from "./LoginModal.module.scss";

export const LoginModal = ({ isModalShown, onHide }) => {
  const { setIsLoginSuccess } = useAuthContext();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isError, setIsError] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    document.addEventListener("keydown", onEscapeKeyDown);
    return () => document.removeEventListener("keydown", onEscapeKeyDown);
  }, []);

  const authenticateUser = async () => {
    const status = await authenticate(username, password);
    if (status === 401) {
      setIsError(true);
    } else if (status === 200) {
      setIsLoginSuccess(true);
      hide();
    }
  };

  const hide = () => {
    modalRef.current.close();
    onHide();
  };

  if (isModalShown && !modalRef.current.open) {
    modalRef.current.showModal();
  }

  const onEscapeKeyDown = (event) => event.key === "Escape" && onHide();

  return (
    <dialog ref={modalRef} open={false} className={styles.loginModal}>
      <div>
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
        {isError && <p className={styles.error}>Invalid credentials!</p>}
        <div className={styles.buttons}>
          <Button size={"small"} color={"tertiary"} onClick={authenticateUser}>
            Login
          </Button>
          <Button size={"small"} color={"tertiary"} onClick={hide}>
            Close
          </Button>
        </div>
      </div>
    </dialog>
  );
};
