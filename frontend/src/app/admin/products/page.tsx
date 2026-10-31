"use client";

import React, { useState } from "react";
import {
  useProducts,
  usePlans,
  useCreateProduct,
  useCreateVariant,
  useCreatePlan,
} from "@/hooks/useProducts";
import { DataTable } from "@/components/ui/data-table";
import { Dialog } from "@/components/ui/dialog";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { formatINR, formatDate } from "@/lib/utils";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import type { Product, Plan } from "@/mocks/store";
import {
  Plus,
  Package,
  Sparkle,
  CalendarCheck,
  Check,
} from "@phosphor-icons/react";

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // New product form
  const [prodName, setProdName] = useState("");
  const [prodType, setProdType] = useState("Software");
  const [salesPrice, setSalesPrice] = useState(1200);
  const [costPrice, setCostPrice] = useState(400);
  const [prodNotes, setProdNotes] = useState("");

  // New variant form
  const [variantBrand, setVariantBrand] = useState("");
  const [priceDelta, setPriceDelta] = useState(560);

  // New plan form
  const [planName, setPlanName] = useState("");
  const [planPeriod, setPlanPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");
  const [planPrice, setPlanPrice] = useState(999);
  const [minQty, setMinQty] = useState(1);
  const [autoClose, setAutoClose] = useState(false);
  const [closable, setClosable] = useState(true);
  const [pausable, setPausable] = useState(true);
  const [renewable, setRenewable] = useState(true);

  const { data: productsData, isLoading } = useProducts({ page, page_size: pageSize });
  const { data: plansData } = usePlans();

  const createProductMutation = useCreateProduct();
  const createVariantMutation = useCreateVariant();
  const createPlanMutation = useCreatePlan();

  const productColumns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: "Product Name",
      cell: ({ row }) => (
        <div>
          <span className="font-semibold text-ink text-sm block">
            {row.original.name}
          </span>
          <span className="text-xs text-muted block truncate max-w-xs">
            {row.original.notes || "Standard SaaS subscription software"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <span className="text-xs px-2 py-0.5 rounded-leaf bg-paper border border-border text-ink">
          {row.original.type}
        </span>
      ),
    },
    {
      accessorKey: "salesPrice",
      header: "Sales Price",
      cell: ({ row }) => (
        <span className="font-mono-tabular text-xs font-semibold text-ink">
          {formatINR(row.original.salesPrice)}
        </span>
      ),
    },
    {
      accessorKey: "costPrice",
      header: "Cost Price",
      cell: ({ row }) => (
        <span className="font-mono-tabular text-xs text-muted">
          {formatINR(row.original.costPrice)}
        </span>
      ),
    },
    {
      id: "margin",
      header: "Gross Margin",
      cell: ({ row }) => {
        const margin = row.original.salesPrice - row.original.costPrice;
        const percent = Math.round((margin / (row.original.salesPrice || 1)) * 100);
        return (
          <span className="font-mono-tabular text-xs text-primary font-medium">
            {percent}% ({formatINR(margin)})
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedProduct(row.original);
              setVariantModalOpen(true);
            }}
            className="text-xs text-primary font-medium hover:underline cursor-pointer"
          >
            + Variant
          </button>
        </div>
      ),
    },
  ];

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName) return;

    await createProductMutation.mutateAsync({
      name: prodName,
      type: prodType,
      salesPrice: Number(salesPrice),
      costPrice: Number(costPrice),
      notes: prodNotes,
    });

    setProductModalOpen(false);
    setProdName("");
    setProdNotes("");
  };

  const handleVariantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !variantBrand) return;

    await createVariantMutation.mutateAsync({
      productId: selectedProduct.id,
      data: {
        brand: variantBrand,
        priceDelta: Number(priceDelta),
      },
    });

    setVariantModalOpen(false);
    setVariantBrand("");
  };

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName || !selectedProduct) return;

    await createPlanMutation.mutateAsync({
      productId: selectedProduct.id,
      name: planName,
      period: planPeriod,
      price: Number(planPrice),
      minQty: Number(minQty),
      availableFrom: new Date().toISOString(),
      autoClose,
      closable,
      pausable,
      renewable,
    });

    setPlanModalOpen(false);
    setPlanName("");
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-[var(--font-bricolage)] text-ink">
            Products & Plan Catalog
          </h1>
          <p className="text-sm text-muted">
            Configure subscription offerings, brand variants (e.g. Odoo adds ₹560), and billing rules
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (productsData?.items[0]) {
                setSelectedProduct(productsData.items[0]);
              }
              setPlanModalOpen(true);
            }}
            className="gap-2"
          >
            <CalendarCheck size={14} />
            <span>Build Plan</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setProductModalOpen(true)}
            className="gap-2"
          >
            <Plus size={14} />
            <span>Add Product</span>
          </Button>
        </div>
      </div>

      {/* Product Catalog Table */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold font-[var(--font-bricolage)] text-ink">
          Core Software Products
        </h2>
        <DataTable
          columns={productColumns}
          data={productsData?.items || []}
          total={productsData?.total || 0}
          page={page}
          pageSize={pageSize}
          isLoading={isLoading}
          onPaginationChange={(p: PaginationState) => {
            setPage(p.pageIndex + 1);
            setPageSize(p.pageSize);
          }}
        />
      </div>

      {/* Available Plans Grid */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold font-[var(--font-bricolage)] text-ink">
            Active Subscription Plans ({plansData?.length || 0})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(plansData || []).map((plan) => (
            <div
              key={plan.id}
              className="bg-surface border border-border shape-leaf p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-ink">
                    {plan.name}
                  </span>
                  <span className="text-[11px] font-mono-tabular uppercase px-2 py-0.5 rounded-leaf bg-paper border border-border text-primary font-medium">
                    {plan.period}
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono-tabular text-ink mb-1">
                  {formatINR(plan.price)}
                  <span className="text-xs text-muted font-normal"> / {plan.period}</span>
                </div>
                <span className="text-xs text-muted block">
                  Minimum quantity: {plan.minQty} seat(s)
                </span>
              </div>

              {/* Toggles Status Badges */}
              <div className="pt-3 border-t border-border grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-ink">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      plan.renewable ? "bg-status-active" : "bg-muted"
                    }`}
                  />
                  <span>Renewable</span>
                </div>
                <div className="flex items-center gap-1.5 text-ink">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      plan.pausable ? "bg-status-active" : "bg-muted"
                    }`}
                  />
                  <span>Pausable</span>
                </div>
                <div className="flex items-center gap-1.5 text-ink">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      plan.closable ? "bg-status-active" : "bg-muted"
                    }`}
                  />
                  <span>Customer Closable</span>
                </div>
                <div className="flex items-center gap-1.5 text-ink">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      plan.autoClose ? "bg-accent" : "bg-muted"
                    }`}
                  />
                  <span>Auto-close</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Product Dialog */}
      <Dialog
        open={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        title="Add Software Product"
      >
        <form onSubmit={handleProductSubmit} className="space-y-4">
          <Field label="Product Name" required>
            <Input
              required
              placeholder="e.g. Brightloop CRM Pro"
              value={prodName}
              onChange={(e) => setProdName(e.target.value)}
            />
          </Field>

          <Field label="Type" required>
            <Select
              value={prodType}
              onChange={(e) => setProdType(e.target.value)}
            >
              <option value="Software">Software</option>
              <option value="Service">Managed Service</option>
              <option value="Addon">Addon Feature</option>
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Sales Price (₹)" required>
              <Input
                type="number"
                value={salesPrice}
                onChange={(e) => setSalesPrice(Number(e.target.value))}
              />
            </Field>

            <Field label="Cost Price (₹)" required>
              <Input
                type="number"
                value={costPrice}
                onChange={(e) => setCostPrice(Number(e.target.value))}
              />
            </Field>
          </div>

          <Field label="Notes / Description">
            <Textarea
              placeholder="Internal product notes or feature scope"
              value={prodNotes}
              onChange={(e) => setProdNotes(e.target.value)}
            />
          </Field>

          <div className="flex items-center justify-end gap-3 mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setProductModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createProductMutation.isPending}
            >
              Save Product
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Add Variant Dialog */}
      <Dialog
        open={variantModalOpen}
        onClose={() => setVariantModalOpen(false)}
        title={`Add Variant — ${selectedProduct?.name || ""}`}
      >
        <form onSubmit={handleVariantSubmit} className="space-y-4">
          <p className="text-xs text-muted">
            Configure a brand delta for this product (for example, Odoo adds ₹560).
          </p>

          <Field label="Brand / Variant Name" required>
            <Input
              required
              placeholder="e.g. Odoo Integration / Enterprise Edition"
              value={variantBrand}
              onChange={(e) => setVariantBrand(e.target.value)}
            />
          </Field>

          <Field label="Price Delta (₹, positive or negative)" required>
            <Input
              type="number"
              value={priceDelta}
              onChange={(e) => setPriceDelta(Number(e.target.value))}
            />
          </Field>

          <div className="flex items-center justify-end gap-3 mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setVariantModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createVariantMutation.isPending}
            >
              Add Variant
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Plan Builder Dialog */}
      <Dialog
        open={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        title="Build Recurring Plan"
      >
        <form onSubmit={handlePlanSubmit} className="space-y-4">
          <Field label="Associated Product" required>
            <Select
              value={selectedProduct?.id || ""}
              onChange={(e) => {
                const p = productsData?.items.find((item) => item.id === e.target.value);
                if (p) setSelectedProduct(p);
              }}
            >
              {(productsData?.items || []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Plan Name" required>
            <Input
              required
              placeholder="e.g. Monthly Professional / Annual Scale"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Billing Cadence" required>
              <Select
                value={planPeriod}
                onChange={(e) =>
                  setPlanPeriod(
                    e.target.value as "daily" | "weekly" | "monthly" | "yearly"
                  )
                }
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </Select>
            </Field>

            <Field label="Price per Cycle (₹)" required>
              <Input
                type="number"
                value={planPrice}
                onChange={(e) => setPlanPrice(Number(e.target.value))}
              />
            </Field>
          </div>

          <Field label="Minimum Quantity" required>
            <Input
              type="number"
              min={1}
              value={minQty}
              onChange={(e) => setMinQty(Number(e.target.value))}
            />
          </Field>

          {/* Toggles */}
          <div className="p-4 bg-paper border border-border rounded-leaf space-y-2 text-xs">
            <label className="flex items-center gap-2 text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={renewable}
                onChange={(e) => setRenewable(e.target.checked)}
                className="accent-primary"
              />
              <span>Renewable automatically</span>
            </label>
            <label className="flex items-center gap-2 text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={pausable}
                onChange={(e) => setPausable(e.target.checked)}
                className="accent-primary"
              />
              <span>Pausable by customer</span>
            </label>
            <label className="flex items-center gap-2 text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={closable}
                onChange={(e) => setClosable(e.target.checked)}
                className="accent-primary"
              />
              <span>Closable by customer</span>
            </label>
            <label className="flex items-center gap-2 text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={autoClose}
                onChange={(e) => setAutoClose(e.target.checked)}
                className="accent-primary"
              />
              <span>Auto-close at end of availability</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setPlanModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createPlanMutation.isPending}
            >
              Save Plan
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
