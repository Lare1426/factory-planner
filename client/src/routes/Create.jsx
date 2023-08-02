import { useState } from "react";
import styles from "./Create.module.scss";
import { Input, Button } from "@/components";

const products = Array(7).fill("Electromagnetic control rod");
const productSets = [];

for (let i = 0; i < products.length; i += 5) {
  productSets.push(products.slice(i, i + 5));
}

export default function Create() {
  const [product, setProduct] = useState("");
  const [amount, setAmount] = useState("");
  let isGeneratePlanDisabled = !(product && amount);

  return (
    <main className={styles.create}>
      <div className={styles.mainContainer}>
        <div className={styles.inputs}>
          <label>Select a product or type it in the input field</label>
          <Input
            size="large"
            type="text"
            placeholder="Enter a product"
            value={product}
            setValue={setProduct}
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

        <hr />

        <table className={styles.productTable}>
          <tbody>
            {productSets.map((products) => (
              <tr>
                {products.map((product) => (
                  <td>
                    <Button size="small" color="tertiary">
                      {product}
                    </Button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <hr />

        <div className={styles.productSelection}>
          {products.map((product) => (
            <div className={styles.buttonContainer}>
              <Button size="small" color="tertiary">
                {product}
              </Button>
            </div>
          ))}
        </div>

        <hr />

        <div className={styles.productGrid}>
          {productSets.map((products, rowIndex) =>
            products.map((product, columnIndex) => (
              <div
                className={`${styles[`column${columnIndex + 1}`]} ${
                  styles[`row${rowIndex + 1}`]
                }`}
              >
                <Button size="small" color="tertiary">
                  {product}
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
