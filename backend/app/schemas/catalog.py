from pydantic import BaseModel, Field


class ProductCreate(BaseModel):
    name: str
    product_type: str = "software"
    sales_price: float = Field(default=0.0, ge=0)
    cost_price: float = Field(default=0.0, ge=0)
    notes: str | None = None


class PlanCreate(BaseModel):
    name: str
    billing_period: str = "monthly"
    price: float = Field(default=0.0, ge=0)
    minimum_quantity: int = Field(default=1, ge=1)
    is_auto_close: bool = False
    is_closable: bool = True
    is_pausable: bool = True
    is_renewable: bool = True
