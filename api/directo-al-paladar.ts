import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { Recipe } from "./types.d.ts";

import {
	fetchAndScrape,
	getIngredientsList,
	getStepsList,
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

	const imgSrc = (
		document.querySelector(".post-asset-main img") as HTMLImageElement
	).src;

	const ingredientsListElem = getIngredientsList(
		document,
		".asset-recipe-list ul",
	);
	const stepsListElem = getStepsList(document, "#ingredientes ~ ol");

	const ingredients = [];
	const steps = [];

	for (const child of ingredientsListElem.children) {
		if (child.textContent) {
			ingredients.push(child.textContent.trim());
		}
	}

	for (const child of stepsListElem.children) {
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
