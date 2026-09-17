/**
 * WHICH RECORD, AND WHICH FIELD ON IT.
 *
 * A `ContentPointer` says where a string physically lives — a file, a binding, a path to
 * one literal. An address says what it IS: a field of a page section, or a field of a
 * record inside one. The two are not interchangeable, and both exist because there are two
 * stores. The file-backed writer splices a pointer; a row is keyed by an address.
 *
 * A record CREATED in the panel has no pointer at all — there is no literal in any file for
 * it — which is why the address is the primary way a write is targeted and the pointer is
 * the fallback.
 *
 * Addresses are only ever constructed server-side, from the read model. Nothing a browser
 * sends becomes one, which is what makes "no request can name a table, a column or a file"
 * true by construction rather than by validation.
 */
export interface ContentAddress {
  /**
   * "deck_slide" and "deck_item" address the Capability Deck's own parallel structure — a
   * slide, or a repeatable card inside one (a video, a website entry, a print image). The
   * deck is not one of the seven fixed pages, so it does not use "page_section", but its
   * writes go through this same address/edit/conflict machinery rather than a second one.
   */
  readonly kind: "page_section" | "collection_record" | "deck_slide" | "deck_item";
  /** "home:hero", "capabilities:creative-design". */
  readonly key: string;
}

/** The address of one field: the owner, plus the field id within it. */
export interface ContentFieldAddress extends ContentAddress {
  /** Matches `CmsValue.id` within the record. */
  readonly field: string;
}

export function sameAddress(left: ContentAddress, right: ContentAddress): boolean {
  return left.kind === right.kind && left.key === right.key;
}

/** "page_section:home:hero" — the key every per-string lookup in the panel is made on. */
export function addressKey(address: ContentAddress): string {
  return `${address.kind}:${address.key}`;
}

export function fieldKey(address: ContentFieldAddress): string {
  return `${addressKey(address)}:${address.field}`;
}
