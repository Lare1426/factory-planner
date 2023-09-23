import { useEffect, useState } from "react";
import styles from "./Plan.module.scss";
import { Button, Input } from "@/components";

function PlanSection({ initialPlan, layer, updateTotalOres }) {
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

  useEffect(() => {
    setFinalProduct("Iron Plate");
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
        setTotalOres({ ores: plan.totalOreCount });
      })();
    }
  }, [finalProduct, finalAmount]);

  // const updateTotalOres = (item, amount) => {
  //   setTotalOres((previousState) => {
  //     const updatedTotalOres = { ...previousState };

  //     if (updatedTotalOres[item]) {
  //       updatedTotalOres[item] += amount;
  //     } else {
  //       updatedTotalOres[item] = amount;
  //     }
  //     return updatedTotalOres;
  //   });
  // };

  const updateTotalOres = async (previousOreCount, ores) => {
    const updatedTotalOres = { ...totalOres };
    updatedTotalOres.ores -= previousOreCount;
    updatedTotalOres.ores += ores;
    setTotalOres(updatedTotalOres);
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
          />
        )}
      </div>
      <aside className={styles.sidePanel}>
        <ul>
          <div className={styles.title}>Total ore amounts:</div>
          {Object.entries(totalOres).map(([ore, amount], index) => (
            <li key={`${ore}${index}`}>
              {ore}: {amount}/min
            </li>
          ))}
        </ul>
      </aside>
    </main>
  );
}
