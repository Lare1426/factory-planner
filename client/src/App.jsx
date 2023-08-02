import { useState } from "react";
import styles from "./App.module.scss";
import { Header, Button, Input } from "@/components";

export default function App() {
  const [product, setProduct] = useState("");
  const [amount, setAmount] = useState("");
  let isGeneratePlanDisabled = !(product && amount);

  return (
    <>
      <Header />
      <main>
        <div className={styles.planList}>
          <h2>Top 10 most viewed plans</h2>
          <hr />
        </div>
        <div className={styles.rightContainer}>
          <div className={styles.buttons}>
            <Button size="large" color="primary" shadow="drop">
              View
            </Button>
            <Button size="large" color="primary" shadow="drop">
              Create
            </Button>
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
            <Button
              size="small"
              color="primary"
              disabled={isGeneratePlanDisabled}
            >
              Generate plan
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
