import os
import schedule
import subprocess
import time
import zipfile
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv

ENV_PATH = Path(__file__).resolve().parent.parent / "Backend" / ".env"
load_dotenv(ENV_PATH)

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "Budget_Planner")

MAX_BACKUPS = 3  # how many .zip files to keep at a time


def compress_backup(sql_file):
    """Compress a .sql backup file into a .zip, then delete the original .sql."""
    sql_path = Path(sql_file)
    zip_path = sql_path.with_suffix(".zip")

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.write(sql_path, sql_path.name)  # store just the filename inside the zip

    sql_path.unlink()  # remove the raw .sql to save space
    print(f"[{datetime.now()}] Compressed: {zip_path}")
    return str(zip_path)


def cleanup_old_backups(backup_dir, db_name):
    """Delete the oldest .zip backups, keeping only MAX_BACKUPS files."""
    backups = sorted(Path(backup_dir).glob(f"{db_name}_backup_*.zip"))  # oldest first

    while len(backups) > MAX_BACKUPS:
        oldest = backups.pop(0)  # grab and remove the first (oldest) from the list
        oldest.unlink()          # delete it from disk
        print(f"[{datetime.now()}] Deleted old backup: {oldest.name}")


def backup_database(host, port, user, password, db_name, output_file=None):
    """Create a MySQL database backup using mysqldump."""
    backup_dir = Path(__file__).parent / "backups"
    backup_dir.mkdir(exist_ok=True)

    now = datetime.now()
    timestamp = now.strftime("%Y%m%d") + f"_{now.hour}h_{now.minute}mn_{now.second}s"
    if output_file is None:
        output_file = backup_dir / f"{db_name}_backup_{timestamp}.sql"

    command = [
        "mysqldump",
        f"--host={host}",
        f"--port={port}",
        f"--user={user}",
        # Aiven only accepts TLS connections
        "--ssl-mode=REQUIRED",
        "--single-transaction",
        # The server runs with GTIDs on, so mysqldump would otherwise write
        # SET @@SESSION.SQL_LOG_BIN and SET @@GLOBAL.GTID_PURGED into the dump.
        # Replaying those needs SUPER, which a managed Aiven account doesn't
        # have — the restore dies on line 18. OFF omits them.
        "--set-gtid-purged=OFF",
        # Reading tablespace metadata needs the PROCESS privilege.
        "--no-tablespaces",
        # --databases (not a bare name) makes the dump carry its own
        # CREATE DATABASE + USE, so a restore works even after the database
        # has been dropped entirely.
        "--databases", db_name,
        f"--result-file={output_file}",
    ]

    # pass the password via env instead of the command line,
    # so it is not visible in the process list
    env = {**os.environ, "MYSQL_PWD": password}

    print(f"[{datetime.now()}] Starting backup...")
    try:
        result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env)
    except FileNotFoundError:
        print(f"[{datetime.now()}] Backup failed: mysqldump was not found in PATH.")
        return None

    if result.returncode == 0:
        print(f"[{datetime.now()}] Backup successful: {output_file}")
        zip_file = compress_backup(output_file)   # step 1: compress
        cleanup_old_backups(backup_dir, db_name)  # step 2: delete oldest if over limit
        return zip_file

    error = result.stderr.decode("utf-8", errors="replace")
    print(f"[{datetime.now()}] Backup failed: {error}")
    return None


def setup_schedule():
    """Setup all backup schedules."""
    db_config = {
        "host": DB_HOST,
        "port": DB_PORT,
        "user": DB_USER,
        "password": DB_PASSWORD,
        "db_name": DB_NAME,
    }

    schedule.every().day.at("00:00").do(backup_database, **db_config)

if __name__ == "__main__":
    setup_schedule()

    print("Backup Scheduler Started")
    print("Schedule:")
    print("   - Every day at 12:00 AM (midnight)")
    print(f"\nKeeping last {MAX_BACKUPS} backups. Older ones will be auto-deleted.")
    print("\nPress Ctrl+C to stop\n")

    while True:
        schedule.run_pending()
        time.sleep(1)