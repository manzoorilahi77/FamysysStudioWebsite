import { describe, expect, it } from "vitest";
import { MediaRef } from "../../domain/shared/value-objects/MediaRef";
import type { ClientLogo } from "../../domain/social-proof/entities/ClientLogo";
import { FakeSocialProofRepository } from "./__fakes__/FakeSocialProofRepository";
import { GetClientLogos } from "./GetClientLogos";

function fixtureLogos(): ReadonlyArray<ClientLogo> {
  return [
    {
      name: "Northwind Logistics",
      logo: MediaRef.create({
        kind: "image",
        src: "/media/logo-01.svg",
        alt: "Northwind Logistics wordmark",
        aspectRatio: "1:1",
      }),
    },
  ];
}

describe("GetClientLogos", () => {
  it("returns client logos from the repository", async () => {
    const logos = fixtureLogos();
    const repository = new FakeSocialProofRepository([], [], logos);
    const useCase = new GetClientLogos(repository);

    const result = await useCase.execute();

    expect(result).toBe(logos);
    expect(repository.logosCalls).toBe(1);
  });

  it("propagates a repository failure", async () => {
    const repository = new FakeSocialProofRepository([], [], fixtureLogos());
    repository.error = new Error("logos unavailable");
    const useCase = new GetClientLogos(repository);

    await expect(useCase.execute()).rejects.toThrow("logos unavailable");
  });
});
