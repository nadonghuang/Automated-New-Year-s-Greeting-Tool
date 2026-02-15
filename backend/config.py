import os

# 日志配置
LOG_CONFIG = {
    "LOG_FILE": os.getenv("LOG_FILE", "app.log"),
    "LOG_LEVEL": os.getenv("LOG_LEVEL", "INFO"),
    "LOG_FORMAT": "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
}

# CORS 配置
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")

# 速率限制配置
RATE_LIMIT_CONFIG = {
    "config_requests_per_minute": int(os.getenv("RATE_LIMIT_CONFIG_PER_MINUTE", "10")),
    "generate_requests_per_minute": int(os.getenv("RATE_LIMIT_GENERATE_PER_MINUTE", "30")),
}
