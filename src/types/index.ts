export type FieldType = "text" | "multiline" | "numeric" | "link" | "boolean";
export type FieldKey =
  | "text1" | "text2" | "text3"
  | "multiline1" | "multiline2" | "multiline3"
  | "num1" | "num2" | "num3"
  | "bool1" | "bool2" | "bool3"
  | "link1" | "link2" | "link3";

export interface FieldMeta {
  id: string;
  inventoryId: string;
  fieldKey: FieldKey;
  fieldType: FieldType;
  title: string;
  description?: string | null;
  showInTable: boolean;
  sortOrder: number;
}

export interface Inventory {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  fieldMetas?: FieldMeta[];
  _count?: { items: number };
}

export interface Item {
  id: string;
  inventoryId: string;
  customId?: string | null;
  version: number;
  text1?: string | null;
  text2?: string | null;
  text3?: string | null;
  multiline1?: string | null;
  multiline2?: string | null;
  multiline3?: string | null;
  num1?: number | null;
  num2?: number | null;
  num3?: number | null;
  bool1?: boolean | null;
  bool2?: boolean | null;
  bool3?: boolean | null;
  link1?: string | null;
  link2?: string | null;
  link3?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type IdElementType =
  | "fixed"
  | "rand20"
  | "rand32"
  | "rand6"
  | "rand9"
  | "guid"
  | "date"
  | "time"
  | "sequence";

export interface IdElement {
  id: string;
  type: IdElementType;
  value?: string; // for fixed type
}

export interface IdTemplate {
  id: string;
  inventoryId: string;
  elements: IdElement[];
  sequenceVal: number;
}

export interface Post {
  id: string;
  inventoryId: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  content: string;
  createdAt: Date;
}

export interface SearchResult {
  type: "inventory" | "item";
  inventoryId: string;
  inventoryName: string;
  itemId?: string;
  snippet: string;
}

export type Theme = "light" | "dark";
export type Locale = "en" | "ru";