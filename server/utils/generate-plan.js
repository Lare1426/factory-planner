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

  recipeName ??= products[productName].base;
  const recipe = await recipesDB.get(recipeName);

  const recipeAmount =
    amount / findDesiredProduct(recipe.products, productName).amount;
  const plan = {
    product: productName,
    amount,
    recipe: {
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

          const recipeName = products[productName].base;
          const recipe = await recipesDB.get(recipeName);

          return {
            name: ingredient.item,
            amount: ingredient.amount * recipeAmount,
            recipe: {
              name: recipeName,
              ingredients: recipe.ingredients.map((ingredient) => ({
                name: ingredient.item,
                amount: ingredient.amount * recipeAmount,
              })),
            },
          };
        })
      ),
    },
  };
  return plan;
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
