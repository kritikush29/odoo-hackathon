from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    billing,
    catalog,
    customers,
    discounts,
    invoices,
    payments,
    reports,
    staff,
    subscriptions,
    taxes,
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(catalog.router, tags=["catalog"])
api_router.include_router(customers.router, tags=["customers"])
api_router.include_router(subscriptions.router, tags=["subscriptions"])
api_router.include_router(invoices.router, tags=["invoices"])
api_router.include_router(billing.router, tags=["billing"])
api_router.include_router(payments.router, tags=["payments"])
api_router.include_router(taxes.router, tags=["taxes"])
api_router.include_router(discounts.router, tags=["discounts"])
api_router.include_router(staff.router, tags=["staff"])
api_router.include_router(reports.router, tags=["reports"])
