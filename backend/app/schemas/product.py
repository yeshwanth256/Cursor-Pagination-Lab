from decimal import Decimal
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict

class ProductBase(BaseModel):
    name: str = Field(..., description="The name of the product")
    category: str = Field(..., description="The product category")
    price: Decimal = Field(..., description="The price of the product with up to 2 decimal places")

class ProductCreate(ProductBase):
    pass

class ProductOut(ProductBase):
    id: int = Field(..., description="Unique product ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last updated timestamp")

    model_config = ConfigDict(from_attributes=True)

class CursorSchema(BaseModel):
    updated_at: str = Field(..., description="ISO 8601 formatted datetime string of the cursor position")
    id: int = Field(..., description="ID of the cursor position")

class PaginatedProductsResponse(BaseModel):
    items: List[ProductOut] = Field(..., description="List of products in the current page")
    next_cursor: Optional[CursorSchema] = Field(None, description="Cursor for fetching the next page")
    snapshot_time: str = Field(..., description="ISO 8601 formatted snapshot timestamp of when browsing started")
