import { describe, it, expect } from "vitest";
import { render, screen } from "../../../test/test-utils";
import { Loader } from "../Loader";

describe("Loader", () => {
  it("должен отображать загрузчик с текстом по умолчанию", () => {
    render(<Loader />);
    expect(screen.getByText("Загрузка")).toBeInTheDocument();
  });

  it("должен отображать кастомный текст", () => {
    render(<Loader text="Загрузка данных..." />);
    expect(screen.getByText("Загрузка данных...")).toBeInTheDocument();
  });

  it("должен применять размер 'sm'", () => {
    const { container } = render(<Loader size="sm" />);
    const svg = container.querySelector("svg");
    expect(svg?.parentElement).toHaveClass("w-6", "h-6");
  });

  it("должен применять размер 'md' по умолчанию", () => {
    const { container } = render(<Loader />);
    const svg = container.querySelector("svg");
    expect(svg?.parentElement).toHaveClass("w-10", "h-10");
  });

  it("должен применять размер 'lg'", () => {
    const { container } = render(<Loader size="lg" />);
    const svg = container.querySelector("svg");
    expect(svg?.parentElement).toHaveClass("w-14", "h-14");
  });

  it("должен отображать анимированные точки", () => {
    const { container } = render(<Loader />);
    const dots = container.querySelectorAll(".dot");
    expect(dots).toHaveLength(3);
  });

  it("должен отображать overlay при overlay=true", () => {
    const { container } = render(<Loader overlay />);
    const overlay = container.querySelector(".fixed.inset-0");
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass("z-50");
  });

  it("не должен отображать overlay при overlay=false", () => {
    const { container } = render(<Loader overlay={false} />);
    const overlay = container.querySelector(".fixed.inset-0");
    expect(overlay).not.toBeInTheDocument();
  });

  it("должен содержать SVG элемент", () => {
    const { container } = render(<Loader />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("viewBox", "0 0 50 50");
  });

  it("должен содержать круги в SVG", () => {
    const { container } = render(<Loader />);
    const circles = container.querySelectorAll("svg circle");
    expect(circles.length).toBeGreaterThan(0);
  });
});

