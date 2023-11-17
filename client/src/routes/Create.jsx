import { useState } from "react";
import styles from "./Create.module.scss";
import { Input, Button } from "@/components";

const products = Array(19).fill("Electromagnetic control rod");

export const Create = () => {
  const [finalProduct, setFinalProduct] = useState("");
  const [amount, setAmount] = useState("");
  let isGeneratePlanDisabled = !(finalProduct && amount);

  return (
    <main className={styles.create}>
      <div className={styles.mainContainer}>
        <div className={styles.inputs}>
          <label>Select a product or type it in the input field</label>
          <Input
            size="large"
            type="text"
            placeholder="Enter a product"
            value={finalProduct}
            setValue={setFinalProduct}
          />
          <label>Enter the desired production amount</label>
          <Input
            size="small"
            type="number"
            placeholder={0}
            min={0}
            max={20000}
            value={amount}
            setValue={setAmount}
          />
          <Button
            size="small"
            color="primary"
            disabled={isGeneratePlanDisabled}
          >
            Generate plan
          </Button>
        </div>
        <div className={styles.productSelection}>
          {products.map((product, index) => (
            <div className={styles.buttonContainer} key={`${product}${index}`}>
              <Button
                size="small"
                color={finalProduct === product ? "primary" : "tertiary"}
                onClick={() => {
                  setFinalProduct(product);
                }}
              >
                {product}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};
