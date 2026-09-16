import { describe, expect, it } from "vitest";
import {
  SUBMISSION_LIMIT,
  SUBMISSION_WINDOW_MS,
  SubmissionRateLimit,
  clientAddress,
} from "./SubmissionRateLimit";

function clock(start = 1_000_000) {
  let now = start;
  return { now: () => now, advance: (ms: number) => (now += ms) };
}

describe("SubmissionRateLimit", () => {
  it("allows five from one address in ten minutes and refuses the sixth", () => {
    const time = clock();
    const limit = new SubmissionRateLimit(SUBMISSION_LIMIT, SUBMISSION_WINDOW_MS, time.now);

    for (let attempt = 0; attempt < SUBMISSION_LIMIT; attempt += 1) {
      expect(limit.take("203.0.113.7").allowed).toBe(true);
    }
    const refused = limit.take("203.0.113.7");

    expect(refused.allowed).toBe(false);
    expect(refused.allowed ? 0 : refused.retryAfterSeconds).toBe(600);
  });

  it("counts each address separately", () => {
    const limit = new SubmissionRateLimit(1, SUBMISSION_WINDOW_MS, clock().now);

    expect(limit.take("203.0.113.7").allowed).toBe(true);
    expect(limit.take("198.51.100.2").allowed).toBe(true);
    expect(limit.take("203.0.113.7").allowed).toBe(false);
  });

  it("allows the address again once its oldest attempt leaves the window", () => {
    const time = clock();
    const limit = new SubmissionRateLimit(1, SUBMISSION_WINDOW_MS, time.now);

    limit.take("203.0.113.7");
    time.advance(SUBMISSION_WINDOW_MS - 1);
    expect(limit.take("203.0.113.7").allowed).toBe(false);

    time.advance(1);
    expect(limit.take("203.0.113.7").allowed).toBe(true);
  });
});

describe("clientAddress", () => {
  it("takes the last address, the one the proxy itself appended", () => {
    expect(clientAddress(new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }))).toBe(
      "10.0.0.1",
    );
  });

  it("falls back to x-real-ip, then to one shared bucket", () => {
    expect(clientAddress(new Headers({ "x-real-ip": "198.51.100.2" }))).toBe("198.51.100.2");
    expect(clientAddress(new Headers())).toBe("unknown");
  });
});
