import { error, type RequestHandler } from "@sveltejs/kit";
import { JSDOM } from "jsdom";

import scrapers, { type ResultadoScraper } from "$lib/server/scrapers";

export const GET: RequestHandler = async ({ fetch, url }) => {
	const rawUrlReceta = url.searchParams.get("url");

	if (!rawUrlReceta) {
		throw error(400, "URL de receta requerido como parametro `url`.");
	}

	const urlReceta = new URL(decodeURI(rawUrlReceta));

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
