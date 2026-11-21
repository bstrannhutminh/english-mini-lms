import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MarkdownText } from "@/components/ui/markdown-text";

describe("reading passage Markdown rendering", () => {
  it("retains source paragraphs immediately following a heading", () => {
    const html = renderToStaticMarkup(createElement(MarkdownText, { text: "# Source heading\nThis source sentence must remain visible.\nAnother source sentence." }));
    expect(html).toContain("Source heading");
    expect(html).toContain("This source sentence must remain visible.");
    expect(html).toContain("Another source sentence.");
  });
  it("keeps a list after a heading and escapes HTML", () => {
    const html = renderToStaticMarkup(createElement(MarkdownText, { text: "## Steps\n- First\n- <script>unsafe</script>" }));
    expect(html).toContain("<li>First</li>");
    expect(html).toContain("&lt;script&gt;unsafe&lt;/script&gt;");
    expect(html).not.toContain("<script>");
  });
  it("renders a standalone image block with a safe internal src", () => {
    const html = renderToStaticMarkup(createElement(MarkdownText, { text: "Some text.\n\n![Chart](/ielts/i-w2-chart.png)\n\nMore text." }));
    expect(html).toContain("<img");
    expect(html).toContain('src="/ielts/i-w2-chart.png"');
    expect(html).toContain('alt="Chart"');
  });
  it("keeps an image with an unsafe src as raw text", () => {
    const html = renderToStaticMarkup(createElement(MarkdownText, { text: "![X](javascript:alert(1))" }));
    expect(html).not.toContain("<img");
    expect(html).toContain("![X](javascript:alert(1))");
  });
});
