from fastapi import FastAPI, HTTPException, Request, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
import wechat_service
from generator import Generator
import pandas as pd
import os
import re
import logging
import config
import threading
import uuid
import time

# Configure logging
logging.basicConfig(
    filename=config.LOG_CONFIG["LOG_FILE"],
    level=getattr(logging, config.LOG_CONFIG["LOG_LEVEL"]),
    format=config.LOG_CONFIG["LOG_FORMAT"]
)
logger = logging.getLogger(__name__)

app = FastAPI()

MAX_REQUEST_BODY_SIZE = 10 * 1024 * 1024

@app.middleware("http")
async def limit_request_body_size(request: Request, call_next):
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > MAX_REQUEST_BODY_SIZE:
        return JSONResponse(
            status_code=413,
            content={"detail": "请求体大小超过限制 (最大 10MB)"}
        )
    return await call_next(request)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

# CORS for frontend - 使用配置的来源
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    max_age=600,
)

# Generator storage (thread-safe alternative to global variable)
class GeneratorStorage:
    _instance = None
    _generator = None
    _lock = threading.Lock()
    _created_at = None
    _MAX_AGE_SECONDS = 3600

    @classmethod
    def set_generator(cls, generator: Generator):
        with cls._lock:
            cls._generator = generator
            cls._created_at = time.time()

    @classmethod
    def get_generator(cls) -> Optional[Generator]:
        with cls._lock:
            if cls._generator is None:
                return None
            if cls._created_at and (time.time() - cls._created_at > cls._MAX_AGE_SECONDS):
                logger.info("Generator instance expired, clearing...")
                cls._generator = None
                cls._created_at = None
                return None
            return cls._generator

    @classmethod
    def clear_generator(cls):
        with cls._lock:
            cls._generator = None
            cls._created_at = None

    @classmethod
    def refresh_timestamp(cls):
        with cls._lock:
            if cls._generator is not None:
                cls._created_at = time.time()

class ConfigRequest(BaseModel):
    api_key: str = Field(..., min_length=10, max_length=200, description="OpenRouter API Key")

class GenerateRequest(BaseModel):
    contact_name: str = Field(..., min_length=1, max_length=100, description="Contact name")
    answers: Dict[str, Any] = Field(..., description="User answers")
    model: Optional[str] = Field("deepseek/deepseek-v3.2", description="AI model to use")

class ManualInputRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000, description="Input text for parsing")

    @validator('text')
    def sanitize_text(cls, v):
        if len(v.strip()) == 0:
            raise ValueError('Text cannot be empty')
        return v.strip()

class QuestionRequest(BaseModel):
    contact_name: str = Field(..., min_length=1, max_length=100, description="Contact name")
    history: List[Dict[str, str]] = Field(..., max_length=50, description="Question history")
    model: str = Field(..., description="AI model to use")

    @validator('history')
    def validate_history(cls, v):
        if not isinstance(v, list):
            raise ValueError('History must be a list')
        for item in v:
            if not isinstance(item, dict):
                raise ValueError('History items must be dictionaries')
        return v

class FinalGreetingRequest(BaseModel):
    contact_name: str = Field(..., min_length=1, max_length=100, description="Contact name")
    history: List[Dict[str, str]] = Field(..., max_length=50, description="Question history")
    model: str = Field(..., description="AI model to use")

class ExportRequest(BaseModel):
    contacts: List[Dict[str, Any]] = Field(..., max_length=1000, description="Contacts to export")

@app.post("/config")
@limiter.limit(f"{config.RATE_LIMIT_CONFIG['config_requests_per_minute']}/minute")
def config_api(req: ConfigRequest, request: Request):
    generator = Generator(req.api_key)
    is_valid, message = generator.validate_key()
    if not is_valid:
        logger.warning(f"API Key validation failed: {message}")
        raise HTTPException(status_code=400, detail=message)
    GeneratorStorage.set_generator(generator)
    logger.info("API Key configured successfully")
    return {"status": "ok"}

@app.post("/generate/question")
@limiter.limit(f"{config.RATE_LIMIT_CONFIG['generate_requests_per_minute']}/minute")
def get_question(req: QuestionRequest, request: Request):
    generator = GeneratorStorage.get_generator()
    if not generator:
        raise HTTPException(status_code=400, detail="Please configure API Key first")
    result = generator.get_next_question(req.contact_name, req.history, model=req.model)
    return result

@app.post("/generate/final")
@limiter.limit(f"{config.RATE_LIMIT_CONFIG['generate_requests_per_minute']}/minute")
def get_final_greeting(req: FinalGreetingRequest, request: Request):
    generator = GeneratorStorage.get_generator()
    if not generator:
        raise HTTPException(status_code=400, detail="Please configure API Key first")
    greeting = generator.generate_final_greeting(req.contact_name, req.history, model=req.model)
    return {"greeting": greeting}

@app.post("/contacts/export")
@limiter.limit("10/minute")
def export_contacts(req: ExportRequest, request: Request):
    import tempfile
    import os
    from fastapi.responses import FileResponse
    from starlette.background import BackgroundTask
    
    contacts_data = []
    for c in req.contacts:
        contacts_data.append({
            "name": c.get("name", ""),
            "nickname": c.get("nickname", ""),
            "remark": c.get("remark", ""),
            "greeting": c.get("greeting", "")
        })
    
    df = pd.DataFrame(contacts_data)
    
    with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False, encoding='utf-8-sig') as f:
        df.to_csv(f.name, index=False, encoding='utf-8-sig')
        temp_path = f.name
    
    def cleanup():
        try:
            os.unlink(temp_path)
        except:
            pass
    
    return FileResponse(
        temp_path, 
        filename="wechat_greetings_export.csv", 
        media_type='text/csv',
        background=BackgroundTask(cleanup)
    )

@app.post("/wechat/login")
@limiter.limit("5/minute")
def start_wechat_login(request: Request):
    wechat_service.start_login()
    return {"status": "starting"}

@app.get("/wechat/status")
@limiter.limit("30/minute")
def get_login_status(request: Request):
    return wechat_service.get_status()

@app.get("/wechat/friends")
@limiter.limit("10/minute")
def get_friends(request: Request):
    friends = wechat_service.get_friends()
    return {"count": len(friends), "friends": friends}

@app.post("/wechat/logout")
@limiter.limit("5/minute")
def logout_wechat(request: Request):
    wechat_service.logout()
    return {"status": "logged_out"}

@app.post("/contacts/parse_manual")
@limiter.limit("30/minute")
def parse_manual(req: ManualInputRequest, request: Request):
    raw_text = req.text
    text = re.sub(r'[,，;；]', '\n', raw_text)
    lines = [line.strip() for line in text.split('\n') if line.strip()]

    contacts = []
    for i, line in enumerate(lines[:100]):
        parts = re.split(r'[\s:：,，]+', line, maxsplit=1)
        name = parts[0]
        remark = parts[1] if len(parts) > 1 else ""
        contacts.append({
            "id": f"manual_{i}",
            "name": name,
            "nickname": name,
            "remark": remark,
            "city": ""
        })
    return {"count": len(contacts), "friends": contacts}

@app.post("/contacts/parse_file")
@limiter.limit("10/minute")
async def parse_file(request: Request, file: UploadFile = File(...)):
    import io
    
    MAX_FILE_SIZE = 10 * 1024 * 1024
    ALLOWED_EXTENSIONS = {'.xlsx', '.xls', '.csv', '.txt'}
    
    filename = file.filename or ""
    file_ext = '.' + filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
    
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"不支持的文件类型: {file_ext}。支持: Excel (.xlsx/.xls), CSV (.csv), TXT (.txt)"
        )
    
    content = await file.read()
    
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail=f"文件过大，最大支持 {MAX_FILE_SIZE // (1024*1024)}MB")
    
    contacts = []
    header_keywords = ['name', 'nickname', '姓名', '名字', 'remark', '备注', 'greeting', '祝福']
    
    def is_header_row(first_cell: str) -> bool:
        if not first_cell:
            return False
        first_lower = first_cell.lower().strip()
        return any(kw in first_lower for kw in header_keywords)
    
    try:
        if filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(io.BytesIO(content), header=None)
            for i, row in df.iterrows():
                if len(contacts) >= 500:
                    break
                name = str(row.iloc[0]) if pd.notna(row.iloc[0]) else ""
                if i == 0 and is_header_row(name):
                    continue
                if name and name.strip():
                    remark = str(row.iloc[2]) if len(row) > 2 and pd.notna(row.iloc[2]) else ""
                    greeting = str(row.iloc[3]) if len(row) > 3 and pd.notna(row.iloc[3]) else ""
                    contacts.append({
                        "id": f"excel_{i}",
                        "name": name.strip(),
                        "nickname": name.strip(),
                        "remark": remark.strip() if remark else "",
                        "greeting": greeting.strip() if greeting and greeting.strip().lower() != 'greeting' else "",
                        "city": ""
                    })
        elif filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(content), header=None, encoding='utf-8-sig')
            for i, row in df.iterrows():
                if len(contacts) >= 500:
                    break
                name = str(row.iloc[0]) if pd.notna(row.iloc[0]) else ""
                if i == 0 and is_header_row(name):
                    continue
                if name and name.strip():
                    remark = str(row.iloc[2]) if len(row) > 2 and pd.notna(row.iloc[2]) else ""
                    greeting = str(row.iloc[3]) if len(row) > 3 and pd.notna(row.iloc[3]) else ""
                    contacts.append({
                        "id": f"csv_{i}",
                        "name": name.strip(),
                        "nickname": name.strip(),
                        "remark": remark.strip() if remark else "",
                        "greeting": greeting.strip() if greeting and greeting.strip().lower() != 'greeting' else "",
                        "city": ""
                    })
        elif filename.endswith('.txt'):
            text = content.decode('utf-8')
            lines = [line.strip() for line in text.split('\n') if line.strip()]
            for i, line in enumerate(lines[:500]):
                if i == 0 and is_header_row(line):
                    continue
                parts = re.split(r'[\s:：,，\t]+', line, maxsplit=3)
                name = parts[0] if len(parts) > 0 else ""
                remark = parts[2] if len(parts) > 2 else ""
                greeting = parts[3] if len(parts) > 3 else ""
                if name:
                    contacts.append({
                        "id": f"txt_{i}",
                        "name": name,
                        "nickname": name,
                        "remark": remark,
                        "greeting": greeting if greeting and greeting.lower() != 'greeting' else "",
                        "city": ""
                    })
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"File parse error: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")
    
    return {"count": len(contacts), "friends": contacts}

@app.post("/generate")
@limiter.limit(f"{config.RATE_LIMIT_CONFIG['generate_requests_per_minute']}/minute")
def generate_greeting(req: GenerateRequest, request: Request):
    generator = GeneratorStorage.get_generator()
    if not generator:
         raise HTTPException(status_code=400, detail="Please configure API Key first")
    
    greeting = generator.generate_greeting(req.contact_name, req.answers, model=req.model)
    return {"greeting": greeting}

@app.get("/health")
def health():
    return {"status": "ok"}

# Exception handlers
@app.exception_handler(RateLimitExceeded)
async def rate_limit_exception_handler(request: Request, exc: RateLimitExceeded):
    logger.warning(f"Rate limit exceeded from {get_remote_address(request)}")
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many requests, please try again later"}
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
