import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "./Account.module.scss";
import { useAuthContext } from "@/utils/AuthContext";
import { Button, Input } from "@/components";
import { getAccountPlans, deauthorise } from "@/utils/api";

const PlanList = ({ name, list }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.planList}>
      <div>{name}</div>
      {list.map((plan, index) => (
        <div
          className={styles.plan}
          onClick={() => {
            navigate(`/plan/${plan.id}`);
          }}
          key={`${plan.name}${index}`}
        >
          <div className={styles.name}>{plan.name}</div>
          <div>{plan.product}</div>
          <div>{plan.amount}/min</div>
        </div>
      ))}
    </div>
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
          <PlanList name={"Public"} list={accountPlans.public} />
          <PlanList name={"Private"} list={accountPlans.private} />
          <PlanList name={"Favourited"} list={accountPlans.favourited} />
          <PlanList name={"Shared"} list={accountPlans.sharedTo} />
        </div>
      )}
    </main>
  );
};
