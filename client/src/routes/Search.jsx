import { useState } from "react";
import { Input, Button, EditAndShareModal } from "@/components";
import styles from "./Search.module.scss";
import { getSearch } from "@/utils/api";

export const Search = () => {
  const [searchValue, setSearchValue] = useState("");
  const [orderingValue, setOrderingValue] = useState("creationTime");
  const [orderDirection, setOrderDirection] = useState("ASC");
  const [plans, setPlans] = useState([]);
  const [isPlanModalShow, setIsPlanModalShow] = useState(false);
  const [planForModal, setPlanForModal] = useState();

  const searchPlan = async () => {
    setPlans([]);
    const plans = await getSearch(searchValue, orderingValue, orderDirection);
    setPlans(plans);
  };

  return (
    <main className={styles.public}>
      <div className={styles.sidePanel}>
        <Input
          type="text"
          placeholder="Search"
          className={styles.search}
          size="large"
          setValue={setSearchValue}
          value={searchValue}
        />
        <div className={styles.orderBy}>
          Order by:
          <select
            value={orderingValue}
            onChange={(e) => setOrderingValue(e.target.value)}
          >
            <option value="creationTime">Creation date</option>
            <option value="name">Plan name</option>
            <option value="product">Final product</option>
          </select>
          <select
            value={orderDirection}
            onChange={(e) => setOrderDirection(e.target.value)}
          >
            <option value="ASC">Ascending</option>
            <option value="DESC">Descending</option>
          </select>
        </div>
        <Button size="medium" color="primary" onClick={searchPlan}>
          Search
        </Button>
      </div>
      <div className={styles.plans}>
        <div className={styles.result}>
          <h2>Search result:</h2>
          <div className={styles.planList}>
            {plans.map((plan) => (
              <div
                className={styles.plan}
                onClick={() => {
                  setIsPlanModalShow(true);
                  setPlanForModal(plan);
                }}
                key={plan.id}
              >
                <h3 className={styles.name}>{plan.name}</h3>
                <div>
                  {plan.product} {plan.amount}/min
                </div>
                <div>Creator: {plan.creator}</div>
                <div>{plan.creationDate}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <EditAndShareModal
        isModalShow={isPlanModalShow}
        setIsModalShow={setIsPlanModalShow}
        plan={planForModal}
        edit={true}
      />
    </main>
  );
};
