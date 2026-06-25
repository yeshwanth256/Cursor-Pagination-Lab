from datetime import datetime, timezone
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
    2. No duplicates across pages (by using inequality cursors instead of offset values)
    3. No missed records from subsequent inserts (by using cursor)
    4. Snapshot consistency: hiding any elements updated/created after the browse session started.
    
    Arguments:
        db: SQLAlchemy session
        limit: Number of items to return
        category: Optional category filter
        cursor_updated_at: The updated_at value from the next_cursor
        cursor_id: The id value from the next_cursor
        snapshot_time: The timestamp at which the pagination session was frozen.
                      If None, the current time is captured and returned.
                      
    Returns:
        Tuple containing:
        - List of Products matching the query (up to limit)
        - Next cursor's updated_at (or None if no more pages)
        - Next cursor's id (or None if no more pages)
        - The snapshot_time used for this query
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

    # Always order by updated_at DESC, id DESC to maintain stable pagination order
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

    return items_to_return, next_cursor_updated_at, next_cursor_id, snapshot_time
