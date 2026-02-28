import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AIGeneratingOverlay } from "./AIGeneratingOverlay";

describe("AIGeneratingOverlay", () => {
  describe("generating stage", () => {
    it("renders the generating headline", () => {
      render(<AIGeneratingOverlay stage="generating" />);
      expect(
        screen.getByText("Generating AI Panel Responses")
      ).toBeInTheDocument();
    });

    it("renders generating description text", () => {
      render(<AIGeneratingOverlay stage="generating" />);
      expect(
        screen.getByText(/simulating 500 nationally representative UK respondents/i)
      ).toBeInTheDocument();
    });

    it("shows the 15-30 seconds time estimate", () => {
      render(<AIGeneratingOverlay stage="generating" />);
      expect(
        screen.getByText(/15-30 seconds/i)
      ).toBeInTheDocument();
    });

    it("renders progress bar at 60% width", () => {
      const { container } = render(<AIGeneratingOverlay stage="generating" />);
      const progressBar = container.querySelector(
        "[style*='width']"
      ) as HTMLElement;
      expect(progressBar).toBeTruthy();
      expect(progressBar.style.width).toBe("60%");
    });
  });

  describe("analyzing stage", () => {
    it("renders the analyzing headline", () => {
      render(<AIGeneratingOverlay stage="analyzing" />);
      expect(screen.getByText("Running AI Analysis")).toBeInTheDocument();
    });

    it("renders analyzing description text", () => {
      render(<AIGeneratingOverlay stage="analyzing" />);
      expect(
        screen.getByText(/Analysing response patterns/i)
      ).toBeInTheDocument();
    });

    it("shows the 'Almost there' message", () => {
      render(<AIGeneratingOverlay stage="analyzing" />);
      expect(screen.getByText(/Almost there/i)).toBeInTheDocument();
    });

    it("renders progress bar at 90% width", () => {
      const { container } = render(<AIGeneratingOverlay stage="analyzing" />);
      const progressBar = container.querySelector(
        "[style*='width']"
      ) as HTMLElement;
      expect(progressBar).toBeTruthy();
      expect(progressBar.style.width).toBe("90%");
    });
  });

  describe("feature highlights", () => {
    it("shows 500 respondents badge", () => {
      render(<AIGeneratingOverlay stage="generating" />);
      expect(screen.getByText("500 respondents")).toBeInTheDocument();
    });

    it("shows UK nationally representative badge", () => {
      render(<AIGeneratingOverlay stage="generating" />);
      expect(
        screen.getByText("UK nationally representative")
      ).toBeInTheDocument();
    });

    it("shows AI-powered insights badge", () => {
      render(<AIGeneratingOverlay stage="generating" />);
      expect(screen.getByText("AI-powered insights")).toBeInTheDocument();
    });
  });
});
