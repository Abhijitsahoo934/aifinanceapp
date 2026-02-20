import os
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Initialize logger for Database Audit Trail
logger = logging.getLogger("database")

# 1. Identity Protocol
DATABASE_URL = settings.DATABASE_URL

# 2. Engine Intelligence Layer
if "sqlite" in DATABASE_URL:
    # Optimized for rapid local prototyping
    engine = create_engine(
        DATABASE_URL, 
        connect_args={"check_same_thread": False},
        echo=False # Set to True if you want to see raw SQL in terminal
    )
else:
    # High-Performance Production Configuration (PostgreSQL/MySQL)
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,      # Heartbeat check to prevent 500 errors on stale connections
        pool_size=20,            # Increased baseline for concurrent user support
        max_overflow=10,         # Buffer for traffic spikes
        pool_recycle=1800,       # Recycles every 30 mins to prevent memory bloat
        connect_args={
            "keepalives": 1,
            "keepalives_idle": 30,
            "keepalives_interval": 10,
            "keepalives_count": 5,
        }
    )

# 3. Session & Identity Factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 4. Connectivity Handshake (Vitality Check)
def verify_db_connection():
    """Ensures the Database Node is reachable on system startup."""
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
            logger.info("Database Handshake: SUCCESSful connection.")
    except Exception as e:
        logger.error(f"Database Handshake: FAILURE. Details: {e}")
        # In production, you might want to raise an Exception here to stop the server
        # raise Exception("Database unreachable")

# 5. Dependency Injection Protocol
def get_db():
    """
    Data Bridge Dependency.
    Ensures every request gets a fresh session and closes it after completion.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Session Error: {e}")
        db.rollback() # Protect data integrity if a request fails mid-way
        raise
    finally:
        db.close()