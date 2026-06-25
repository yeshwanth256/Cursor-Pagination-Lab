import pytest
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import Base, get_db
from app.db.models import Product
from app.main import app
from app.services.pagination import paginate_products

# Setup self-contained in-memory SQLite database for test runs
DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(name="db")
def fixture_db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(name="client")
def fixture_client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()

def test_first_page_returns_newest(db):
    """
    Requirement 1: Products must be returned newest first (ordered by updated_at DESC, id DESC).
    """
    now = datetime.now(timezone.utc)
    p1 = Product(name="Oldest Product", category="Electronics", price=10.00, updated_at=now - timedelta(hours=3))
    p2 = Product(name="Middle Product", category="Electronics", price=20.00, updated_at=now - timedelta(hours=1))
    p3 = Product(name="Newest Product", category="Electronics", price=30.00, updated_at=now)
    # Adding a product with the exact same timestamp to test id tiebreaking
    p4 = Product(name="Newest Product ID tiebreaker", category="Electronics", price=40.00, updated_at=now)
    
    db.add_all([p1, p2, p3, p4])
    db.commit()

    items, next_up, next_id, snapshot = paginate_products(db, limit=10)
    
    # Ordered by updated_at DESC, id DESC
    # p4 was added last, so it will have a larger ID than p3. Since updated_at is the same, p4 comes first!
    assert len(items) == 4
    assert items[0].id == p4.id
    assert items[1].id == p3.id
    assert items[2].id == p2.id
    assert items[3].id == p1.id

def test_category_filter(db):
    """
    Requirement 2: Users can filter by category.
    """
    p1 = Product(name="Laptop", category="Electronics", price=1000.00)
    p2 = Product(name="Philosophy Book", category="Books", price=15.00)
    p3 = Product(name="T-Shirt", category="Fashion", price=25.00)
    p4 = Product(name="Phone", category="Electronics", price=800.00)
    db.add_all([p1, p2, p3, p4])
    db.commit()

    items, _, _, _ = paginate_products(db, limit=10, category="Electronics")
    assert len(items) == 2
    assert all(item.category == "Electronics" for item in items)

def test_cursor_pagination(db):
    """
    Requirement 3 & 4: Pagination must remain fast and work correctly page-by-page.
    """
    base_time = datetime.now(timezone.utc)
    products = [
        Product(name=f"Prod {i}", category="Sports", price=10.00 + i, updated_at=base_time - timedelta(minutes=i))
        for i in range(10)
    ]
    db.add_all(products)
    db.commit()

    # Get page 1 (3 items)
    items_p1, next_up, next_id, snapshot = paginate_products(db, limit=3)
    assert len(items_p1) == 3
    assert next_up is not None
    assert next_id is not None

    # Get page 2 using cursor
    items_p2, next_up2, next_id2, _ = paginate_products(
        db, limit=3, cursor_updated_at=next_up, cursor_id=next_id, snapshot_time=snapshot
    )
    assert len(items_p2) == 3
    
    # Assert item order and boundary
    # No items from page 1 should be in page 2
    p1_ids = {item.id for item in items_p1}
    p2_ids = {item.id for item in items_p2}
    assert len(p1_ids.intersection(p2_ids)) == 0

def test_no_duplicates_between_pages(db):
    """
    Requirement 5: Users must never see duplicate products.
    """
    base_time = datetime.now(timezone.utc)
    for i in range(15):
        db.add(Product(name=f"Item {i}", category="Home", price=5.0, updated_at=base_time - timedelta(minutes=i)))
    db.commit()

    all_fetched_ids = []
    cursor_up, cursor_id = None, None
    snapshot = None

    # Paginate through 3 pages of size 5
    for _ in range(3):
        items, cursor_up, cursor_id, snapshot = paginate_products(
            db, limit=5, cursor_updated_at=cursor_up, cursor_id=cursor_id, snapshot_time=snapshot
        )
        all_fetched_ids.extend([item.id for item in items])

    # Check that we received exactly 15 unique items
    assert len(all_fetched_ids) == 15
    assert len(set(all_fetched_ids)) == 15

def test_snapshot_consistency_with_inserts(db):
    """
    Requirement 6: Users must never miss products due to insertions/updates during browsing,
    nor should inserts during browsing cause duplicates.
    
    By freezing the snapshot_time, newly inserted products updated_at > snapshot_time
    will be safely excluded from subsequent pages, ensuring pagination consistency.
    """
    base_time = datetime.now(timezone.utc) - timedelta(hours=1)
    
    # Insert 6 initial products
    initial_products = [
        Product(name=f"Initial {i}", category="Gaming", price=50.0, updated_at=base_time - timedelta(minutes=i))
        for i in range(6)
    ]
    db.add_all(initial_products)
    db.commit()

    # Page 1: Request limit of 3
    items_p1, next_up, next_id, snapshot = paginate_products(db, limit=3)
    assert len(items_p1) == 3
    
    # Insert a new product with current time (newer than snapshot_time)
    # Without snapshot consistency, this insertion would push existing items down,
    # causing an item to be duplicated or skipped in OFFSET pagination.
    # With Cursor + Snapshot, it is filtered out since its updated_at > snapshot.
    new_prod = Product(name="New Mid-Browse Product", category="Gaming", price=100.0, updated_at=datetime.now(timezone.utc))
    db.add(new_prod)
    db.commit()

    # Page 2: Request limit of 3 with snapshot consistency
    items_p2, _, _, _ = paginate_products(
        db, limit=3, cursor_updated_at=next_up, cursor_id=next_id, snapshot_time=snapshot
    )
    
    # Page 2 should successfully fetch the remaining 3 initial products
    assert len(items_p2) == 3
    
    # The newly inserted product MUST NOT appear on Page 2
    assert all(item.id != new_prod.id for item in items_p2)
    
    # Combined pages must cover exactly the 6 initial products (all unique)
    combined_ids = {item.id for item in items_p1 + items_p2}
    assert len(combined_ids) == 6
    assert all(p.id in combined_ids for p in initial_products)
