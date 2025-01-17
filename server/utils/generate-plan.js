import * as recipesDB from "./recipes-db.js";
import { getProducts } from "./get-products.js";
import { round } from "../../shared/round.js";
import { ores } from "../../shared/ores.js";

const productsWithRecipes = await getProducts();

const findDesiredProduct = (products, desiredProductName) => {
  let byProduct;
  let desiredProduct;

  for (const product of products) {
    if (product.item === desiredProductName) {
      desiredProduct = product;
    } else {
      byProduct = product;
    }
  }
  return { byProduct, desiredProduct };
};

export const generate = async (
  item,
  amount,
  changedRecipes,
  recipeToUse = null
) => {
  let recipe;
  let alternateRecipes;

  if (productsWithRecipes[item]) {
    const { base, alternate } = productsWithRecipes[item];

    if (changedRecipes && changedRecipes[item]) {
      recipe = changedRecipes[item];
      alternateRecipes = [base, ...alternate].filter(
        (recipe) => recipe !== changedRecipes[item]
      );
    } else {
      recipe = base;
      alternateRecipes = alternate;
    }

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

  const { desiredProduct, byProduct } = findDesiredProduct(
    recipeData.products,
    item
  );

  const recipeProductionAmount = desiredProduct.amount;

  const recipeProductsPerMinute =
    (60 / recipeData.time) * recipeProductionAmount;
  const buildingCount = round(amount / recipeProductsPerMinute, 4);

  if (byProduct) {
    byProduct.amount =
      (60 / recipeData.time) * byProduct.amount * buildingCount;
  }

  const ingredients = await Promise.all(
    recipeData.ingredients.map(async (ingredient) => {
      const recipeAmount = ingredient.amount / recipeProductionAmount;
      const ingredientAmount = round(amount * recipeAmount, 5);
      const plan = await generate(
        ingredient.item,
        ingredientAmount,
        changedRecipes
      );
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
    byProduct,
  };
};
