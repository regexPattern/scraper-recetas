/**
 * @typedef {{
 *  title: string,
 *  img: string,
 *  tags: string[],
 *  ingredients: string[],
 *  steps: string[],
 * }} Recipe
 */

const form = document.getElementsByTagName("form")[0];
const submitBtn = document.getElementsByTagName("button")[0];

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const recipeUrl = formData.get("recipe-url");

  submitBtn.disabled = true;

  const res = await fetch(`/api?url=${recipeUrl}`);
  const payload = await res.json();

  submitBtn.disabled = false;

  if (res.ok) {
    addRecipeScrapingResult(payload);
  }
});

const recipes = document.getElementsByTagName("section")[0];

/** @param {Recipe} recipe */
function addRecipeScrapingResult(recipe) {
  const container = document.createElement("article");

  const title = document.createElement("h2");
  title.textContent = recipe.title;

  const figure = document.createElement("figure");
  const img = document.createElement("img");

  img.src = recipe.img;

  figure.appendChild(img);

  const snippet = document.createElement("pre");
  const json = document.createElement("code");

  delete recipe.title;

  json.textContent = JSON.stringify(recipe, null, 4);

  snippet.appendChild(json);

  container.append(title, figure, snippet);
  recipes.appendChild(container);
}
