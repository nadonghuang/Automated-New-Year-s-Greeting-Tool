import os
import logging

API_KEY = os.getenv("OPENROUTER_API_KEY", "")

def validate_config():
    errors = []
    warnings = []
    
    if not API_KEY:
        warnings.append("OPENROUTER_API_KEY not set - will need to configure via UI")
    elif not API_KEY.startswith("sk-or-"):
        warnings.append("OPENROUTER_API_KEY may be invalid (expected to start with 'sk-or-')")
    
    rate_limit_config = int(os.getenv("RATE_LIMIT_CONFIG_PER_MINUTE", "10"))
    if rate_limit_config < 1 or rate_limit_config > 100:
        errors.append(f"RATE_LIMIT_CONFIG_PER_MINUTE should be between 1 and 100, got {rate_limit_config}")
    
    return {"errors": errors, "warnings": warnings}

LOG_CONFIG = {
    "LOG_FILE": os.getenv("LOG_FILE", "app.log"),
    "LOG_LEVEL": os.getenv("LOG_LEVEL", "INFO"),
    "LOG_FORMAT": "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
}

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")

RATE_LIMIT_CONFIG = {
    "config_requests_per_minute": int(os.getenv("RATE_LIMIT_CONFIG_PER_MINUTE", "10")),
    "generate_requests_per_minute": int(os.getenv("RATE_LIMIT_GENERATE_PER_MINUTE", "30")),
}

MODEL_CONFIG = {
    "default_model": os.getenv("DEFAULT_MODEL", "deepseek/deepseek-v3.2"),
    "max_history_length": int(os.getenv("MAX_HISTORY_LENGTH", "20")),
    "request_timeout": float(os.getenv("REQUEST_TIMEOUT", "60.0")),
    "max_retries": int(os.getenv("MAX_RETRIES", "3")),
}

config_validation = validate_config()
if config_validation["errors"]:
    logging.error(f"Configuration errors: {config_validation['errors']}")
if config_validation["warnings"]:
    logging.warning(f"Configuration warnings: {config_validation['warnings']}")
