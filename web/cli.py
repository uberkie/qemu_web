import os
import subprocess
from typing import Optional

import typer
from typing_extensions import Annotated

from app.version import VERSION

app = typer.Typer()


@app.command()
def ui(
    host: str = "127.0.0.1",
    port: int = 8081,
    workers: int = 1,
    reload: Annotated[bool, typer.Option("--reload")] = False,
    docs: bool = False,
    appdir: str = "None ",
    database_uri: Optional[str] = None,
):
    """
    Run the QEMU WEB UI.

    Args:
        host (str, optional): Host to run the UI on. Defaults to 127.0.0.1 (localhost).
        port (int, optional): Port to run the UI on. Defaults to 8081.
        workers (int, optional): Number of workers to run the UI with. Defaults to 1.
        reload (bool, optional): Whether to reload the UI on code changes. Defaults to False.
        docs (bool, optional): Whether to generate API docs. Defaults to False.
        appdir (str, optional): Path to the AutoGen Studio app directory. Defaults to None.
        database-uri (str, optional): Database URI to connect to. Defaults to None.
    """

    # Set environment variables
    os.environ["QEMU_WEB_API_DOCS"] = str(docs)
    if appdir != "None ":
        os.environ["QEMU_WEB_APPDIR"] = appdir
    if database_uri:
        os.environ["QEMU_WEB_DATABASE_URI"] = database_uri

    # Constructing the uwsgi command
    uwsgi_command = [
        "uwsgi",
        "--http", f"{host}:{port}",
        "--workers", str(workers),
        "--reload-mercy", "30" if reload else "0",  # Example of handling reload option
        "--module", "wsgi:app"
    ]

    # Running uwsgi command using subprocess.run
    try:
        result = subprocess.run(uwsgi_command, check=True)
    except subprocess.CalledProcessError as e:
        typer.echo(f"Error running uWSGI: {e}")
        raise typer.Abort()

    typer.echo("QEMU Web UI is running.")


@app.command()
def version():
    """
    Print the version of the QEMU WEB UI CLI.
    """
    typer.echo(f"QEMU WEB CLI version: {VERSION}")


def run():
    app()


if __name__ == "__main__":
    run()
