import os
import subprocess
import zipfile
from pathlib import Path

from dotenv import load_dotenv

ENV_PATH = Path(__file__).resolve().parent.parent / "Backend" / ".env"
load_dotenv(ENV_PATH)

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "Budget_Planner")

BACKUP_DIR = Path(__file__).parent / "backups"


def find_latest_backup(db_name):
    """Return the newest backup zip created by Automate.py, or None."""
    backups = sorted(
        BACKUP_DIR.glob(f"{db_name}_backup_*.zip"),
        key=lambda p: p.stat().st_mtime,
    )
    return backups[-1] if backups else None


def restore_database(host, port, user, password, backup_file):
    """Restore the database from a .zip (as made by Automate.py) or a plain .sql file.

    No database is named on the command line on purpose: the dump carries its
    own CREATE DATABASE + USE, so this still works when the database has been
    dropped. Naming it here would fail with "Unknown database".
    """
    backup_file = Path(backup_file)
    extracted = None

    if backup_file.suffix == ".zip":
        with zipfile.ZipFile(backup_file) as zf:
            sql_name = zf.namelist()[0]
            zf.extract(sql_name, backup_file.parent)
        extracted = backup_file.parent / sql_name
        sql_file = extracted
    else:
        sql_file = backup_file

    command = [
        "mysql",
        f"--host={host}",
        f"--port={port}",
        f"--user={user}",
        # Aiven only accepts TLS connections
        "--ssl-mode=REQUIRED"
    ]

    # pass the password via env instead of the command line,
    # so it is not visible in the process list
    env = {**os.environ, "MYSQL_PWD": password}

    with open(sql_file, "r") as infile:
        result = subprocess.run(command, stdin=infile, stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env)

    if extracted is not None:
        extracted.unlink()  # remove the temporary extracted .sql

    if result.returncode == 0:
        print(f"Restore successful from {backup_file.name}.")
    else:
        print(f"Error: {result.stderr.decode('utf-8')}")


if __name__ == "__main__":
    latest = find_latest_backup(DB_NAME)
    if latest is None:
        print(f"No backup found in {BACKUP_DIR}. Run Automate.py first.")
    else:
        print(f"Restoring from latest backup: {latest.name}")
        restore_database(DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, latest)
