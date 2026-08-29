import Image from "next/image";
import type { ClientLogo } from "../../domain/social-proof/entities/ClientLogo";
import { Container } from "../components/Container";
import { Eyebrow } from "../components/Eyebrow";
import { Marquee } from "../components/Marquee";

interface ClientMarqueeProps {
  readonly eyebrow: string;
  readonly logos: ReadonlyArray<ClientLogo>;
}

export function ClientMarquee({ eyebrow, logos }: ClientMarqueeProps) {
  return (
    <section aria-label="Clients" className="bg-ink py-16">
      <Container>
        <Eyebrow dark className="text-center">
          {eyebrow}
        </Eyebrow>
        <div className="mt-8">
          <Marquee
            ariaLabel="Client logos"
            items={logos.map((logo) => ({
              key: logo.name,
              content: (
                <Image
                  src={logo.logo.src.value}
                  alt={logo.logo.alt}
                  width={48}
                  height={48}
                  loading="lazy"
                  style={{ opacity: 0.6 }}
                />
              ),
            }))}
          />
        </div>
      </Container>
    </section>
  );
}
