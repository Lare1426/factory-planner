import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Home.module.scss";
import { Button, Input } from "@/components";
import { getProducts } from "@/utils/api";

export const Home = () => {
  const [inputProduct, setInputProduct] = useState("");
  const [inputAmount, setInputAmount] = useState("");
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  let isGeneratePlanDisabled = !(
    products.includes(inputProduct) &&
    inputAmount > 0 &&
    inputAmount < 50001
  );

  useEffect(() => {
    (async () => {
      setProducts(await getProducts());
    })();
  }, []);

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
      </div>
      <div className={styles.rightContainer}>
        <div className={styles.buttons}>
          <Button size="large" color="primary" shadow="drop">
            View
          </Button>
          <Link to="/create">
            <Button size="large" color="primary" shadow="drop">
              Create
            </Button>
          </Link>
          <Link to="/public">
            <Button size="large" color="primary" shadow="drop">
              Public
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
    </main>
  );
};
