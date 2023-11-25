import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Home.module.scss";
import { Button, Input } from "@/components";

export const Home = () => {
  const [product, setProduct] = useState("");
  const [amount, setAmount] = useState("");
  let isGeneratePlanDisabled = !(product && amount);

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
            setValue={setProduct}
            value={product}
          />
          <label>Total amount per minute</label>
          <Input
            type="number"
            placeholder="0"
            size="small"
            min={0}
            max={20000}
            setValue={setAmount}
            value={amount}
          />
          <Link to="/plan" state={{ product, amount }}>
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
