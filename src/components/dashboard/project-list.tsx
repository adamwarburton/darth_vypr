"use client";

import { ProjectCard } from "./project-card";

const DEMO_PROJECTS = [
  {
    id: "proj-1",
    title: "Snack Bar Flavour Preferences UK 2025",
    description:
      "Testing consumer reaction to 6 new flavour concepts for the UK snacking market. Focus on Gen Z and millennial segments.",
    status: "live" as const,
    responseCount: 1247,
    questionCount: 12,
    completionRate: 78,
    createdAt: "2025-11-15T10:00:00Z",
  },
  {
    id: "proj-2",
    title: "Plant-Based Packaging Perception Study",
    description:
      "Evaluating consumer attitudes to sustainable packaging materials across three product categories.",
    status: "live" as const,
    responseCount: 843,
    questionCount: 8,
    completionRate: 92,
    createdAt: "2025-12-01T14:30:00Z",
  },
  {
    id: "proj-3",
    title: "Premium Ready Meals Concept Test",
    description:
      "Concept validation for a new premium ready meals range targeting time-poor professionals.",
    status: "closed" as const,
    responseCount: 2156,
    questionCount: 15,
    completionRate: 100,
    createdAt: "2025-09-20T09:00:00Z",
  },
  {
    id: "proj-4",
    title: "Energy Drink Brand Repositioning",
    description:
      "Understanding how consumers perceive brand messaging changes around health and wellness positioning.",
    status: "draft" as const,
    responseCount: 0,
    questionCount: 10,
    completionRate: 0,
    createdAt: "2026-01-28T16:00:00Z",
  },
  {
    id: "proj-5",
    title: "Cereal Aisle Shelf Impact Analysis",
    description:
      "Image stimulus study measuring visual attention and purchase intent for new packaging designs.",
    status: "live" as const,
    responseCount: 567,
    questionCount: 9,
    completionRate: 64,
    createdAt: "2026-01-10T11:00:00Z",
  },
  {
    id: "proj-6",
    title: "Dairy Alternative Taste Preference",
    description: null,
    status: "draft" as const,
    responseCount: 0,
    questionCount: 6,
    completionRate: 0,
    createdAt: "2026-02-20T08:45:00Z",
  },
];

export function ProjectList() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {DEMO_PROJECTS.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
