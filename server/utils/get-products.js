import * as recipesDB from "./recipes-db.js";
import { ores } from "../../shared/ores.js";

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
