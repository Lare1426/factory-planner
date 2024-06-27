import { useRef, useEffect } from "react";
import styles from "./Modal.module.scss";

export const Modal = ({ children, hide, open = false }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    document.addEventListener("keydown", onEscapeKeyDown);
    return () => document.removeEventListener("keydown", onEscapeKeyDown);
  }, []);

  useEffect(() => {
    if (!open) {
      modalRef.current.close();
    }
  }, [open]);

  const onEscapeKeyDown = (event) => {
    if (event.key === "Escape") {
      modalRef.current.close();
      hide();
    }
  };

  if (open && !modalRef.current.open) {
    modalRef.current.showModal();
  }

  return (
    <dialog ref={modalRef} open={false} className={styles.modal}>
      {children}
    </dialog>
  );
};
