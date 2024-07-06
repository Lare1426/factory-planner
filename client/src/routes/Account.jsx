import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "./Account.module.scss";
import { useAuthContext } from "@/utils/AuthContext";
import { Button, Input, Modal } from "@/components";
import {
  getAccountPlans,
  deauthorise,
  postToggleFavouritePlan,
  postToggleIsPublicPlan,
} from "@/utils/api";

const PlanList = ({ name, list, setAccountPlans }) => {
  const { setIsLoginModalShow, setLoginModalMessage } = useAuthContext();

  const [isPlanModalShow, setIsPlanModalShow] = useState(false);
  const [planForModal, setPlanForModal] = useState();
  const [isPublic, setIsPublic] = useState(false);
  const [isModalPlanFavourited, setIsModalPlanFavourited] = useState(false);

  useEffect(() => {
    if (
      planForModal &&
      (planForModal.favourited !== isModalPlanFavourited ||
        isPublic !== planForModal.isPublic)
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
  }, [isPlanModalShow]);

  useEffect(() => {
    if (planForModal && isPublic !== planForModal.isPublic) {
      try {
        postToggleIsPublicPlan(planForModal.id);
      } catch (error) {
        setIsLoginModalShow(true);
        setLoginModalMessage(error.message);
      }
    }
  }, [isPublic]);

  const navigate = useNavigate();

  const favouritePlan = async () => {
    try {
      await postToggleFavouritePlan(planForModal.id);
      setIsModalPlanFavourited(!isModalPlanFavourited);
    } catch (error) {
      setIsLoginModalShow(true);
      setLoginModalMessage(error.message);
    }
  };

  return (
    <>
      <div className={styles.planList}>
        <label>{name}</label>
        {list.map((plan, index) => (
          <div
            className={styles.plan}
            onClick={() => {
              setPlanForModal(plan);
              setIsPublic(plan.isPublic);
              plan.favourited && setIsModalPlanFavourited(plan.favourited);
              setIsPlanModalShow(true);
            }}
            key={`${plan.name}${index}`}
          >
            <div className={styles.name}>{plan.name}</div>
            <div>{plan.product}</div>
            <div>{plan.amount}/min</div>
          </div>
        ))}
      </div>
      <Modal
        open={isPlanModalShow}
        hide={() => {
          setIsPlanModalShow(false);
        }}
      >
        {planForModal && (
          <div className={styles.modalComponents}>
            <h2>{planForModal.name}</h2>
            {planForModal?.created || planForModal?.sharedTo ? (
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
                <label>Creator: {planForModal.creator}</label>
              </>
            )}
            <Button
              size="small"
              color="tertiary"
              onClick={() => navigate(`/plan/${planForModal.id}`)}
            >
              View
            </Button>
            <Button size="small" color="tertiary" onClick={favouritePlan}>
              {isModalPlanFavourited ? "Unfavourite" : "Favourite"}
            </Button>
            <Button
              size="small"
              color="tertiary"
              onClick={() => {
                setIsPlanModalShow(false);
              }}
            >
              Close
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
};

export const Account = () => {
  const {
    loggedInUsername,
    setIsLoginModalShow,
    setLoginModalMessage,
    setIsLoggedIn,
    setLoggedInUsername,
  } = useAuthContext();

  const [accountPlans, setAccountPlans] = useState();

  useEffect(() => {
    (async () => {
      try {
        const result = await getAccountPlans();
        setAccountPlans(result);
      } catch (error) {
        setIsLoginModalShow(true);
        setLoginModalMessage(error.message);
      }
    })();
  }, []);

  const navigate = useNavigate();

  const navigatePlan = (plan) => {
    navigate("/plan/new", {
      state: { plan },
    });
  };

  const logOut = async () => {
    await deauthorise();
    navigate("/");
    setIsLoggedIn(false);
    setLoggedInUsername("");
  };

  return (
    <main className={styles.account}>
      <div className={styles.topBar}>
        {loggedInUsername}'s plans
        <div className={styles.buttons}>
          <Link to="/create">
            <Button size="large" color="primary" shadow="drop">
              Create
            </Button>
          </Link>
          <Input
            size="large"
            type="file"
            shadow="drop"
            setValue={navigatePlan}
          />
          <Button size="large" color="primary" shadow="drop" onClick={logOut}>
            Log out
          </Button>
        </div>
      </div>
      {accountPlans && (
        <div className={styles.planLists}>
          <PlanList
            name={"Public"}
            list={accountPlans.public}
            setAccountPlans={setAccountPlans}
          />
          <PlanList
            name={"Private"}
            list={accountPlans.private}
            setAccountPlans={setAccountPlans}
          />
          <PlanList
            name={"Favourited"}
            list={accountPlans.favourited}
            setAccountPlans={setAccountPlans}
          />
          <PlanList
            name={"Shared"}
            list={accountPlans.sharedTo}
            setAccountPlans={setAccountPlans}
          />
        </div>
      )}
    </main>
  );
};
