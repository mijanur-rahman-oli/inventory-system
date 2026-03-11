"use client";

import { useRouter, usePathname } from "next/navigation";
import { Package, Settings, Hash, MessageCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ItemsTab } from "./ItemsTab";
import { InventorySettingsTab } from "./InventorySettingsTab";
import { CustomIdTab } from "./CustomIdTab";
import { DiscussionTab } from "@/components/discussion/DiscussionTab";
import type { FieldMeta, Item, Post } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  inventory: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    version: number;
    fieldMetas: FieldMeta[];
    idTemplate: {
      id: string;
      inventoryId: string;
      elements: unknown;
      sequenceVal: number;
    } | null;
  };
  items: Item[];
  itemsTotal: number;
  totalPages: number;
  currentPage: number;
  currentTab: string;
  searchQuery: string;
  posts: Post[];
}

const TABS = [
  { id: "items", label: "Items", icon: Package },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "customId", label: "Custom ID", icon: Hash },
  { id: "discussion", label: "Discussion", icon: MessageCircle },
];

export function InventoryTabs(props: Props) {
  const {
    inventory,
    items,
    itemsTotal,
    totalPages,
    currentPage,
    currentTab,
    searchQuery,
    posts,
  } = props;
  const router = useRouter();
  const pathname = usePathname();

  const setTab = (tab: string) => {
    router.push(`${pathname}?tab=${tab}`);
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/inventories"
          className="p-2 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-[var(--text)] truncate">
            {inventory.name}
          </h1>
          {inventory.description && (
            <p className="text-sm text-[var(--text-muted)] truncate">
              {inventory.description}
            </p>
          )}
        </div>
        <div className="ml-auto">
          <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--border)] text-[var(--text-muted)]">
            {itemsTotal} items
          </span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-[var(--border)] mb-6 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap",
                active
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {currentTab === "items" && (
        <ItemsTab
          inventory={inventory}
          items={items}
          itemsTotal={itemsTotal}
          totalPages={totalPages}
          currentPage={currentPage}
          searchQuery={searchQuery}
        />
      )}
      {currentTab === "settings" && (
        <InventorySettingsTab inventory={inventory} />
      )}
      {currentTab === "customId" && <CustomIdTab inventory={inventory} />}
      {currentTab === "discussion" && (
        <DiscussionTab inventoryId={inventory.id} initialPosts={posts} />
      )}
    </>
  );
}