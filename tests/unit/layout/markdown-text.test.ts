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
});
