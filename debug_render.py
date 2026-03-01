import requests
import json

url = "https://api.render.com/v1/services"
headers = {
    "Authorization": "Bearer rnd_sOauqnNEDKzLS3lhR6QK31ETzItA",
    "Content-Type": "application/json"
}

payload = {
    "type": "web_service",
    "name": "school-system-backend",
    "ownerId": "tea-d58j4fggjchc73a6ru9g",
    "repo": "https://github.com/hamidali1929/school-system",
    "autoDeploy": "yes",
    "serviceDetails": {
        "env": "node",
        "region": "oregon",
        "plan": "free",
        "rootDir": "server",
        "envSpecificDetails": {
            "buildCommand": "npm install",
            "startCommand": "node index.js"
        }
    }
}

response = requests.post(url, json=payload, headers=headers)
with open('debug_output.txt', 'w') as f:
    f.write(str(response.status_code) + '\n')
    f.write(response.text)

