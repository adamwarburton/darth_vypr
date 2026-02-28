import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QuestionResultCard } from "./QuestionResultCard";

describe("QuestionResultCard", () => {
  const defaultProps = {
    questionNumber: 1,
    questionType: "single_choice" as const,
    questionTitle: "What is your favourite colour?",
    responseCount: 150,
    children: <div data-testid="child-content">Chart goes here</div>,
  };

  it("renders the question number and type label", () => {
    render(<QuestionResultCard {...defaultProps} />);
    expect(screen.getByText(/Q1/)).toBeInTheDocument();
    expect(screen.getByText(/Single Choice/)).toBeInTheDocument();
  });

  it("renders the question title", () => {
    render(<QuestionResultCard {...defaultProps} />);
    expect(
      screen.getByText("What is your favourite colour?")
    ).toBeInTheDocument();
  });

  it("renders the response count badge", () => {
    render(<QuestionResultCard {...defaultProps} />);
    expect(screen.getByText("150 responses")).toBeInTheDocument();
  });

  it("renders children content", () => {
    render(<QuestionResultCard {...defaultProps} />);
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });

  describe("AI Panel badge", () => {
    it("does not render AI Generated badge when isAiPanel is false", () => {
      render(<QuestionResultCard {...defaultProps} isAiPanel={false} />);
      expect(screen.queryByText("AI Generated")).not.toBeInTheDocument();
    });

    it("does not render AI Generated badge when isAiPanel is undefined", () => {
      render(<QuestionResultCard {...defaultProps} />);
      expect(screen.queryByText("AI Generated")).not.toBeInTheDocument();
    });

    it("renders AI Generated badge when isAiPanel is true", () => {
      render(<QuestionResultCard {...defaultProps} isAiPanel={true} />);
      expect(screen.getByText("AI Generated")).toBeInTheDocument();
    });
  });

  describe("question type icons", () => {
    const types = [
      "monadic_split",
      "single_choice",
      "multiple_choice",
      "scaled_response",
      "open_text",
      "ranking",
      "maxdiff",
      "anchored_pricing",
      "implicit_association",
      "image_heatmap",
    ] as const;

    types.forEach((type) => {
      it(`renders without error for type ${type}`, () => {
        const { container } = render(
          <QuestionResultCard
            {...defaultProps}
            questionType={type}
          />
        );
        expect(container.firstChild).toBeTruthy();
      });
    });
  });

  it("renders with zero responses", () => {
    render(<QuestionResultCard {...defaultProps} responseCount={0} />);
    expect(screen.getByText("0 responses")).toBeInTheDocument();
  });
});
