import { useEffect, useState } from "react";
import styles from "./Plan.module.scss";
import { Button, Input } from "@/components";

const roundTo4DP = (num) => Math.round((num + Number.EPSILON) * 10000) / 10000;

function PlanSection({
  initialPlan,
  layer,
  updateTotalOres,
  updateAllProducts,
}) {
  const [plan, setPlan] = useState(initialPlan);

  const layerColor = `layer${layer}`;

  const onChange = async (e) => {
    const recipe = e.target.value;
    if (recipe !== plan.recipe) {
      const response = await fetch(
        `/api/plan/new/${plan.item}/${recipe}?amount=${plan.amount}`
      );
      const newPlan = await response.json();
      updateTotalOres(plan.totalOreCount, newPlan.totalOreCount);
      updateAllProducts(plan.allProducts, newPlan.allProducts);
      setPlan(newPlan);
    }
  };

  return (
    <section className={`${styles.planSection} ${styles[layerColor]}`}>
      <div>{plan.item}</div>
      {plan.recipe && (
        <div>
          Recipe:
          <select value={plan.recipe} onChange={onChange}>
            <option value={plan.recipe}>{plan.recipe}</option>
            {plan.alternateRecipes.map((alternateRecipe, index) => (
              <option value={alternateRecipe} key={index}>
                {alternateRecipe}
              </option>
            ))}
          </select>
        </div>
      )}
      {plan.buildings && (
        <div>
          Buildings: {plan.buildings} {plan.producedIn}
        </div>
      )}
      <div>Amount: {plan.amount}/min</div>
      {plan.ingredients?.map((ingredient, index) => (
        <PlanSection
          initialPlan={ingredient}
          key={`${plan.recipe}-${ingredient.item}-${index}`}
          layer={layer % 10 === 0 ? 1 : layer + 1}
          updateTotalOres={updateTotalOres}
          updateAllProducts={updateAllProducts}
        />
      ))}
    </section>
  );
}

export default function Plan() {
  const [initialPlan, setInitialPlan] = useState();
  const [finalProduct, setFinalProduct] = useState("");
  const [finalAmount, setFinalAmount] = useState(0);
  const [totalOres, setTotalOres] = useState({});
  const [allProducts, setAllProducts] = useState({});

  useEffect(() => {
    setFinalProduct("Crystal Oscillator");
    setFinalAmount(100);
  }, []);

  useEffect(() => {
    if (!initialPlan && finalProduct && finalAmount) {
      (async () => {
        const response = await fetch(
          `/api/plan/new/${finalProduct}?amount=${finalAmount}`
        );
        const plan = await response.json();
        setInitialPlan(plan);
        setTotalOres(plan.totalOreCount);
        setAllProducts(plan.allProducts);
      })();
    }
  }, [finalProduct, finalAmount]);

  const updateTotalOres = async (previousOreCount, newOreCount) => {
    const updatedTotalOres = { ...totalOres };

    for (const [ore, amount] of Object.entries(previousOreCount)) {
      if (updatedTotalOres[ore] - amount === 0) {
        delete updatedTotalOres[ore];
      } else {
        updatedTotalOres[ore] -= amount;
      }
    }

    for (const [ore, amount] of Object.entries(newOreCount)) {
      if (ore in updatedTotalOres) {
        updatedTotalOres[ore] += amount;
      } else {
        updatedTotalOres[ore] = amount;
      }
    }

    setTotalOres(updatedTotalOres);
  };

  const updateAllProducts = async (
    previousProductsAmount,
    newProductsAmount
  ) => {
    const updatedAllProducts = { ...allProducts };

    for (const [item, { amount, count }] of Object.entries(
      previousProductsAmount
    )) {
      if (updatedAllProducts[item].amount - amount === 0) {
        delete updatedAllProducts[item];
      } else {
        updatedAllProducts[item].amount -= amount;
        updatedAllProducts[item].count -= count;
      }
    }

    for (const [item, { amount, count }] of Object.entries(newProductsAmount)) {
      if (item in updatedAllProducts) {
        updatedAllProducts[item].amount += amount;
        updatedAllProducts[item].count += count;
      } else {
        updatedAllProducts[item] = { amount, count };
      }
    }

    setAllProducts(updatedAllProducts);
  };

  return (
    <main className={styles.plan}>
      <aside className={styles.sidePanel}>
        <Input size="large" type="text" placeholder="Plan name" />
        <div>
          <label>Description</label>
          <textarea rows="5" cols="27"></textarea>
        </div>
        <div>
          <label>Product</label>
          <Input
            size="large"
            type="text"
            value={finalProduct}
            setValue={setFinalProduct}
          />
        </div>
        <div>
          <label>Production amount</label>
          <Input
            size="small"
            type="number"
            placeholder="0"
            min={0}
            max={20000}
            value={finalAmount}
            setValue={setFinalAmount}
          />
        </div>
        <div className={styles.buttons}>
          <Button size="small" color="primary">
            Export
          </Button>
          <Button size="small" color="primary">
            Save
          </Button>
          <Button size="small" color="primary">
            Favourite
          </Button>
          <Button size="small" color="primary">
            Share
          </Button>
          <Button size="small" color="red">
            Delete
          </Button>
        </div>
      </aside>
      <div className={styles.planView}>
        {initialPlan && (
          <PlanSection
            initialPlan={initialPlan}
            layer={1}
            updateTotalOres={updateTotalOres}
            updateAllProducts={updateAllProducts}
          />
        )}
      </div>
      <aside className={styles.sidePanel}>
        <ul>
          <div className={styles.title}>Total ore amounts:</div>
          {Object.entries(totalOres).map(([ore, amount], index) => (
            <li key={`${ore}${index}`}>
              {ore}: {roundTo4DP(amount)}/min
            </li>
          ))}
        </ul>
        <ul>
          <div className={styles.title}>Common product amounts:</div>
          {Object.entries(allProducts).map(
            ([item, { amount, count }], index) => {
              if (count > 1) {
                return (
                  <li key={`${item}${index}`}>
                    {item}: {roundTo4DP(amount)}/min
                  </li>
                );
              }
            }
          )}
        </ul>
      </aside>
    </main>
  );
}
