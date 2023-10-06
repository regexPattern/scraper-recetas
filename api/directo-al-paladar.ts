import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { Recipe } from "./types.js";

import {
	fetchAndScrape,
	getIngredientsList,
	scrapeOpenGraphTags,
} from "./_utils.js";

const QUERY_PARAMS = { URL: "url" };

export default async function (req: VercelRequest, res: VercelResponse) {
	const queryParam = req.query[QUERY_PARAMS.URL];
	let rawUrl: string;

	if (Array.isArray(queryParam)) {
		rawUrl = queryParam[0];
	} else {
		rawUrl = queryParam;
	}

	if (!rawUrl) {
		res.status(400).json({
			message: `Parámetro '${QUERY_PARAMS.URL}' requerido`,
		});
		return;
	}

	let url: URL;

	try {
		url = new URL(rawUrl);
	} catch {
		res.status(400).json({
			message: `Parámetro '${QUERY_PARAMS.URL}' debe ser un URL válido`,
		});
		return;
	}

	fetchAndScrape(url, res, scraper);
}

function scraper(document: Document): Recipe {
	const metaTags = scrapeOpenGraphTags(document);

	// TODO: En este sitio estan usando un `<picture>` para tener diferentes
	// sources. Por alguna razon, si saco directo de la imagen me toma una
	// version de la imagen de baja resolucion (no he revisado, seguro asi esta
	// el `<img>`).
	//
	const imgSrc = (
		document.querySelector(".post-asset-main img") as HTMLImageElement
	).src;

	const ingredientsListElem = getIngredientsList(
		document,
		".asset-recipe-list",
	);
	const stepsListElem = document.querySelectorAll(".asset-recipe-steps p");

	const ingredients = [];
	const steps = [];

	for (const child of ingredientsListElem.children) {
		if (child.textContent) {
      //
      // REFACTOR: Si, esta horrible yo se, solo quiero que funcione por ahora.
      //
			let ingredientAndAmount = child.textContent.split("\n");
			ingredientAndAmount = ingredientAndAmount.map((val) => val.trim());

			const ingredient = ingredientAndAmount[1];
			const amount = ingredientAndAmount[2];

			ingredients.push(`${amount} ${ingredient}`.trim());
		}
	}

	for (const child of stepsListElem) {
		if (child.textContent) {
			steps.push(child.textContent.trim());
		}
	}

	return {
		metaTags,
		img: imgSrc,
		ingredients,
		steps,
	};
}
