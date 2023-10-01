import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { Receta } from "./_scrapers.js";
import handler from "./_handler.js";

export default async function (
  request: VercelRequest,
  response: VercelResponse,
) {
  handler(request, response, (receta: Receta) => {
    return JSON.stringify(receta);
  });
}
