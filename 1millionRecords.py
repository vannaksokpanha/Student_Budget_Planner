import os
import random
import string
import sys
import bcrypt
import pymysql
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# ---------- Credentials (from Backend/.env, never hardcoded) ----------
# Reuses the backend's existing .env so there is only one copy of the password.
load_dotenv(Path(__file__).parent / "Backend" / ".env")

DB_HOST = os.environ.get("DB_HOST")
DB_PORT = int(os.environ.get("DB_PORT", 12946))
DB_USER = os.environ.get("DB_USER")
DB_PASSWORD = os.environ.get("DB_PASSWORD")
DB_NAME = os.environ.get("DB_NAME", "Budget_Planner")

missing = [k for k in ("DB_HOST", "DB_USER", "DB_PASSWORD") if not os.environ.get(k)]
if missing:
    sys.exit(f"Missing env vars: {', '.join(missing)}")

NAME_CHARS = string.ascii_uppercase + string.digits

# Every seeded user shares this password. Bcrypt costs ~100ms per call, which is
# a week of CPU across 6M rows -- so it is hashed exactly once here and the
# resulting hash string is reused. Cost factor 10 matches the app's existing hashes.
SEED_PASSWORD = "123456"

print("Hashing seed password ...")
SEED_HASH = bcrypt.hashpw(SEED_PASSWORD.encode(), bcrypt.gensalt(rounds=10)).decode()

# `email` has a unique index, so the local part carries a counter to guarantee
# uniqueness across the whole run rather than relying on random collisions.
def generate_data(seq):
    name = ''.join(random.choice(NAME_CHARS) for _ in range(10))
    email = f"{name.lower()}{seq}@gmail.com"
    return name, email, SEED_HASH

try:
    connection = pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        charset='utf8mb4'
    )
    cursor = connection.cursor()
    print("Connected to Aiven")
except pymysql.Error as err:
    sys.exit(f"Error: {err}")

insertion_amount = 100      # number of rounds
num_records = 20000         # per round -> total = 6,000,000
batch_size = 10000

total_records = insertion_amount * num_records
inserted = 0
seq = 0
start_time = datetime.now()

insert_query = """
INSERT IGNORE INTO users (username, email, password_hash)
VALUES (%s, %s, %s)
"""

print(f'Start inserting {total_records:,} records ...')
print(f'Login with any seeded email + password: {SEED_PASSWORD}')

try:
    cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
    cursor.execute("SET UNIQUE_CHECKS = 0")

    for k in range(insertion_amount):
        for start in range(0, num_records, batch_size):
            end = min(start + batch_size, num_records)
            batch_values = []
            for _ in range(end - start):
                seq += 1
                batch_values.append(generate_data(seq))
            cursor.executemany(insert_query, batch_values)
            connection.commit()
            # rowcount is what the server actually wrote, not what we sent
            inserted += cursor.rowcount

        elapsed = (datetime.now() - start_time).total_seconds()
        rate = inserted / elapsed if elapsed else 0
        print(f'Round {k + 1}/{insertion_amount}: {num_records:,} records | '
              f'Total: {inserted:,} | Speed: {rate:.0f} rec/s | {elapsed:.1f}s')

    print(f"Successfully inserted {inserted:,} of {total_records:,} attempted "
          f"in {(datetime.now() - start_time).total_seconds():.1f}s")
    print('Finished inserting!!!')
except KeyboardInterrupt:
    connection.rollback()
    print(f"\nInterrupted after {inserted:,} records")
except pymysql.Error as err:
    connection.rollback()
    print(f"\nFailed after {inserted:,} records: {err}")
finally:
    try:
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
        cursor.execute("SET UNIQUE_CHECKS = 1")
    except pymysql.Error:
        pass
    cursor.close()
    connection.close()
