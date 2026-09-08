import type { ReactNode } from "react";
import type { AdminNavigation } from "../../../application/cms/GetAdminNavigation";
import { AdminSidebar } from "./AdminSidebar";

/**
 * Two columns for the whole panel: a fixed 256px sidebar on the dark ground and the content
 * on the page ground beside it.
 *
 * The sidebar is `sticky` rather than `fixed` so the main column keeps normal document flow —
 * a fixed sidebar would need the content offset by a magic number that has to be kept in step
 * with the width. `min-w-0` on the main column is what stops a wide row inside it pushing the
 * whole layout sideways at 1280.
 *
 * The navigation is passed in rather than fetched here: it is read once in the layout, on the
 * server, so every screen shows the same draft marks as the screen that produced them.
 */
export function AdminShell({
  navigation,
  children,
}: {
  readonly navigation: AdminNavigation;
  readonly children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Two elements, not one: the outer column carries the dark ground and stretches to the
          full height of the document, while the inner one is the screen-height sticky panel.
          Sticking the coloured element itself left the ink stopping at the fold and the page
          ground showing under it on any screen with more rows than fit. */}
      <div className="w-64 shrink-0 bg-ink">
        <div className="sticky top-0 h-screen overflow-y-auto">
          <AdminSidebar navigation={navigation} />
        </div>
      </div>
      <main id="main-content" className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  );
}
