from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import StreamingResponse
from datetime import datetime
import asyncio
import random

app = FastAPI()

templates = Jinja2Templates(directory="templates")

@app.get("/")
def serve_root_page(request: Request):
  return templates.TemplateResponse("index.html", { "request": request })

async def date_generator():
  while True:
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    yield f"data: {now}\n\n"
    await asyncio.sleep(1)

async def text_generator():
  while True:
    word_list = ["apple", "banana", "cherry", "dragonfruit", "elephant", "forest"]
    random_word = random.choice(word_list)
    yield f"data: {random_word} \n\n"
    await asyncio.sleep(1)


@app.get("/sse")
def sse():
  return StreamingResponse(date_generator(), media_type="text/event-stream")

@app.get("/word")
async def date():
  return StreamingResponse(text_generator(), media_type="text/event-stream")

