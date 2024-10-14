import { describe, expect, test } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Home from "./page"; 

describe("Home Page Component", () => {
  test("renders the configuration button", () => {
    render(<Home />); 

    const configButtons = screen.getAllByRole("button");
    const configButton = configButtons.find(
      (button) => button.textContent === "#1"
    );
    expect(configButton).to.exist;
    fireEvent.click(configButton);
  });
});
