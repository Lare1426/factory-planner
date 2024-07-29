import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Home.module.scss";
import { Button, Input, EditAndShareModal } from "@/components";
import { getProducts, getMostViewedPlans } from "@/utils/api";

export const Home = () => {
  const [inputProduct, setInputProduct] = useState("");
  const [inputAmount, setInputAmount] = useState("");
  const [products, setProducts] = useState([]);
  const [mostViewedPlans, setMostViewedPlans] = useState([]);
  const [isPlanModalShow, setIsPlanModalShow] = useState(false);
  const [planForModal, setPlanForModal] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setMostViewedPlans(await getMostViewedPlans());
      setProducts(await getProducts());
    })();
  }, []);

  let isGeneratePlanDisabled = !(
    products.includes(inputProduct) &&
    inputAmount > 0 &&
    inputAmount < 50001
  );

  const navigatePlan = (plan) => {
    navigate("/plan/new", {
      state: { plan },
    });
  };

  return (
    <main className={styles.home}>
      <div className={styles.planList}>
        <h2>Top 10 most viewed plans</h2>
        <hr />
        <div className={styles.plans}>
          {mostViewedPlans.map((plan) => (
            <div
              className={styles.plan}
              key={plan.id}
              onClick={() => {
                setIsPlanModalShow(true);
                setPlanForModal(plan);
              }}
            >
              <h3 className={styles.name}>{plan.name}</h3>
              <div>
                {plan.product} {plan.amount}/min
              </div>
              <div>Views: {plan.views}</div>
              <div>Creator: {plan.creator}</div>
              <div>{plan.creationDate}</div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.rightContainer}>
        <div className={styles.buttons}>
          <Link to="/search">
            <Button size="large" color="primary" shadow="drop">
              View
            </Button>
          </Link>
          <Link to="/create">
            <Button size="large" color="primary" shadow="drop">
              Create
            </Button>
          </Link>
        </div>
        <div className={styles.quickCreate}>
          <h2>Quick create</h2>
          <Input
            type="text"
            placeholder="Select product"
            size="large"
            setValue={setInputProduct}
            value={inputProduct}
            customList={products}
          />
          <label>Total amount per minute</label>
          <Input
            type="number"
            placeholder={1}
            size="medium"
            min={1}
            max={50000}
            setValue={setInputAmount}
            value={inputAmount}
          />
          <Link to="/plan/new" state={{ inputProduct, inputAmount }}>
            <Button
              size="medium"
              color="primary"
              disabled={isGeneratePlanDisabled}
            >
              Generate plan
            </Button>
          </Link>
        </div>
        <div className={styles.buttons}>
          <Input
            size="large"
            type="file"
            shadow="drop"
            setValue={navigatePlan}
          />
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
