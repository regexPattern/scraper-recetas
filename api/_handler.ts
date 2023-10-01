import type { VercelRequest, VercelResponse } from "@vercel/node";
import scrapers, { type Receta, type Scraper } from "./_scrapers.js";
import { JSDOM } from "jsdom";

export default async function (
  request: VercelRequest,
  response: VercelResponse,
  payloadSerializer: (receta: Receta) => string,
) {
  const parametroUrl = request.query["url"];

  if (parametroUrl === undefined) {
    response.status(400).json({ message: "Parámetro 'url-receta' requerido" });
    return;
  }

  let strUrlReceta: string;

  if (Array.isArray(parametroUrl)) {
    strUrlReceta = parametroUrl[0];
  } else {
    strUrlReceta = parametroUrl;
  }

  let objUrlReceta: URL;

  try {
    objUrlReceta = new URL(strUrlReceta);
  } catch {
    response
      .status(400)
      .json({ message: "Parámetro 'url-receta' no es un URL válido" });
    return;
  }

  console.log(`[INFO]: Recipe URL: \`${objUrlReceta}\``);

  let scraper: Scraper;

  switch (objUrlReceta.hostname) {
    case "www.paulinacocina.net":
      scraper = scrapers.paulinaCocina;
      break;
    default:
      response.status(501).json({
        message: `Parser para recetas de '${objUrlReceta.origin}' no implementado`,
      });
      return;
  }

  const res = await fetch(objUrlReceta);

  if (!res.ok) {
    response
      .status(500)
      .json({ message: `Error '${res.status}' al descargar la página` });
    return;
  }

  const rawHtml = await res.text();
  const dom = new JSDOM(rawHtml);

  try {
    const receta = scraper(dom.window.document);
    response.status(200).send(payloadSerializer(receta));
  } catch (error) {
    let message;

    if (error instanceof Error) {
      message = error.message;
    } else {
      message = "Error generando receta";
    }

    response.status(500).json({ message });
  }
}
