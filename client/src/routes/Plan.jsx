import { useEffect, useState } from "react";
import styles from "./Plan.module.scss";
import { Button, Input } from "@/components";

const ores = [
  "Bauxite",
  "Caterium Ore",
  "Coal",
  "Copper Ore",
  "Iron Ore",
  "Limestone",
  "Raw Quartz",
  "Sulfur",
  "Uranium",
  "Water",
  "Nitrogen Gas",
  "Crude Oil",
];

function PlanSection({ initialPlan, layer, totalOres, setTotalOres }) {
  const [plan, setPlan] = useState(initialPlan);

  useEffect(() => {
    if (ores.includes(plan.item)) {
      if (totalOres[plan.item]) {
        totalOres[plan.item] += plan.amount;
      } else {
        totalOres[plan.item] = plan.amount;
      }
      console.log("file: Plan.jsx:31 ~ totalOres:", totalOres);
      setTotalOres(totalOres);
    }
  });

  const layerColor = `layer${layer}`;

  const onChange = async (e) => {
    const recipe = e.target.value;
    if (recipe !== plan.recipe) {
      const response = await fetch(
        `/api/plan/new/${plan.item}/${recipe}?amount=${plan.amount}`
      );
      const resJson = await response.json();
      setPlan(resJson);
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
      {plan.buildings && <div>Buildings: {plan.buildings}</div>}
      <div>Amount: {plan.amount}/min</div>
      {plan.ingredients?.map((ingredient, index) => (
        <PlanSection
          initialPlan={ingredient}
          key={`${index}${ingredient.item}${plan.recipe}`}
          layer={layer % 10 === 0 ? 1 : layer + 1}
          totalOres={totalOres}
          setTotalOres={setTotalOres}
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
        const resJson = await response.json();
        setInitialPlan(resJson);
      })();
    }
  }, [finalProduct, finalAmount]);

  console.log(totalOres);
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
            totalOres={totalOres}
            setTotalOres={setTotalOres}
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
