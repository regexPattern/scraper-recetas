export type Receta = {
  tags: string[];
  ingredientes: string[];
  pasos: string[];
};

export type Scraper = (documentoHtml: Document) => Receta;

function paulinaCocina(documentoHtml: Document) {
  const tagsCategorias = documentoHtml.querySelectorAll(
    "meta[property='article:tag']",
  );
  const ulIngredientes = documentoHtml.querySelector("#ingredientes ~ ul");
  const olPasos = documentoHtml.querySelector("#ingredientes ~ ol");

  if (!ulIngredientes) {
    throw Error("Lista de ingredientes no encontrada");
  }

  if (!olPasos) {
    throw Error("Lista de pasos no encontrada");
  }

  const tags = [];
  const ingredientes = [];
  const pasos = [];

  for (const metaTag of tagsCategorias) {
    const categoria = metaTag.getAttribute("content");
    if (categoria) {
      tags.push(categoria);
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

  return { tags, ingredientes, pasos };
}

export default {
  paulinaCocina,
} as { [x: string]: Scraper };
