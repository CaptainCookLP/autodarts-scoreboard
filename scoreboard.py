import argparse
import http.server
import socketserver

def start_web_server(host, port):
    handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer((host, port), handler) as httpd:
        print(f"Server started at http://{host}:{port}")
        httpd.serve_forever()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Autodarts Scoreboard")
    parser.add_argument("-CON", default="127.0.0.1:8079", help="Connection to Autodarts-Caller (Default: 127.0.0.1:8079)")
    parser.add_argument("-PORT", type=int, default=8008, help="Web-Server (Default: 8008)")
    
    args = parser.parse_args()
    host, port = args.CON.split(':')
    port = int(port)
    
    start_web_server(host, port)
