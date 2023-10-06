const form = document.querySelector("form")!;
const button = document.querySelector("button")!;

form.addEventListener("submit", async (event) => {
	event.preventDefault();

	const formData = new FormData(form);
	const url = formData.get("url") || "";

	const prevButtonIcon = button.innerHTML;

	button.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
</svg>
	`;

	button.disabled = true;

	const res = await fetch(`/api/paulina-cocina?url=${url}`);
	const recipe = await res.json();

	const recipeCard = document.createElement("section");
	recipeCard.classList.add("receta");

	const recipeImg = document.createElement("img");
	recipeImg.src = recipe.img;

	const recipeSql = document.createElement("pre");
	recipeSql.textContent = JSON.stringify(recipe, null, 2);

	recipeCard.append(recipeImg, recipeSql);
	document.querySelector("main")!.appendChild(recipeCard);

	button.innerHTML = prevButtonIcon;
	button.disabled = false;

	window.scroll({
		top:
			recipeCard.offsetTop -
			Number(
				getComputedStyle(recipeCard).scrollPaddingTop.replace("px", ""),
			),
		behavior: "smooth",
	});
});
