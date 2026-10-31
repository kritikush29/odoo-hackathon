"use client";

import React, { useState } from "react";
import {
  useStaffList,
  useCreateStaff,
  useDeleteStaff,
} from "@/hooks/useStaff";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { formatDate } from "@/lib/utils";
import type { User } from "@/mocks/store";
import {
  UsersThree,
  Plus,
  Trash,
  ShieldCheck,
  UserGear,
} from "@phosphor-icons/react";

export default function AdminTeamPage() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);

  // Form state
  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffRole, setStaffRole] = useState<"staff" | "finance_lead">("staff");
  const [staffPassword, setStaffPassword] = useState("Staff@123");

  const { data: staffList, isLoading } = useStaffList();
  const createMutation = useCreateStaff();
  const deleteMutation = useDeleteStaff();

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !staffEmail) return;

    await createMutation.mutateAsync({
      name: staffName,
      email: staffEmail,
      role: staffRole,
      password: staffPassword,
    });

    setAddModalOpen(false);
    setStaffName("");
    setStaffEmail("");
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmUser) return;
    await deleteMutation.mutateAsync(deleteConfirmUser.id);
    setDeleteConfirmUser(null);
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-[var(--font-bricolage)] text-ink">
            Team Management
          </h1>
          <p className="text-sm text-muted">
            Manage operations staff, finance leads, and role permissions
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setAddModalOpen(true)}
          className="gap-2"
        >
          <Plus size={14} />
          <span>Add Team Member</span>
        </Button>
      </div>

      {/* Staff Table */}
      <div className="bg-surface border border-border shape-leaf overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UsersThree size={18} className="text-primary" />
            <span className="text-sm font-semibold text-ink">
              Authorized Personnel ({staffList?.length || 0})
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-sand/30 border-b border-border text-muted font-medium">
              <tr>
                <th className="p-3">Member</th>
                <th className="p-3">Role</th>
                <th className="p-3">Operating State</th>
                <th className="p-3">Joined</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {(staffList || []).map((member) => (
                <tr key={member.id} className="hover:bg-sand/20 transition-colors">
                  <td className="p-3">
                    <span className="font-semibold text-ink text-sm block">
                      {member.name}
                    </span>
                    <span className="text-muted block">{member.email}</span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-leaf text-[11px] font-medium border ${
                        member.role === "admin"
                          ? "bg-[#EAF3EC] text-status-active border-[#B8D8BF]"
                          : member.role === "finance_lead"
                            ? "bg-[#FDF6E8] text-[#8E6514] border-[#EAD39E]"
                            : "bg-[#EBF1F7] text-confirmed border-[#B5CBDD]"
                      }`}
                    >
                      {member.role === "admin" && <ShieldCheck size={12} />}
                      {member.role === "staff" && <UserGear size={12} />}
                      <span className="capitalize">
                        {member.role.replace("_", " ")}
                      </span>
                    </span>
                  </td>
                  <td className="p-3 text-muted">{member.state || "National"}</td>
                  <td className="p-3 font-mono-tabular text-muted">
                    {formatDate(member.createdAt, "short")}
                  </td>
                  <td className="p-3 text-right">
                    {member.role !== "admin" && (
                      <button
                        onClick={() => setDeleteConfirmUser(member)}
                        className="text-muted hover:text-status-overdue p-1.5 rounded-leaf transition-colors cursor-pointer"
                        title="Remove member"
                      >
                        <Trash size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Dialog */}
      <Dialog
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Invite Team Member"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <Field label="Full Name" required>
            <Input
              required
              placeholder="e.g. Priya Sharma"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
            />
          </Field>

          <Field label="Work Email" required>
            <Input
              required
              type="email"
              placeholder="priya@brightloop.in"
              value={staffEmail}
              onChange={(e) => setStaffEmail(e.target.value)}
            />
          </Field>

          <Field label="Role Designation" required>
            <Select
              value={staffRole}
              onChange={(e) =>
                setStaffRole(e.target.value as "staff" | "finance_lead")
              }
            >
              <option value="staff">Staff Operator (Quotes, Customers, Invoices)</option>
              <option value="finance_lead">Finance Lead (Ledger, Analytics, Taxes)</option>
            </Select>
          </Field>

          <Field label="Temporary Password" required>
            <Input
              required
              value={staffPassword}
              onChange={(e) => setStaffPassword(e.target.value)}
            />
          </Field>

          <div className="flex items-center justify-end gap-3 mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createMutation.isPending}
            >
              Add Member
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deleteConfirmUser)}
        onClose={() => setDeleteConfirmUser(null)}
        title="Revoke Team Access"
      >
        <div className="space-y-4">
          <p className="text-xs text-muted leading-relaxed">
            Are you sure you want to revoke access for{" "}
            <strong className="text-ink">{deleteConfirmUser?.name}</strong> (
            {deleteConfirmUser?.email})? They will no longer be able to log in to the Brightloop console.
          </p>

          <div className="flex items-center justify-end gap-3 mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeleteConfirmUser(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={deleteMutation.isPending}
              onClick={handleConfirmDelete}
            >
              Revoke Access
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
