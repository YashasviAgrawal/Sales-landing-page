import "server-only";

import { Marked } from "marked";
import { slugify } from "@/lib/posts";

/*
  Markdown -> HTML, plus the table of contents, done once on the server.

  Three things here are deliberate and worth not undoing:

  1. A NEW `Marked` instance rather than the shared `marked` singleton.
     The singleton is global mutable state in a long-lived server process:
     configuring it in one module changes rendering everywhere, and two
     requests overlapping while it is being reconfigured produce mixed output.
     An instance per call site has none of that.

  2. Rendering on the server, not in the browser. A markdown parser is ~40KB
     the visitor should never download, and - much more importantly - HTML
     that only exists after JavaScript runs is HTML that ranks worse. The
     whole point of these pages is to be indexed, so the article has to be in
     the response body.

  3. A hand-written renderer for links, headings and images rather than the
     defaults, because each of the three has an SEO or accessibility job the
     default does not do. They are explained at each override.

  ON SANITISATION: the only people who can write this markdown are admins on
  the ADMIN_EMAILS allowlist, so this is not the untrusted input that would
  demand DOMPurify. But `marked` passes raw HTML through by default, and the
  gap between "our admin" and "whoever gets hold of an admin session" is the
  kind of assumption that ages badly - so inline HTML is disabled below and
  markdown is the only syntax that does anything.
*/

export type TocEntry = { id: string; text: string; level: 2 | 3 };

export type RenderedPost = {
  html: string;
  toc: TocEntry[];
};

export function renderMarkdown(markdown: string): RenderedPost {
  const toc: TocEntry[] = [];
  /* Two headings called "The fix" must not both be #the-fix - an anchor that
     appears twice sends every link to the first one. */
  const used = new Map<string, number>();

  const marked = new Marked({
    gfm: true,
    breaks: false,
  });

  marked.use({
    renderer: {
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        const plain = stripTags(text);

        const base = slugify(plain) || "section";
        const seen = used.get(base) ?? 0;
        used.set(base, seen + 1);
        const id = seen === 0 ? base : `${base}-${seen + 1}`;

        /*
          The page renders the post title as the only <h1>, so body headings
          shift down one level: markdown "##" becomes <h2>, "###" becomes
          <h3>. A document with two H1s is not penalised outright, but the
          heading tree is how a crawler reads the shape of an argument, and
          two competing top-level headings blur it.
        */
        const level = Math.min(depth + 1, 6);

        if (level === 2 || level === 3) {
          toc.push({ id, text: plain, level: level as 2 | 3 });
        }

        /*
          The anchor link is aria-hidden and tabindex -1: it is a convenience
          for someone copying a deep link with a mouse, and putting it in the
          tab order would mean a keyboard user tabbing through two stops per
          heading for the whole article.
        */
        return `<h${level} id="${id}" class="scroll-mt-28 group">${text}<a href="#${id}" class="anchor-link" aria-hidden="true" tabindex="-1">#</a></h${level}>\n`;
      },

      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const safe = safeHref(href);
        if (!safe) return text;

        const external = /^https?:\/\//i.test(safe);
        const attrs = [
          `href="${escapeAttr(safe)}"`,
          title ? `title="${escapeAttr(title)}"` : "",
          /*
            External links open in a new tab and carry rel="noopener". Not
            "nofollow" by default: reflexively nofollowing every outbound link
            is cargo-culted advice - linking out to good sources is a quality
            signal, and the pages worth citing are the ones worth passing a
            little authority to.
          */
          external ? 'target="_blank" rel="noopener noreferrer"' : "",
        ]
          .filter(Boolean)
          .join(" ");

        return `<a ${attrs}>${text}</a>`;
      },

      image({ href, title, text }) {
        const safe = safeHref(href);
        if (!safe) return "";

        /*
          loading="lazy" and decoding="async" on body images, and explicit
          dimensions are not available here - which is why the CSS gives every
          article image an aspect-ratio box. Without one, the page reflows as
          each image arrives, and layout shift is a ranking signal you lose
          for free.

          An empty alt is left empty rather than filled with the filename: for
          a decorative image, alt="" is the correct answer and tells a screen
          reader to skip it, where alt="chart-final-v2.png" is noise.
        */
        return `<img src="${escapeAttr(safe)}" alt="${escapeAttr(text ?? "")}"${
          title ? ` title="${escapeAttr(title)}"` : ""
        } loading="lazy" decoding="async" />`;
      },

      /* Inline and block HTML both become nothing. See the note above. */
      html() {
        return "";
      },
    },
  });

  const html = marked.parse(markdown, { async: false }) as string;

  return { html, toc };
}

/*
  Reject anything that is not http(s), a root-relative path, a fragment, or
  mailto/tel. This is what stops `javascript:` and `data:text/html` URLs, both
  of which execute script from what looks like an ordinary link.
*/
function safeHref(href: string | null | undefined): string | null {
  if (!href) return null;
  const trimmed = href.trim();
  if (/^(https?:\/\/|\/|#|mailto:|tel:)/i.test(trimmed)) return trimmed;
  return null;
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

/*
  Plain text of an article, for the JSON-LD `wordCount` and for the generated
  social card. Deliberately crude - it only ever feeds a count or a truncated
  preview, so getting a stray bracket wrong costs nothing.
*/
export function markdownToText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_`~>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
