import { useEffect, useState } from "react";
import styles from "./ShareModal.module.scss";
import { Button, Input, Modal } from "@/components";
import { postToggleSharedPlan, getPlanSharedTo } from "@/utils/api";
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

  useEffect(() => {
    (async () => {
      try {
        setSharedTo(await getPlanSharedTo(planId));
      } catch (error) {
        setIsLoginModalShow(true);
        setLoginModalMessage(error.message);
      }
    })();
  }, []);

  const sharePlan = async () => {
    if (inputAccount === creator) {
      setIsError(true);
      setShareError("Can't share to creator of plan");
      return;
    }
    try {
      await postToggleSharedPlan(planId, inputAccount);
      isError && setIsError(false);
      setSharedTo([...sharedTo, inputAccount]);
      setInputAccount("");
    } catch (error) {
      setIsLoginModalShow(true);
      setLoginModalMessage(error.message);
    }
  };

  const removeShare = async (usernameToRemove) => {
    try {
      await postToggleSharedPlan(planId, usernameToRemove);
      setSharedTo(sharedTo.filter((username) => username !== usernameToRemove));
    } catch (error) {
      setIsLoginModalShow(true);
      setLoginModalMessage(error.message);
    }
  };

  const hide = () => {
    setIsShareModalShow(false);
    setInputAccount("");
  };

  return (
    <Modal open={isShareModalShow} hide={hide}>
      <div className={styles.shareModal}>
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
    </Modal>
  );
};
