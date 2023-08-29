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
];

const productsReduce = async () => {
  const recipesMap = await recipesDB.map();
  const products = recipesMap.rows.reduce((acc, product) => {
    if (acc[product.key]) {
      acc[product.key].push(product.value);
    } else {
      acc[product.key] = [product.value];
    }
    return acc;
  }, {});

  return products;
};

const products = await productsReduce();

const generate = async (product, amount, recipe) => {
  const recipeData = await recipesDB.get(recipe);

  const plan = {
    product: product,
    amount,
    recipe: recipe,
  };
};

const plan = {
  product: "AI Limiter",
  amount: 100,
  Recipe: "AI Limiter",
  alternateRecipes: [],
  buildings: 20,
  ingredients: [{}, {}],
};

const sortRecipes = async (product) => {
  const recipes = products[product];

  let sortedRecipes = {};

  if (ores.includes(product)) {
    sortedRecipes = { base: [], alternate: [] };
    sortedRecipes.base.push(product);
    sortedRecipes.alternate = recipes;
  }

  if (!sortedRecipes.base) {
    sortedRecipes = recipes.reduce(
      (acc, recipe) => {
        if (recipe.includes("Alternate: ")) {
          acc.alternate.push(recipe);
        } else {
          acc.base.push(recipe);
        }
        return acc;
      },
      { base: [], alternate: [] }
    );

    if (sortedRecipes.base.length > 1) {
      sortedRecipes.alternate.push(...sortedRecipes.base.slice(1));
      sortedRecipes.base = [sortedRecipes.base[0]];
    }
  }
  return sortedRecipes;
};

export default { generate, sortRecipes, productsReduce };
