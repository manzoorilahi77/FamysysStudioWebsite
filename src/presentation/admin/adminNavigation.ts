/**
 * WHAT THE SIDEBAR IS NOT.
 *
 * It used to be a constant here: a list of groups and hrefs, one per screen the panel
 * happened to have. That is why it drifted — a screen existed because a route existed, not
 * because the site had the thing it claimed to edit.
 *
 * The sidebar is now built from the read model. See `GetAdminNavigation`: seven pages from
 * the routes, their sections from what each route renders, and the draft marks from what has
 * been saved and not published. Nothing about it is written down.
 *
 * What is left here is the one string that is genuinely a constant.
 */

/** One shared login, so the name in the top right is the studio rather than a person. */
export const ADMIN_ACCOUNT_NAME = "Famysys Studio";
