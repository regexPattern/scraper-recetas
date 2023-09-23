export type ResultadoScraper = {
	etiquetas: string[];
	ingredientes: string[];
	pasos: string[];
};

import paulinaCocina from "./paulinaCocina";

export default { paulinaCocina } satisfies {
	[x: string]: (documento: Document) => ResultadoScraper | null;
};
