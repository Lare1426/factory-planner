import recipesDB from "./recipes-db.js";
import productsReduce from "./products-reduce.js";

const products = productsReduce();

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

  if (
    [
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
    ].includes(product)
  ) {
    sortedRecipes = {
      base: [],
      alternate: [],
    };
    sortedRecipes.base.push(product);
    sortedRecipes.alternate = recipes;
  }

  if (!sortedRecipes.base) {
    console.log("yes");
    sortedRecipes = recipes.reduce(
      (acc, recipe) => {
        if (recipe.includes("Alternate")) {
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

export default { generate, sortRecipes };
