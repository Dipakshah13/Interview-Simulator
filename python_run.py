import subprocess
import sys
import time
import os

def run_command(command, cwd):
    return subprocess.Popen(command, shell=True, cwd=cwd)

if __name__ == "__main__":
    print("Starting Interview Stimulator Python Stack...")
    
    # 1. Start Backend
    print("Starting FastAPI Backend on port 3001...")
    backend_proc = run_command(f"{sys.executable} -m uvicorn main:app --host 0.0.0.0 --port 3001", "backend_py")
    
    # 2. Start Frontend
    print("Starting Reflex Frontend...")
    # Note: Reflex requires 'reflex init' once. We assume the environment is set up.
    frontend_proc = run_command(f"{sys.executable} -m reflex run", "frontend_py")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping services...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("Done.")
