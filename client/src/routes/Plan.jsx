import { useEffect, useState } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import styles from "./Plan.module.scss";
import { Button, Input } from "@/components";
import { round } from "../../../shared/round";
import { ores } from "../../../shared/ores";

const InputsAndButtons = ({ fetchPlan, plan }) => {
  const [inputProduct, setInputProduct] = useState(plan.item);
  const [inputAmount, setInputAmount] = useState(plan.amount);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    (async () => {
      const response = await fetch("/api/products");
      setProducts(await response.json());
    })();
  }, []);

  const isApplyDisabled = !(
    (inputProduct !== plan.item || inputAmount !== plan.amount) &&
    inputAmount > 0 &&
    inputAmount < 50001 &&
    products.includes(inputProduct)
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
          customList={products}
        />
      </div>
      <div>
        <label>Production amount</label>
        <Input
          size="small"
          type="number"
          placeholder="0"
          min={1}
          max={50000}
          value={inputAmount}
          setValue={(value) => {
            setInputAmount(parseInt(value));
          }}
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
        <a
          href={URL.createObjectURL(
            new Blob([JSON.stringify(plan)], {
              type: "application/json",
            })
          )}
          download={`${plan.item}.json`}
          onClick={() => {}}
          className={`primary-button-style ${styles.exportLink}`}
        >
          Export
        </a>
        <Button size="small" color="primary" disabled={true}>
          Save
        </Button>
        <Button size="small" color="primary" disabled={true}>
          Favourite
        </Button>
        <Button size="small" color="primary" disabled={true}>
          Share
        </Button>
        <Button size="small" color="red" disabled={true}>
          Delete
        </Button>
      </div>
    </>
  );
};

const LeftSidePanel = ({ fetchPlan, plan }) => {
  return (
    <aside className={styles.sidePanel}>
      {plan && <InputsAndButtons fetchPlan={fetchPlan} plan={plan} />}
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
      {plan.buildingCount && (
        <div>
          Buildings: {round(plan.buildingCount, 4)} {plan.producedIn}
        </div>
      )}
      <div>Amount: {round(plan.amount, 4)}/min</div>
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
  if (plan.buildingCount) {
    plan.buildingCount = round((plan.buildingCount / plan.amount) * amount, 5);
  }
  plan.amount = round(amount, 5);
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
            {ore}: {round(amount, 4)}/min
          </li>
        ))}
      </ul>
      <ul>
        <div className={styles.title}>Common product amounts:</div>
        {Object.entries(allProducts).map(([item, amount], index) => (
          <li key={`${item}${index}`}>
            {item}: {round(amount, 4)}/min
          </li>
        ))}
      </ul>
    </aside>
  );
};

export const Plan = () => {
  const [plan, setPlan] = useState();

  const fetchPlan = (product, amount) => {
    (async () => {
      if (!plan || product !== plan.item) {
        const response = await fetch(
          `/api/plan/new/${product}?amount=${amount}`
        );
        const newPlan = await response.json();
        setPlan(newPlan);
      } else {
        const newPlan = { ...plan };
        updatePlanAmounts(newPlan, amount);
        setPlan(newPlan);
      }
    })();
  };

  const { state } = useLocation();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      (async () => {
        const response = await fetch(`/api/plan/${id}`);
        const plan = await response.json();
        setPlan(plan);
      })();
    } else if (state) {
      if (state.plan) {
        setPlan(state.plan);
      } else {
        fetchPlan(state.inputProduct, state.inputAmount);
      }
    }
  }, []);

  if (!state && !id) {
    return <Navigate to="/" replace />;
  }

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
      <LeftSidePanel fetchPlan={fetchPlan} plan={plan} />
      <div className={styles.planView}>
        {plan && <PlanSection plan={plan} layer={1} updatePlan={updatePlan} />}
      </div>
      {plan && <RightSidePanel plan={plan} />}
    </main>
  );
};
