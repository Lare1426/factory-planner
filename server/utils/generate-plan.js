import recipesDB from "./recipes-db.js";

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

const getProducts = async () => {
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

const roundTo4DP = (num) => Math.round((num + Number.EPSILON) * 10000) / 10000;

const findDesiredProduct = (products, desiredProductName) => {
  for (const product of products) {
    if (product.item === desiredProductName) {
      return product;
    }
  }
};

const generate = async (item, amount, recipeToUse = null) => {
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
        totalOreCount: amount,
      };
    }
  } else {
    // item doesn't have a recipe defined it is an raw material
    return {
      item,
      amount,
      totalOreCount: amount,
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
  const buildings = roundTo4DP(amount / recipeProductsPerMinute);

  let totalOreCount = 0;

  const ingredients = await Promise.all(
    recipeData.ingredients.map(async (ingredient) => {
      const recipeAmount = ingredient.amount / recipeProductionAmount;
      const ingredientAmount = roundTo4DP(amount * recipeAmount);
      const plan = await generate(ingredient.item, ingredientAmount);
      totalOreCount += plan.totalOreCount;
      return plan;
    })
  );

  return {
    item,
    amount,
    buildings,
    producedIn,
    recipe,
    alternateRecipes,
    ingredients,
    totalOreCount,
  };
};

export default { generate, getProducts };
