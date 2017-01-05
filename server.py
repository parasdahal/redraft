import cherrypy
from paste.translogger import TransLogger
from .api import create_app

def run_server(app):
    app_logged = TransLogger(app)
    cherrypy.tree.graft(app_logged,'/')
    cherrypy.config.update(
        {
            'engine.autoreload.on':True,
            'log.screen':True,
            'server.socket_port':8888,
            'server.socket_host':'0.0.0.0'
        }
    )
    cherrypy.engine.start()
    cherrypy.engine.block()

if __name__ == "__main__":
    app = create_app()
    run_server(app)