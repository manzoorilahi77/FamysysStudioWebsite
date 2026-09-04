/**
 * WHICH COLLECTIONS ARE OPEN, RE-EXPORTED FOR THE ROUTES.
 *
 * The policy itself lives in the domain, next to `CmsCollection`, because "a case study
 * cannot be added until media upload exists" is a fact about the content model rather
 * than about a screen. But a route file is `app`, and `app` may not import `domain` —
 * that boundary is what stops a page reaching past the use cases into the entities and
 * quietly growing logic of its own.
 *
 * So this is the one thing an application module is for: passing a domain decision
 * outward without the caller having to know where it was made. It re-exports and adds
 * nothing, deliberately — the moment it starts deciding anything, the decision has moved
 * out of the domain by accident.
 */
export { isOpenCollection, recordNoun } from "../../domain/cms/entities/CmsCollection";
