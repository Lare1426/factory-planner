import { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import styles from "./Plan.module.scss";
import { getNewPlan } from "@/utils/api";
import { useLocalStorage } from "@/utils/useLocalStorage";
import { Button } from "@/components";
import { round } from "../../../../shared/round";
import { LeftSidePanel } from "./LeftSidePanel";
import { RightSidePanel } from "./RightSidePanel";
import { PlanSection } from "./PlanSection";

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

export const Plan = () => {
  const [plan, setPlan] = useState();
  const [hasEditAccess, setHasEditAccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [changedRecipes] = useLocalStorage("changedRecipes");

  const navigate = useNavigate();

  const fetchPlan = (product, amount) => {
    (async () => {
      if (!plan || product !== plan.item) {
        const newPlan = await getNewPlan(product, amount, changedRecipes);
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
    if (state) {
      if (state.plan) {
        setPlan(state.plan);
      } else {
        fetchPlan(state.inputProduct, state.inputAmount);
      }
    }
  }, []);

  /**
   * Navigate through the plan using the indexPath, replacing the target ingredient node
   * @param {int[]} indexPath - A list of indexes to navigate through nested ingredient arrays
   * @param {object} newNode - A New node to update with
   */
  const updatePlan = (indexPath, newNode) => {
    if (!indexPath.length) {
      return setPlan(newNode);
    }

    const destinationIndex = indexPath.pop();
    const updatedPlan = { ...plan };

    let currentIngredient = updatedPlan;
    for (const index of indexPath) {
      currentIngredient = currentIngredient.ingredients[index];
    }

    currentIngredient.ingredients[destinationIndex] = newNode;

    setPlan(updatedPlan);
  };

  return (
    <>
      {errorMessage ? (
        <main className={styles.error}>
          <h2 className={styles.message}>{errorMessage}</h2>
          <Button
            size={"large"}
            color={"primary"}
            onClick={() => navigate("/")}
          >
            Return home
          </Button>
        </main>
      ) : (
        <main className={styles.plan}>
          <LeftSidePanel
            fetchPlan={fetchPlan}
            idParam={id}
            plan={plan}
            setPlan={setPlan}
            isNewPlan={!id}
            hasEditAccess={hasEditAccess}
            setHasEditAccess={setHasEditAccess}
            setErrorMessage={setErrorMessage}
          />
          {plan && (
            <>
              <div className={styles.planView}>
                <PlanSection
                  plan={{ ...plan }}
                  updatePlan={updatePlan}
                  layer={1}
                  isNewPlan={!id}
                  hasEditAccess={hasEditAccess}
                  changedRecipes={changedRecipes}
                />
              </div>
              <RightSidePanel plan={plan} />
            </>
          )}
        </main>
      )}
    </>
  );
};
