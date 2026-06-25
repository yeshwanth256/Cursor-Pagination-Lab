import { useState, useEffect, useMemo } from "react";
import { 
  Database, 
  Layers, 
  Terminal, 
  RefreshCw, 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  ChevronRight, 
  ChevronLeft, 
  FileCode, 
  Cpu, 
  BookOpen, 
  Sparkles,
  Layers2,
  TrendingUp,
  Flame,
  Search,
  Check,
  Code
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Types
interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  created_at: string;
  updated_at: string;
  status: "original" | "inserted" | "updated";
}

interface Cursor {
  updated_at: string;
  id: number;
}

// Initial Mock Products (35 Products spread across categories)
const INITIAL_PRODUCTS_RAW = [
  { id: 200, name: "Vortex Gaming PC Extreme", category: "Electronics", price: 1899.99, hoursAgo: 10 },
  { id: 199, name: "Prism OLED Display 34\"", category: "Electronics", price: 799.99, hoursAgo: 9.8 },
  { id: 198, name: "Sapiens: Brief History of Humankind", category: "Books", price: 24.99, hoursAgo: 9.5 },
  { id: 197, name: "Nebula Mechanical Keyboard Pro", category: "Electronics", price: 149.99, hoursAgo: 9.2 },
  { id: 196, name: "Carbon Fiber Hiking Poles", category: "Sports", price: 85.00, hoursAgo: 8.9 },
  { id: 195, name: "Minimalist Italian Leather Boots", category: "Fashion", price: 210.00, hoursAgo: 8.6 },
  { id: 194, name: "Sonic Wave Wireless Earbuds", category: "Electronics", price: 129.99, hoursAgo: 8.3 },
  { id: 193, name: "Atomic Habits - Clear", category: "Books", price: 18.50, hoursAgo: 8.0 },
  { id: 192, name: "Nordic Ceramic Coffee Set", category: "Home", price: 65.00, hoursAgo: 7.7 },
  { id: 191, name: "Pure Argan Cold Pressed Oil", category: "Beauty", price: 34.00, hoursAgo: 7.4 },
  { id: 190, name: "Performance Brake Pads Set", category: "Automotive", price: 120.00, hoursAgo: 7.1 },
  { id: 189, name: "Apex Pro Tennis Racket", category: "Sports", price: 185.00, hoursAgo: 6.8 },
  { id: 188, name: "Chrono Classic Watch Titanium", category: "Fashion", price: 450.00, hoursAgo: 6.5 },
  { id: 187, name: "Clean Code - Robert Martin", category: "Books", price: 39.99, hoursAgo: 6.2 },
  { id: 186, name: "Zero-Gravity Reclining Chair", category: "Home", price: 199.99, hoursAgo: 5.9 },
  { id: 185, name: "Luminous Hydrating Serum", category: "Beauty", price: 45.00, hoursAgo: 5.6 },
  { id: 184, name: "All-Weather Car Cover Elite", category: "Automotive", price: 89.99, hoursAgo: 5.3 },
  { id: 183, name: "Cyberpunk Samurai Edition", category: "Gaming", price: 59.99, hoursAgo: 5.0 },
  { id: 182, name: "AeroFit Smart Row Machine", category: "Sports", price: 699.00, hoursAgo: 4.7 },
  { id: 181, name: "Dune - Frank Herbert", category: "Books", price: 14.95, hoursAgo: 4.4 },
  { id: 180, name: "AirFlow Mesh Running Shoes", category: "Fashion", price: 110.00, hoursAgo: 4.1 },
  { id: 179, name: "Obsidian Chef Knife 8\"", category: "Home", price: 135.00, hoursAgo: 3.8 },
  { id: 178, name: "Ultra-Matte Mineral Foundation", category: "Beauty", price: 29.50, hoursAgo: 3.5 },
  { id: 177, name: "Dual-Cylinder Air Compressor", category: "Automotive", price: 74.99, hoursAgo: 3.2 },
  { id: 176, name: "Rogue Controller Wireless", category: "Gaming", price: 69.99, hoursAgo: 2.9 },
  { id: 175, name: "SoundBar Studio Surround Pro", category: "Electronics", price: 299.99, hoursAgo: 2.6 },
  { id: 174, name: "Grit - Angela Duckworth", category: "Books", price: 22.00, hoursAgo: 2.3 },
  { id: 173, name: "Thermal Polar Fleece Jacket", category: "Fashion", price: 79.99, hoursAgo: 2.0 },
  { id: 172, name: "Eco-Luxe Bamboo Bed Sheets", category: "Home", price: 95.00, hoursAgo: 1.7 },
  { id: 171, name: "Velvet Matte Lip Stain Set", category: "Beauty", price: 38.00, hoursAgo: 1.4 },
  { id: 170, name: "OBD2 Engine Code Scanner", category: "Automotive", price: 49.99, hoursAgo: 1.1 },
  { id: 169, name: "Tactical VR Headset Strap", category: "Gaming", price: 45.00, hoursAgo: 0.8 },
  { id: 168, name: "Yoga Block High Density Duo", category: "Sports", price: 18.99, hoursAgo: 0.5 },
  { id: 167, name: "Think and Grow Rich", category: "Books", price: 12.00, hoursAgo: 0.3 },
  { id: 166, name: "Stellar Horizon RTS Game", category: "Gaming", price: 49.99, hoursAgo: 0.1 }
];

// Seed timestamps back from a base time (anchored in UTC)
const baseTime = new Date("2026-06-25T08:00:00Z");

const generateInitialProducts = (): Product[] => {
  return INITIAL_PRODUCTS_RAW.map(p => {
    const timestamp = new Date(baseTime.getTime() - p.hoursAgo * 60 * 60 * 1000).toISOString();
    return {
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      created_at: timestamp,
      updated_at: timestamp,
      status: "original"
    };
  });
};

// Python Source Files to show in the code browser
const PYTHON_SOURCES = [
  {
    name: "pagination.py",
    path: "/backend/app/services/pagination.py",
    code: `from datetime import datetime, timezone
from typing import Optional, Tuple, List
from sqlalchemy import or_, and_, desc
from sqlalchemy.orm import Session
from app.db.models import Product

def paginate_products(
    db: Session,
    limit: int = 20,
    category: Optional[str] = None,
    cursor_updated_at: Optional[datetime] = None,
    cursor_id: Optional[int] = None,
    snapshot_time: Optional[datetime] = None
) -> Tuple[List[Product], Optional[datetime], Optional[int], datetime]:
    """
    Implements high-performance Cursor-Based Pagination combined with Snapshot Consistency.
    
    Guarantees:
    1. Stable ordering (ORDER BY updated_at DESC, id DESC)
    2. No duplicates across pages (using cursor inequalities)
    3. No missed records from subsequent inserts (using cursor boundaries)
    4. Snapshot consistency: hiding elements updated after browsing session started.
    """
    # Use timezone-aware UTC datetime for snapshot if not provided
    if snapshot_time is None:
        snapshot_time = datetime.now(timezone.utc)

    # Base query: return items updated BEFORE or AT snapshot time
    query = db.query(Product).filter(Product.updated_at <= snapshot_time)

    # Apply category filter if requested
    if category:
        query = query.filter(Product.category == category)

    # Apply cursor filters to move to the specific page offset
    if cursor_updated_at is not None and cursor_id is not None:
        query = query.filter(
            or_(
                Product.updated_at < cursor_updated_at,
                and_(
                    Product.updated_at == cursor_updated_at,
                    Product.id < cursor_id
                )
            )
        )

    # Fetch limit + 1 items to determine if there is a next page
    products = (
        query.order_by(desc(Product.updated_at), desc(Product.id))
        .limit(limit + 1)
        .all()
    )

    has_more = len(products) > limit
    items_to_return = products[:limit]

    next_cursor_updated_at = None
    next_cursor_id = None

    if has_more and items_to_return:
        last_item = items_to_return[-1]
        next_cursor_updated_at = last_item.updated_at
        next_cursor_id = last_item.id

    return items_to_return, next_cursor_updated_at, next_cursor_id, snapshot_time`
  },
  {
    name: "products.py",
    path: "/backend/app/api/products.py",
    code: `from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.product import PaginatedProductsResponse, CursorSchema
from app.services.pagination import paginate_products

router = APIRouter()

@router.get("/products", response_model=PaginatedProductsResponse)
def get_products(
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = Query(None),
    cursor_updated_at: Optional[datetime] = Query(None),
    cursor_id: Optional[int] = Query(None),
    snapshot_time: Optional[datetime] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Get a paginated list of products using cursor-based pagination and snapshot consistency.
    """
    try:
        items, next_up, next_id, snap_time = paginate_products(
            db=db,
            limit=limit,
            category=category,
            cursor_updated_at=cursor_updated_at,
            cursor_id=cursor_id,
            snapshot_time=snapshot_time,
        )
        
        next_cursor = None
        if next_up is not None and next_id is not None:
            next_cursor = CursorSchema(
                updated_at=next_up.isoformat(),
                id=next_id
            )
            
        return PaginatedProductsResponse(
            items=items,
            next_cursor=next_cursor,
            snapshot_time=snap_time.isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))`
  },
  {
    name: "seed_products.py",
    path: "/backend/app/scripts/seed_products.py",
    code: `import sys
import os
import time
import random
from datetime import datetime, timedelta, timezone
from faker import Faker
from db.database import SessionLocal, Base, engine
from db.models import Product

def seed_database(total_records: int = 200000, batch_size: int = 5000):
    fake = Faker()
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    print(f"Beginning bulk seeding of {total_records} products...")
    start_time = time.time()
    now = datetime.now(timezone.utc)
    
    count = 0
    try:
        while count < total_records:
            batch = []
            for _ in range(min(batch_size, total_records - count)):
                created_days_ago = random.uniform(0.1, 60.0)
                created_at = now - timedelta(days=created_days_ago)
                updated_at = created_at + timedelta(days=random.uniform(0, created_days_ago))
                
                batch.append({
                    "name": f"{fake.company()} {fake.word().capitalize()} {random.randint(100, 999)}",
                    "category": random.choice(["Electronics", "Books", "Fashion", "Sports", "Home", "Beauty", "Automotive", "Gaming"]),
                    "price": round(random.uniform(2.99, 1499.99), 2),
                    "created_at": created_at,
                    "updated_at": updated_at
                })
                
            db.bulk_insert_mappings(Product, batch)
            db.commit()
            count += len(batch)
            
        elapsed_time = time.time() - start_time
        print(f"Inserted {total_records} products in {elapsed_time:.2f} seconds")
    finally:
        db.close()`
  },
  {
    name: "models.py",
    path: "/backend/app/db/models.py",
    code: `from sqlalchemy import Column, BigInteger, Text, Numeric, DateTime, Index, func
from .database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    name = Column(Text, nullable=False)
    category = Column(Text, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

# Index for Cursor-Based Pagination on updated_at and id descending
Index(
    "idx_products_updated_id",
    Product.updated_at.desc(),
    Product.id.desc()
)

# Index for Category filtering + Cursor Pagination
Index(
    "idx_products_category_updated_id",
    Product.category,
    Product.updated_at.desc(),
    Product.id.desc()
)`
  },
  {
    name: "test_pagination.py",
    path: "/backend/tests/test_pagination.py",
    code: `import pytest
from datetime import datetime, timedelta, timezone
from app.db.models import Product
from app.services.pagination import paginate_products

def test_snapshot_consistency_with_inserts(db):
    """
    By freezing the snapshot_time, newly inserted products (updated_at > snapshot_time)
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
    
    # Combined pages must cover exactly the 6 initial products
    combined_ids = {item.id for item in items_p1 + items_p2}
    assert len(combined_ids) == 6`
  }
];

export default function App() {
  // Database simulation state
  const [database, setDatabase] = useState<Product[]>(() => generateInitialProducts());
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [pageSize, setPageSize] = useState<number>(5);

  // Pagination Settings
  const [paginationMode, setPaginationMode] = useState<"cursor" | "offset">("cursor");
  const [useSnapshot, setUseSnapshot] = useState<boolean>(true);

  // Pagination State Variables
  // Offset Page index (1-based)
  const [offsetPage, setOffsetPage] = useState<number>(1);
  
  // Cursor Page stack: stores the cursors of pages we have visited
  // index 0: page 1 cursor (null/undefined)
  // index 1: page 2 cursor
  // etc.
  const [cursorHistory, setCursorHistory] = useState<(Cursor | null)[]>([null]);
  const [currentCursorIndex, setCurrentCursorIndex] = useState<number>(0);
  
  // Active Browse Session Snapshot Time (ISO String)
  const [snapshotTime, setSnapshotTime] = useState<string>(() => new Date().toISOString());

  // Log feed for operations
  const [logs, setLogs] = useState<{ id: string; msg: string; time: string; type: "info" | "success" | "warn" | "error" }[]>([
    { id: "1", msg: "Database initialized with 35 base products.", time: new Date().toLocaleTimeString(), type: "info" }
  ]);

  // Code Explorer Active File
  const [activeFileIdx, setActiveFileIdx] = useState<number>(0);

  // Bulk Seeding simulation state
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [seedProgress, setSeedProgress] = useState<number>(0);
  const [seedTime, setSeedTime] = useState<number>(0);
  const [virtualRecordCount, setVirtualRecordCount] = useState<number>(200000);
  const [hasSeededVirtual, setHasSeededVirtual] = useState<boolean>(false);

  // UI Tabs (Sandbox vs. Code Explorer)
  const [activeTab, setActiveTab] = useState<"sandbox" | "code">("sandbox");

  // Keep track of which IDs have been viewed in the current browse session to catch Duplicates or Skips
  const [seenItemIds, setSeenItemIds] = useState<Set<number>>(new Set());

  // Reset the browse session (Resets snapshot time, clears duplicates tracking, resets pages)
  const handleResetSession = () => {
    const newSnap = new Date().toISOString();
    setSnapshotTime(newSnap);
    setOffsetPage(1);
    setCursorHistory([null]);
    setCurrentCursorIndex(0);
    setSeenItemIds(new Set());
    addLog(`Browsing session refreshed. Snapshot timestamp set to ${newSnap.substring(11, 19)} UTC.`, "success");
  };

  const addLog = (msg: string, type: "info" | "success" | "warn" | "error" = "info") => {
    setLogs(prev => [
      { id: Date.now().toString() + Math.random(), msg, time: new Date().toLocaleTimeString(), type },
      ...prev.slice(0, 49)
    ]);
  };

  // Trigger real-time inserts (Simulates items added to the catalog mid-browse)
  const handleInsertProducts = () => {
    const fakeAdjectives = ["Apex", "Titan", "Quantum", "Hyper", "Stellar", "Zephyr", "Aero", "Prime"];
    const fakeProducts = ["Display Screen", "Fitness Track", "Pro Headset", "Coffee Maker", "Backpack Elite", "Wireless Pad"];
    const categories = ["Electronics", "Sports", "Gaming", "Home", "Fashion", "Beauty"];

    const newItems: Product[] = [];
    const nowISO = new Date().toISOString();

    for (let i = 0; i < 3; i++) {
      const id = Math.max(...database.map(p => p.id)) + 1 + i;
      const category = categories[Math.floor(Math.random() * categories.length)];
      const name = `${fakeAdjectives[Math.floor(Math.random() * fakeAdjectives.length)]} ${fakeProducts[Math.floor(Math.random() * fakeProducts.length)]} ${Math.floor(Math.random() * 900 + 100)}`;
      const price = parseFloat((Math.random() * 200 + 15).toFixed(2));

      newItems.push({
        id,
        name,
        category,
        price,
        created_at: nowISO,
        updated_at: nowISO,
        status: "inserted"
      });
    }

    setDatabase(prev => [...prev, ...newItems]);
    addLog(`Simulated Insertion: 3 new products added to database at current timestamp!`, "warn");
  };

  // Trigger a real-time update of an existing product (Moves it to the top by editing updated_at)
  const handleUpdateProduct = () => {
    if (database.length === 0) return;
    // Choose a product not already recently modified
    const eligible = database.filter(p => p.status === "original");
    if (eligible.length === 0) return;

    const target = eligible[Math.floor(Math.random() * eligible.length)];
    const nowISO = new Date().toISOString();

    setDatabase(prev => prev.map(p => {
      if (p.id === target.id) {
        return {
          ...p,
          price: parseFloat((p.price * 1.1).toFixed(2)), // Price hike
          updated_at: nowISO,
          status: "updated"
        };
      }
      return p;
    }));

    addLog(`Simulated Update: Product #${target.id} ("${target.name}") updated_at changed to current time!`, "warn");
  };

  // Reset Database back to original 35 items
  const handleResetDatabase = () => {
    setDatabase(generateInitialProducts());
    setHasSeededVirtual(false);
    handleResetSession();
    addLog("Database reset to initial 35 products.", "info");
  };

  // Simulate bulk seeding of 200,000 items in background
  const handleSimulateBulkSeed = () => {
    setIsSeeding(true);
    setSeedProgress(10);
    const start = performance.now();
    addLog("Starting optimized bulk seeding of 200,000 products...", "info");

    const timer1 = setTimeout(() => {
      setSeedProgress(45);
      addLog("Generating Faker mapping structures in chunks of 5,000...", "info");
    }, 400);

    const timer2 = setTimeout(() => {
      setSeedProgress(85);
      addLog("Executing high-speed SQLAlchemy bulk_insert_mappings() on Neon tables...", "info");
    }, 900);

    const timer3 = setTimeout(() => {
      const end = performance.now();
      const seconds = parseFloat(((end - start) / 1000 + 0.35).toFixed(2));
      setSeedTime(seconds);
      setSeedProgress(100);
      setIsSeeding(false);
      setVirtualRecordCount(200000 + database.length);
      setHasSeededVirtual(true);
      addLog(`Seeding complete! Inserted 200,000 products in ${seconds} seconds. Database fully indexed!`, "success");
    }, 1500);
  };

  // Computes the complete sorted & filtered database view representing the DB *prior* to pagination
  const filteredAndSortedDatabase = useMemo(() => {
    let result = [...database];

    // 1. Snapshot Isolation (if turned ON)
    if (useSnapshot) {
      const snapLimit = new Date(snapshotTime).getTime();
      result = result.filter(p => new Date(p.updated_at).getTime() <= snapLimit);
    }

    // 2. Category Filter
    if (selectedCategory !== "All") {
      result = result.filter(p => p.category === selectedCategory);
    }

    // 3. Stable Sort: ORDER BY updated_at DESC, id DESC
    result.sort((a, b) => {
      const timeA = new Date(a.updated_at).getTime();
      const timeB = new Date(b.updated_at).getTime();
      if (timeB !== timeA) {
        return timeB - timeA;
      }
      return b.id - a.id;
    });

    return result;
  }, [database, selectedCategory, useSnapshot, snapshotTime]);

  // Compute products of the CURRENT PAGE
  const pageProducts = useMemo((): Product[] => {
    if (paginationMode === "offset") {
      // Offset pagination slice calculation
      const startIdx = (offsetPage - 1) * pageSize;
      return filteredAndSortedDatabase.slice(startIdx, startIdx + pageSize);
    } else {
      // Cursor pagination
      // Find the active cursor in history
      const activeCursor = cursorHistory[currentCursorIndex];
      
      if (!activeCursor) {
        // First Page: return first limit items
        return filteredAndSortedDatabase.slice(0, pageSize);
      } else {
        // Query equivalent to:
        // WHERE updated_at < cursor_updated_at OR (updated_at == cursor_updated_at AND id < cursor_id)
        const cursorTime = new Date(activeCursor.updated_at).getTime();
        const cursorId = activeCursor.id;

        const paginated = filteredAndSortedDatabase.filter(p => {
          const itemTime = new Date(p.updated_at).getTime();
          if (itemTime < cursorTime) return true;
          if (itemTime === cursorTime && p.id < cursorId) return true;
          return false;
        });

        return paginated.slice(0, pageSize);
      }
    }
  }, [filteredAndSortedDatabase, paginationMode, offsetPage, cursorHistory, currentCursorIndex, pageSize]);

  // Track duplicates/skips in current viewing list
  // If we change pages, let's keep track of items we've viewed in this session
  useEffect(() => {
    // If we're on page 1 (or cursor index 0), reset our session seen history
    const isFirstPage = paginationMode === "offset" ? offsetPage === 1 : currentCursorIndex === 0;
    if (isFirstPage) {
      setSeenItemIds(new Set(pageProducts.map(p => p.id)));
    } else {
      setSeenItemIds(prev => {
        const next = new Set(prev);
        pageProducts.forEach(p => next.add(p.id));
        return next;
      });
    }
  }, [pageProducts, offsetPage, currentCursorIndex, paginationMode]);

  // Calculate anomalies on the current page
  // An anomaly is when an item on the current page has already been "seen" on a previous page in this session
  const duplicatesOnCurrentPage = useMemo(() => {
    // Only trace if we are beyond page 1
    const isFirstPage = paginationMode === "offset" ? offsetPage === 1 : currentCursorIndex === 0;
    if (isFirstPage) return [];

    // Let's compute previously seen IDs (excluding current page products themselves to find overlaps)
    const currentIds = pageProducts.map(p => p.id);
    
    // To reconstruct what was seen on previous pages, we can compute the prior slices
    const previousPageIds = new Set<number>();
    
    if (paginationMode === "offset") {
      // All items from previous pages using standard offset database sort (with ALL inserts included)
      let databaseWithInserts = [...database];
      if (selectedCategory !== "All") {
        databaseWithInserts = databaseWithInserts.filter(p => p.category === selectedCategory);
      }
      databaseWithInserts.sort((a, b) => {
        const timeA = new Date(a.updated_at).getTime();
        const timeB = new Date(b.updated_at).getTime();
        if (timeB !== timeA) return timeB - timeA;
        return b.id - a.id;
      });

      const limit = (offsetPage - 1) * pageSize;
      for (let i = 0; i < limit; i++) {
        if (databaseWithInserts[i]) {
          previousPageIds.add(databaseWithInserts[i].id);
        }
      }
    } else {
      // In cursor mode, we can compute what was viewed in prior steps
      // Find all products that were returned on previous cursors
      let tempHistoryCursor = 0;
      let tempSeen = new Set<number>();
      
      while (tempHistoryCursor < currentCursorIndex) {
        const activeCursor = cursorHistory[tempHistoryCursor];
        let items: Product[] = [];
        if (!activeCursor) {
          items = filteredAndSortedDatabase.slice(0, pageSize);
        } else {
          const cursorTime = new Date(activeCursor.updated_at).getTime();
          const cursorId = activeCursor.id;
          const paginated = filteredAndSortedDatabase.filter(p => {
            const itemTime = new Date(p.updated_at).getTime();
            if (itemTime < cursorTime) return true;
            if (itemTime === cursorTime && p.id < cursorId) return true;
            return false;
          });
          items = paginated.slice(0, pageSize);
        }
        items.forEach(it => tempSeen.add(it.id));
        tempHistoryCursor++;
      }
      tempSeen.forEach(id => previousPageIds.add(id));
    }

    return currentIds.filter(id => previousPageIds.has(id));
  }, [pageProducts, offsetPage, currentCursorIndex, paginationMode, database, filteredAndSortedDatabase, selectedCategory, pageSize]);

  // Compute any "skipped" items (items that should have been viewed but got pushed past the offset boundary)
  const missedProductsCount = useMemo(() => {
    if (paginationMode !== "offset") return 0;
    // For offset mode, let's see: how many initial products (status "original")
    // are skipped entirely because we shifted them?
    // Let's count items that are "original" and are currently neither on previous pages nor current page,
    // but whose index in the final sorted list (without insertions) is smaller than the current offset limit.
    // Basically, any item pushed from page 1 down to page 2 (so we missed it because we are now on page 2)
    return 0; // We will estimate and explain this conceptually or compute if needed. Let's make a clear conceptual count
  }, [paginationMode, offsetPage]);

  // Determine if there is a next page
  const hasNextPage = useMemo(() => {
    if (paginationMode === "offset") {
      return (offsetPage * pageSize) < filteredAndSortedDatabase.length;
    } else {
      // For cursor pagination, we fetch limit + 1 items.
      // So if we query using the active cursor, we check if there are any products left beyond our current slice of size 'pageSize'
      const activeCursor = cursorHistory[currentCursorIndex];
      let remainingCount = 0;
      if (!activeCursor) {
        remainingCount = filteredAndSortedDatabase.length;
      } else {
        const cursorTime = new Date(activeCursor.updated_at).getTime();
        const cursorId = activeCursor.id;
        const paginated = filteredAndSortedDatabase.filter(p => {
          const itemTime = new Date(p.updated_at).getTime();
          if (itemTime < cursorTime) return true;
          if (itemTime === cursorTime && p.id < cursorId) return true;
          return false;
        });
        remainingCount = paginated.length;
      }
      return remainingCount > pageSize;
    }
  }, [filteredAndSortedDatabase, paginationMode, offsetPage, cursorHistory, currentCursorIndex, pageSize]);

  // Navigate forward
  const handleNextPage = () => {
    if (!hasNextPage) return;

    if (paginationMode === "offset") {
      setOffsetPage(prev => prev + 1);
      addLog(`Fetched Page ${offsetPage + 1} using OFFSET ${(offsetPage) * pageSize}`, "info");
    } else {
      // Find the last item of the current page to be the next cursor
      if (pageProducts.length > 0) {
        const lastItem = pageProducts[pageProducts.length - 1];
        const nextCursor: Cursor = {
          updated_at: lastItem.updated_at,
          id: lastItem.id
        };
        
        // Push the cursor onto the history stack and advance pointer
        const newHistory = [...cursorHistory.slice(0, currentCursorIndex + 1), nextCursor];
        setCursorHistory(newHistory);
        setCurrentCursorIndex(newHistory.length - 1);
        addLog(`Fetched Page ${newHistory.length} using Cursor {updated_at: "${lastItem.updated_at.substring(11, 19)}", id: ${lastItem.id}}`, "info");
      }
    }
  };

  // Navigate backward
  const handlePrevPage = () => {
    if (paginationMode === "offset") {
      if (offsetPage > 1) {
        setOffsetPage(prev => prev - 1);
        addLog(`Returned to Page ${offsetPage - 1}`, "info");
      }
    } else {
      if (currentCursorIndex > 0) {
        setCurrentCursorIndex(prev => prev - 1);
        addLog(`Returned to Page ${currentCursorIndex}`, "info");
      }
    }
  };

  // Switch category filter
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setOffsetPage(1);
    setCursorHistory([null]);
    setCurrentCursorIndex(0);
    setSeenItemIds(new Set());
    addLog(`Category filter changed to: ${cat}`, "info");
  };

  // Switch pagination mode
  const handlePaginationModeChange = (mode: "cursor" | "offset") => {
    setPaginationMode(mode);
    setOffsetPage(1);
    setCursorHistory([null]);
    setCurrentCursorIndex(0);
    setSeenItemIds(new Set());
    addLog(`Switched pagination algorithm to: ${mode.toUpperCase()} PAGINATION`, "success");
  };

  // Generate simulated SQL code based on current settings
  const generatedSQL = useMemo(() => {
    const table = "products";
    const orderStr = "ORDER BY updated_at DESC, id DESC";
    const limitStr = `LIMIT ${pageSize}`;

    let categoryClause = selectedCategory !== "All" ? `category = '${selectedCategory}'` : "";
    let snapshotClause = useSnapshot ? `updated_at <= '${snapshotTime.replace("T", " ").substring(0, 19)}'` : "";

    if (paginationMode === "offset") {
      const offsetValue = (offsetPage - 1) * pageSize;
      const whereClauses = [categoryClause, snapshotClause].filter(Boolean);
      const whereStr = whereClauses.length ? `\nWHERE ${whereClauses.join(" AND ")}` : "";
      return `SELECT id, name, category, price, created_at, updated_at
FROM ${table}${whereStr}
${orderStr}
${limitStr} OFFSET ${offsetValue};`;
    } else {
      // Cursor query
      const activeCursor = cursorHistory[currentCursorIndex];
      let cursorClause = "";
      if (activeCursor) {
        const formattedTime = activeCursor.updated_at.replace("T", " ").substring(0, 19);
        cursorClause = `(
    updated_at < '${formattedTime}'
  ) OR (
    updated_at = '${formattedTime}' 
    AND id < ${activeCursor.id}
  )`;
      }

      const whereClauses = [snapshotClause, categoryClause, cursorClause].filter(Boolean);
      const whereStr = whereClauses.length ? `\nWHERE ${whereClauses.join("\n  AND ")}` : "";
      
      return `SELECT id, name, category, price, created_at, updated_at
FROM ${table}${whereStr}
${orderStr}
${limitStr};`;
    }
  }, [paginationMode, selectedCategory, pageSize, offsetPage, cursorHistory, currentCursorIndex, useSnapshot, snapshotTime]);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-ink font-sans flex flex-col bg-grid-pattern selection:bg-brand-accent selection:text-white" id="root-layout">
      {/* Top Banner Header */}
      <header className="border-b-2 border-brand-ink bg-brand-bg px-6 py-5 sticky top-0 z-40 flex flex-col md:flex-row md:items-end justify-between gap-4" id="app-header">
        <div className="max-w-[1600px] w-full mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="mb-2.5">
              <span className="font-mono text-[9px] uppercase font-bold tracking-widest border border-brand-ink px-2 py-0.5 bg-brand-neutral text-brand-ink rounded-none shadow-[1px_1px_0px_0px_rgba(26,26,26,1)]">
                v1.0.0 (FastAPI)
              </span>
            </div>
            <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight leading-none text-brand-ink uppercase">
              Cursor Pagination &<br className="hidden md:inline" /> Snapshot Consistency Lab
            </h1>
            <p className="text-[11px] text-brand-ink/70 font-mono mt-1 leading-normal">
              Solving duplicates, drift, and performance on 200,000+ catalog records.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto font-mono">
            <button
              onClick={() => setActiveTab("sandbox")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-2 border-brand-ink transition-all cursor-pointer ${
                activeTab === "sandbox"
                  ? "bg-brand-ink text-brand-bg shadow-[2px_2px_0px_0px_rgba(230,57,70,1)]"
                  : "bg-brand-neutral text-brand-ink/80 hover:bg-brand-bg hover:text-brand-ink"
              }`}
              id="tab-btn-sandbox"
            >
              Interactive Lab
            </button>
            <button
              onClick={() => setActiveTab("code")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-2 border-brand-ink transition-all cursor-pointer ${
                activeTab === "code"
                  ? "bg-brand-ink text-brand-bg shadow-[2px_2px_0px_0px_rgba(230,57,70,1)]"
                  : "bg-brand-neutral text-brand-ink/80 hover:bg-brand-bg hover:text-brand-ink"
              }`}
              id="tab-btn-code"
            >
              Source Code
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 flex flex-col gap-5 overflow-hidden">
        
        {/* Sandbox Content */}
        {activeTab === "sandbox" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" id="sandbox-grid">
            
            {/* LEFT RAIL: Database State & Simulated Operations (lg:col-span-4) */}
            <section className="lg:col-span-4 flex flex-col gap-5" id="db-simulation-rail">
              
              {/* Virtual Database Status Widget */}
              <div className="bg-brand-bg border-2 border-brand-ink p-4 relative overflow-hidden shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]" id="db-status-card">
                <div className="absolute right-3 top-3 opacity-10">
                  <Cpu className="w-16 h-16 text-brand-accent" />
                </div>
                
                <h2 className="text-[10px] font-bold text-brand-ink/60 uppercase tracking-widest flex items-center gap-1.5 mb-3 font-mono">
                  <Database className="w-3.5 h-3.5 text-brand-accent" />
                  Database Instance Status
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-brand-neutral p-3 border border-brand-ink/20">
                    <span className="text-[10px] text-brand-ink/60 block uppercase font-mono tracking-wider">Catalog Size</span>
                    <span className="text-lg font-display font-bold text-brand-ink tracking-tight block">
                      {virtualRecordCount.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-brand-accent font-mono block mt-0.5 uppercase font-semibold">
                      {hasSeededVirtual ? "Indexed B-Tree Scan" : "Active Dynamic Pool"}
                    </span>
                  </div>

                  <div className="bg-brand-neutral p-3 border border-brand-ink/20">
                    <span className="text-[10px] text-brand-ink/60 block uppercase font-mono tracking-wider">Local Buffer</span>
                    <span className="text-lg font-display font-bold text-brand-ink tracking-tight block">
                      {database.length}
                    </span>
                    <span className="text-[9px] text-brand-ink/60 font-mono block mt-0.5 uppercase font-semibold">
                      In-Memory Sandbox
                    </span>
                  </div>
                </div>

                {/* Bulk Seeding Simulation Button */}
                {!hasSeededVirtual ? (
                  <button
                    disabled={isSeeding}
                    onClick={handleSimulateBulkSeed}
                    className={`w-full mt-3 py-2.5 px-4 text-xs font-bold font-mono uppercase tracking-wider border-2 border-brand-ink transition-all cursor-pointer ${
                      isSeeding 
                        ? "bg-brand-neutral text-brand-ink/40 border-brand-ink/40 cursor-not-allowed" 
                        : "bg-brand-accent text-white hover:bg-brand-ink shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                    }`}
                    id="btn-bulk-seed"
                  >
                    {isSeeding ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5 inline" />
                        Seeding 200,000 Products ({seedProgress}%)
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 mr-1.5 inline" />
                        Run 200,000 Bulk Seed (SQLAlchemy)
                      </>
                    )}
                  </button>
                ) : (
                  <div className="mt-3 p-2 bg-emerald-500/10 border-2 border-emerald-500 text-[10px] text-emerald-800 flex items-center justify-between font-mono font-bold">
                    <span className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600" /> Seeding Complete (Indexed)
                    </span>
                    <span className="text-[9px] bg-emerald-500/20 px-1.5 py-0.5">
                      {seedTime}s
                    </span>
                  </div>
                )}
              </div>

              {/* Real-time Event Simulator Panel */}
              <div className="bg-brand-bg border-2 border-brand-ink p-4 shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]" id="event-simulator-card">
                <h2 className="text-[10px] font-bold text-brand-ink/60 uppercase tracking-widest flex items-center gap-1.5 mb-2.5 font-mono">
                  <Flame className="w-3.5 h-3.5 text-brand-accent" />
                  Real-time Event Simulator
                </h2>
                <p className="text-[11px] text-brand-ink/75 mb-3.5 leading-relaxed font-sans">
                  Simulate background store activity. Trigger events, then paginate to observe how different algorithms behave.
                </p>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleInsertProducts}
                    className="w-full text-left py-2.5 px-3 bg-brand-neutral hover:bg-brand-bg border border-brand-ink hover:border-brand-ink rounded-none transition-all flex items-center justify-between group cursor-pointer shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                    id="btn-simulate-insert"
                  >
                    <div>
                      <span className="text-xs font-bold text-brand-ink block group-hover:text-brand-accent transition-colors font-mono">
                        Insert 3 Products
                      </span>
                      <span className="text-[9px] font-mono text-brand-accent uppercase font-bold">
                        Inserts newer items at head
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-brand-ink/60 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button
                    onClick={handleUpdateProduct}
                    className="w-full text-left py-2.5 px-3 bg-brand-neutral hover:bg-brand-bg border border-brand-ink hover:border-brand-ink rounded-none transition-all flex items-center justify-between group cursor-pointer shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                    id="btn-simulate-update"
                  >
                    <div>
                      <span className="text-xs font-bold text-brand-ink block group-hover:text-brand-accent transition-colors font-mono">
                        Update Random Product
                      </span>
                      <span className="text-[9px] font-mono text-brand-ink/60 uppercase font-bold">
                        Bumps updated_at, changes index
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-brand-ink/60 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                <div className="mt-4 pt-3 border-t border-brand-ink/20 flex items-center justify-between font-mono text-[10px]">
                  <span className="text-brand-ink/50">Reset sandbox variables</span>
                  <button
                    onClick={handleResetDatabase}
                    className="text-[10px] text-brand-ink/75 hover:text-brand-accent flex items-center gap-1 transition-colors hover:underline cursor-pointer font-bold"
                    id="btn-reset-db"
                  >
                    <RefreshCw className="w-2.5 h-2.5" /> reset_db()
                  </button>
                </div>
              </div>

              {/* Database Audit Log Feed */}
              <div className="bg-brand-bg border-2 border-brand-ink p-4 flex-1 flex flex-col min-h-[180px] shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]" id="audit-log-card">
                <h2 className="text-[10px] font-bold text-brand-ink/60 uppercase tracking-widest flex items-center gap-1.5 mb-2.5 font-mono">
                  <Terminal className="w-3.5 h-3.5 text-brand-accent" />
                  Server Logs & Transactions
                </h2>

                <div className="bg-brand-neutral border border-brand-ink/20 p-2.5 font-mono text-[10px] flex-1 overflow-y-auto max-h-[160px]" id="log-console-feed">
                  <div className="flex flex-col gap-1">
                    {logs.map((log) => (
                      <div key={log.id} className="leading-relaxed border-b border-brand-ink/10 pb-1 last:border-0 last:pb-0">
                        <span className="text-brand-ink/40 mr-1.5 font-mono">[{log.time}]</span>
                        <span className={`font-mono font-medium
                          ${log.type === "success" ? "text-emerald-700 font-semibold" : ""}
                          ${log.type === "warn" ? "text-amber-750 font-bold" : ""}
                          ${log.type === "error" ? "text-brand-accent font-bold" : ""}
                          ${log.type === "info" ? "text-brand-ink" : ""}
                        `}>
                          {log.msg}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </section>

            {/* MIDDLE COLUMN: Pagination Controller & Product Catalog (lg:col-span-8) */}
            <section className="lg:col-span-8 flex flex-col gap-5" id="catalog-browsing-column">
              
              {/* Algorithm Configuration bar */}
              <div className="bg-brand-bg border-2 border-brand-ink p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]" id="algo-config-bar">
                
                {/* Mode Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-brand-ink/60 tracking-wider font-mono">
                    Select Pagination Algorithm
                  </label>
                  <div className="bg-brand-neutral p-0.5 rounded-none border border-brand-ink flex items-center">
                    <button
                      onClick={() => handlePaginationModeChange("cursor")}
                      className={`px-3 py-1 text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                        paginationMode === "cursor"
                          ? "bg-brand-ink text-brand-bg"
                          : "text-brand-ink/60 hover:text-brand-ink"
                      }`}
                      id="btn-mode-cursor"
                    >
                      Cursor-Based
                    </button>
                    <button
                      onClick={() => handlePaginationModeChange("offset")}
                      className={`px-3 py-1 text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                        paginationMode === "offset"
                          ? "bg-brand-ink text-brand-bg"
                          : "text-brand-ink/60 hover:text-brand-ink"
                      }`}
                      id="btn-mode-offset"
                    >
                      OFFSET Pagination
                    </button>
                  </div>
                </div>

                {/* Snapshot Switch */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase font-bold text-brand-ink/60 tracking-wider font-mono">
                      Snapshot Consistency
                    </label>
                    <span className="text-[9px] bg-brand-accent/15 text-brand-accent px-1.5 py-0.2 rounded-none border border-brand-accent/25 font-mono ml-2 font-bold uppercase">
                      FROZEN VIEW
                    </span>
                  </div>
                  <div className="bg-brand-neutral p-0.5 rounded-none border border-brand-ink flex items-center font-mono">
                    <button
                      onClick={() => {
                        setUseSnapshot(true);
                        addLog("Snapshot Consistency enabled.", "success");
                      }}
                      className={`px-3 py-1 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        useSnapshot
                          ? "bg-brand-ink text-brand-bg"
                          : "text-brand-ink/60 hover:text-brand-ink"
                      }`}
                      id="btn-snapshot-on"
                    >
                      Enabled (Safe)
                    </button>
                    <button
                      onClick={() => {
                        setUseSnapshot(false);
                        addLog("Snapshot Consistency disabled! Newly inserted items will affect pagination flow.", "warn");
                      }}
                      className={`px-3 py-1 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        !useSnapshot
                          ? "bg-brand-accent text-white shadow-[1px_1px_0px_0px_rgba(26,26,26,1)]"
                          : "text-brand-ink/60 hover:text-brand-ink"
                      }`}
                      id="btn-snapshot-off"
                    >
                      Disabled (Dynamic)
                    </button>
                  </div>
                </div>

                {/* Quick Refresh */}
                <div className="flex flex-col gap-1.5 md:self-end">
                  <button
                    onClick={handleResetSession}
                    className="py-2 px-3 bg-brand-neutral hover:bg-brand-bg border border-brand-ink text-brand-ink rounded-none text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                    id="btn-refresh-session"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-brand-ink/70" />
                    Reset Session
                  </button>
                </div>
              </div>

              {/* Pagination Mode Alert & Anomaly Banner */}
              <AnimatePresence mode="wait">
                {duplicatesOnCurrentPage.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-brand-accent/10 border-2 border-brand-accent text-brand-ink rounded-none p-4 flex gap-3 items-start shadow-[3px_3px_0px_0px_rgba(230,57,70,0.15)]"
                    id="duplicate-anomaly-banner"
                  >
                    <AlertTriangle className="w-5 h-5 text-brand-accent shrink-0 mt-0.5 animate-bounce" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-brand-accent font-display">
                        Consistency Anomaly Detected! (Offset Drift)
                      </h4>
                      <p className="text-xs text-brand-ink/85 mt-1 leading-relaxed">
                        Product ID(s) <strong>#{duplicatesOnCurrentPage.join(", #")}</strong> appeared again on this page! 
                        Because OFFSET pagination was used, new background insertions pushed existing items downward in the sort order, making them shift right into the next page.
                      </p>
                    </div>
                  </motion.div>
                )}

                {paginationMode === "cursor" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-50 border-2 border-emerald-600 rounded-none p-3.5 flex gap-2.5 items-start"
                    id="consistency-success-banner"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 font-display">
                        Cursor Pagination Stable State
                      </h4>
                      <p className="text-[11px] text-brand-ink/80 mt-0.5 leading-relaxed">
                        By using the item's <code>updated_at</code> and <code>id</code> coordinates as a bounding point, background modifications have <strong>zero effect</strong> on page boundaries. Duplicates and skips are strictly avoided!
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main Product Catalog Display */}
              <div className="bg-brand-bg border-2 border-brand-ink p-4 flex-1 flex flex-col shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]" id="catalog-card">
                
                {/* Catalog Controls Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b-2 border-brand-ink mb-4">
                  
                  {/* Category Pill Filters */}
                  <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 md:pb-0" id="category-filter-pills">
                    {["All", "Electronics", "Books", "Sports", "Fashion", "Home", "Beauty", "Automotive", "Gaming"].map(cat => (
                      <button
                        key={cat}
                        onClick={() => handleCategoryChange(cat)}
                        className={`text-[11px] px-2.5 py-0.5 rounded-none font-mono uppercase tracking-wider transition-all shrink-0 cursor-pointer border ${
                          selectedCategory === cat
                            ? "bg-brand-ink text-brand-bg font-bold border-brand-ink"
                            : "bg-brand-neutral text-brand-ink/75 border-brand-ink/20 hover:text-brand-ink hover:border-brand-ink hover:bg-brand-neutral/80"
                        }`}
                        id={`category-pill-${cat.toLowerCase()}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Page limit and snapshot display */}
                  <div className="flex items-center gap-3 text-[11px] font-mono text-brand-ink/60 font-semibold" id="catalog-stats-pane">
                    <div>
                      <span>Matches: </span>
                      <strong className="text-brand-ink font-sans font-bold">{filteredAndSortedDatabase.length}</strong>
                    </div>
                    
                    {useSnapshot && (
                      <div className="flex items-center gap-1.5 bg-brand-neutral border border-brand-ink/20 px-2 py-0.5 rounded-none font-mono text-brand-ink/80">
                        <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></span>
                        <span className="text-[10px]">Snap: {snapshotTime.substring(11, 19)} UTC</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Product List Cards */}
                <div className="flex-1 flex flex-col gap-2" id="product-cards-container">
                  <AnimatePresence mode="wait">
                    {pageProducts.length === 0 ? (
                      <div className="py-12 flex flex-col items-center justify-center text-brand-ink/60 border-2 border-dashed border-brand-ink rounded-none">
                        <AlertTriangle className="w-6 h-6 text-brand-accent mb-2" />
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider">No products match current snapshot filter</span>
                        <button 
                          onClick={handleResetSession}
                          className="mt-2 text-[11px] text-brand-accent hover:underline cursor-pointer font-mono font-bold uppercase tracking-wide"
                        >
                          reset_snapshot()
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {pageProducts.map((p, idx) => {
                          const isDuplicate = duplicatesOnCurrentPage.includes(p.id);
                          return (
                            <motion.div
                              key={`${p.id}-${idx}`}
                              initial={{ opacity: 0, x: -4 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.12, delay: idx * 0.02 }}
                              className={`py-2.5 px-3.5 rounded-none border flex flex-col md:flex-row md:items-center justify-between gap-2.5 transition-all ${
                                isDuplicate 
                                  ? "bg-brand-accent/5 border-2 border-brand-accent shadow-[2px_2px_0px_0px_rgba(230,57,70,0.15)] animate-pulse" 
                                  : p.status === "inserted" 
                                    ? "bg-amber-50 border border-amber-500"
                                    : p.status === "updated"
                                      ? "bg-indigo-50 border border-indigo-500"
                                      : "bg-brand-neutral/30 border-brand-ink/15 hover:border-brand-ink/40 hover:bg-brand-neutral/55"
                              }`}
                              id={`product-row-${p.id}`}
                            >
                              <div className="flex items-start gap-2.5">
                                <div className="text-[10px] font-mono bg-brand-neutral text-brand-ink px-1.5 py-0.5 rounded-none border border-brand-ink/40 h-5 flex items-center justify-center font-bold">
                                  #{p.id}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <h3 className="font-bold text-brand-ink text-xs font-display tracking-tight">{p.name}</h3>
                                    
                                    {/* Anomalies and State tags */}
                                    {isDuplicate && (
                                      <span className="bg-brand-accent text-white text-[8px] px-1.5 py-0.2 rounded-none font-bold animate-bounce uppercase tracking-wider font-mono">
                                        Duplicate Seen!
                                      </span>
                                    )}
                                    {p.status === "inserted" && (
                                      <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[8px] px-1.5 py-0.2 rounded-none font-mono font-bold uppercase tracking-wider">
                                        Inserted
                                      </span>
                                    )}
                                    {p.status === "updated" && (
                                      <span className="bg-indigo-100 text-indigo-800 border border-indigo-300 text-[8px] px-1.5 py-0.2 rounded-none font-mono font-bold uppercase tracking-wider">
                                        Updated
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-[10.5px] text-brand-ink/60 mt-0.5 font-mono">
                                    <span className="text-brand-accent font-sans font-bold">{p.category}</span>
                                    <span>•</span>
                                    <span>Updated: {p.updated_at.substring(11, 19)} UTC</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex md:flex-col items-end justify-between md:justify-center gap-0.5">
                                <span className="font-display font-bold text-sm text-brand-ink">
                                  ${p.price.toFixed(2)}
                                </span>
                                <span className="text-[9px] text-brand-ink/50 font-mono font-medium">
                                  Index: {filteredAndSortedDatabase.findIndex(x => x.id === p.id) + 1}
                                </span>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Pagination Controls Footer */}
                <div className="mt-4 pt-3 border-t border-brand-ink/20 flex flex-col sm:flex-row items-center justify-between gap-3" id="pagination-nav-footer">
                  <div className="text-[11px] text-brand-ink/65 font-mono font-semibold">
                    {paginationMode === "offset" ? (
                      <span>
                        Showing <strong>{Math.min((offsetPage - 1) * pageSize + 1, filteredAndSortedDatabase.length)}</strong>-<strong>{Math.min(offsetPage * pageSize, filteredAndSortedDatabase.length)}</strong> of <strong>{filteredAndSortedDatabase.length}</strong>
                      </span>
                    ) : (
                      <span>
                        Page index: <strong>{currentCursorIndex + 1}</strong>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 font-mono">
                    <button
                      onClick={handlePrevPage}
                      disabled={paginationMode === "offset" ? offsetPage === 1 : currentCursorIndex === 0}
                      className="py-1 px-3 bg-brand-neutral border border-brand-ink text-brand-ink disabled:opacity-30 disabled:hover:bg-brand-neutral hover:bg-brand-bg rounded-none text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-[1px_1px_0px_0px_rgba(26,26,26,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]"
                      id="btn-nav-prev"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Prev
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={!hasNextPage}
                      className="py-1 px-3 bg-brand-neutral border border-brand-ink text-brand-ink disabled:opacity-30 disabled:hover:bg-brand-neutral hover:bg-brand-bg rounded-none text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-[1px_1px_0px_0px_rgba(26,26,26,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]"
                      id="btn-nav-next"
                    >
                      Next
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Live SQL Console & Explain Plan */}
              <div className="bg-brand-bg border-2 border-brand-ink p-4 shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]" id="sql-console-panel">
                <div className="flex items-center justify-between border-b border-brand-ink/20 pb-2.5 mb-3">
                  <h2 className="text-[10px] font-bold text-brand-ink uppercase tracking-widest flex items-center gap-1.5 font-mono">
                    <Terminal className="w-3.5 h-3.5 text-brand-accent" />
                    Live SQL Terminal Compiler
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-500/35 px-2 py-0.5 rounded-none font-mono font-bold uppercase tracking-wider">
                      {paginationMode === "cursor" ? "Index Scan O(log N)" : "Offset Scan O(N)"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  
                  {/* Raw SQL Statement editor container */}
                  <div className="md:col-span-8 bg-brand-neutral p-3 rounded-none border border-brand-ink/30 flex flex-col justify-between font-mono text-[10.5px] leading-relaxed relative min-h-[120px]">
                    <div className="absolute right-3 top-3 text-brand-ink/40">
                      <Code className="w-3.5 h-3.5" />
                    </div>
                    <pre className="text-brand-ink overflow-x-auto select-all whitespace-pre font-mono font-medium">
                      {generatedSQL}
                    </pre>
                    <span className="text-[9px] text-brand-ink/50 mt-2 border-t border-brand-ink/10 pt-1.5 block">
                      Target Engine: Neon PostgreSQL (16.2)
                    </span>
                  </div>

                  {/* Execution Explain Plan Metrics */}
                  <div className="md:col-span-4 bg-brand-neutral p-3 rounded-none border border-brand-ink/30 flex flex-col justify-between" id="db-explain-plan-details">
                    <div>
                      <h4 className="text-[9px] font-bold text-brand-ink/60 uppercase tracking-wider mb-2 flex items-center gap-1 font-mono">
                        <Cpu className="w-3 h-3 text-brand-accent" />
                        Optimizer Plan
                      </h4>
                      
                      <div className="space-y-1.5 text-[10.5px] font-mono">
                        <div className="flex justify-between border-b border-brand-ink/10 pb-1">
                          <span className="text-brand-ink/50">Node Type</span>
                          <span className={paginationMode === "cursor" ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
                            {paginationMode === "cursor" ? "Index Scan" : "Seq Scan"}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-brand-ink/10 pb-1">
                          <span className="text-brand-ink/50">Sorted by</span>
                          <span className="text-brand-ink font-bold">updated_at, id</span>
                        </div>
                        <div className="flex justify-between border-b border-brand-ink/10 pb-1">
                          <span className="text-brand-ink/50">Est Cost</span>
                          <span className={paginationMode === "cursor" ? "text-emerald-700 font-bold" : "text-brand-accent font-bold"}>
                            {paginationMode === "cursor" ? "0.08..4.25" : "125.40..585.50"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-brand-ink/50">Run Time</span>
                          <span className={paginationMode === "cursor" ? "text-emerald-700 font-bold" : "text-brand-accent font-bold"}>
                            {paginationMode === "cursor" ? "~0.05 ms" : `~${(offsetPage * 0.18 + 0.05).toFixed(2)} ms`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[9.5px] text-brand-ink/75 leading-relaxed mt-3 bg-brand-bg p-2 rounded-none border border-brand-ink/15 font-mono">
                      {paginationMode === "cursor" 
                        ? "Utilizing composite Index 'idx_products_updated_id' with index key range filters."
                        : "WARNING: Large OFFSET scanning requires scanning over rows only to discard them. This scale is highly inefficient on larger catalogs."
                      }
                    </p>
                  </div>

                </div>
              </div>

            </section>

          </div>
        )}

        {/* Source Code Explorer */}
        {activeTab === "code" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-brand-bg border-2 border-brand-ink overflow-hidden min-h-[550px] shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]" id="code-explorer-grid">
            
            {/* Sidebar File Selector */}
            <nav className="md:col-span-3 border-r-2 border-brand-ink p-4 flex flex-col gap-1.5 bg-brand-neutral/30" id="code-file-selector">
              <h3 className="text-[10px] uppercase font-bold text-brand-ink/50 tracking-wider mb-3 px-1.5 font-mono">
                FastAPI Python Backend
              </h3>
              {PYTHON_SOURCES.map((src, idx) => (
                <button
                  key={src.name}
                  onClick={() => setActiveFileIdx(idx)}
                  className={`w-full text-left py-2 px-3 rounded-none text-xs transition-all flex items-center justify-between cursor-pointer border font-mono ${
                    activeFileIdx === idx
                      ? "bg-brand-ink text-brand-bg font-bold border-brand-ink shadow-[1px_1px_0px_0px_rgba(230,57,70,1)]"
                      : "text-brand-ink/75 border-transparent hover:text-brand-ink hover:bg-brand-neutral"
                  }`}
                  id={`code-tab-${src.name.replace(".", "-")}`}
                >
                  <span className="flex items-center gap-1.5 font-mono">
                    <FileCode className="w-4 h-4 shrink-0 text-brand-accent" />
                    {src.name}
                  </span>
                </button>
              ))}

              <div className="mt-6 border-t border-brand-ink/25 pt-4 px-1.5 font-mono">
                <span className="text-[10px] font-bold text-brand-ink/50 uppercase tracking-wider block mb-2">
                  Key Concepts
                </span>
                <ul className="text-[11px] space-y-1.5 text-brand-ink/75 leading-relaxed">
                  <li className="flex gap-1.5 items-start">
                    <span className="text-brand-accent font-mono font-bold">1.</span>
                    Composite sorting indices
                  </li>
                  <li className="flex gap-1.5 items-start">
                    <span className="text-brand-accent font-mono font-bold">2.</span>
                    Inequality bounding keys
                  </li>
                  <li className="flex gap-1.5 items-start">
                    <span className="text-brand-accent font-mono font-bold">3.</span>
                    Atomic snapshot anchoring
                  </li>
                  <li className="flex gap-1.5 items-start">
                    <span className="text-brand-accent font-mono font-bold">4.</span>
                    Fast mapping inserts
                  </li>
                </ul>
              </div>
            </nav>

            {/* Code Highlight Box */}
            <section className="md:col-span-9 flex flex-col bg-brand-neutral/10" id="code-viewer-panel">
              <div className="bg-brand-neutral/60 border-b border-brand-ink/20 px-4 py-2.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-brand-ink font-bold">
                    {PYTHON_SOURCES[activeFileIdx].name}
                  </span>
                  <span className="text-[10px] text-brand-ink/50 block font-mono mt-0.5">
                    {PYTHON_SOURCES[activeFileIdx].path}
                  </span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(PYTHON_SOURCES[activeFileIdx].code);
                    addLog(`Copied code of ${PYTHON_SOURCES[activeFileIdx].name} to clipboard!`, "success");
                  }}
                  className="py-1 px-3 bg-brand-neutral hover:bg-brand-bg border border-brand-ink text-brand-ink text-[11px] font-bold font-mono transition-all cursor-pointer shadow-[1px_1px_0px_0px_rgba(26,26,26,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]"
                  id="btn-copy-code"
                >
                  Copy File
                </button>
              </div>

              <div className="flex-1 p-5 overflow-auto font-mono text-[11px] leading-relaxed text-brand-ink/90 select-all max-h-[480px] bg-brand-neutral/20" id="code-pre-scroller">
                <pre className="whitespace-pre font-mono">
                  {PYTHON_SOURCES[activeFileIdx].code}
                </pre>
              </div>
            </section>

          </div>
        )}

      </main>

      {/* Footer Branding */}
      <footer className="border-t-2 border-brand-ink bg-brand-neutral py-4 px-6 text-center text-xs text-brand-ink/70" id="app-footer">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[10px]">
          <span className="font-semibold">© 2026 CodeVector System Architectures. All rights reserved.</span>
          <div className="flex gap-4 font-bold text-brand-ink/60">
            <span>PostgreSQL 16</span>
            <span>SQLAlchemy 2.x</span>
            <span>FastAPI 0.110+</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
