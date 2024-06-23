from fastapi import FastAPI
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import os
import asyncio
from supabase import create_client, Client
from hume import HumeStreamClient
from hume.models.config import FaceConfig
import requests


app = FastAPI(docs_url="/server/docs", openapi_url="/server/openapi.json")


@app.get("/server/home")
async def health_check():
    return {"message":"The health check is successful"}


@app.get("/server/humeAPi")
async def main():
    os.environ['SUPABASE_URL'] = 'https://dbijhxjcgykfejomfrwj.supabase.co'
    os.environ['SUPABASE_KEY'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiaWpoeGpjZ3lrZmVqb21mcndqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkwODIwOTksImV4cCI6MjAzNDY1ODA5OX0.bGxdJhRWCBTHBEj_yRunCt7yLLpgciRKpDsKqnLi3Nc'

    url: str = os.environ.get("SUPABASE_URL")
    key: str = os.environ.get("SUPABASE_KEY")

    folder_path = "server/images"
    os.makedirs(folder_path, exist_ok=True)
    
    # Debugging print statements
    
    if not url or not key:
        raise ValueError("Supabase URL and Key must be set")

    supabase: Client = create_client(url, key)

    bucket_name = 'images'

    all_images = supabase.storage.from_(bucket_name).list()


    #Sends images from subasbase to local folder
    for image in all_images:
        #print(image)
        image_name = image['name']

        image_url = supabase.storage.from_(bucket_name).get_public_url(image_name)
        image_path = os.path.join(folder_path, image_name)

        # Download the image
        response = requests.get(image_url)
        if response.status_code == 200:
            with open(image_path, "wb") as file:
                file.write(response.content)
            result = f"Image saved to {image_path}"
        else:
            result = "Failed to download the image"
        #print(result)
    

    client = HumeStreamClient("GO75OuuxF6CjvRfiliqDxQJTCYbWo0Gtbrv5szt5LLl9cpvA")
    output = {}


    config = FaceConfig(identify_faces=True)

    
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            # Get the full path of the image
            image_path = os.path.join(root, file)

            async with client.connect([config]) as socket:
                result = await socket.send_file(image_path)
                data = result["face"]["predictions"][0]["emotions"]
                emotions = sorted(data, key=lambda x: x['score'], reverse=True)
                for i in range(4):    
                    output[emotions[i]['name']] = int(emotions[i]["score"]*10)

            print(output)
            response = supabase.table('hume').upsert({"id":1, "emotionsJSON":output}).execute()
            return response
# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="127.0.0.1", port=3000)
