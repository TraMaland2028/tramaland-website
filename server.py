
import http.server
import socketserver
import webbrowser
import os

PORT = 8000
os.chdir(os.path.dirname(__file__))

Handler = http.server.SimpleHTTPRequestHandler
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at http://localhost:{PORT}")
    webbrowser.open(f"http://localhost:{PORT}")
    httpd.serve_forever()
