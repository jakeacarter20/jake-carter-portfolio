"""Local preview server. Not part of the site. Safe to delete."""
import os, functools, http.server, socketserver

ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)

Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("127.0.0.1", 4321), Handler) as httpd:
    print("serving %s on http://127.0.0.1:4321" % ROOT, flush=True)
    httpd.serve_forever()
