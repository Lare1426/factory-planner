import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
    if (share && !edit) {
      (async () => {
        try {
          setSharedTo(await getPlanSharedTo(plan.id));
        } catch (error) {
          setIsLoginModalShow(true);
          setLoginModalMessage(error.message);
        }
      })();
    }
  }, []);

  useEffect(() => {
    if (edit && plan) {
      setIsPublic(plan.isPublic);
      setIsPlanFavourited(plan.favourited);

      if (share) {
        setSharedTo(plan.sharedTo);
      }
    }
  }, [plan]);

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
      await postToggleFavouritePlan(plan.id);
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
    }

    // check if there are users that don't appear in both arrays
    const removedUsers = plan.sharedTo.filter(
      (user) => !sharedTo.includes(user)
    );
    const addedUsers = sharedTo.filter((user) => !plan.sharedTo.includes(user));
    const hasShareListChanged = removedUsers.length || addedUsers.length;

    if (
      edit &&
      (plan.favourited !== isPlanFavourited ||
        isPublic !== plan.isPublic ||
        hasShareListChanged)
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
                  onChange={(e) => {
                    if (edit && plan && e.target.checked !== plan.isPublic) {
                      try {
                        postToggleIsPublicPlan(plan.id);
                      } catch (error) {
                        setIsLoginModalShow(true);
                        setLoginModalMessage(error.message);
                      }
                    }
                    setIsPublic(e.target.checked);
                  }}
                />
              </div>
            ) : (
              <>
                <label>Creator: {plan.creator}</label>
              </>
            )}
            <Button
              size="medium"
              color="tertiary"
              onClick={() => navigate(`/plan/${plan.id}`)}
            >
              View
            </Button>
            <Button size="medium" color="tertiary" onClick={favouritePlan}>
              {isPlanFavourited ? "Unfavourite" : "Favourite"}
            </Button>
          </>
        )}
        {share && (
          <>
            <label>Share plan:</label>
            {isError && <p className={styles.error}>{shareError}</p>}
            <Input
              type="text"
              placeholder="Username"
              size={"large"}
              value={inputAccount}
              setValue={setInputAccount}
            />
            <Button size={"medium"} color={"tertiary"} onClick={sharePlan}>
              Share
            </Button>
            <div>Shared to users:</div>
            {sharedTo?.toSorted().map((username, index) => (
              <div key={index} className={styles.sharedTo}>
                {username}
                <Button
                  size={"medium"}
                  color={"red"}
                  onClick={() => removeShare(username)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </>
        )}
        <Button size="medium" color="tertiary" onClick={hide}>
          Close
        </Button>
      </div>
    </Modal>
  );
};
