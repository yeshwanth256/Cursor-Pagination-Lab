# CodeVector Backend Internship Task: High-Performance Catalog Pagination

A production-ready FastAPI and PostgreSQL backend demonstrating a highly optimized cursor-based pagination system with snapshot consistency. This setup guarantees stable ordering, zero duplicates, and zero skipped items even when hundreds of records are being inserted or updated in real-time during user browsing on a catalog of 200,000+ items.

---

## 1. The Core Problem

Standard `LIMIT x OFFSET y` pagination is inherently broken for large datasets and highly dynamic catalogs:
1. **Performance Degradation ($O(N)$ Complexity)**: PostgreSQL must scan and discard `OFFSET` rows. For page 10,000 (`OFFSET 200000`), the database scans 200,000 rows only to return 20, leading to severe latency and resource depletion.
2. **Data Drifting & Duplicates**: If a user is on Page 1 and an item is inserted, existing items shift down. When the user requests Page 2 (`OFFSET 20`), they see the last item of Page 1 again.
3. **Skipped/Missed Items**: If an item is deleted or updated to a different position, items shift up. When requesting the next page, some items are skipped entirely and never shown.

---

## 2. The Solution

### A. Cursor-Based Pagination (Stable Ordering)
Instead of skipping a variable count of rows (`OFFSET`), we query items *relative* to the last item seen on the previous page. 
Our stable sorting order is `ORDER BY updated_at DESC, id DESC`.
The page boundaries are determined by a cursor containing the `updated_at` timestamp and `id` of the last item of the current page.

To fetch the next page, we execute:
```sql
SELECT *
FROM products
WHERE 
  (updated_at < :cursor_updated_at)
  OR 
  (updated_at = :cursor_updated_at AND id < :cursor_id)
ORDER BY updated_at DESC, id DESC
LIMIT :limit;
```
This is extremely fast ($O(\log N)$ or $O(1)$ lookup via a B-tree index) and completely immune to simple drift duplicates/skips!

### B. Snapshot Consistency
While cursor pagination avoids drifting issues caused by *insertions at the top*, it does not protect against:
- Brand new items being inserted while browsing (the user goes back to a previous page or updates are mixed).
- Items being *updated* such that their sorting position changes.

To freeze the user's browsing view, we capture a `snapshot_time` when they load the **first page**. Every subsequent request passes this same `snapshot_time`.
We apply a strict filtering clause:
```sql
WHERE updated_at <= :snapshot_time
```
This guarantees that **no products inserted or updated after the browsing session started are returned**. The dataset is effectively frozen for that browsing session, guaranteeing complete snapshot consistency.

---

## 3. Indexing Strategy

To support high performance, two composite index keys are configured:

1. **`CREATE INDEX idx_products_updated_id ON products(updated_at DESC, id DESC);`**
   - **Why?**: The primary query fetches pages ordered by `(updated_at DESC, id DESC)`. This B-tree index allows the query planner to read the rows already ordered and perform index-range scans. The lookup for `(updated_at < cursor_updated_at) OR ...` runs in $O(\log N)$ time, bypassing any sorting or full-table scans.

2. **`CREATE INDEX idx_products_category_updated_id ON products(category, updated_at DESC, id DESC);`**
   - **Why?**: When a user filters by category (`WHERE category = :category`), the database must filter first, then paginate. This multi-column composite index allows the query planner to jump directly to the specific category, scan the matching rows in pre-sorted descending order, and paginate instantaneously.

---

## 4. Local Setup and Installation

### Prerequisites
- Python 3.12+
- PostgreSQL database (or SQLite will be used automatically as a local fallback)

### Installation
1. Clone this repository and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Seeding the Database
Generate **200,000** realistic, Faker-derived product records in batches of 5,000 using the optimized bulk-insertion script:
```bash
# Set your DATABASE_URL environment variable first, e.g.:
export DATABASE_URL="postgresql://postgres:secret@localhost:5432/catalog_db"

# Run the seeding script
python app/scripts/seed_products.py
```
This will log the elapsed execution time, such as:
`Inserted 200000 products in 12.45 seconds`

### Running the API
Start the FastAPI server locally:
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) to view the interactive Swagger UI.

### Running Tests
Execute the self-contained pytest suite (testing pagination logic, categories, duplicates, and snapshot isolation):
```bash
pytest
```

---

## 5. API Usage & Curl Examples

### 1. Health Check
```bash
curl -X GET "http://127.0.0.1:8000/"
```

### 2. First Page Request (Initializes Snapshot)
```bash
curl -X GET "http://127.0.0.1:8000/products?limit=5"
```
**Response**:
```json
{
  "items": [
    {
      "name": "Acme Laptop 991",
      "category": "Electronics",
      "price": 899.99,
      "id": 199998,
      "created_at": "2026-06-25T08:00:00Z",
      "updated_at": "2026-06-25T08:00:00Z"
    }
  ],
  "next_cursor": {
    "updated_at": "2026-06-25T08:00:00Z",
    "id": 199998
  },
  "snapshot_time": "2026-06-25T08:50:00Z"
}
```

### 3. Fetching Subsequent Pages
Include the `snapshot_time` and the cursor keys returned from the previous page:
```bash
curl -X GET "http://127.0.0.1:8000/products?limit=5&snapshot_time=2026-06-25T08:50:00Z&cursor_updated_at=2026-06-25T08:00:00Z&cursor_id=199998"
```

---

## 6. Scalability Beyond 200,000 Records

To scale this database and system to millions of products, we recommend the following structural enhancements:
1. **Redis Caching for Cursor Queries**: Cache the first 1-3 landing pages of each category. These represent 90% of user hits.
2. **Elasticsearch / Typesense**: Offload filtering and fuzzy product searches to a search engine, feeding back IDs to perform fast primary key database lookups.
3. **Database Read-Replicas**: Distribute read queries for paginating products across read-replicas, keeping the primary write-instance reserved for orders and inventories.
4. **Partitioning**: Partition the `products` table by `category` or date ranges if historical archives are kept, reducing the size of individual B-trees.
