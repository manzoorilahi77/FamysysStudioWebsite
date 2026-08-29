import type { TalentBlockView } from "../lib/viewModels";
import { Container } from "../components/Container";
import { Eyebrow } from "../components/Eyebrow";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";
import { TalentTile } from "../components/TalentTile";

const GRID_SIZE = 3;

interface TalentProps {
  readonly talent: TalentBlockView;
}

export function Talent({ talent }: TalentProps) {
  return (
    <Section ariaLabel={talent.heading}>
      <Container className="grid gap-10 lg:grid-cols-2">
        <Reveal>
          <Eyebrow>{talent.eyebrow}</Eyebrow>
          <h2 className="text-display-l mt-4 font-medium text-ink">{talent.heading}</h2>
          <p className="text-lead mt-6 text-ink-70" style={{ maxWidth: "44ch" }}>
            {talent.supportingParagraph}
          </p>
        </Reveal>
        <div className="grid grid-cols-3 gap-3">
          {talent.tiles.map((tile, index) => (
            <TalentTile
              key={tile.src}
              media={tile}
              row={Math.floor(index / GRID_SIZE)}
              column={index % GRID_SIZE}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}
