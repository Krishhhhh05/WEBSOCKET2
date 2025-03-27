import tkinter as tk
import subprocess
import os
import webbrowser

# Paths
NODE_APP_DIR = os.path.join(os.getcwd(), "webchat-app")  # Adjust if needed
PYTHON_SCRIPT = os.path.join(os.getcwd(), "server.py")

def run_node_app():
    subprocess.Popen("npm run dev", cwd=NODE_APP_DIR, shell=True)

def run_python_server():
    subprocess.Popen("python server.py", cwd=os.getcwd(), shell=True)

def open_url():
    webbrowser.open("http://192.168.1.56:3000")
def close_app():
    root.destroy()
# Tkinter UI
root = tk.Tk()
root.title("Websockets App Runner")
root.geometry("300x200")

btn_node = tk.Button(root, text="Start Node App", command=run_node_app, width=20)
btn_node.pack(pady=10)

btn_python = tk.Button(root, text="Start Python Server", command=run_python_server, width=20)
btn_python.pack(pady=10)

# Add a label with a hyperlink
link_label = tk.Label(root, text="Open Web App", fg="blue", cursor="hand2")
link_label.pack(pady=10)
link_label.bind("<Button-1>", lambda e: open_url())

# Add a button to close the application
btn_close = tk.Button(root, text="Close Application", command=close_app, width=20)
btn_close.pack(pady=10)
root.mainloop()