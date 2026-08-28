import { describe, expect, it } from "vitest";
import type { MetricStat } from "../../domain/social-proof/entities/MetricStat";
import { FakeSocialProofRepository } from "./__fakes__/FakeSocialProofRepository";
import { GetImpactMetrics } from "./GetImpactMetrics";

function fixtureMetrics(): ReadonlyArray<MetricStat> {
  return [{ value: 3, suffix: "x", label: "Faster turnaround — TODO: confirm with client" }];
}

describe("GetImpactMetrics", () => {
  it("returns metrics from the repository", async () => {
    const metrics = fixtureMetrics();
    const repository = new FakeSocialProofRepository([], metrics, []);
    const useCase = new GetImpactMetrics(repository);

    const result = await useCase.execute();

    expect(result).toBe(metrics);
    expect(repository.metricsCalls).toBe(1);
  });

  it("propagates a repository failure", async () => {
    const repository = new FakeSocialProofRepository([], fixtureMetrics(), []);
    repository.error = new Error("metrics unavailable");
    const useCase = new GetImpactMetrics(repository);

    await expect(useCase.execute()).rejects.toThrow("metrics unavailable");
  });
});
