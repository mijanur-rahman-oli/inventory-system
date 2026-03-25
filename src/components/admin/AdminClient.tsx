"use client";

import { useState, useTransition } from "react";
import {
  Shield,
  ShieldOff,
  Trash2,
  UserCheck,
  UserX,
  Users,
  Crown,
  AlertTriangle,
} from "lucide-react";
import {
  promoteUser,
  demoteUser,
  blockUser,
  unblockUser,
  deleteUsers,
} from "@/lib/actions/admin";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  displayName: string;
  primaryEmail: string;
  role: string;
  isBlocked: boolean;
  createdAt: string;
  inventoryCount: number;
}

export function AdminClient({
  users: initial,
  currentUserId,
}: {
  users: User[];
  currentUserId: string;
}) {
  const [users, setUsers] = useState(initial);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [confirmAction, setConfirmAction] = useState<{
    type: string;
    label: string;
    onConfirm: () => void;
  } | null>(null);
  const router = useRouter();

  const adminCount = users.filter((u) => u.role === "admin").length;
  const allSelected =
    users.length > 0 && selected.size === users.length;
  const someSelected = selected.size > 0;

  const toggleAll = () =>
    setSelected(
      allSelected ? new Set() : new Set(users.map((u) => u.id))
    );

  const toggle = (id: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) {
        n.delete(id);
      } else {
        n.add(id);
      }
      return n;
    });

  const confirm = (type: string, label: string, action: () => void) => {
    setConfirmAction({ type, label, onConfirm: action });
  };

  const handlePromote = () => {
    confirm(
      "promote",
      `Promote ${selected.size} user(s) to Admin?`,
      () => {
        startTransition(async () => {
          for (const id of selected) {
            await promoteUser(id);
            setUsers((prev) =>
              prev.map((u) =>
                u.id === id ? { ...u, role: "admin" } : u
              )
            );
          }
          setSelected(new Set());
          toast.success("Users promoted to Admin");
          router.refresh();
        });
      }
    );
  };

  const handleDemote = () => {
    const selectedAdmins = Array.from(selected).filter(
      (id) => users.find((u) => u.id === id)?.role === "admin"
    );

    // Check if demoting would remove all admins
    const remainingAdmins = adminCount - selectedAdmins.length;
    if (remainingAdmins === 0) {
      toast.error(
        "Cannot demote: At least one admin must remain in the system."
      );
      return;
    }

    const isSelfDemotion = selected.has(currentUserId);
    const label = isSelfDemotion
      ? `Demote ${selected.size} user(s) to User? You will lose admin access immediately.`
      : `Demote ${selected.size} user(s) to User?`;

    confirm("demote", label, () => {
      startTransition(async () => {
        for (const id of selected) {
          await demoteUser(id);
          setUsers((prev) =>
            prev.map((u) =>
              u.id === id ? { ...u, role: "user" } : u
            )
          );
        }
        setSelected(new Set());
        toast.success("Users demoted");

        // If self-demotion, redirect immediately
        if (isSelfDemotion) {
          toast("Your admin access has been removed. Redirecting...");
          setTimeout(() => router.push("/dashboard"), 1500);
        } else {
          router.refresh();
        }
      });
    });
  };

  const handleBlock = () => {
    confirm(
      "block",
      `Block ${selected.size} user(s)?`,
      () => {
        startTransition(async () => {
          for (const id of selected) {
            await blockUser(id);
            setUsers((prev) =>
              prev.map((u) =>
                u.id === id ? { ...u, isBlocked: true } : u
              )
            );
          }
          setSelected(new Set());
          toast.success("Users blocked");
          router.refresh();
        });
      }
    );
  };

  const handleUnblock = () => {
    startTransition(async () => {
      for (const id of selected) {
        await unblockUser(id);
        setUsers((prev) =>
          prev.map((u) =>
            u.id === id ? { ...u, isBlocked: false } : u
          )
        );
      }
      setSelected(new Set());
      toast.success("Users unblocked");
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (selected.has(currentUserId)) {
      toast.error("You cannot delete your own account.");
      return;
    }

    confirm(
      "delete",
      `Permanently delete ${selected.size} user(s)? This cannot be undone.`,
      () => {
        startTransition(async () => {
          await deleteUsers(Array.from(selected));
          setUsers((prev) =>
            prev.filter((u) => !selected.has(u.id))
          );
          setSelected(new Set());
          toast.success("Users deleted");
        });
      }
    );
  };

  const selectedUsers = users.filter((u) => selected.has(u.id));
  const allSelectedAreBlocked =
    selectedUsers.length > 0 &&
    selectedUsers.every((u) => u.isBlocked);
  const allSelectedAreAdmins =
    selectedUsers.length > 0 &&
    selectedUsers.every((u) => u.role === "admin");

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">
            Admin Panel
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Manage users, roles and access
          </p>
        </div>

        {/* Stats */}
        <div className="ml-auto flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-[var(--text-muted)]">
              Total Users
            </div>
            <div className="text-lg font-bold text-[var(--text)]">
              {users.length}
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-xs text-[var(--text-muted)]">Admins</div>
            <div className="text-lg font-bold text-indigo-400">
              {adminCount}
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-xs text-[var(--text-muted)]">Blocked</div>
            <div className="text-lg font-bold text-red-400">
              {users.filter((u) => u.isBlocked).length}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Toolbar — only shows when rows selected */}
      {someSelected && (
        <div className="toolbar-enter mb-4 flex items-center gap-2 px-4 py-3 bg-[var(--accent-muted)] border border-[var(--accent)] rounded-xl flex-wrap">
          <span className="text-sm font-medium text-[var(--accent)]">
            {selected.size} selected
          </span>
          <div className="flex-1" />

          {/* Promote */}
          {!allSelectedAreAdmins && (
            <button
              onClick={handlePromote}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-xs font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50"
            >
              <Crown className="w-3.5 h-3.5" />
              Promote to Admin
            </button>
          )}

          {/* Demote */}
          {allSelectedAreAdmins && (
            <button
              onClick={handleDemote}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
              <ShieldOff className="w-3.5 h-3.5" />
              Demote to User
            </button>
          )}

          {/* Block / Unblock */}
          {allSelectedAreBlocked ? (
            <button
              onClick={handleUnblock}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Unblock
            </button>
          ) : (
            <button
              onClick={handleBlock}
              disabled={isPending || selected.has(currentUserId)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              <UserX className="w-3.5 h-3.5" />
              Block
            </button>
          )}

          {/* Delete */}
          <button
            onClick={handleDelete}
            disabled={isPending || selected.has(currentUserId)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>

          <button
            onClick={() => setSelected(new Set())}
            className="px-3 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[var(--text-muted)]" />
            <h2 className="font-semibold text-[var(--text)]">
              Registered Users
            </h2>
          </div>
          <span className="text-xs text-[var(--text-muted)]">
            {users.length} total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg)]">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide hidden md:table-cell">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide hidden lg:table-cell">
                  Inventories
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide hidden lg:table-cell">
                  Registered
                </th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-16 text-center text-sm text-[var(--text-muted)]"
                  >
                    No users found
                  </td>
                </tr>
              )}
              {users.map((u) => {
                const isSelected = selected.has(u.id);
                const isSelf = u.id === currentUserId;
                return (
                  <tr
                    key={u.id}
                    className={cn(
                      "border-b border-[var(--border)] last:border-0 transition-colors",
                      isSelected
                        ? "bg-[var(--accent-muted)]"
                        : "hover:bg-[var(--bg)]"
                    )}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggle(u.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-indigo-400">
                            {u.displayName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[var(--text)] flex items-center gap-1.5">
                            {u.displayName}
                            {isSelf && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-muted)] hidden md:table-cell">
                      {u.primaryEmail}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border",
                          u.role === "admin"
                            ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                            : "bg-[var(--border)] text-[var(--text-muted)] border-transparent"
                        )}
                      >
                        {u.role === "admin" && (
                          <Crown className="w-3 h-3" />
                        )}
                        {u.role === "admin" ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border",
                          u.isBlocked
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        )}
                      >
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            u.isBlocked ? "bg-red-400" : "bg-emerald-400"
                          )}
                        />
                        {u.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-muted)] hidden lg:table-cell">
                      {u.inventoryCount}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-muted)] hidden lg:table-cell">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Dialog */}
      {confirmAction && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setConfirmAction(null)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border)] p-6 animate-fadeIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="font-semibold text-[var(--text)]">
                Confirm Action
              </h3>
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              {confirmAction.label}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  confirmAction.onConfirm();
                  setConfirmAction(null);
                }}
                className="flex-1 py-2 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-2 bg-[var(--border)] text-[var(--text)] rounded-xl text-sm font-medium hover:opacity-80 transition-opacity"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}