from fastapi import FastAPI
import requests


app = FastAPI()

@app.get("/fastapiData")
def getFastAPIData():
  return { "data": "Data from fastAPI" }

@app.get("/requestExpressData")
def getExpressData():
  response = requests.get("http://127.0.0.1:8080/expressData")
  return response.json()
  

