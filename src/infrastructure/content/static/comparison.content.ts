import type { AlternativeColumn } from "../../../domain/comparison/entities/AlternativeColumn";
import { ComparisonCriterion } from "../../../domain/comparison/entities/ComparisonCriterion";

export const comparisonColumns: ReadonlyArray<AlternativeColumn> = [
  { name: "Famysys Studio", isHighlighted: true },
  { name: "In-house team", isHighlighted: false },
  { name: "Traditional agency", isHighlighted: false },
  { name: "Freelancers", isHighlighted: false },
  { name: "AI tools alone", isHighlighted: false },
];

export const comparisonCriteria: ReadonlyArray<ComparisonCriterion> = [
  ComparisonCriterion.create("Speed", [
    "Parallel pipelines mean a 60-second brand film ships in under two weeks without a rush surcharge.",
    "Fast once briefed, but one editor's calendar is the ceiling on how many projects run at once.",
    "Capable of fast turnarounds, though usually priced and staffed for campaign cycles, not weekly requests.",
    "Individually quick, but coordinating several freelancers on one deliverable adds its own scheduling overhead.",
    "Fastest raw output of any option, with no production timeline to manage at all.",
  ]),
  ComparisonCriterion.create("Consistency", [
    "The same creative and technical standards apply whether it's the first video of the year or the fortieth.",
    "Consistent by default, since one team and one set of tools touch every project.",
    "Consistent within a single retainer, though quality can shift when account staff turn over.",
    "Varies by who's available for a given brief, since the roster isn't fixed.",
    "Highly consistent output, but consistently generic without a human editorial pass.",
  ]),
  ComparisonCriterion.create("Craft", [
    "Senior editors and colorists work every project, not just the ones large enough to justify it.",
    "Craft ceiling is set by whoever was hired, and specialist skills like colour grading are rarely in-house.",
    "Strong craft on flagship work; smaller ongoing requests often get junior staff.",
    "Craft can be excellent for a single specialism, but rarely covers shooting, editing, and sound in one person.",
    "Technically polished, but pattern-matched from training data rather than directed toward a specific brand.",
  ]),
  ComparisonCriterion.create("Scale", [
    "Built to run twenty projects in a month as comfortably as two.",
    "Scaling means hiring, and hiring takes months longer than the backlog can wait.",
    "Can scale up for a campaign, then scales back down between engagements.",
    "Can be hard to scale across concurrent projects without duplicating briefing effort for each person.",
    "Scales instantly and without limit, independent of how much editorial judgment each output actually needs.",
  ]),
  ComparisonCriterion.create("Cost efficiency", [
    "One retainer covers strategy, production, and delivery, with no separate markup at each stage.",
    "No day-rate markup, but full-time salaries and equipment run whether or not there's a project in flight.",
    "Overhead from account management and multiple approval layers is priced into every deliverable.",
    "Lowest day rate of any option, until the cost of coordinating several of them is counted.",
    "Lowest cost per output by a wide margin, with no editorial or strategic layer included in that price.",
  ]),
  ComparisonCriterion.create("Strategic input", [
    "Creative direction is part of the engagement, not an add-on billed separately.",
    "Deep product knowledge, but limited exposure to what's working outside the company.",
    "Strong strategic input, usually bundled with the largest and most expensive retainer tier.",
    "Strategic input depends on the individual — some are strong strategists, most are hired for execution.",
    "None — a tool can execute a brief but can't originate or challenge one.",
  ]),
];
