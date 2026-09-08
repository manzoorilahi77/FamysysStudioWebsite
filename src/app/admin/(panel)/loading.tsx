/**
 * WHAT A SLOW SCREEN LOOKS LIKE, so it does not look like a broken one.
 *
 * Every screen in the panel is server-rendered per request and reads the whole content
 * model to do it — seven pages, their blocks, and the cards inside them. On a cold start,
 * or against a database on another host, that is a second or two in which the previous
 * screen would otherwise just sit there with nothing to say.
 *
 * Deliberately not a skeleton of the screen that is coming: the panel's screens are
 * different enough shapes that a skeleton would be wrong more often than right, and a
 * wrong skeleton reads as a rendering bug. A line that says what is happening is honest
 * and is announced to a screen reader, which a shimmering rectangle is not.
 */
export default function AdminPanelLoading() {
  return (
    <div className="px-10 py-7">
      <p role="status" aria-live="polite" className="text-small text-graphite-70">
        Loading…
      </p>
    </div>
  );
}
