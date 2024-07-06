import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./EditAndShareModal.module.scss";
import { Button, Input, Modal } from "@/components";
import {
  postToggleSharedPlan,
  getPlanSharedTo,
  getAccountPlans,
  postToggleFavouritePlan,
  postToggleIsPublicPlan,
} from "@/utils/api";
import { useAuthContext } from "@/utils/AuthContext";

export const EditAndShareModal = ({
  isModalShow,
  setIsModalShow,
  plan,
  setAccountPlans,
  edit = false,
  share = false,
}) => {
  const { setIsLoginModalShow, setLoginModalMessage } = useAuthContext();

  const [isError, setIsError] = useState(false);
  const [inputAccount, setInputAccount] = useState("");
  const [shareError, setShareError] = useState("");
  const [sharedTo, setSharedTo] = useState([]);
  const [isPublic, setIsPublic] = useState(false);
  const [isPlanFavourited, setIsPlanFavourited] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (share && plan) {
      (async () => {
        try {
          setSharedTo(await getPlanSharedTo(plan.id));
        } catch (error) {
          setIsLoginModalShow(true);
          setLoginModalMessage(error.message);
        }
      })();
    }
    if (edit && plan) {
      setIsPublic(plan.isPublic);
      setIsPlanFavourited(plan.favourited);
    }
  }, [plan]);

  useEffect(() => {
    if (
      edit &&
      plan &&
      (plan.favourited !== isPlanFavourited || isPublic !== plan.isPublic)
    ) {
      (async () => {
        try {
          const result = await getAccountPlans();
          setAccountPlans(result);
        } catch (error) {
          setIsLoginModalShow(true);
          setLoginModalMessage(error.message);
        }
      })();
    }
  }, [isModalShow]);

  useEffect(() => {
    if (edit && plan && isPublic !== plan.isPublic) {
      try {
        postToggleIsPublicPlan(plan.id);
      } catch (error) {
        setIsLoginModalShow(true);
        setLoginModalMessage(error.message);
      }
    }
  }, [isPublic]);

  const sharePlan = async () => {
    if (inputAccount === plan.creator) {
      setIsError(true);
      setShareError("Can't share to creator of plan");
      return;
    }
    try {
      await postToggleSharedPlan(plan.id, inputAccount);
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
      await postToggleSharedPlan(plan.id, usernameToRemove);
      setSharedTo(sharedTo.filter((username) => username !== usernameToRemove));
    } catch (error) {
      setIsLoginModalShow(true);
      setLoginModalMessage(error.message);
    }
  };

  const favouritePlan = async () => {
    try {
      await postToggleFavouritePlan(planForModal.id);
      setIsPlanFavourited(!isPlanFavourited);
    } catch (error) {
      setIsLoginModalShow(true);
      setLoginModalMessage(error.message);
    }
  };

  const hide = () => {
    setIsModalShow(false);
    if (share) {
      setInputAccount("");
      setIsError(false);
      setShareError("");
      setSharedTo([]);
    }
  };

  return (
    <Modal open={isModalShow} hide={hide}>
      <div className={styles.modal}>
        {edit && plan && (
          <>
            <h2>{plan.name}</h2>
            {plan?.created ? (
              <div>
                <label>Public</label>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
              </div>
            ) : (
              <>
                <label>Creator: {plan.creator}</label>
              </>
            )}
            <Button
              size="small"
              color="tertiary"
              onClick={() => navigate(`/plan/${plan.id}`)}
            >
              View
            </Button>
            <Button size="small" color="tertiary" onClick={favouritePlan}>
              {isPlanFavourited ? "Unfavourite" : "Favourite"}
            </Button>
          </>
        )}
        {share && edit && <label>Share:</label>}
        {share && (
          <>
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
          </>
        )}
        <Button size="small" color="tertiary" onClick={hide}>
          Close
        </Button>
      </div>
    </Modal>
  );
};
