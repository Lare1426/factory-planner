import styles from "./PlanSection.module.scss";
import { getItemRecipe } from "@/utils/api";
import { round } from "../../../../shared/round";

export const PlanSection = ({
  fullPlanCopy,
  plan,
  setPlan,
  layer,
  isNewPlan,
  hasEditAccess,
}) => {
  const layerColor = `layer${layer}`;

  const onChange = async (e) => {
    const recipe = e.target.value;
    if (recipe !== plan.recipe) {
      const newPlan = await getItemRecipe(plan.item, recipe, plan.amount);

      // relies on the fact that plan isn't part of the plan state variable but
      // is a copy. Maybe rename variable better
      // here it is already in the correct part the plan so why pass in path to
      //another function that has to make a copy of the plan and iterate until
      // finding this same location in that object

      // Would there be better way to override plan because just resetting the
      // variable won't modify the object

      plan.buildingCount = newPlan.buildingCount;
      plan.recipe = newPlan.recipe;
      plan.alternateRecipes = newPlan.alternateRecipes;
      plan.producedIn = newPlan.producedIn;
      plan.ingredients = newPlan.ingredients;

      setPlan(fullPlanCopy);
    }
  };

  return (
    <section className={`${styles.planSection} ${styles[layerColor]}`}>
      <div>{plan.item}</div>
      {plan.recipe && (
        <div>
          Recipe:
          {(isNewPlan || hasEditAccess) && plan.alternateRecipes.length ? (
            <select value={plan.recipe} onChange={onChange}>
              <option value={plan.recipe}>{plan.recipe}</option>
              {plan.alternateRecipes.map((alternateRecipe, index) => (
                <option value={alternateRecipe} key={index}>
                  {alternateRecipe}
                </option>
              ))}
            </select>
          ) : (
            " " + plan.recipe
          )}
        </div>
      )}
      {plan.buildingCount && (
        <div>
          Buildings: {round(plan.buildingCount, 4)} {plan.producedIn}
        </div>
      )}
      <div>Amount: {round(plan.amount, 4)}/min</div>
      <div className={styles.ingredients}>
        {plan.ingredients?.map((ingredient, index) => (
          <PlanSection
            fullPlanCopy={fullPlanCopy}
            plan={ingredient}
            setPlan={setPlan}
            layer={layer % 10 === 0 ? 1 : layer + 1}
            key={`${plan.recipe}-${ingredient.item}-${index}`}
            isNewPlan={isNewPlan}
            hasEditAccess={hasEditAccess}
          />
        ))}
      </div>
    </section>
  );
};
