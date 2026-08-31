import Image from "next/image";
import type { ApproachBlock } from "../../domain/about/entities/AboutPage";
import { motion } from "../../shared/design/tokens";
import { Container } from "../components/Container";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";
import { SectionHeader } from "../components/SectionHeader";

interface AboutApproachProps {
  readonly approach: ApproachBlock;
}

/**
 * The same asymmetric split the capability, step and tier blocks use — five columns of
 * image against six of copy, the image dropped a step — so this page sits inside the
 * site's existing system rather than inventing a layout for one section.
 *
 * A SERVER COMPONENT, unlike its siblings on the other pages. Those own an observer so
 * their image can settle from 1.03 on entry; this page's motion brief is standard scroll
 * reveals and the heading clip reveal, nothing else, so the settle is not here and there
 * is no client-side state left to justify the boundary. `Reveal` supplies the two-part
 * entry on its own.
 *
 * Dark, and it KEEPS the entry fade: every colour here is canvas or canvas-80, which
 * hold at 9.616:1 and 8.548:1 against the fade's start value as well as against settled
 * ink. The accent-on-dark that forces `fade={false}` elsewhere is not used.
 */
export function AboutApproach({ approach }: AboutApproachProps) {
  return (
    <Section dark ariaLabel={approach.heading}>
      <Container>
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-6">
          <div className="lg:col-span-5 lg:col-start-1 lg:mt-20">
            <Reveal index={0} staggerStepMs={motion.stagger.splitStepMs}>
              <div className="about-media">
                <Image
                  src={approach.media.src.value}
                  alt={approach.media.alt}
                  width={1600}
                  height={1200}
                  sizes="(min-width: 1024px) 42vw, 100vw"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal index={1} staggerStepMs={motion.stagger.splitStepMs}>
              <SectionHeader
                eyebrow={approach.eyebrow}
                heading={approach.heading}
                dark
                className=""
              />
              {approach.paragraphs.map((paragraph, index) => (
                <p
                  key={paragraph}
                  className={`text-body text-canvas-80 ${index === 0 ? "mt-8" : "mt-5"}`}
                  style={{ maxWidth: "58ch" }}
                >
                  {paragraph}
                </p>
              ))}
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
