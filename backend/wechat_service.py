import itchat
from itchat.content import *
import threading
import time
import base64
import io
import qrcode as qrcode_lib
from PIL import Image

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

_state_lock = threading.Lock()
_qr_code_base64 = None
_is_logged_in = False
_login_status = "IDLE"
_last_error = None
_login_start_time = None
LOGIN_TIMEOUT = 120

def _get_state():
    with _state_lock:
        global _login_start_time
        current_status = _login_status
        if current_status == "WAITING_SCAN" and _login_start_time:
            if time.time() - _login_start_time > LOGIN_TIMEOUT:
                current_status = "TIMEOUT"
        return {
            "qr_code": _qr_code_base64,
            "is_logged_in": _is_logged_in,
            "login_status": current_status,
            "last_error": _last_error
        }

def _set_state(qr_code=None, is_logged_in=None, login_status=None, last_error=None):
    with _state_lock:
        global _qr_code_base64, _is_logged_in, _login_status, _last_error
        if qr_code is not None:
            _qr_code_base64 = qr_code
        if is_logged_in is not None:
            _is_logged_in = is_logged_in
        if login_status is not None:
            _login_status = login_status
        if last_error is not None:
            _last_error = last_error

def qr_callback(uuid, status, qrcode):
    logger.info(f"QR Callback: status={status} (type: {type(status)}), uuid={uuid}")
    
    if str(status) == '0' or status == 0:
        _set_state(login_status="WAITING_SCAN")
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
            _set_state(qr_code=f"data:image/png;base64,{img_b64}")
            logger.info("QR code generated successfully")
        except Exception as e:
            logger.error(f"Failed to generate QR: {e}")
            
    elif str(status) == '200' or status == 200:
        _set_state(login_status="LOGGED_IN", qr_code=None)

def login_thread():
    try:
        itchat.auto_login(hotReload=False, qrCallback=qr_callback, statusStorageDir='itchat.pkl')
        _set_state(is_logged_in=True, login_status="LOGGED_IN", last_error=None)
    except Exception as e:
        logger.error(f"Login failed detected in thread", exc_info=True)
        _set_state(login_status="FAILED", is_logged_in=False, last_error=str(e))

def start_login():
    global _login_start_time
    with _state_lock:
        _login_start_time = time.time()
    _set_state(login_status="WAITING_SCAN", last_error=None)
    t = threading.Thread(target=login_thread)
    t.daemon = True
    t.start()

def get_status():
    state = _get_state()
    if state["is_logged_in"]:
        _set_state(login_status="LOGGED_IN")
    
    return {
        "status": state["login_status"],
        "qr_code": state["qr_code"],
        "is_logged_in": state["is_logged_in"],
        "error": state["last_error"]
    }

def get_friends():
    state = _get_state()
    if not state["is_logged_in"]:
        return []
    try:
        friends = itchat.get_friends(update=True)
        if not friends:
            return []
        
        my_user = itchat.search_friends()
        my_username = my_user.get('UserName') if my_user else None
        
        processed_friends = []
        seen_usernames = set()
        
        for f in friends:
            username = f.get('UserName')
            if not username or username == my_username:
                continue
            
            if username in seen_usernames:
                continue
            seen_usernames.add(username)
                
            name = f.get('RemarkName') or f.get('NickName') or "Unknown"
            
            processed_friends.append({
                "id": username,
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
    try:
        itchat.logout()
    except Exception:
        pass
    _set_state(is_logged_in=False, login_status="IDLE")
