import { expect, test } from "vitest";
import { JSDOM } from "jsdom";

import scraper from "./paulinaCocina";

test("Titulo de seccion de ingredientes no encontrada", () => {
	const dom = new JSDOM(`
<h3></h3>
<ul></ul>
<ol></ol>
`);

	const resultado = scraper(dom.window.document);

	expect(resultado).toBeNull();
});

test("Listado de ingredientes no encontrada", () => {
	const dom = new JSDOM(`
<h3 id="ingredientes"></h3>
<ol></ol>
`);

	const resultado = scraper(dom.window.document);

	expect(resultado).toBeNull();
});

test("Listado de pasos no encontrada", () => {
	const dom = new JSDOM(`
<h3 id="ingredientes"></h3>
<ul></ul>
`);

	const resultado = scraper(dom.window.document);

	expect(resultado).toBeNull();
});

test("Se encuentran los resultados deseados", () => {
	const dom = new JSDOM(`
<h3 id="ingredientes"></h3>
<ul>
  <li>500 gr de carne picada&nbsp;</li>
  <li>1/2 taza de pan rallado</li>
  <li>2 cucharadas grandes de salsa de tomate</li>
  <li>1 cucharadita de tomillo seco</li>
</ul>
<h3 id="como-hacer-pastel-de-carne-paso-a-paso">Cómo hacer pastel de carne paso a paso</h3>
<ol>
	<li>Precalentar el horno a 180°C. En una sartén grande a fuego</li>
	<li>En un bol grande combinar la carne picada, el huevo batido</li>
	<li>Transferir a un molde para horno engrasado y presionar lig</li>
	<li>Hervir las papas en agua con sal hasta que estén tiernas, </li>
	<li>Extender el puré sobre la mezcla de carne en el molde hast</li>
</ol>
`);

	const resultado = scraper(dom.window.document);

	expect(resultado?.ingredientes).toEqual(
		expect.arrayContaining([
			"500 gr de carne picada",
			"1/2 taza de pan rallado",
			"2 cucharadas grandes de salsa de tomate",
			"1 cucharadita de tomillo seco"
		])
	);

	expect(resultado?.pasos).toEqual(
		expect.arrayContaining([
			"Precalentar el horno a 180°C. En una sartén grande a fuego",
			"En un bol grande combinar la carne picada, el huevo batido",
			"Transferir a un molde para horno engrasado y presionar lig",
			"Hervir las papas en agua con sal hasta que estén tiernas,",
			"Extender el puré sobre la mezcla de carne en el molde hast"
		])
	);
});

test("Se extraen las etiquetas de la receta", () => {
	const dom = new JSDOM(`
<meta property="article:tag" content="ajo" />
<meta property="article:tag" content="carne picada" />
<meta property="article:tag" content="huevos" />
<h3 id="ingredientes"></h3>
<ul></ul>
<ol></ol>
`);

	const resultado = scraper(dom.window.document);

	expect(resultado?.etiquetas).toEqual(expect.arrayContaining(["ajo", "carne picada", "huevos"]));
});
