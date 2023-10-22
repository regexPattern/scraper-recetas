import json
import logging
import requests

from bs4 import BeautifulSoup
from http.server import BaseHTTPRequestHandler
from urllib import parse


SUPPOTED_WEBSITES_HOSTNAMES = ["www.paulinacocina.net"]


class handler(BaseHTTPRequestHandler):
    error_message_format = '{"errors": "%(explain)s"}'
    error_content_type = "application/json"

    def do_GET(self):
        query_str = parse.urlparse(self.path).query
        recipe_urls_params = parse.parse_qs(query_str).get("url", [])

        if len(recipe_urls_params) == 0:
            self.send_error(
                400, None, "Missing 'url' query params indicating the website to scrape")
            return

        recipe_url = parse.urlparse(recipe_urls_params.pop(0))

        logging.info(recipe_url.geturl())

        if not (recipe_url.hostname in SUPPOTED_WEBSITES_HOSTNAMES):
            self.send_error(
                501, None, f"Recipe scraping is only supported for the following websites: {SUPPOTED_WEBSITES_HOSTNAMES}")
            return

        try:
            req = requests.get(recipe_url.geturl())
        except Exception:
            self.send_error(500, None, "Couldn't fetch the recipe website")
            return

        parser = BeautifulSoup(req.text, "html.parser")

        opengraph_tag_nodes = parser.find_all("meta", {"property": "article:tag"})
        recipe_tags = list(map(lambda tag: tag["content"], opengraph_tag_nodes))

        try:
            title = parser.find("h1", attrs={"class": "entry-title"}).text
        except AttributeError:
            self.send_error(
                400, None, "Couldn't find the recipe's title in the given webpage")
            return

        description = ""

        if description_node := parser.find("meta", {"name": "description"}):
            description = description_node["content"] or ""

        try:
            image_node = parser.find(
                attrs={"class": "post-thumb-img-content"}).find("img")
        except AttributeError:
            self.send_error(
                400, None, "Couldn't find the recipe's image in the given webpage")
            return

        ingredients_section_node = parser.find(id="ingredientes")

        try:
            ingredient_li_nodes = ingredients_section_node.find_next_sibling(
                "ul").find_all("li")
        except AttributeError:
            self.send_error(
                400, None, "Couldn't find the recipe's ingredients list in the given webpage")
            return

        try:
            steps_ol_nodes = ingredients_section_node.find_next_sibling(
                "ol").find_all("li")
        except AttributeError:
            self.send_error(
                400, None, "Couldn't find the recipe's steps list in the given webpage")
            return

        ingredients = list(map(lambda li: li.text, ingredient_li_nodes))
        steps = list(map(lambda li: li.text, steps_ol_nodes))

        recipe_data = {
            "title": title,
            "description": description,
            "img": image_node["src"],
            "tags": recipe_tags,
            "ingredients": ingredients,
            "steps": steps,
        }

        logging.info(json.dumps(recipe_data, indent=4))

        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(recipe_data).encode())
