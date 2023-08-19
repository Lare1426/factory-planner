import "dotenv/config";
import fs from "fs";
import recipesDB from "./recipes-db.js";

const data = JSON.parse(fs.readFileSync("./satisfactory-data.json"));

const sortRecipes = async () => {
  for (const recipe of Object.values(data.recipes)) {
    if (!recipe.inMachine) {
      continue;
    }

    const producedIn = data.buildings[recipe.producedIn[0]].name;

    const ingredients = recipe.ingredients.map((ingredient) => ({
      item: data.items[ingredient.item].name,
      amount: ingredient.amount,
    }));

    const products = recipe.products.map((product) => ({
      item: data.items[product.item].name,
      amount: product.amount,
    }));

    const response = await recipesDB.put(recipe.name, {
      time: recipe.time,
      producedIn,
      ingredients,
      products,
    });

    console.log(response);
  }
};
sortRecipes();
