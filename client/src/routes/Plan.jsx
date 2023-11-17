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

const roundTo4DP = (num) => Math.round((num + Number.EPSILON) * 10000) / 10000;

const InputsAndButtons = ({ fetchPlan, finalProduct, finalAmount }) => {
  const [inputProduct, setInputProduct] = useState(finalProduct);
  const [inputAmount, setInputAmount] = useState(finalAmount);

  const isApplyDisabled = !(
    inputProduct !== finalProduct || inputAmount !== finalAmount
  );

  return (
    <>
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
          value={inputProduct}
          setValue={setInputProduct}
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
          value={inputAmount}
          setValue={(value) => setInputAmount(parseInt(value))}
        />
      </div>
      <div className={styles.buttons}>
        <Button
          size="small"
          color="primary"
          disabled={isApplyDisabled}
          onClick={() => {
            fetchPlan(inputProduct, inputAmount);
          }}
        >
          Apply
        </Button>
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
    </>
  );
};

const LeftSidePanel = ({ finalProduct, finalAmount, fetchPlan }) => {
  return (
    <aside className={styles.sidePanel}>
      {finalProduct && finalAmount && (
        <InputsAndButtons
          fetchPlan={fetchPlan}
          finalProduct={finalProduct}
          finalAmount={finalAmount}
        />
      )}
    </aside>
  );
};

const PlanSection = ({ plan, layer, updatePlan, path = [] }) => {
  const layerColor = `layer${layer}`;

  const onChange = async (e) => {
    const recipe = e.target.value;
    if (recipe !== plan.recipe) {
      const response = await fetch(
        `/api/plan/new/${plan.item}/${recipe}?amount=${plan.amount}`
      );
      const newPlan = await response.json();
      updatePlan(path, newPlan);
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
          plan={ingredient}
          layer={layer % 10 === 0 ? 1 : layer + 1}
          updatePlan={updatePlan}
          path={[...path, ingredient.item]}
          key={`${plan.recipe}-${ingredient.item}-${index}`}
        />
      ))}
    </section>
  );
};

const findTotalAmounts = (plan) => {
  const totalAmounts = {
    [plan.item]: {
      amount: plan.amount,
      count: 1,
    },
  };

  if (plan.ingredients) {
    for (const ingredient of plan.ingredients) {
      const returnedTotalAmounts = findTotalAmounts(ingredient);

      for (const [item, { amount, count }] of Object.entries(
        returnedTotalAmounts
      )) {
        if (item in totalAmounts) {
          totalAmounts[item].amount += amount;
          totalAmounts[item].count += count;
        } else {
          totalAmounts[item] = {
            amount,
            count,
          };
        }
      }
    }
  }

  return totalAmounts;
};

const updatePlanAmounts = async (plan, amount) => {
  if (plan.ingredients) {
    for (const ingredient of plan.ingredients) {
      updatePlanAmounts(ingredient, (ingredient.amount / plan.amount) * amount);
    }
  }
  plan.amount = amount;
};

const RightSidePanel = ({ plan }) => {
  const [totalOres, setTotalOres] = useState({});
  const [allProducts, setAllProducts] = useState({});

  useEffect(() => {
    const totalAmounts = findTotalAmounts(plan);

    const preTotalOres = {};
    const preAllProducts = {};

    for (const [item, { amount, count }] of Object.entries(totalAmounts)) {
      if (ores.includes(item)) {
        preTotalOres[item] = amount;
      } else if (count > 1) {
        preAllProducts[item] = amount;
      }
    }

    setTotalOres(preTotalOres);
    setAllProducts(preAllProducts);
  }, [plan]);

  return (
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
        {Object.entries(allProducts).map(([item, amount], index) => (
          <li key={`${item}${index}`}>
            {item}: {roundTo4DP(amount)}/min
          </li>
        ))}
      </ul>
    </aside>
  );
};

export const Plan = () => {
  const [plan, setPlan] = useState();
  const [finalProduct, setFinalProduct] = useState("");
  const [finalAmount, setFinalAmount] = useState(0);

  const fetchPlan = (product, amount) => {
    (async () => {
      if (product !== finalProduct) {
        const response = await fetch(
          `/api/plan/new/${product}?amount=${amount}`
        );
        const newPlan = await response.json();
        setPlan(newPlan);
        setFinalProduct(product);
        amount !== finalAmount && setFinalAmount(amount);
      } else {
        const newPlan = { ...plan };
        updatePlanAmounts(newPlan, amount);
        setFinalAmount(amount);
        setPlan(newPlan);
      }
    })();
  };

  useEffect(() => {
    fetchPlan("Crystal Oscillator", 100);
  }, []);

  const updatePlan = (path, newNode, parent = null) => {
    const node = parent ?? { ...plan };

    if (path.length) {
      const nextStep = path.shift();
      for (const [index, child] of node.ingredients.entries()) {
        if (child.item === nextStep) {
          if (!path.length) {
            node.ingredients[index] = newNode;
          } else {
            updatePlan(path, newNode, child);
          }

          if (!parent) {
            setPlan(node);
            break;
          } else {
            return;
          }
        }
      }
    } else {
      setPlan(newNode);
    }
  };

  return (
    <main className={styles.plan}>
      <LeftSidePanel
        finalProduct={finalProduct}
        finalAmount={finalAmount}
        fetchPlan={fetchPlan}
      />
      <div className={styles.planView}>
        {plan && <PlanSection plan={plan} layer={1} updatePlan={updatePlan} />}
      </div>
      {plan && <RightSidePanel plan={plan} />}
    </main>
  );
};
