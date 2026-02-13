import os

# 视觉扫描配置
SCAN_CONFIG = {
    # 微信通讯录图标相对于窗口左上角的偏移量
    "CONTACTS_ICON_OFFSET_X": 35,
    "CONTACTS_ICON_OFFSET_Y": 100,
    
    # 好友列表区域相对于窗口左上角的偏移量
    "LIST_AREA_OFFSET_X": 150,
    "LIST_AREA_OFFSET_Y": 300,
    
    # 滚动步长 (正数为向上滚动，负数为向下滚动)
    # macOS 和 Windows 的滚动单位不同，这里提供默认值，可根据系统调整
    "SCROLL_UP_STEP": 50,
    "SCROLL_DOWN_STEP": -30,
    
    # 自动扫描的最大滚动次数
    "MAX_SCROLLS": 300
}

# 日志配置
LOG_CONFIG = {
    "LOG_FILE": "app.log",
    "LOG_LEVEL": "INFO",
    "LOG_FORMAT": "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
}
