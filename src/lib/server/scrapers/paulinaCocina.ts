import type { ResultadoScraper } from ".";

const scraper = (documento: Document): ResultadoScraper | null => {
	const metaEtiquetas = documento.querySelectorAll("meta[property='article:tag']");
	const ulIngredientes = documento.querySelector("#ingredientes ~ ul");
	const olPasos = documento.querySelector("#ingredientes ~ ol");

	if (!ulIngredientes || !olPasos) {
		return null;
	}

	const etiquetas = [];
	const ingredientes = [];
	const pasos = [];

	for (const meta of metaEtiquetas) {
		const etiqueta = meta.getAttribute("content");
		if (etiqueta != null) {
			etiquetas.push(etiqueta);
		}
	}

	for (const li of ulIngredientes.children) {
		if (li.textContent) {
			ingredientes.push(li.textContent.trim());
		}
	}

	for (const li of olPasos.children) {
		if (li.textContent) {
			pasos.push(li.textContent.trim());
		}
	}

	return { etiquetas, ingredientes, pasos };
};

export default scraper;
