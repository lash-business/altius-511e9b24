import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import App from "../App";

describe("App", () => {
  it("renders the home page", () => {
    render(<App />);
    expect(screen.getByText("Altius")).toBeInTheDocument();
    expect(screen.getByText(/Sports science PWA/i)).toBeInTheDocument();
  });

  it("renders skip link for accessibility", () => {
    render(<App />);
    const skipLink = screen.getByText("Skip to main content");
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveClass("skip-link");
  });
});
