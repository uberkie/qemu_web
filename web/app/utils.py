import base64
import hashlib
import os
import re
import shutil
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Tuple, Union

from dotenv import load_dotenv
from loguru import logger




from version import APP_NAME


def md5_hash(text: str) -> str:
    """
    Compute the MD5 hash of a given text.

    :param text: The string to hash
    :return: The MD5 hash of the text
    """
    return hashlib.md5(text.encode()).hexdigest()


def check_and_cast_datetime_fields(obj: Any) -> Any:
    if hasattr(obj, "created_at") and isinstance(obj.created_at, str):
        obj.created_at = str_to_datetime(obj.created_at)

    if hasattr(obj, "updated_at") and isinstance(obj.updated_at, str):
        obj.updated_at = str_to_datetime(obj.updated_at)

    return obj


def str_to_datetime(dt_str: str) -> datetime:
    if dt_str[-1] == "Z":
        # Replace 'Z' with '+00:00' for UTC timezone
        dt_str = dt_str[:-1] + "+00:00"
    return datetime.fromisoformat(dt_str)


def clear_folder(folder_path: str) -> None:
    """
    Clear the contents of a folder.

    :param folder_path: The path to the folder to clear.
    """
    # exit if the folder does not exist
    if not os.path.exists(folder_path):
        return
    # exit if the folder does not exist
    if not os.path.exists(folder_path):
        return
    for file in os.listdir(folder_path):
        file_path = os.path.join(folder_path, file)
        if os.path.isfile(file_path):
            os.remove(file_path)
        elif os.path.isdir(file_path):
            shutil.rmtree(file_path)


def get_file_type(file_path: str) -> str:
    """


    Get file type   determined by the file extension. If the file extension is not
    recognized, 'unknown' will be used as the file type.

    :param file_path: The path to the file to be serialized.
    :return: A  string containing the file type.
    """

    # Extended list of file extensions for code and text files
    CODE_EXTENSIONS = {
        ".py",
        ".js",
        ".jsx",
        ".java",
        ".c",
        ".cpp",
        ".cs",
        ".ts",
        ".tsx",
        ".html",
        ".css",
        ".scss",
        ".less",
        ".json",
        ".xml",
        ".yaml",
        ".yml",
        ".md",
        ".rst",
        ".tex",
        ".sh",
        ".bat",
        ".ps1",
        ".php",
        ".rb",
        ".go",
        ".swift",
        ".kt",
        ".hs",
        ".scala",
        ".lua",
        ".pl",
        ".sql",
        ".config",
    }

    # Supported spreadsheet extensions
    CSV_EXTENSIONS = {".csv", ".xlsx"}

    # Supported image extensions
    IMAGE_EXTENSIONS = {
        ".png",
        ".jpg",
        ".jpeg",
        ".gif",
        ".bmp",
        ".tiff",
        ".svg",
        ".webp",
    }
    # Supported (web) video extensions
    VIDEO_EXTENSIONS = {".mp4", ".webm", ".ogg", ".mov", ".avi", ".wmv"}

    # Supported PDF extension
    PDF_EXTENSION = ".pdf"

    # Determine the file extension
    _, file_extension = os.path.splitext(file_path)

    # Determine the file type based on the extension
    if file_extension in CODE_EXTENSIONS:
        file_type = "code"
    elif file_extension in CSV_EXTENSIONS:
        file_type = "csv"
    elif file_extension in IMAGE_EXTENSIONS:
        file_type = "image"
    elif file_extension == PDF_EXTENSION:
        file_type = "pdf"
    elif file_extension in VIDEO_EXTENSIONS:
        file_type = "video"
    else:
        file_type = "unknown"

    return file_type


def serialize_file(file_path: str) -> Tuple[str, str]:
    """
    Reads a file from a given file path, base64 encodes its content,
    and returns the base64 encoded string along with the file type.

    The file type is determined by the file extension. If the file extension is not
    recognized, 'unknown' will be used as the file type.

    :param file_path: The path to the file to be serialized.
    :return: A tuple containing the base64 encoded string of the file and the file type.
    """

    file_type = get_file_type(file_path)

    # Read the file and encode its contents
    try:
        with open(file_path, "rb") as file:
            file_content = file.read()
            base64_encoded_content = base64.b64encode(file_content).decode("utf-8")
    except Exception as e:
        raise IOError(f"An error occurred while reading the file: {e}") from e

    return base64_encoded_content, file_type


def get_modified_files(start_timestamp: float, end_timestamp: float, source_dir: str) -> List[Dict[str, str]]:
    """
    Identify files from source_dir that were modified within a specified timestamp range.
    The function excludes files with certain file extensions and names.

    :param start_timestamp: The floating-point number representing the start timestamp to filter modified files.
    :param end_timestamp: The floating-point number representing the end timestamp to filter modified files.
    :param source_dir: The directory to search for modified files.

    :return: A list of dictionaries with details of relative file paths that were modified.
             Dictionary format: {path: "", name: "", extension: "", type: ""}
             Files with extensions "__pycache__", "*.pyc", "__init__.py", and "*.cache"
             are ignored.
    """
    modified_files = []
    ignore_extensions = {".pyc", ".cache"}
    ignore_files = {"__pycache__", "__init__.py"}

    # Walk through the directory tree
    for root, dirs, files in os.walk(source_dir):
        # Update directories and files to exclude those to be ignored
        dirs[:] = [d for d in dirs if d not in ignore_files]
        files[:] = [f for f in files if f not in ignore_files and os.path.splitext(f)[1] not in ignore_extensions]

        for file in files:
            file_path = os.path.join(root, file)
            file_mtime = os.path.getmtime(file_path)

            # Verify if the file was modified within the given timestamp range
            if start_timestamp <= file_mtime <= end_timestamp:
                file_relative_path = (
                    "files/user" + file_path.split("files/user", 1)[1] if "files/user" in file_path else ""
                )
                file_type = get_file_type(file_path)

                file_dict = {
                    "path": file_relative_path,
                    "name": os.path.basename(file),
                    # Remove the dot
                    "extension": os.path.splitext(file)[1].lstrip("."),
                    "type": file_type,
                }
                modified_files.append(file_dict)

    # Sort the modified files by extension
    modified_files.sort(key=lambda x: x["extension"])
    return modified_files


def get_app_root() -> str:
    """
    Get the root directory of the application.

    :return: The root directory of the application.
    """
    app_name = f".{APP_NAME}"
    default_app_root = os.path.join(os.path.expanduser("~"), app_name)
    if not os.path.exists(default_app_root):
        os.makedirs(default_app_root, exist_ok=True)
    app_root = os.environ.get("AUTOGENSTUDIO_APPDIR") or default_app_root
    return app_root


def get_db_uri(app_root: str) -> str:
    """
    Get the default database URI for the application.

    :param app_root: The root directory of the application.
    :return: The default database URI.
    """
    db_uri = f"sqlite:///{os.path.join(app_root, 'database.sqlite')}"
    db_uri = os.environ.get("AUTOGENSTUDIO_DATABASE_URI") or db_uri
    logger.info(f"Using database URI: {db_uri}")
    return db_uri


def init_app_folders(app_file_path: str) -> Dict[str, str]:
    """
    Initialize folders needed for a web server, such as static file directories
    and user-specific data directories. Also load any .env file if it exists.

    :param root_file_path: The root directory where webserver folders will be created
    :return: A dictionary with the path of each created folder
    """
    app_root = get_app_root()

    if not os.path.exists(app_root):
        os.makedirs(app_root, exist_ok=True)

    # load .env file if it exists
    env_file = os.path.join(app_root, ".env")
    if os.path.exists(env_file):
        logger.info(f"Loaded environment variables from {env_file}")
        load_dotenv(env_file)

    files_static_root = os.path.join(app_root, "files/")
    static_folder_root = os.path.join(app_file_path, "ui")

    os.makedirs(files_static_root, exist_ok=True)
    os.makedirs(os.path.join(files_static_root, "user"), exist_ok=True)
    os.makedirs(static_folder_root, exist_ok=True)
    folders = {
        "files_static_root": files_static_root,
        "static_folder_root": static_folder_root,
        "app_root": app_root,
        "database_engine_uri": get_db_uri(app_root=app_root),
    }
    logger.info(f"Initialized application data folder: {app_root}")
    return folders





def delete_files_in_folder(folders: Union[str, List[str]]) -> None:
    """
    Delete all files and directories in the specified folders.

    :param folders: A list of folders or a single folder string
    """

    if isinstance(folders, str):
        folders = [folders]

    for folder in folders:
        # Check if the folder exists
        if not os.path.isdir(folder):
            continue

        # List all the entries in the directory
        for entry in os.listdir(folder):
            # Get the full path
            path = os.path.join(folder, entry)
            try:
                if os.path.isfile(path) or os.path.islink(path):
                    # Remove the file or link
                    os.remove(path)
                elif os.path.isdir(path):
                    # Remove the directory and all its content
                    shutil.rmtree(path)
            except Exception as e:
                # Print the error message and skip
                logger.info(f"Failed to delete {path}. Reason: {e}")


def extract_successful_code_blocks(messages: List[Dict[str, str]]) -> List[str]:
    """
    Parses through a list of messages containing code blocks and execution statuses,
    returning the array of code blocks that executed successfully and retains
    the backticks for Markdown rendering.

    Parameters:
    messages (List[Dict[str, str]]): A list of message dictionaries containing 'content' and 'role' keys.

    Returns:
    List[str]: A list containing the code blocks that were successfully executed, including backticks.
    """
    successful_code_blocks = []
    # Regex pattern to capture code blocks enclosed in triple backticks.
    code_block_regex = r"```[\s\S]*?```"

    for i, row in enumerate(messages):
        message = row["message"]
        if message["role"] == "user" and "execution succeeded" in message["content"]:
            if i > 0 and messages[i - 1]["message"]["role"] == "assistant":
                prev_content = messages[i - 1]["message"]["content"]
                # Find all matches for code blocks
                code_blocks = re.findall(code_block_regex, prev_content)
                # Add the code blocks with backticks
                successful_code_blocks.extend(code_blocks)

    return successful_code_blocks


