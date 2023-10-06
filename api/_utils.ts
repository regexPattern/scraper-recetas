import type { VercelResponse } from "@vercel/node";
import type { RecipeMetaTag, Scraper } from "./types.js";

import { JSDOM } from "jsdom";

export async function fetchAndScrape(
	url: URL,
	apiRes: VercelResponse,
	scraper: Scraper,
) {
	const pageRes = await fetch(url);

	if (!pageRes.ok) {
		apiRes.status(500).json({
			message: `Error '${pageRes.status}' al descargar la página '${url}'`,
		});
		return;
	}

	const rawHtml = await pageRes.text();
	const dom = new JSDOM(rawHtml);

	try {
		const receta = scraper(dom.window.document);
		apiRes.status(200).json(receta);
	} catch (error) {
		let message;

		if (error instanceof Error) {
			message = error.message;
		} else {
			message = "Error generando receta";
		}

		apiRes.status(500).json({ message });
	}
}

export function scrapeOpenGraphTags(document: Document): RecipeMetaTag[] {
	const metaTagElems = document.querySelectorAll(
		"meta[property='article:tag']",
	);

	const metaTags = [];

	for (const mt of metaTagElems) {
		const categoria = mt.getAttribute("content");
		if (categoria) {
			metaTags.push(categoria);
		}
	}

	return metaTags;
}

export function getIngredientsList(
	document: Document,
	selector: string,
): Element {
	const ingredientsListElem = document.querySelector(selector);

	if (!ingredientsListElem) {
		throw Error("Lista de ingredientes no encontrada");
	}

	return ingredientsListElem;
}

export function getStepsList(
	document: Document,
	selector: string,
): Element {
	const ingredientsListElem = document.querySelector(selector);

	if (!ingredientsListElem) {
		throw Error("Lista de pasos no encontrada");
	}

	return ingredientsListElem;
}
