import "dotenv/config";
import fs from "fs";
import * as recipesDB from "./recipes-db.js";

const deleteOldRecipes = async () => {
  const products = await recipesDB.map();
  for (const product of products.rows) {
    console.log("product.id:", product.id);
    const response = await recipesDB.del(product.id);
    console.log("response:", response);
  }
};

const sortRecipes = async () => {
  const recipesSource = JSON.parse(
    fs.readFileSync("./utils/satisfactory-recipes.json")
  );
  const itemsSource = JSON.parse(
    fs.readFileSync("./utils/satisfactory-items.json")
  );
  const buildingsSource = JSON.parse(
    fs.readFileSync("./utils/satisfactory-buildings.json")
  );

  for (const [recipe] of Object.values(recipesSource)) {
    if (recipe.name.includes("FICSMAS") || !recipe.producedIn.length) {
      continue;
    }

    const recipeName = `${recipe.alternate ? "Alternate: " : ""}${recipe.name}`;

    const producedIn = buildingsSource[recipe.producedIn[0]][0].name;

    const ingredients = recipe.ingredients.map((ingredient) => ({
      item: itemsSource[ingredient.item][0].name,
      amount: ingredient.amount,
    }));

    if (
      ingredients.filter((ingredient) => !ingredient.item.includes("FICSMAS"))
        .length !== ingredients.length
    ) {
      continue;
    }

    console.log("ingredients:", ingredients);

    const products = recipe.products.map((product) => ({
      item: itemsSource[product.item][0].name,
      amount: product.amount,
    }));

    // const response = await recipesDB.put(recipeName, {
    //   time: recipe.duration,
    //   producedIn,
    //   ingredients,
    //   products,
    // });

    // console.log(response);
  }
};

sortRecipes();
