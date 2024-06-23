from fastapi import FastAPI
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import base64
import os
import asyncio
from supabase import create_client, Client
from hume import HumeStreamClient
from hume.models.config import FaceConfig
import requests
from dotenv import load_dotenv

load_dotenv(verbose=True)

url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

app = FastAPI(docs_url="/api/docs", openapi_url="/api/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/home")
async def health_check():
    return {"message":"The health check is successful"}


@app.get("/api/humeAPI")
async def main():
    os.environ["SUPABASE_URL"] = "https://dbijhxjcgykfejomfrwj.supabase.co"
    os.environ["SUPABASE_KEY"] = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiaWpoeGpjZ3lrZmVqb21mcndqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkwODIwOTksImV4cCI6MjAzNDY1ODA5OX0.bGxdJhRWCBTHBEj_yRunCt7yLLpgciRKpDsKqnLi3Nc"
    url: str = os.environ.get("SUPABASE_URL")
    key: str = os.environ.get("SUPABASE_KEY")
    
    # Debugging print statements
    
    if not url or not key:
        raise ValueError("Supabase URL and Key must be set")

    supabase: Client = create_client(url, key)

    bucket_name = 'images'

    all_images = supabase.storage.from_(bucket_name).list()

    all_images_name = []
    #Sends images from subasbase to local folder
    for image in all_images:
        #print(image)
        image_name = image['name']
        if len(image_name) == 0 or image_name[0] == '.':
            continue
        # print(image_name)

        image_url = supabase.storage.from_(bucket_name).get_public_url(image_name)
        # all_images_name.append(image_url)
        # image_path = os.path.join(folder_path, image_name)

        # # Download the image

        response = requests.get(image_url)
        # print('response: ')
        # # print(response.content)
        # print(type(response.content))
        all_images_name.append(base64.b64encode(response.content))

        # if response.status_code == 200:
        #     with open(image_path, "wb") as file:
        #         file.write(response.content)
        #     result = f"Image saved to {image_path}"
        # else:
        #     result = "Failed to download the image"
        #print(result)
    

    client = HumeStreamClient("GO75OuuxF6CjvRfiliqDxQJTCYbWo0Gtbrv5szt5LLl9cpvA")
    output = {}


    config = FaceConfig(identify_faces=True)
    

    # for root, dirs, files in os.walk(folder_path):
    #     for file in files:
    #         # Get the full path of the image
    #         image_path = os.path.join(root, file)

    #         async with client.connect([config]) as socket:
    #             result = await socket.send_file(image_path)
    #             data = result["face"]["predictions"][0]["emotions"]
    #             emotions = sorted(data, key=lambda x: x['score'], reverse=True)
    #             for i in range(4):    
    #                 output[emotions[i]['name']] = int(emotions[i]["score"]*10)

    #         print(output)
    #         response = supabase.table('hume').upsert({"id":1, "emotionsJSON":output}).execute()
    #         return response
    # print('bytes')
    # print(all_images_name)
    # for image_url in all_images_name:
    
    if len(all_images_name) == 0:
        output = {}
    else:
        image_url = all_images_name[0]
        # print('image_url:', image_url)
        # print('runs once')
        if not (image_url == '' or image_url == b''):
            
            async with client.connect([config]) as socket:
                # print('sanity')
                # print(image_url)
                result = await socket.send_bytes(image_url)
                # print("BYEYEYEYEEY: ", result)
                print('result:', result)
                if "predictions" in result["face"] and len(result["face"]["predictions"]) > 0:
                    data = result["face"]["predictions"][0]["emotions"]
                    emotions = sorted(data, key=lambda x: x['score'], reverse=True)
                    for i in range(4):    
                        if emotions[i]['name'] in output:
                            output[emotions[i]['name']] += int(emotions[i]["score"]*10)
                        else:
                            output[emotions[i]['name']] = int(emotions[i]["score"]*10)
                        

    print(output)
    response = supabase.table('hume').upsert({"id":1, "emotionsJSON":output}).execute()
    # print(all_images[0]['name'])
    del_response = supabase.storage.from_('images').remove(all_images[0]['name'])
    # print(del_response)

    return response
# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="127.0.0.1", port=3000)

