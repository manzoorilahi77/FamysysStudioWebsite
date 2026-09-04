/**
 * THE SIDEBAR'S SHAPE.
 *
 * Routes, not content — every entry here has a matching folder under `src/app/admin`, and
 * the groups are how those routes are filed rather than anything read from the CMS. That
 * is why it is a presentation constant and not a repository call: a nav item exists
 * because a route exists, and an empty collection still needs its screen.
 *
 * `breadcrumb` is the group label a screen prints above its heading. Dashboard has none —
 * it is the root.
 */

export interface AdminNavItem {
  readonly label: string;
  readonly href: string;
}

export interface AdminNavGroup {
  /** Empty for the ungrouped first item. */
  readonly label: string;
  readonly items: ReadonlyArray<AdminNavItem>;
}

export const ADMIN_NAV_GROUPS: ReadonlyArray<AdminNavGroup> = [
  {
    label: "",
    items: [{ label: "Dashboard", href: "/admin" }],
  },
  {
    label: "Content",
    items: [
      { label: "Pages", href: "/admin/pages" },
      { label: "Case Studies", href: "/admin/case-studies" },
      { label: "Testimonials", href: "/admin/testimonials" },
      { label: "Capabilities", href: "/admin/capabilities" },
      { label: "Process Steps", href: "/admin/process-steps" },
      { label: "FAQ", href: "/admin/faq" },
      { label: "Engagement Tiers", href: "/admin/engagement-tiers" },
      { label: "Lists", href: "/admin/lists" },
    ],
  },
  {
    label: "Media",
    items: [{ label: "Library", href: "/admin/library" }],
  },
  {
    label: "Inbox",
    items: [{ label: "Inquiries", href: "/admin/inquiries" }],
  },
] as const;

/**
 * No account system yet — this phase has no authentication at all. The name in the top
 * right is the studio itself, and the control beside it is disabled, because there is
 * nothing to switch to and nothing to sign out of.
 */
export const ADMIN_ACCOUNT_NAME = "Famysys Studio";
