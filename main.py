from fastapi import FastAPI, Query
from fastapi.responses import FileResponse
import yt_dlp
import os
import uuid

app = FastAPI()

DOWNLOAD_DIR = "downloads"
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

@app.get("/")
def home():
    return {"message": "YouTube Downloader API"}

@app.get("/download/")
def download_video(url: str = Query(..., title="YouTube Video URL"), format: str = "mp4"):
    unique_id = str(uuid.uuid4())
    output_file = os.path.join(DOWNLOAD_DIR, f"{unique_id}.%(ext)s")

    ydl_opts = {
        'format': 'bestvideo+bestaudio/best' if format == "mp4" else 'bestaudio',
        'outtmpl': output_file,
        'merge_output_format': format,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

    downloaded_files = [f for f in os.listdir(DOWNLOAD_DIR) if f.startswith(unique_id)]
    if not downloaded_files:
        return {"error": "Download failed"}

    return FileResponse(os.path.join(DOWNLOAD_DIR, downloaded_files[0]), media_type="application/octet-stream", filename=downloaded_files[0])
