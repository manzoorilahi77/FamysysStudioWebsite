import type { ContactPage } from "../../domain/contact/entities/ContactPage";
import { Container } from "../components/Container";
import { ContactForm } from "../components/ContactForm";
import { Section } from "../components/Section";
import { Wordmark } from "../components/Wordmark";

interface ContactFormSectionProps {
  readonly form: ContactPage["form"];
  readonly panel: ContactPage["panel"];
}

/**
 * The page's one dark section: form on the left, "what happens next" on the right, as on
 * famysys.com's own contact page.
 *
 * `fade={false}`, and not for the usual reason. Every other dark section settles its
 * background from ink-90 to full ink over 900ms, and any colour derived against full ink
 * is wrong for that first 900ms — accent-on-dark measures 5.015:1 on ink and 3.792:1 on
 * the fade's start value. The error messages are accent-on-dark, and an error message
 * that is briefly illegible is a worse failure than the one it is reporting. Beyond the
 * contrast: a form is not a moment for a background transition. Someone arriving here
 * has come to fill it in.
 */
export function ContactFormSection({ form, panel }: ContactFormSectionProps) {
  const { direct } = panel;
  const hasDirectContact = Boolean(direct.email ?? direct.phone);

  return (
    <Section dark fade={false} ariaLabel={form.heading}>
      <Container>
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <h2 className="text-display-m font-medium text-canvas">{form.heading}</h2>
            <div className="mt-10">
              <ContactForm form={form} />
            </div>
          </div>

          {/* The raised panel. canvas-4 over ink with a canvas-16 edge — the site's
              existing dark-card surface, minus the hover escalation, because this one
              is not a target. */}
          <aside
            aria-labelledby="what-happens-next"
            className="rounded-sm border border-canvas-16 bg-canvas-4 p-8 lg:col-span-5 lg:p-10"
          >
            <h2 id="what-happens-next" className="text-display-s font-medium text-canvas">
              {panel.heading}
            </h2>

            <ol className="mt-8 space-y-8">
              {panel.steps.map((step) => (
                <li key={step.numeral}>
                  {/* accent-on-dark reads 4.515:1 against this panel's canvas-4 ground,
                      which clears the 4.5:1 text floor with very little to spare. It is
                      the same value, on the same surface, as the numbered sub-features
                      the homepage already ships. */}
                  <p className="label tabular text-accent-on-dark">{step.numeral}</p>
                  <h3 className="text-body mt-3 font-medium text-canvas">{step.heading}</h3>
                  <p className="text-small mt-2 text-canvas-80">{step.body}</p>
                </li>
              ))}
            </ol>

            <div className="mt-10 border-t border-canvas-16 pt-8">
              {/* The eyebrow is rendered only when there is something under it. The
                  Studio's own email and phone are not in the brief, and the parent's are
                  the parent's — see contact.content.ts. A heading with nothing beneath it
                  would be worse than the absence. */}
              {hasDirectContact ? (
                <p className="label text-canvas">{panel.directEyebrow}</p>
              ) : null}

              <div className={hasDirectContact ? "mt-6" : ""}>
                <Wordmark alt="Famysys Studio" dark className="h-7" />
                <p className="text-small mt-4 text-canvas-80">{panel.tagline}</p>
              </div>

              {hasDirectContact ? (
                <div className="mt-6 space-y-2">
                  {direct.email ? (
                    <a href={`mailto:${direct.email}`} className="text-small block text-canvas">
                      {direct.email}
                    </a>
                  ) : null}
                  {direct.phone ? (
                    <a
                      href={`tel:${direct.phone.replace(/[^\d+]/g, "")}`}
                      className="text-small block text-canvas"
                    >
                      {direct.phone}
                    </a>
                  ) : null}
                </div>
              ) : null}

              {/* The brief's closing line, and the last thing on the page before the
                  footer — which is what a closing line is for. */}
              <p className="text-small mt-8 text-canvas-60">{panel.closingLine}</p>
            </div>
          </aside>
        </div>
      </Container>
    </Section>
  );
}
