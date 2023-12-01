import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Home.module.scss";
import { Button, Input } from "@/components";

export const Home = () => {
  const [inputProduct, setInputProduct] = useState("");
  const [inputAmount, setInputAmount] = useState("");
  const [products, setProducts] = useState([]);

  let isGeneratePlanDisabled = !(
    products.includes(inputProduct) &&
    inputAmount > 0 &&
    inputAmount < 50001
  );

  useEffect(() => {
    (async () => {
      const response = await fetch("/api/products");
      setProducts(await response.json());
    })();
  }, []);

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
            size="small"
            min={1}
            max={50000}
            setValue={setInputAmount}
            value={inputAmount}
          />
          <Link to="/plan/new" state={{ inputProduct, inputAmount }}>
            <Button
              size="small"
              color="primary"
              disabled={isGeneratePlanDisabled}
            >
              Generate plan
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
};
