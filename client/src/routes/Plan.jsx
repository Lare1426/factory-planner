import { useEffect, useState } from "react";
import styles from "./Plan.module.scss";
import { Button, Input } from "@/components";

const layers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function PlanSection({ plan, layer }) {
  if (plan) {
    const layerColor = `layer${layer}`;
    if (plan.ingredients) {
      return (
        <section className={`${styles.planSection} ${styles[layerColor]}`}>
          <div>{plan.item}</div>
          <div>Recipe: {plan.recipe}</div>
          <div>Buildings: {plan.buildings}</div>
          <div>Amount: {plan.amount}/min</div>
          {plan.ingredients.map((ingredient, index) => (
            <PlanSection
              plan={ingredient}
              key={`${index}${ingredient.item}`}
              layer={layers[layers.indexOf(layer) + 1]}
            />
          ))}
        </section>
      );
    }
    return (
      <section className={`${styles.planSection} ${styles[layerColor]}`}>
        <div>{plan.item}</div>
        {plan.recipe && <div>Recipe: {plan.recipe}</div>}
        <div>Amount: {plan.amount}/min</div>
      </section>
    );
  }
}

export default function Plan() {
  const [plan, setPlan] = useState();

  useEffect(() => {
    (async () => {
      const response = await fetch(
        "/api/plan/new/Thermal Propulsion Rocket/Thermal Propulsion Rocket?amount=100"
      );
      const resJson = await response.json();
      setPlan(resJson);
    })();
  }, []);

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
          <Input size="large" type="text" />
        </div>
        <div>
          <label>Production amount</label>
          <Input
            size="small"
            type="number"
            placeholder="0"
            min={0}
            max={20000}
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
        <PlanSection plan={plan} layer={layers[0]} />
      </div>
    </main>
  );
}
