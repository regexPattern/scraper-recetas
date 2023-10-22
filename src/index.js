/**
 * @typedef {{
 *  title: string,
 *  description: string,
 *  img: string,
 *  tags: string[],
 *  ingredients: string[],
 *  steps: string[],
 * }} Recipe
 */

const form = document.querySelector("form");

/** @type HTMLButtonElement */
const submitBtn = document.querySelector("button[type='submit']");
const submitStatusSvg = submitBtn.getElementsByTagName("svg")[0];

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const recipeUrl = formData.get("recipe-url").toString() || "";

  const notLoadingSvg = submitStatusSvg.innerHTML;

  submitBtn.disabled = true;
  submitStatusSvg.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
</svg>`;

  const res = await fetch(`/api?url=${recipeUrl}`);
  const payload = await res.json();

  submitBtn.disabled = false;
  submitStatusSvg.innerHTML = notLoadingSvg;

  if (!res.ok) {
    logError(payload.errors);
  } else {
    showRecipe(payload);
  }
});

// TODO: Implement this logger.
/** @param {string} errorMsg */
function logError() {}

const results = document.getElementById("results");

/** @param {Recipe} recipe */
function showRecipe(recipe) {
  const recipeArticle = document.createElement("article");
  recipeArticle.classList.add("recipe");

  const recipeTitle = document.createElement("h2");
  recipeTitle.textContent = recipe.title;
  recipeArticle.appendChild(recipeTitle);

  if (recipe.description) {
    const recipeDescription = document.createElement("p");
    recipeDescription.textContent = recipe.description;
    recipeArticle.appendChild(recipeDescription);
  }

  const recipeFigure = document.createElement("figure");
  const recipeImg = document.createElement("img");

  recipeImg.src = recipe.img;

  recipeFigure.appendChild(recipeImg);
  recipeArticle.appendChild(recipeFigure);

  results.appendChild(recipeArticle);
}
