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
      if (recipeName.includes("Alternate: ") || product.base) {
        product.alternate.push(recipeName);
      } else {
        product.base = recipeName;
      }
    }

    acc[productName] = product;
    return acc;
  }, {});

  return products;
};

const productsWithRecipes = await getProducts();

const roundTo4DP = (num) => Math.round(num * 10000) / 10000;

const findDesiredProduct = (products, desiredProduct) => {
  for (const product of products) {
    if (product.item === desiredProduct) {
      return product;
    }
  }
};

const generate = async ({ item, amount }, recipeToUse = null) => {
  console.log(item);
  let recipe;
  let alternateRecipes;

  if (productsWithRecipes[item]) {
    const { base, alternate } = productsWithRecipes[item];
    recipe = base;
    alternateRecipes = alternate;
  } else {
    recipe = item;
    alternateRecipes = [];
  }

  if (recipeToUse) {
    recipe = recipeToUse;
    const allRecipes = [recipe, ...alternateRecipes];
    alternateRecipes = allRecipes.reduce((acc, oneRecipe) => {
      if (!oneRecipe === recipeToUse) {
        acc.push(recipe);
      }
      return acc;
    });
  }

  const recipeData = await recipesDB.get(recipe);

  let buildings;
  let ingredients;
  let producedIn;
  if (!recipeData.error) {
    producedIn = recipeData.producedIn;

    const desiredProduct = findDesiredProduct(recipeData.products, item);
    const recipeProductionAmount = desiredProduct.amount;

    const recipeProductsPerMinute =
      (60 / recipeData.time) * recipeProductionAmount;
    buildings = roundTo4DP(amount / recipeProductsPerMinute);

    ingredients = [];
    for (const ingredient of recipeData.ingredients) {
      const recipeAmount = ingredient.amount / recipeProductionAmount;
      ingredients.push(
        await generate({
          item: ingredient.item,
          amount: roundTo4DP(amount * recipeAmount),
        })
      );
    }
  }

  return {
    item,
    amount,
    buildings,
    producedIn,
    recipe,
    alternateRecipes,
    ingredients,
  };
};

export default { generate, getProducts };
