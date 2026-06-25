from sqlalchemy import Column, BigInteger, Text, Numeric, DateTime, Index, func
from .database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    name = Column(Text, nullable=False)
    category = Column(Text, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    def __repr__(self) -> str:
        return f"<Product id={self.id} name={self.name} category={self.category} price={self.price}>"

# Composite Index for Cursor-Based Pagination on 'updated_at' and 'id' in descending order
Index(
    "idx_products_updated_id",
    Product.updated_at.desc(),
    Product.id.desc()
)

# Composite Index with category filtering and cursor-based pagination
Index(
    "idx_products_category_updated_id",
    Product.category,
    Product.updated_at.desc(),
    Product.id.desc()
)
