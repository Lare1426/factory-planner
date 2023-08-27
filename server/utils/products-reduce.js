import recipesDB from "./recipes-db.js";

export default async () => {
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
