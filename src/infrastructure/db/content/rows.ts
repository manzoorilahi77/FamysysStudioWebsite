import type { RowDataPacket } from "mysql2/promise";

/**
 * The shape of every row this layer reads, one interface per SELECT.
 *
 * They are written out rather than inferred because mysql2 hands back `any`: a typo in a
 * column name would otherwise become `undefined` at runtime and a rendered empty string,
 * which is exactly the failure the store's missing-key error exists to prevent. Declaring
 * the row makes the compiler check the property names against the SELECT beside them.
 *
 * DATE COLUMNS ARE STRINGS. The pool sets `dateStrings`, because the driver's own
 * conversion applies the server's timezone to a value that carries none. Repositories
 * turn them into Dates where a Date is what the entity holds.
 */

export interface ContentStringRow extends RowDataPacket {
  owner_key: string;
  field_key: string;
  value: string;
  list_key: string | null;
  sort_order: number;
}

/** One unpublished edit, as the preview overlay reads it. */
export interface ContentDraftRow extends RowDataPacket {
  owner_key: string;
  field_key: string;
  value: string;
}

/** The panel's own read of a draft, with the revision it was made against. */
export interface ContentDraftDetailRow extends ContentDraftRow {
  owner_kind: "page_section" | "collection_record" | "media_asset";
  base_version: number;
  updated_at: string;
}

/** The panel's own read of a string: everything the editor is shown about it. */
export interface ContentStringDetailRow extends ContentStringRow {
  id: number;
  owner_kind: "page_section" | "collection_record" | "media_asset";
  label: string;
  value_kind: "text" | "ctaLabel" | "url" | "mediaAlt";
  is_approved: number;
  is_editable: number;
  read_only_reason: string | null;
  source_file: string | null;
  source_symbol: string | null;
  source_path: string | null;
  version: number;
  updated_at: string;
}

export interface CaseStudyRow extends RowDataPacket {
  id: number;
  slug: string;
  reference: string;
  home_media_path: string;
  home_media_kind: string;
  home_media_ratio: string;
  detail_media_path: string;
  detail_media_kind: string;
  detail_media_ratio: string;
  sort_order: number;
  updated_at: string;
}

export interface CapabilityRow extends RowDataPacket {
  id: number;
  slug: string;
  media_path: string;
  media_kind: string;
  media_ratio: string;
  sort_order: number;
  updated_at: string;
}

export interface CaseStudyCapabilityRow extends RowDataPacket {
  case_study_slug: string;
  capability_slug: string;
  sort_order: number;
}

export interface ProcessStepRow extends RowDataPacket {
  id: number;
  slug: string;
  media_path: string;
  media_kind: string;
  media_ratio: string;
  sort_order: number;
  updated_at: string;
}

export interface EngagementTierRow extends RowDataPacket {
  id: number;
  slug: string;
  is_custom: number;
  media_path: string;
  media_kind: string;
  media_ratio: string;
  sort_order: number;
  updated_at: string;
}

export interface FaqItemRow extends RowDataPacket {
  id: number;
  faq_key: string;
  owner: string;
  has_cta: number;
  sort_order: number;
  updated_at: string;
}

export interface MediaAssetRow extends RowDataPacket {
  file_name: string;
  path: string;
  extension: string;
  default_alt: string | null;
  byte_size: number;
  updated_at: string;
}

export interface InquiryRow extends RowDataPacket {
  id: number;
  full_name: string;
  email: string;
  company_name: string;
  company_size: string;
  company_website: string | null;
  contact_role: string | null;
  project_brief: string | null;
  source_form: string;
  status: "new" | "read" | "archived";
  received_at: string;
  read_at: string | null;
  archived_at: string | null;
}

export interface ActivityLogRow extends RowDataPacket {
  id: number;
  action: "saved" | "published" | "previewed";
  page_label: string;
  section_label: string | null;
  occurred_at: string;
}

export interface PageRow extends RowDataPacket {
  page_key: string;
  title: string;
  route: string;
  description: string;
  source_file: string;
  sort_order: number;
  updated_at: string;
}

export interface PageSectionRow extends RowDataPacket {
  page_key: string;
  section_key: string;
  title: string;
  summary: string;
  sort_order: number;
  updated_at: string;
}

export interface CountRow extends RowDataPacket {
  total: number;
}

/**
 * MySQL DATETIME(3) as the driver returns it with `dateStrings`: "2026-09-04 10:31:22.481",
 * with no offset on it at all.
 *
 * It is read as UTC, and that is only correct because the pool pins every connection to
 * `time_zone = '+00:00'` — see pool.ts. Without that the value is in whatever zone the
 * server happens to be in, parsing it here applies whatever zone this machine is in, and
 * the panel shows a relative time that is wrong by the difference. That was a real bug,
 * not a hypothetical one.
 */
export function toDate(value: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(`${value.replace(" ", "T")}Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
