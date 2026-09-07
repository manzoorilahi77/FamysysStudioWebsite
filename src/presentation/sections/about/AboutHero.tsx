import type { CSSProperties } from "react";
import type { AboutHeroView } from "../../lib/viewModels";
import { AboutFrame } from "../../components/AboutFrame";
import { Container } from "../../components/Container";
import { Eyebrow } from "../../components/Eyebrow";
import { RevealHeading } from "../../components/RevealHeading";

interface AboutHeroProps {
  readonly hero: AboutHeroView;
}

/**
 * The same 60svh the other inner-page heroes hold, where this one used to sit at 50 —
 * and an image beside the heading where it used to be type on a flat ground. The page
 * is still the quietest on the site, but a hero that was nothing but a sentence read as
 * a placeholder rather than as restraint.
 *
 * The image is BESIDE the type, not behind it. A photograph under the heading would need
 * a wash to keep the text legible, and a wash is a colour derived against ink — exactly
 * what the contrast rules say cannot be trusted. Beside it, the heading sits on plain
 * ink and the frame carries the picture: five columns, dropped a step, the split the
 * rest of the page uses.
 *
 * No call to action, still deliberately: this page's argument is "here is who this is",
 * and the ask belongs at the foot. Everything here arrives on load rather than on scroll,
 * so the entrance is the CSS keyframe `.enter-fade` and the image's settle is
 * `enter-scale` keyframe — both hold their end state when JavaScript never runs.
 */
export function AboutHero({ hero }: AboutHeroProps) {
  const fadeIn = (delayMs: number) => ({ "--enter-delay": `${delayMs}ms` }) as CSSProperties;

  return (
    <section
      className="surface-dark bg-ink text-canvas flex items-center"
      aria-label={hero.heading}
      style={{ minHeight: "60svh" }}
    >
      <Container>
        {/* Top padding clears the fixed header and no more; the flex centring takes up
            whatever slack is left inside the 60svh. */}
        <div className="grid gap-10 pt-28 pb-16 lg:grid-cols-12 lg:items-center lg:gap-6 lg:pb-20">
          <div className="lg:col-span-6">
            <div className="enter-fade" style={fadeIn(0)}>
              <Eyebrow dark>{hero.eyebrow}</Eyebrow>
            </div>
            <RevealHeading
              as="h1"
              className="text-heading mt-5 max-w-[20ch] font-semibold text-canvas"
              accent={["creative production."]}
            >
              {hero.heading}
            </RevealHeading>
            <p
              className="text-body enter-fade mt-6 text-canvas-80"
              style={{ maxWidth: "54ch", ...fadeIn(200) }}
            >
              {hero.body}
            </p>
          </div>

          <div className="enter-fade lg:col-span-5 lg:col-start-8 lg:mt-10" style={fadeIn(120)}>
            <AboutFrame
              media={hero.media}
              hasArrived
              priority
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="about-frame--hero"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
