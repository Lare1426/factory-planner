import * as recipesDB from "./recipes-db.js";
import { round } from "../../shared/round.js";

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

export const getProducts = async () => {
  const recipesMap = await recipesDB.map();

  const products = recipesMap.rows.reduce((acc, partialProduct) => {
    const { key: productName, value: recipeName } = partialProduct;
    const product = acc[productName] ?? { base: "", alternate: [] };

    if (ores.includes(productName)) {
      product.base = productName;
      product.alternate.push(recipeName);
    } else {
      if (!product.base) {
        product.base = recipeName;
      } else if (recipeName === productName) {
        product.alternate.push(product.base);
        product.base = recipeName;
      } else {
        product.alternate.push(recipeName);
      }
    }

    acc[productName] = product;
    return acc;
  }, {});

  return products;
};

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

  const totalOreCount = {};
  const allProducts = { [item]: { amount, count: 1 } };

  const ingredients = await Promise.all(
    recipeData.ingredients.map(async (ingredient) => {
      const recipeAmount = ingredient.amount / recipeProductionAmount;
      const ingredientAmount = round(amount * recipeAmount, 5);
      const plan = await generate(ingredient.item, ingredientAmount);

      for (const [ore, amount] of Object.entries(plan.totalOreCount)) {
        if (ore in totalOreCount) {
          totalOreCount[ore] += amount;
        } else {
          totalOreCount[ore] = amount;
        }
      }

      for (const [item, { amount, count }] of Object.entries(
        plan.allProducts
      )) {
        if (item in allProducts) {
          allProducts[item].amount += amount;
          allProducts[item].count += count;
        } else {
          allProducts[item] = { amount, count };
        }
      }
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
    totalOreCount,
    allProducts,
    ingredients,
  };
};
