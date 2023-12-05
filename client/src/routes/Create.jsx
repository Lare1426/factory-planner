import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Create.module.scss";
import { Input, Button } from "@/components";

const ProductSelection = ({ inputProduct, setInputProduct, products }) => {
  const isInputInProducts = products.includes(inputProduct);

  return (
    <div className={styles.productSelection}>
      {isInputInProducts && (
        <div className={styles.buttonContainer}>
          <Button size="small" color={"primary"}>
            {inputProduct}
          </Button>
        </div>
      )}

      {products.map((product, index) => {
        const isInputInProduct = product
          .toLowerCase()
          .includes(inputProduct.toLowerCase());

        if (
          !(isInputInProduct || isInputInProducts) ||
          product === inputProduct
        ) {
          return;
        }

        return (
          <div className={styles.buttonContainer} key={`${product}${index}`}>
            <Button
              size="small"
              color={inputProduct === product ? "primary" : "tertiary"}
              onClick={() => {
                setInputProduct(product);
              }}
            >
              {product}
            </Button>
          </div>
        );
      })}
    </div>
  );
};

export const Create = () => {
  const [inputProduct, setInputProduct] = useState("");
  const [inputAmount, setInputAmount] = useState("");
  const [products, setProducts] = useState([]);

  useEffect(() => {
    (async () => {
      const response = await fetch("/api/products");
      setProducts(await response.json());
    })();
  }, []);

  let isGeneratePlanDisabled = !(
    products.includes(inputProduct) &&
    inputAmount > 0 &&
    inputAmount < 50001
  );

  return (
    <main className={styles.create}>
      <div className={styles.mainContainer}>
        <div className={styles.inputs}>
          <label>Select a product or type it in the input field</label>
          <Input
            size="large"
            type="text"
            placeholder="Enter a product"
            value={inputProduct}
            setValue={setInputProduct}
          />
          <label>Enter the desired production amount</label>
          <Input
            size="small"
            type="number"
            placeholder={1}
            min={1}
            max={50001}
            value={inputAmount}
            setValue={setInputAmount}
          />
          <Link
            to="/plan/new"
            state={{ inputProduct, inputAmount }}
            className={`primary-button-style ${styles.customLink}`}
          >
            Generate plan
          </Link>
        </div>
        <ProductSelection
          inputProduct={inputProduct}
          setInputProduct={setInputProduct}
          products={products}
        />
      </div>
    </main>
  );
};
