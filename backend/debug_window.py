import subprocess
import sys

def debug_wechat_window():
    print("=== 深度调试微信窗口信息 ===")
    
    # 1. 查找所有可能的微信进程
    script_find_proc = """
    tell application "System Events"
        set allProcs to name of every process
        set targetProcs to {}
        repeat with procName in allProcs
            if procName contains "WeChat" or procName contains "微信" or procName contains "Weixin" then
                set end of targetProcs to (procName as string)
            end if
        end repeat
        return targetProcs
    end tell
    """
    
    try:
        print("1. 正在搜索微信进程...")
        res = subprocess.run(["osascript", "-e", script_find_proc], capture_output=True, text=True)
        if res.returncode != 0:
            print(f"❌ AppleScript 执行失败: {res.stderr}")
            return
            
        procs = res.stdout.strip().split(", ")
        if not procs or procs == ['']:
            print("❌ 未找到任何包含 'WeChat'/'微信' 的进程")
            return
            
        print(f"✅ 找到进程: {procs}")
        
        # 2. 遍历每个进程的窗口
        for proc in procs:
            proc = proc.strip()
            print(f"\n--- 分析进程: [{proc}] ---")
            
            script_wins = f"""
            tell application "System Events"
                if not (exists process "{proc}") then return "PROCESS_GONE"
                
                tell process "{proc}"
                    set winList to every window
                    if (count of winList) is 0 then return "NO_WINDOWS"
                    
                    set output to ""
                    repeat with w in winList
                        set winTitle to title of w
                        set winSize to size of w
                        set winPos to position of w
                        set winRole to role of w
                        set winSubrole to subrole of w
                        
                        set output to output & "Title: '" & winTitle & "' | Size: " & winSize & " | Pos: " & winPos & " | Role: " & winRole & " | Subrole: " & winSubrole & "\\n"
                    end repeat
                    return output
                end tell
            end tell
            """
            
            res_win = subprocess.run(["osascript", "-e", script_wins], capture_output=True, text=True)
            if res_win.returncode != 0:
                print(f"❌ 获取窗口失败: {res_win.stderr}")
            else:
                print(f"窗口列表:\n{res_win.stdout.strip()}")

    except Exception as e:
        print(f"❌ Python 异常: {e}")

if __name__ == "__main__":
    debug_wechat_window()
