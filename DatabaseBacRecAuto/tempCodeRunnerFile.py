import os
import subprocess
from pathlib import Path

from dotenv import load_dotenv

ENV_PATH = Path(__file__).resolve().parent.parent / "Backend" / "config" / ".env"
load_dotenv(ENV_PATH)

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")

BACKUP_DIR = Path(__file__).parent / "backups"


def backup_all_databases(host, user, password, output_file):
    command = [
        "mysqldump",
        f"--host={host}",
        f"--user={user}",
        "--single-transaction",
        "--all-databases",
        "--routines",
        "--events",
        f"--result-file={output_file}"
    ]

    # pass the password via env instead of the command line,
    # so it is not visible in the process list
    env = {**os.environ, "MYSQL_PWD": password}

    result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env)

    if result.returncode == 0:
        print(f"Backup successful. All databases saved as {output_file}.")
    else:
        print(f"Error: {result.stderr.decode('utf-8')}")

if __name__ == "__main__":
    BACKUP_DIR.mkdir(exist_ok=True)
    backup_all_databases(DB_HOST, DB_USER, DB_PASSWORD, BACKUP_DIR / "all_databases_backup.sql")
