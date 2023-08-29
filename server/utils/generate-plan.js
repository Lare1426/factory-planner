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

const findDesiredProduct = (recipeProducts, productName) => {
  for (const product of recipeProducts) {
    if (product.item === productName) {
      return product;
    }
  }
};

const generate = async (productName, amount, recipeName) => {
  const products = await getProducts();

  const generateRecipe = async (productName, amount, recipeName) => {
    recipeName ??= products[productName].base;
    const recipe = await recipesDB.get(recipeName);

    const recipeAmount =
      amount / findDesiredProduct(recipe.products, productName).amount;

    return {
      name: recipeName,
      ingredients: await Promise.all(
        recipe.ingredients.map(async (ingredient) => {
          const productName = ingredient.item;
          if (ores.includes(ingredient.item)) {
            return {
              name: ingredient.item,
              amount: ingredient.amount * recipeAmount,
            };
          }

          return {
            name: ingredient.item,
            amount: ingredient.amount * recipeAmount,
            recipe: await generateRecipe(
              productName,
              ingredient.amount * recipeAmount
            ),
          };
        })
      ),
    };
  };

  return {
    product: productName,
    amount,
    recipe: await generateRecipe(productName, amount, recipeName),
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

export default { generate, getProducts };
