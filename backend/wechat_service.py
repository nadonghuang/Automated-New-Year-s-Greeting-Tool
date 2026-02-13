import itchat
from itchat.content import *
import threading
import time
import base64
import io
import qrcode as qrcode_lib
from PIL import Image

import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global state
qr_code_base64 = None
is_logged_in = False
login_status = "IDLE" # IDLE, WAITING_SCAN, LOGGED_IN, FAILED
last_error = None

def qr_callback(uuid, status, qrcode):
    global qr_code_base64, login_status
    logger.info(f"QR Callback: status={status} (type: {type(status)}), uuid={uuid}")
    
    if str(status) == '0' or status == 0:
        login_status = "WAITING_SCAN"
        logger.info(f"Generating QR code for UUID: {uuid}")
        
        try:
            url = f'https://login.weixin.qq.com/l/{uuid}'
            qr = qrcode_lib.QRCode(version=1, box_size=10, border=5)
            qr.add_data(url)
            qr.make(fit=True)
            img = qr.make_image(fill_color="black", back_color="white")
            
            buffered = io.BytesIO()
            img.save(buffered, format="PNG")
            img_b64 = base64.b64encode(buffered.getvalue()).decode("utf-8")
            qr_code_base64 = f"data:image/png;base64,{img_b64}"
            logger.info("QR code generated successfully")
        except Exception as e:
            logger.error(f"Failed to generate QR: {e}")
            
    elif str(status) == '200' or status == 200:
        login_status = "LOGGED_IN"
        qr_code_base64 = None

def login_thread():
    global is_logged_in, login_status, last_error
    try:
        itchat.auto_login(hotReload=False, qrCallback=qr_callback, statusStorageDir='itchat.pkl')
        is_logged_in = True
        login_status = "LOGGED_IN"
        last_error = None
    except Exception as e:
        logger.error(f"Login failed detected in thread", exc_info=True)
        login_status = "FAILED"
        is_logged_in = False
        last_error = str(e)

def start_login():
    global login_status, last_error
    login_status = "WAITING_SCAN"
    last_error = None
    t = threading.Thread(target=login_thread)
    t.daemon = True
    t.start()

def get_status():
    global login_status, qr_code_base64, is_logged_in, last_error
    if is_logged_in:
         login_status = "LOGGED_IN"
    
    return {
        "status": login_status,
        "qr_code": qr_code_base64,
        "is_logged_in": is_logged_in,
        "error": last_error
    }

def get_friends():
    if not is_logged_in:
        return []
    try:
        friends = itchat.get_friends(update=True)
        # Process friends list to return simple structure
        processed_friends = []
        for f in friends:
            # Skip self
            if f['UserName'] == itchat.search_friends()['UserName']:
                continue
                
            name = f.get('RemarkName') or f.get('NickName') or "Unknown"
            avatar = f.get('HeadImgUrl') # We might need to fetch this through itchat
            
            processed_friends.append({
                "id": f.get('UserName'),
                "name": name,
                "nickname": f.get('NickName'),
                "remark": f.get('RemarkName'),
                "signature": f.get('Signature'),
                "city": f.get('City')
            })
        return processed_friends
    except Exception as e:
        logger.error(f"Error getting friends: {e}", exc_info=True)
        return []

def logout():
    global is_logged_in, login_status
    try:
        itchat.logout()
    except:
        pass
    is_logged_in = False
    login_status = "IDLE"
