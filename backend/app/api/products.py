from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.product import PaginatedProductsResponse, CursorSchema
from app.services.pagination import paginate_products

router = APIRouter()

@router.get("/products", response_model=PaginatedProductsResponse)
def get_products(
    limit: int = Query(20, ge=1, le=100, description="Number of items to return per page"),
    category: Optional[str] = Query(None, description="Filter products by category"),
    cursor_updated_at: Optional[datetime] = Query(None, description="Cursor updated_at timestamp from previous page"),
    cursor_id: Optional[int] = Query(None, description="Cursor product ID from previous page"),
    snapshot_time: Optional[datetime] = Query(None, description="Snapshot timestamp to freeze pagination session"),
    db: Session = Depends(get_db)
):
    """
    Get a paginated list of products using cursor-based pagination and snapshot consistency.
    
    If 'snapshot_time' is not provided, the current server time is used as the snapshot,
    which freezes the dataset for subsequent page loads to avoid duplicates or missing items.
    """
    try:
        # Resolve cursor inputs and execute pagination query
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
        raise HTTPException(
            status_code=500,
            detail=f"Error performing paginated query: {str(e)}"
        )
