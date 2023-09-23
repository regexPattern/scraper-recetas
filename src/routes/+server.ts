import { error, type RequestHandler } from "@sveltejs/kit";
import { JSDOM } from "jsdom";

import scrapers, { type ResultadoScraper } from "$lib/server/scrapers";

export const GET: RequestHandler = async ({ fetch, url }) => {
	const paramNombreReceta = url.searchParams.get("nombre-receta");
	const paramUrlReceta = url.searchParams.get("url-receta");

	if (!paramNombreReceta) {
		throw error(400, "Falta valor de `nombre-receta`.");
	} else if (!paramUrlReceta) {
		throw error(400, "Falta valor de `url-receta`.");
	}

	const urlReceta = new URL(decodeURI(paramUrlReceta.toString()));

	let scraper: (documento: Document) => ResultadoScraper | null;

	switch (urlReceta.hostname) {
		case "www.paulinacocina.net":
			scraper = scrapers.paulinaCocina;
			break;
		default:
			throw error(501, `No existe soporte para recetas de \`${urlReceta.hostname}\``);
	}

	const respuesta = await fetch(urlReceta);
	const html = await respuesta.text();

	const dom = new JSDOM(html);
	const resultadoScraper = scraper(dom.window.document);

	return new Response(JSON.stringify(resultadoScraper));
};
