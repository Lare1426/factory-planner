import { useEffect, useRef, useState } from "react";
import { Input, Button } from "@/components";
import styles from "./LoginModal.module.scss";

export const LoginModal = ({ isModalShown, onHide }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const modalRef = useRef(null);

  const hide = () => {
    modalRef.current.close();
    onHide();
  };

  if (isModalShown && !modalRef.current.open) {
    modalRef.current.showModal();
  }

  const onEscapeKeyDown = (event) => event.key === "Escape" && onHide();

  useEffect(() => {
    document.addEventListener("keydown", onEscapeKeyDown);
    return () => document.removeEventListener("keydown", onEscapeKeyDown);
  }, []);

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
        <div className={styles.buttons}>
          <Button size={"small"} color={"tertiary"}>
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
