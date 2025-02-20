from fastapi import FastAPI, Response
import os, json, requests

app = FastAPI()
BASE_FOLDER = os.path.join("..", "..", "02_Text-based_Data_Formats")
FILE_NAME = "me"
ENCODE = "utf-8"
BASE_URL = "http://127.0.0.1:8080"

@app.get("/json")
def json_endpoint():
  file_path = os.path.join(BASE_FOLDER, f"{FILE_NAME}.json")
  with open(file_path, encoding = ENCODE) as file:
    data = json.load(file)
  return data

@app.get("/csv")
def csv_endpoint():
  file_path = os.path.join(BASE_FOLDER, f"{FILE_NAME}.csv")
  with open(file_path, encoding = ENCODE) as file:
    data = file.read()
  return Response(content = data)

@app.get("/xml")
def xml_endpoint():
  file_path = os.path.join(BASE_FOLDER, f"{FILE_NAME}.xml")
  with open(file_path, encoding = ENCODE) as file:
    data = file.read()
  return Response(content = data)

@app.get("/yaml")
def yaml_endpoint():
  file_path = os.path.join(BASE_FOLDER, f"{FILE_NAME}.yaml")
  with open(file_path, encoding = ENCODE) as file:
    data = file.read()
  return Response(content = data)

@app.get("/txt")
def txt_endpoint():
  file_path = os.path.join(BASE_FOLDER, f"{FILE_NAME}.txt")
  with open(file_path, encoding = ENCODE) as file:
    data = file.read()
  return Response(content = data)

@app.get("/get_json")
def get_json():
  response = requests.get(f"{BASE_URL}/json")
  return response.json()

@app.get("/get_csv")
def get_csv():
  response = requests.get(f"{BASE_URL}/csv")
  return Response(content = response.text)
  
@app.get("/get_xml")
def get_xml():
  response = requests.get(f"{BASE_URL}/xml")
  return Response(content = response.text)

@app.get("/get_yaml")
def get_yaml():
  response = requests.get(f"{BASE_URL}/yaml")
  return Response(content = response.text)

@app.get("/get_txt")
def get_txt():
  response = requests.get(f"{BASE_URL}/txt")
  return Response(content = response.text)