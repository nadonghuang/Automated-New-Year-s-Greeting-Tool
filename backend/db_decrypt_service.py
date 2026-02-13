import os
import sqlite3
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

def get_possible_db_paths() -> List[str]:
    paths = []
    
    home = os.path.expanduser("~")
    wechat_path = os.path.join(home, "Library", "Containers", "com.tencent.xinWeChat", "Data", "Library", "Application Support", "com.tencent.xinWeChat")
    
    if os.path.exists(wechat_path):
        for account in os.listdir(wechat_path):
            db_path = os.path.join(wechat_path, account, "DB", "MicroMsg.db")
            if os.path.exists(db_path):
                paths.append(db_path)
    
    return paths

class WeChatDBDecrypt:
    def __init__(self, db_path: str, key_hex: str):
        self.db_path = db_path
        self.key_hex = key_hex
        self.connection = None
    
    def connect(self) -> bool:
        try:
            self.connection = sqlite3.connect(self.db_path)
            return True
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            return False
    
    def get_contacts(self) -> List[Dict[str, Any]]:
        if not self.connection:
            if not self.connect():
                return []
        
        try:
            cursor = self.connection.cursor()
            cursor.execute("SELECT * FROM Contact")
            contacts = []
            for row in cursor.fetchall():
                contacts.append({"data": row})
            return contacts
        except Exception as e:
            logger.error(f"Failed to get contacts: {e}")
            return []
    
    def close(self):
        if self.connection:
            self.connection.close()
