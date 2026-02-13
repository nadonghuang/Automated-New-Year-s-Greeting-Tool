import subprocess
import json
import logging
import platform

logger = logging.getLogger(__name__)

def get_mac_contacts():
    """
    Uses JavaScript for Automation (JXA) / AppleScript to dump text from WeChat.
    This is extremely basic and might need user to scroll.
    """
    if platform.system() != "Darwin":
        return {"error": "Only supported on macOS"}
    
    script = """
    const app = Application("System Events");
    const process = app.processes.byName("WeChat");
    
    if (!process.exists()) {
        "WeChat Not Running";
    } else {
        process.frontmost = true;
        delay(0.5);
        
        // This is a crude recursive dumper
        function dump(element) {
            let names = [];
            try {
                // Try to get value, title, name
                const v = element.value();
                if (v && typeof v === 'string' && v.length > 0) names.push(v);
                
                const t = element.title();
                if (t && typeof t === 'string' && t.length > 0) names.push(t);
                
                // Recurse children if any
                const children = element.uiElements();
                for (let i = 0; i < children.length; i++) {
                    names = names.concat(dump(children[i]));
                }
            } catch(e) {
                // Ignore permission errors
            }
            return names;
        }
        
        // Look for the contact list specifically if possible
        // Usually window 1 -> splitter group -> scroll area -> table
        // But safer to just dump window 1
        const win = process.windows[0];
        JSON.stringify(dump(win));
    }
    """
    
    try:
        result = subprocess.run(["osascript", "-l", "JavaScript", "-e", script], capture_output=True, text=True)
        if result.returncode != 0:
            logger.error(f"JXA Error: {result.stderr}")
            return {"error": "Failed to run automation script"}
            
        output = result.stdout.strip()
        if output == '"WeChat Not Running"':
             return {"error": "WeChat is not running"}
        
        # Parse JSON
        try:
            # Output might be quoted JSON string '"[...]"'
            # We need to unquote it first if JXA returned a string
            if output.startswith('"') and output.endswith('"'):
                 output = output[1:-1].replace('\\"', '"') # Basic unescape
            
            raw_names = json.loads(output)
            
            # Post-process: Remove common UI elements text
            blacklist = ["WeChat", "Search", "Contacts", "Chats", "Favorites", "Moments", "Settings", "File Transfer", "Minimize", "Zoom", "Close"]
            contacts = []
            seen = set()
            
            for name in raw_names:
                if not name or len(name) < 2: continue
                if name in blacklist: continue
                if name in seen: continue
                
                seen.add(name)
                contacts.append({
                    "id": name,
                    "name": name,
                    "nickname": name, # Can't distinguish
                    "remark": "",
                    "city": "WeChat"
                })
                
            return contacts
            
        except json.JSONDecodeError:
             logger.error(f"Failed to parse JSON: {output}")
             return []

    except Exception as e:
        logger.error(f"Mac Reader Failed: {e}")
        return []
