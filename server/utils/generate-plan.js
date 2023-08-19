import { emit } from "nodemon";

const generate = async (finalProduct, amount, finalRecipe) => {
  const plan = {
    product: finalProduct,
    amount,
    recipe: finalRecipe,
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

const viewMap = function (doc) {
  if (doc.products) {
    doc.products.forEach((product) => {
      emit(product.item, doc._id);
    });
  }
};

const viewReduce = function (keys, values, isRereduce) {
  if (!isRereduce) {
    var products = {};
    for (var i; i < values.length; i++) {
      var product = keys[i][0];
      var recipeName = values[i];
      if (!products[product]) {
        products[product] = [recipeName];
      } else {
        products[product].push(recipeName);
      }
    }
    return products;
  }
};
