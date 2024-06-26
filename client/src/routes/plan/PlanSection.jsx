import styles from "./PlanSection.module.scss";
import { useAuthContext } from "@/utils/AuthContext";
import { getItemRecipe } from "@/utils/api";
import { round } from "../../../../shared/round";

export const PlanSection = ({
  plan,
  layer,
  updatePlan,
  path = [],
  creator,
  isNewPlan,
  hasEditAccess,
}) => {
  const { loggedInUsername } = useAuthContext();

  const layerColor = `layer${layer}`;

  const onChange = async (e) => {
    const recipe = e.target.value;
    if (recipe !== plan.recipe) {
      const newPlan = await getItemRecipe(plan.item, recipe, plan.amount);
      updatePlan(path, newPlan);
    }
  };

  return (
    <section className={`${styles.planSection} ${styles[layerColor]}`}>
      <div>{plan.item}</div>
      {plan.recipe && (
        <div>
          Recipe:
          {(isNewPlan || creator === loggedInUsername || hasEditAccess) &&
          plan.alternateRecipes.length ? (
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
            plan={ingredient}
            layer={layer % 10 === 0 ? 1 : layer + 1}
            updatePlan={updatePlan}
            path={[...path, index]}
            key={`${plan.recipe}-${ingredient.item}-${index}`}
            creator={creator}
            isNewPlan={isNewPlan}
            hasEditAccess={hasEditAccess}
          />
        ))}
      </div>
    </section>
  );
};
