import requests
from bs4 import BeautifulSoup

html = requests.get("https://en.wikipedia.org/wiki/List_of_Monty_Python_projects").text
parse_html = BeautifulSoup(html, "lxml")

tags = parse_html.find("div", { "class": "mw-parser-output" } )

projects = {
  "Initial_Category": []
}

current_category = "Initial_Category"

for tag in tags:
  if tag.name == "h2":
    current_category = tag.text.replace("[edit]", "")
    projects[current_category] = []
  elif tag.name == "ul":
    for li in tag.find_all("li"):
      projects[current_category].append(li.text)

from pprint import pprint
pprint(projects)