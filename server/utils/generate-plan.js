import * as recipesDB from "./recipes-db.js";
import { getProducts } from "./get-products.js";
import { round } from "../../shared/round.js";
import { ores } from "../../shared/ores.js";

const productsWithRecipes = await getProducts();

const findDesiredProduct = (products, desiredProductName) => {
  for (const product of products) {
    if (product.item === desiredProductName) {
      return product;
    }
  }
};

export const generate = async (item, amount, recipeToUse = null) => {
  let recipe;
  let alternateRecipes;

  if (productsWithRecipes[item]) {
    ({ base: recipe, alternate: alternateRecipes } = productsWithRecipes[item]);

    if (ores.includes(item) && (recipeToUse ?? recipe) === item) {
      // raw material can be made as byproduct but not right now
      return {
        item,
        amount,
        recipe,
        alternateRecipes,
        totalOreCount: {
          [item]: amount,
        },
        allProducts: {},
      };
    }
  } else {
    // item doesn't have a recipe defined it is an raw material
    return {
      item,
      amount,
      totalOreCount: {
        [item]: amount,
      },
      allProducts: {},
    };
  }

  if (recipeToUse) {
    alternateRecipes = [recipe, ...alternateRecipes].filter(
      (oneRecipe) => oneRecipe !== recipeToUse
    );
    recipe = recipeToUse;
  }

  const recipeData = await recipesDB.get(recipe);

  const producedIn = recipeData.producedIn;

  const desiredProduct = findDesiredProduct(recipeData.products, item);
  const recipeProductionAmount = desiredProduct.amount;

  const recipeProductsPerMinute =
    (60 / recipeData.time) * recipeProductionAmount;
  const buildingCount = round(amount / recipeProductsPerMinute, 4);

  const ingredients = await Promise.all(
    recipeData.ingredients.map(async (ingredient) => {
      const recipeAmount = ingredient.amount / recipeProductionAmount;
      const ingredientAmount = round(amount * recipeAmount, 5);
      const plan = await generate(ingredient.item, ingredientAmount);
      return plan;
    })
  );

  return {
    item,
    amount,
    buildingCount,
    producedIn,
    recipe,
    alternateRecipes,
    ingredients,
  };
};
