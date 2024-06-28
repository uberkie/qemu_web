from flask import Flask


def create_app():
    app = Flask(__name__, static_url_path="/ui/static", static_folder="static")
    from . import routes
    app.register_blueprint(routes.bp)
    return app
