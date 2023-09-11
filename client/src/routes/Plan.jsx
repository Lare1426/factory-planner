import { useEffect, useState } from "react";
import styles from "./Plan.module.scss";
import { Button, Input } from "@/components";

const layers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function PlanSection({ plan, layer }) {
  const [recipe, setRecipe] = useState(plan.recipe);

  useEffect(() => {
    console.log(
      "recipe:",
      recipe,
      "plan.recipe:",
      plan.recipe,
      recipe === plan.recipe
    );
    if (recipe !== plan.recipe) {
      (async () => {
        const response = await fetch(
          `/api/plan/new/${plan.item}/${recipe}?amount=${plan.amount}`
        );
        const resJson = await response.json();
        plan = resJson;
      })();
    }
  }, [recipe]);

  if (plan) {
    const layerColor = `layer${layer}`;
    if (plan.ingredients) {
      return (
        <section className={`${styles.planSection} ${styles[layerColor]}`}>
          <div>{plan.item}</div>
          <div>
            Recipe:
            <select
              defaultValue={recipe}
              onChange={(e) => {
                setRecipe(e.target.value);
              }}
            >
              <option value={recipe}>{recipe}</option>
              {plan.alternateRecipes.map((alternateRecipe, index) => (
                <option value={alternateRecipe} key={index}>
                  {alternateRecipe}
                </option>
              ))}
            </select>
          </div>
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
  const [finalProduct, setFinalProduct] = useState("");
  const [finalAmount, setFinalAmount] = useState(0);

  useEffect(() => {
    setFinalProduct("Thermal Propulsion Rocket");
    setFinalAmount(100);
  }, []);

  useEffect(() => {
    if (!plan && finalProduct && finalAmount) {
      (async () => {
        const response = await fetch(
          `/api/plan/new/${finalProduct}?amount=${finalAmount}`
        );
        const resJson = await response.json();
        setPlan(resJson);
      })();
    }
  }, [finalProduct, finalAmount]);

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
        {plan && <PlanSection plan={plan} layer={layers[0]} />}
      </div>
    </main>
  );
}
