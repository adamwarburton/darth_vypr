import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PanelDistributionDialog } from "./panel-distribution-dialog";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("PanelDistributionDialog", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    projectId: "proj-123",
    projectTitle: "Snack Preferences Survey",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  describe("initial render", () => {
    it("renders the dialog title", () => {
      render(<PanelDistributionDialog {...defaultProps} />);
      expect(
        screen.getByText("Distribute Your Survey")
      ).toBeInTheDocument();
    });

    it("renders the project title in the description", () => {
      render(<PanelDistributionDialog {...defaultProps} />);
      expect(
        screen.getByText("Snack Preferences Survey")
      ).toBeInTheDocument();
    });

    it("renders all three distribution options", () => {
      render(<PanelDistributionDialog {...defaultProps} />);
      expect(screen.getByText("Share URL")).toBeInTheDocument();
      expect(screen.getByText("Send to VYPR Panel")).toBeInTheDocument();
      expect(screen.getByText("Send to AI Panel")).toBeInTheDocument();
    });

    it("shows AI panel benefits", () => {
      render(<PanelDistributionDialog {...defaultProps} />);
      expect(screen.getByText("Lower costs")).toBeInTheDocument();
      expect(screen.getByText("Almost instant responses")).toBeInTheDocument();
      expect(screen.getByText("99% accuracy")).toBeInTheDocument();
    });

    it("shows disabled publish button with 'Select a method' text", () => {
      render(<PanelDistributionDialog {...defaultProps} />);
      const selectBtn = screen.getByText("Select a method");
      expect(selectBtn).toBeInTheDocument();
    });

    it("renders Cancel button", () => {
      render(<PanelDistributionDialog {...defaultProps} />);
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });
  });

  describe("option selection", () => {
    it("shows 'Publish & Copy URL' when Share URL is selected", async () => {
      const user = userEvent.setup();
      render(<PanelDistributionDialog {...defaultProps} />);

      await user.click(screen.getByText("Share URL"));
      expect(screen.getByText("Publish & Copy URL")).toBeInTheDocument();
    });

    it("shows 'Send to VYPR Panel' button when VYPR Panel is selected", async () => {
      const user = userEvent.setup();
      render(<PanelDistributionDialog {...defaultProps} />);

      await user.click(screen.getByText("Send to VYPR Panel"));
      // Button text matches the option name
      expect(
        screen.getAllByText("Send to VYPR Panel").length
      ).toBeGreaterThanOrEqual(1);
    });

    it("shows 'Send to AI Panel' button when AI Panel is selected", async () => {
      const user = userEvent.setup();
      render(<PanelDistributionDialog {...defaultProps} />);

      await user.click(screen.getByText("Send to AI Panel"));
      expect(
        screen.getAllByText("Send to AI Panel").length
      ).toBeGreaterThanOrEqual(1);
    });
  });

  describe("publishing flow - AI panel", () => {
    // Helper to find the publish button (the short one, not the option card)
    function findPublishButton(): HTMLElement {
      const allButtons = screen.getAllByRole("button");
      const btn = allButtons.find(
        (b) =>
          b.textContent?.includes("Send to AI Panel") &&
          !b.textContent?.includes("Lower costs")
      );
      if (!btn) throw new Error("Publish button not found");
      return btn;
    }

    it("calls publish API with ai_panel distribution method", async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ project: {}, surveyUrl: "" }),
      });

      render(<PanelDistributionDialog {...defaultProps} />);

      // Select AI Panel option card
      await user.click(screen.getByText("Send to AI Panel"));

      // Click the publish button
      await user.click(findPublishButton());

      expect(mockFetch).toHaveBeenCalledWith("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: "proj-123",
          distributionMethod: "ai_panel",
        }),
      });
    });

    it("navigates to results page after publishing with AI panel", async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ project: {}, surveyUrl: "" }),
      });

      render(<PanelDistributionDialog {...defaultProps} />);

      await user.click(screen.getByText("Send to AI Panel"));
      await user.click(findPublishButton());

      // Should navigate to results
      await vi.waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/projects/proj-123");
      });
    });

    it("closes the dialog after AI panel publish", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ project: {}, surveyUrl: "" }),
      });

      render(
        <PanelDistributionDialog {...defaultProps} onOpenChange={onOpenChange} />
      );

      await user.click(screen.getByText("Send to AI Panel"));
      await user.click(findPublishButton());

      await vi.waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe("publishing flow - URL", () => {
    it("calls publish API with url distribution method", async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          project: {},
          surveyUrl: "https://example.com/survey/proj-123",
        }),
      });

      render(<PanelDistributionDialog {...defaultProps} />);

      await user.click(screen.getByText("Share URL"));

      // Click publish button
      await user.click(screen.getByText("Publish & Copy URL"));

      expect(mockFetch).toHaveBeenCalledWith("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: "proj-123",
          distributionMethod: "url",
        }),
      });
    });

    it("shows success view with survey URL after URL publish", async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          project: {},
          surveyUrl: "https://example.com/survey/proj-123",
        }),
      });

      render(<PanelDistributionDialog {...defaultProps} />);

      await user.click(screen.getByText("Share URL"));
      await user.click(screen.getByText("Publish & Copy URL"));

      await vi.waitFor(() => {
        expect(screen.getByText("Survey Published")).toBeInTheDocument();
      });
    });
  });

  describe("error handling", () => {
    it("handles API failure gracefully", async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Something went wrong" }),
      });

      render(<PanelDistributionDialog {...defaultProps} />);

      await user.click(screen.getByText("Share URL"));
      await user.click(screen.getByText("Publish & Copy URL"));

      // Should not navigate or show success
      await vi.waitFor(() => {
        expect(mockPush).not.toHaveBeenCalled();
      });
    });

    it("handles network error gracefully", async () => {
      const user = userEvent.setup();
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      render(<PanelDistributionDialog {...defaultProps} />);

      await user.click(screen.getByText("Share URL"));
      await user.click(screen.getByText("Publish & Copy URL"));

      // Should not crash
      await vi.waitFor(() => {
        expect(mockPush).not.toHaveBeenCalled();
      });
    });
  });

  describe("cancel behavior", () => {
    it("calls onOpenChange(false) when Cancel is clicked", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(
        <PanelDistributionDialog {...defaultProps} onOpenChange={onOpenChange} />
      );

      await user.click(screen.getByText("Cancel"));
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
