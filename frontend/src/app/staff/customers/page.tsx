"use client";

import React, { useState } from "react";
import { useCustomers, useCreateCustomer } from "@/hooks/useCustomers";
import { DataTable } from "@/components/ui/data-table";
import { Drawer } from "@/components/ui/drawer";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { formatDate } from "@/lib/utils";
import type { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table";
import type { User } from "@/mocks/store";
import {
  MagnifyingGlass,
  Plus,
  User as UserIcon,
  Buildings,
  Receipt,
} from "@phosphor-icons/react";
import Link from "next/link";

const STATES = [
  "All States",
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
  "Delhi",
  "Gujarat",
  "Telangana",
  "Uttar Pradesh",
  "Haryana",
];

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("All States");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // New customer form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newState, setNewState] = useState("Maharashtra");
  const [newGstin, setNewGstin] = useState("");

  const createCustomerMutation = useCreateCustomer();

  const sortField = sorting[0]?.id;
  const sortOrder = sorting[0]?.desc ? ("desc" as const) : ("asc" as const);

  const { data, isLoading } = useCustomers({
    page,
    page_size: pageSize,
    q: search || undefined,
    state: stateFilter !== "All States" ? stateFilter : undefined,
    sort: sortField,
    order: sortOrder,
  });

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Customer",
      cell: ({ row }) => (
        <div>
          <span className="font-semibold text-ink block">{row.original.name}</span>
          <span className="text-xs text-muted block">{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "company",
      header: "Company",
      cell: ({ row }) => (
        <span className="text-xs text-ink font-medium">
          {row.original.company || "Individual"}
        </span>
      ),
    },
    {
      accessorKey: "state",
      header: "State (GST)",
      cell: ({ row }) => (
        <span className="text-xs text-muted">{row.original.state}</span>
      ),
    },
    {
      accessorKey: "gstin",
      header: "GSTIN",
      cell: ({ row }) => (
        <span className="font-mono-tabular text-xs text-ink">
          {row.original.gstin || "Unregistered"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => (
        <span className="font-mono-tabular text-xs text-muted">
          {formatDate(row.original.createdAt, "short")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <button
          onClick={() => setSelectedCustomer(row.original)}
          className="text-xs text-primary font-medium hover:underline cursor-pointer"
        >
          View &bull; Manage
        </button>
      ),
    },
  ];

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    await createCustomerMutation.mutateAsync({
      name: newName,
      email: newEmail,
      company: newCompany,
      state: newState,
      gstin: newGstin,
    });

    setCreateOpen(false);
    setNewName("");
    setNewEmail("");
    setNewCompany("");
    setNewGstin("");
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-[var(--font-bricolage)] text-ink">
            Customer Directory
          </h1>
          <p className="text-sm text-muted">
            Manage subscriber accounts, billing profiles, and GST records
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setCreateOpen(true)}
          className="gap-2"
        >
          <Plus size={14} />
          <span>Add Customer</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface border border-border shape-leaf p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <MagnifyingGlass
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder="Search by name, email, company, or GSTIN..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-sm bg-paper border border-border rounded-leaf text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <select
          value={stateFilter}
          onChange={(e) => {
            setStateFilter(e.target.value);
            setPage(1);
          }}
          className="px-3.5 py-2 text-sm bg-paper border border-border rounded-leaf text-ink cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.items || []}
        total={data?.total || 0}
        page={page}
        pageSize={pageSize}
        sorting={sorting}
        isLoading={isLoading}
        onPaginationChange={(p: PaginationState) => {
          setPage(p.pageIndex + 1);
          setPageSize(p.pageSize);
        }}
        onSortingChange={setSorting}
      />

      {/* Customer Detail Drawer */}
      <Drawer
        open={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer?.name || "Customer Profile"}
      >
        {selectedCustomer && (
          <div className="space-y-6">
            <div className="p-4 bg-paper border border-border rounded-leaf space-y-3">
              <div className="flex items-center gap-2 text-ink font-semibold text-sm">
                <UserIcon size={16} className="text-primary" />
                <span>Account Information</span>
              </div>
              <div className="text-xs space-y-1 text-muted">
                <p>
                  <strong className="text-ink">Email:</strong> {selectedCustomer.email}
                </p>
                <p>
                  <strong className="text-ink">Company:</strong>{" "}
                  {selectedCustomer.company || "Individual"}
                </p>
                <p>
                  <strong className="text-ink">State:</strong> {selectedCustomer.state}
                </p>
                <p>
                  <strong className="text-ink">GSTIN:</strong>{" "}
                  <span className="font-mono-tabular">
                    {selectedCustomer.gstin || "Unregistered"}
                  </span>
                </p>
                <p>
                  <strong className="text-ink">Member since:</strong>{" "}
                  {formatDate(selectedCustomer.createdAt, "long")}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                href={`/staff/subscriptions?action=new&customerId=${selectedCustomer.id}`}
                className="w-full"
              >
                <Button variant="primary" size="md" className="w-full gap-2">
                  <Receipt size={16} />
                  <span>Create New Quotation</span>
                </Button>
              </Link>
              <Link
                href={`/staff/subscriptions?q=${encodeURIComponent(selectedCustomer.name)}`}
                className="w-full"
              >
                <Button variant="secondary" size="md" className="w-full">
                  <span>View Customer Subscriptions</span>
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Drawer>

      {/* Create Customer Dialog */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Register New Customer"
      >
        <form onSubmit={handleCreateCustomer} className="flex flex-col gap-4">
          <Field label="Full name" required>
            <Input
              required
              placeholder="Deepak Verma"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </Field>

          <Field label="Email address" required>
            <Input
              required
              type="email"
              placeholder="deepak@acme.in"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </Field>

          <Field label="Company / Entity name">
            <Input
              placeholder="Acme Technologies Pvt Ltd"
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
            />
          </Field>

          <Field label="State (for GST calculation)" required>
            <Select
              value={newState}
              onChange={(e) => setNewState(e.target.value)}
            >
              {STATES.filter((s) => s !== "All States").map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="GSTIN (optional)">
            <Input
              placeholder="27AABCU9603R1ZM"
              value={newGstin}
              onChange={(e) => setNewGstin(e.target.value)}
            />
          </Field>

          <div className="flex items-center justify-end gap-3 mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createCustomerMutation.isPending}
            >
              Save Customer
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
