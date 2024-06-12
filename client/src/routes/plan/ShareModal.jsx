import { useEffect, useState, useRef } from "react";
import styles from "./ShareModal.module.scss";
import { Button, Input } from "@/components";
import { putSharedPlan, getPlanSharedTo } from "@/utils/api";
import { useAuthContext } from "@/utils/AuthContext";

export const ShareModal = ({
  isShareModalShow,
  setIsShareModalShow,
  planId,
  creator,
}) => {
  const { setIsLoginModalShow, setLoginModalMessage } = useAuthContext();

  const [isError, setIsError] = useState(false);
  const [inputAccount, setInputAccount] = useState("");
  const [shareError, setShareError] = useState("");
  const [sharedTo, setSharedTo] = useState([]);
  const modalRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        setSharedTo(await getPlanSharedTo(planId));
      } catch (error) {
        setIsLoginModalShow(true);
        setLoginModalMessage(error.message);
      }
    })();
    document.addEventListener("keydown", onEscapeKeyDown);
    return () => document.removeEventListener("keydown", onEscapeKeyDown);
  }, []);

  const sharePlan = async () => {
    if (inputAccount === creator) {
      setIsError(true);
      setShareError("Can't share to creator of plan");
      return;
    }
    try {
      await putSharedPlan(planId, inputAccount);
      isError && setIsError(false);
      setSharedTo(await getPlanSharedTo(planId));
      setInputAccount("");
    } catch (error) {
      setIsLoginModalShow(true);
      setLoginModalMessage(error.message);
    }
  };

  const removeShare = async (usernameToRemove) => {
    try {
      await putSharedPlan(planId, usernameToRemove);
      setSharedTo(sharedTo.filter((username) => username !== usernameToRemove));
    } catch (error) {
      setIsLoginModalShow(true);
      setLoginModalMessage(error.message);
    }
  };

  const hide = () => {
    modalRef.current.close();
    setIsShareModalShow(false);
    setInputAccount("");
  };

  const onEscapeKeyDown = (event) => event.key === "Escape" && hide();

  if (isShareModalShow && !modalRef.current.open) {
    modalRef.current.showModal();
  }

  return (
    <dialog ref={modalRef} open={false} className={styles.shareModal}>
      <div>
        {isError && <p className={styles.error}>{shareError}</p>}
        <Input
          type="text"
          placeholder="Username"
          size={"large"}
          value={inputAccount}
          setValue={setInputAccount}
        />
        <Button size={"small"} color={"tertiary"} onClick={sharePlan}>
          Share
        </Button>
        <div>Shared to users:</div>
        {sharedTo?.map((username, index) => (
          <div key={index} className={styles.sharedTo}>
            {username}
            <Button
              size={"small"}
              color={"red"}
              onClick={() => removeShare(username)}
            >
              Remove
            </Button>
          </div>
        ))}
        <Button size="small" color="tertiary" onClick={hide}>
          Close
        </Button>
      </div>
    </dialog>
  );
};
