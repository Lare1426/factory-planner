import { useEffect, useState } from "react";
import styles from "./RecipesModal.module.scss";
import { Button, Modal } from "@/components";
import { getProducts } from "@/utils/api";
import { useLocalStorage } from "@/utils/useLocalStorage";

export const RecipesModal = ({ isModalShow, setIsModalShow, refreshPlan }) => {
  const [changedRecipesStorage, setChangedRecipesStorage] =
    useLocalStorage("changedRecipes");
  const [defaultRecipes, setDefaultRecipes] = useState();
  const [changedRecipes, setChangedRecipes] = useState(
    changedRecipesStorage ?? {}
  );
  const [previousChangedRecipes, setPreviousChangedRecipes] = useState(
    changedRecipesStorage ?? {}
  );

  // check if something was changed
  const addedItems = Object.keys(changedRecipes).filter(
    (recipe) => !Object.keys(previousChangedRecipes).includes(recipe)
  );
  const removedItems = Object.keys(previousChangedRecipes).filter(
    (recipe) => !Object.keys(changedRecipes).includes(recipe)
  );
  const recipesChanged = Object.entries(changedRecipes).filter(
    ([item, recipe]) => previousChangedRecipes[item] !== recipe
  );
  const isApplyDisabled = !(
    addedItems.length ||
    removedItems.length ||
    recipesChanged.length
  );

  useEffect(() => {
    (async () => {
      setDefaultRecipes(await getProducts());
    })();
  }, []);

  const hide = () => {
    setPreviousChangedRecipes({ ...changedRecipes });
    setIsModalShow(false);
  };

  const onChange = (recipe, item) => {
    if (defaultRecipes[item].base === recipe) {
      if (Object.keys(changedRecipes).includes(item)) {
        const changedRecipesCopy = { ...changedRecipes };
        delete changedRecipesCopy[item];
        const newChangedRecipes = { ...changedRecipesCopy };
        setChangedRecipes(newChangedRecipes);
        setChangedRecipesStorage(newChangedRecipes);
      }
      return;
    }

    const newChangedRecipes = {
      ...changedRecipes,
      [item]: recipe,
    };
    setChangedRecipes(newChangedRecipes);
    setChangedRecipesStorage(newChangedRecipes);
  };

  return (
    <Modal open={isModalShow} hide={hide}>
      <div className={styles.recipesModal}>
        <div className={styles.topBar}>
          <h2>Edit default recipe for these items</h2>
          <div className={styles.buttons}>
            <Button
              size={"medium"}
              color={"tertiary"}
              disabled={isApplyDisabled}
              onClick={() => {
                refreshPlan(changedRecipes);
                hide();
              }}
            >
              Apply
            </Button>
            <Button
              size={"medium"}
              color={"tertiary"}
              onClick={() => {
                setChangedRecipes({});
              }}
            >
              Reset
            </Button>
            <Button size={"medium"} color={"tertiary"} onClick={hide}>
              Close
            </Button>
          </div>
        </div>
        <div className={styles.recipesList}>
          {defaultRecipes &&
            Object.entries(defaultRecipes).map(([item, recipes], index) => {
              if (recipes.alternate.length === 0) {
                return;
              }

              const selectedRecipe = changedRecipes[item] ?? recipes.base;
              const allRecipes = [recipes.base, ...recipes.alternate];

              return (
                <div className={styles.recipe} key={index}>
                  {item}
                  {changedRecipes[item] && "*"}
                  <select
                    className={changedRecipes[item] && styles.changed}
                    value={selectedRecipe}
                    onChange={(e) => {
                      onChange(e.target.value, item);
                    }}
                  >
                    {allRecipes.map((recipe, index) => (
                      <option value={recipe} key={index}>
                        {recipe}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
        </div>
      </div>
    </Modal>
  );
};
