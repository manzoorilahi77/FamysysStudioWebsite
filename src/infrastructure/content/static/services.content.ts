import type { ServiceCategory } from "../../../domain/services/entities/ServiceCategory";

export const serviceCategories: ReadonlyArray<ServiceCategory> = [
  {
    title: "Video production",
    offerings: [
      {
        title: "Brand films",
        description: "Long-form pieces that carry a brand's positioning without narrating it.",
      },
      {
        title: "Product films",
        description: "Feature and launch films built from a spec sheet, not a mood board.",
      },
      {
        title: "Explainers",
        description: "Short-form pieces that answer the question a prospect actually has.",
      },
      {
        title: "Testimonial films",
        description: "Customer stories shot on location, not read from a script.",
      },
      {
        title: "Event coverage",
        description: "Multi-camera capture with a recap cut turned around the same week.",
      },
    ],
  },
  {
    title: "Motion & animation",
    offerings: [
      {
        title: "Motion graphics",
        description: "Data, UI, and brand animation built to match an existing design system.",
      },
      {
        title: "2D animation",
        description: "Character and illustrative animation for stories live action can't tell.",
      },
      {
        title: "3D & CGI",
        description: "Product renders and dimensional environments for things too large to film.",
      },
      {
        title: "Title sequences",
        description: "Opening and closing brand moments built to be reused across a series.",
      },
      {
        title: "Kinetic type",
        description: "Typography-led motion for copy too dense for a static frame.",
      },
    ],
  },
  {
    title: "Post & finishing",
    offerings: [
      {
        title: "Editing",
        description: "Assembly through final cut, versioned against the approved script.",
      },
      {
        title: "Colour grade",
        description: "Look development and delivery grading matched across a full series.",
      },
      {
        title: "Sound design",
        description: "Mix, score, and sound effects finished before the picture lock, not after.",
      },
      {
        title: "VFX & cleanup",
        description: "Compositing, rig removal, and paint work handled in-house, not outsourced.",
      },
      {
        title: "Localisation",
        description: "Subtitling, dubbing, and market versioning from a single master edit.",
      },
    ],
  },
  {
    title: "Creative & strategy",
    offerings: [
      {
        title: "Concept development",
        description: "Creative territories tested against the brief before a camera is booked.",
      },
      {
        title: "Scriptwriting",
        description: "Scripts written for how a scene will actually be shot and cut.",
      },
      {
        title: "Storyboarding",
        description: "Shot-by-shot plans reviewed and signed off before production spend.",
      },
      {
        title: "Creative direction",
        description: "One point of creative accountability across a multi-video series.",
      },
      {
        title: "Casting",
        description: "Talent sourcing and on-camera screen tests run ahead of the shoot date.",
      },
    ],
  },
];
