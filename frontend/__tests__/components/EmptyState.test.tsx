/**
 * EmptyState component render tests.
 */

import { render, screen } from "@testing-library/react";
import { Search } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

describe("EmptyState", () => {
  it("renders title correctly", () => {
    render(<EmptyState title="Không tìm thấy cầu thủ" />);
    expect(screen.getByText("Không tìm thấy cầu thủ")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <EmptyState
        title="No players"
        description="Try adjusting your filters"
      />
    );
    expect(screen.getByText("Try adjusting your filters")).toBeInTheDocument();
  });

  it("does not render description when not provided", () => {
    const { container } = render(<EmptyState title="No data" />);
    // Only h2 should be present, no description p
    const paragraphs = container.querySelectorAll("p");
    expect(paragraphs).toHaveLength(0);
  });

  it("renders icon when provided", () => {
    render(<EmptyState icon={Search} title="No results" />);
    // Icon container exists
    const container = screen.getByRole("status");
    expect(container).toBeInTheDocument();
  });

  it("renders action when provided", () => {
    render(
      <EmptyState
        title="No data"
        action={<button>Refresh</button>}
      />
    );
    expect(screen.getByText("Refresh")).toBeInTheDocument();
  });

  it("has correct role for accessibility", () => {
    render(<EmptyState title="Empty" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("has correct aria-label", () => {
    render(<EmptyState title="No players found" />);
    expect(screen.getByLabelText("No players found")).toBeInTheDocument();
  });
});
