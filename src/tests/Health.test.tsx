import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import { BrowserRouter } from "react-router-dom";
import { Health } from "../pages/Health";

describe("Health page", () => {
  it("renders health check data", () => {
    render(
      <BrowserRouter>
        <Health />
      </BrowserRouter>
    );

    expect(screen.getByText("Health Check")).toBeInTheDocument();
    expect(screen.getByText(/status/i)).toBeInTheDocument();
    expect(screen.getByText(/version/i)).toBeInTheDocument();
  });

  it("displays JSON formatted output", () => {
    render(
      <BrowserRouter>
        <Health />
      </BrowserRouter>
    );

    const codeBlock = screen.getByRole("code");
    expect(codeBlock).toBeInTheDocument();
  });
});
