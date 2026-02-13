from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import wechat_service
from generator import Generator
import pandas as pd
import os
import logging
import config

# Configure logging
logging.basicConfig(
    filename=config.LOG_CONFIG["LOG_FILE"],
    level=getattr(logging, config.LOG_CONFIG["LOG_LEVEL"]),
    format=config.LOG_CONFIG["LOG_FORMAT"]
)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Generator instance
generator_instance = None

class ConfigRequest(BaseModel):
    api_key: str

class GenerateRequest(BaseModel):
    contact_name: str
    answers: dict
    model: Optional[str] = "deepseek/deepseek-v3.2"

class ManualInputRequest(BaseModel):
    text: str

class LocalDBSyncRequest(BaseModel):
    db_path: str
    key_hex: str

class QuestionRequest(BaseModel):
    contact_name: str
    history: list
    model: str

class FinalGreetingRequest(BaseModel):
    contact_name: str
    history: list
    model: str

class ExportRequest(BaseModel):
    contacts: List[dict]

@app.post("/config")
def config_api(req: ConfigRequest):
    global generator_instance
    generator_instance = Generator(req.api_key)
    if not generator_instance.validate_key():
        raise HTTPException(status_code=400, detail="Invalid API Key")
    return {"status": "ok"}

@app.post("/generate/question")
def get_question(req: QuestionRequest):
    if not generator_instance:
        raise HTTPException(status_code=400, detail="Config API Key first")
    result = generator_instance.get_next_question(req.contact_name, req.history, model=req.model)
    return result

@app.post("/generate/final")
def get_final_greeting(req: FinalGreetingRequest):
    if not generator_instance:
        raise HTTPException(status_code=400, detail="Config API Key first")
    greeting = generator_instance.generate_final_greeting(req.contact_name, req.history, model=req.model)
    return {"greeting": greeting}

@app.post("/contacts/export")
def export_contacts(req: ExportRequest):
    df = pd.DataFrame(req.contacts)
    # Reorder or select columns if needed
    cols = ["name", "nickname", "greeting"]
    available_cols = [c for c in cols if c in df.columns]
    data_to_export = df[available_cols] if not df.empty else df
    
    filename = "wechat_greetings_export.csv"
    data_to_export.to_csv(filename, index=False, encoding='utf-8-sig')
    
    from fastapi.responses import FileResponse
    return FileResponse(filename, filename=filename, media_type='text/csv')

@app.post("/wechat/login")
def start_wechat_login():
    wechat_service.start_login()
    return {"status": "starting"}

@app.get("/wechat/status")
def get_login_status():
    return wechat_service.get_status()

import mac_reader
import vision_scanner

@app.get("/wechat/mac_read")
def get_mac_contacts_bridge():
    # Previous manual mac reader
    contacts = mac_reader.get_mac_contacts()
    return {"friends": contacts}

@app.get("/wechat/auto_scan")
async def start_auto_scan():
    """
    Triggers the robot to scroll and scan.
    Note: In a real world, this should be a background task to avoid timeout.
    """
    scanner = vision_scanner.get_scanner()
    results = scanner.auto_scan()
    
    if isinstance(results, dict) and "error" in results:
        raise HTTPException(status_code=500, detail=results["error"])
        
    return {"friends": results}

@app.get("/wechat/auto_scan/status")
def get_scan_status():
    scanner = vision_scanner.get_scanner()
    return {"scanning": scanner.scanning}

@app.get("/wechat/check_permissions")
def check_permissions_api():
    scanner = vision_scanner.get_scanner()
    return scanner.check_permissions()

import db_decrypt_service

@app.get("/wechat/local_db/detect")
def detect_local_dbs():
    paths = db_decrypt_service.get_possible_db_paths()
    return {"paths": paths}

@app.post("/wechat/local_db/sync")
def sync_local_db(req: LocalDBSyncRequest):
    decrypter = db_decrypt_service.WeChatDBDecrypt(req.db_path, req.key_hex)
    temp_out = "decrypted_contact_temp.db"
    
    success, msg = decrypter.decrypt(temp_out)
    if not success:
        raise HTTPException(status_code=400, detail=f"解密失败: {msg}")
        
    try:
        contacts = db_decrypt_service.extract_contacts(temp_out)
        # Cleanup
        if os.path.exists(temp_out):
            os.remove(temp_out)
        return {"friends": contacts}
    except Exception as e:
        if os.path.exists(temp_out):
            os.remove(temp_out)
        raise HTTPException(status_code=500, detail=f"扫描失败: {str(e)}")

@app.get("/wechat/friends")
def get_friends():
    friends = wechat_service.get_friends()
    return {"count": len(friends), "friends": friends}

@app.post("/contacts/parse_manual")
def parse_manual(req: ManualInputRequest):
    # Split by newline or common separators
    import re
    raw_text = req.text
    # Replace common separators with newline
    text = re.sub(r'[,，;；]', '\n', raw_text)
    lines = [line.strip() for line in text.split('\n') if line.strip()]

    contacts = []
    for i, name in enumerate(lines):
        contacts.append({
            "id": f"manual_{i}",
            "name": name,
            "nickname": name,
            "remark": "",
            "city": ""
        })
    return {"count": len(contacts), "friends": contacts}

@app.post("/generate")
def generate_greeting(req: GenerateRequest):
    global generator_instance
    if not generator_instance:
         # Use a mock/default if not configured (or raise error)
         # For testing flow without key, we can return a mock
         raise HTTPException(status_code=400, detail="Please configure API Key first")
    
    greeting = generator_instance.generate_greeting(req.contact_name, req.answers, model=req.model)
    return {"greeting": greeting}

@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
