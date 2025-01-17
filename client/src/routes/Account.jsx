import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "./Account.module.scss";
import { useAuthContext } from "@/utils/AuthContext";
import { Button, Input, EditAndShareModal } from "@/components";
import { getAccountPlans, deauthorise } from "@/utils/api";

const PlanList = ({ name, list, setPlanForModal, setIsPlanModalShow }) => {
  const [pageIndex, setPageIndex] = useState(0);

  return (
    <>
      <div className={styles.planList}>
        <label>{name}</label>
        {list.length > 5 && (
          <div className={styles.navButtons}>
            <Button
              size="small"
              color="primary"
              disabled={
                !(pageIndex > 0 && pageIndex <= Math.ceil(list.length / 5))
              }
              onClick={() => {
                setPageIndex(pageIndex - 1);
              }}
            >
              {"<"}
            </Button>
            <p>page {pageIndex + 1}</p>
            <Button
              size="small"
              color="primary"
              disabled={
                !(pageIndex >= 0 && pageIndex < Math.floor(list.length / 5))
              }
              onClick={() => {
                setPageIndex(pageIndex + 1);
              }}
            >
              {">"}
            </Button>
          </div>
        )}
        {list.slice(pageIndex * 5, 5 + pageIndex * 5).map((plan, index) => (
          <div
            className={styles.plan}
            onClick={() => {
              setPlanForModal(plan);
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
  const [isPlanModalShow, setIsPlanModalShow] = useState(false);
  const [planForModal, setPlanForModal] = useState();

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
        <>
          <div className={styles.planLists}>
            <PlanList
              name={"Favourited"}
              list={accountPlans.favourited}
              setPlanForModal={setPlanForModal}
              setIsPlanModalShow={setIsPlanModalShow}
            />
            <PlanList
              name={"Private"}
              list={accountPlans.private}
              setPlanForModal={setPlanForModal}
              setIsPlanModalShow={setIsPlanModalShow}
            />
            <PlanList
              name={"Public"}
              list={accountPlans.public}
              setPlanForModal={setPlanForModal}
              setIsPlanModalShow={setIsPlanModalShow}
            />
            <PlanList
              name={"Shared to me"}
              list={accountPlans.shared}
              setPlanForModal={setPlanForModal}
              setIsPlanModalShow={setIsPlanModalShow}
            />
          </div>
          <EditAndShareModal
            isModalShow={isPlanModalShow}
            setIsModalShow={setIsPlanModalShow}
            plan={planForModal}
            setAccountPlans={setAccountPlans}
            edit={true}
            share={planForModal?.created}
          />
        </>
      )}
    </main>
  );
};
