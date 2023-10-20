import json
import logging
import requests

from urllib import parse
from http.server import BaseHTTPRequestHandler
from bs4 import BeautifulSoup


logging.basicConfig(level=logging.INFO)


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        query_str = parse.urlparse(self.path).query
        recipe_urls_params = parse.parse_qs(query_str).get("url", [])

        if len(recipe_urls_params) == 0:
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self.wfile.write(b'{"error": "Missing `url` query param."}')
            return

        recipe_url = parse.urlparse(recipe_urls_params.pop(0))

        logging.info(recipe_url.geturl())

        if recipe_url.hostname != "www.paulinacocina.net":
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self.wfile.write(
                b'{"error": f"Scraping for `{recipe_url.hostname}` is not supported."}')
            return

        try:
            req = requests.get(recipe_url.geturl())
        except Exception as error:
            self.send_response(500)
            self.end_headers()
            return

        parser = BeautifulSoup(req.text, "html.parser")

        meta_tag_nodes = parser.find_all("meta", {"property": "article:tag"})
        recipe_tags = list(map(lambda meta: meta["content"], meta_tag_nodes))

        try:
            image_node = parser.find(
                attrs={"class": "post-thumb-img-content"}).find("img")
        except AttributeError:
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self.wfile.write(
                b'{"error": "Missing recipe image in then given webpage."}')
            return

        ingredients_section_node = parser.find(id="ingredientes")

        try:
            ingredient_li_nodes = ingredients_section_node.find_next_sibling(
                "ul").find_all("li")
        except AttributeError:
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self.wfile.write(
                b'{"error": "Missing ingredients list in then given webpage."}')
            return

        try:
            steps_ol_nodes = ingredients_section_node.find_next_sibling(
                "ol").find_all("li")
        except AttributeError:
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self.wfile.write(
                b'{"error": "Missing steps list in then given webpage."}')
            return

        ingredients = list(map(lambda li: li.text, ingredient_li_nodes))
        steps = list(map(lambda li: li.text, steps_ol_nodes))

        recipe_data = {
            "img": image_node["src"],
            "etiquetas": recipe_tags,
            "ingredientes": ingredients,
            "pasos": steps,
        }

        logging.info(json.dumps(recipe_data, indent=4))

        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(recipe_data).encode("utf-8"))
