import sys
import os
import time
import random
from datetime import datetime, timedelta, timezone
from faker import Faker

# Add project root to path to allow running as standalone script
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.database import SessionLocal, engine, Base
from db.models import Product

CATEGORIES = [
    "Electronics",
    "Books",
    "Fashion",
    "Sports",
    "Home",
    "Beauty",
    "Automotive",
    "Gaming"
]

def seed_database(total_records: int = 200000, batch_size: int = 5000):
    """
    Seeds the PostgreSQL database with 200,000 products using SQLAlchemy's
    highly optimized bulk_insert_mappings to ensure rapid insertion.
    """
    fake = Faker()
    
    print("Syncing database schema...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    print(f"Beginning bulk seeding of {total_records} products...")
    start_time = time.time()
    
    # Anchor time is now
    now = datetime.now(timezone.utc)
    
    count = 0
    try:
        while count < total_records:
            batch = []
            for _ in range(min(batch_size, total_records - count)):
                # Spread creation dates over the last 60 days
                created_days_ago = random.uniform(0.1, 60.0)
                created_at = now - timedelta(days=created_days_ago)
                
                # Make updated_at equal or slightly newer than created_at
                updated_after_created = random.uniform(0, created_days_ago)
                updated_at = created_at + timedelta(days=updated_after_created)
                
                price = round(random.uniform(2.99, 1499.99), 2)
                
                product_data = {
                    "name": f"{fake.company()} {fake.word().capitalize()} {random.randint(100, 999)}",
                    "category": random.choice(CATEGORIES),
                    "price": price,
                    "created_at": created_at,
                    "updated_at": updated_at
                }
                batch.append(product_data)
                
            # Perform high-performance SQLAlchemy bulk insert
            db.bulk_insert_mappings(Product, batch)
            db.commit()
            
            count += len(batch)
            if count % 25000 == 0:
                print(f"Progress: {count}/{total_records} products seeded...")
                
        elapsed_time = time.time() - start_time
        print(f"Inserted {total_records} products in {elapsed_time:.2f} seconds")
        
    except Exception as e:
        db.rollback()
        print(f"Error during bulk seeding: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    # Allow overriding totals via CLI for quick checks
    num_records = 200000
    if len(sys.argv) > 1:
        try:
            num_records = int(sys.argv[1])
        except ValueError:
            pass
    seed_database(total_records=num_records)
