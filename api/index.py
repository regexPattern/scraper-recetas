import json
import logging
from http.server import BaseHTTPRequestHandler
from urllib import parse

import requests
from bs4 import BeautifulSoup

SUPPOTED_WEBSITES_HOSTNAMES = ["www.paulinacocina.net"]


class handler(BaseHTTPRequestHandler):
    error_message_format = '{"errors": "%(explain)s"}'
    error_content_type = "application/json"

    def do_GET(self):
        query_str = parse.urlparse(self.path).query
        recipe_urls_params = parse.parse_qs(query_str).get("url", [])

        if len(recipe_urls_params) == 0:
            self.send_error(
                400,
                None,
                "Falta el query param 'url', que indica el sitio web a indexar",
            )
            return

        recipe_url = parse.urlparse(recipe_urls_params.pop(0))

        logging.info(recipe_url.geturl())

        if not (recipe_url.hostname in SUPPOTED_WEBSITES_HOSTNAMES):
            self.send_error(
                501,
                None,
                f"El indexado de recetas solo está implementado para los siguientes sitios: {SUPPOTED_WEBSITES_HOSTNAMES}",
            )
            return

        try:
            req = requests.get(recipe_url.geturl())
        except Exception:
            self.send_error(500, None, "No se pudo acceder al sitio correctamente")
            return

        parser = BeautifulSoup(req.text, "html.parser")

        opengraph_tag_nodes = parser.find_all("meta", {"property": "article:tag"})
        etiquetas = list(map(lambda tag: tag["content"], opengraph_tag_nodes))

        try:
            titulo = parser.find("h1", attrs={"class": "entry-title"}).text
        except AttributeError:
            self.send_error(
                400,
                None,
                "No se pudo encontrar el título de la receta en el sitio provisto",
            )
            return

        descripcion = ""

        if description_node := parser.find("meta", {"name": "description"}):
            descripcion = description_node["content"] or ""

        try:
            image_node = parser.find(attrs={"class": "post-thumb-img-content"}).find(
                "img"
            )
        except AttributeError:
            self.send_error(
                400,
                None,
                "No se pudo encontrar la imagen de la receta en el sitio provisto",
            )
            return

        ingredients_section_node = parser.find(id="ingredientes")

        try:
            ingredient_li_nodes = ingredients_section_node.find_next_sibling(
                "ul"
            ).find_all("li")
        except AttributeError:
            self.send_error(
                400,
                None,
                "No se pudo encontrar la lista de ingredientes de la receta en el sitio provisto",
            )
            return

        try:
            steps_ol_nodes = ingredients_section_node.find_next_sibling("ol").find_all(
                "li"
            )
        except AttributeError:
            self.send_error(
                400,
                None,
                "No se pudo encontrar la lista de pasos de la receta en el sitio provisto",
            )
            return

        ingredientes = list(map(lambda li: li.text, ingredient_li_nodes))
        pasos = list(map(lambda li: li.text, steps_ol_nodes))

        recipe_data = {
            "url": recipe_url.geturl(),
            "titulo": titulo,
            "descripcion": descripcion,
            "img": image_node["src"],
            "etiquetas": etiquetas,
            "ingredientes": ingredientes,
            "pasos": pasos,
        }

        logging.info(json.dumps(recipe_data, indent=4))

        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(recipe_data).encode())
