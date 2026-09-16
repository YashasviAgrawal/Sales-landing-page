import type { TocEntry } from "@/lib/markdown";

/*
  The rendered article, with a table of contents beside it on wide screens.

  A Server Component, and it stays one. The HTML arrives already rendered from
  the server - see lib/markdown.ts - and nothing here needs an event handler,
  so shipping this as client JavaScript would send a few kilobytes to do
  nothing. The one interactive-feeling part, the contents jumping to a heading,
  is a plain anchor and `scroll-behavior: smooth`, which the browser does on
  its own.

  dangerouslySetInnerHTML is the only way to mount pre-rendered HTML in React,
  and the name is a fair warning. It is safe here because the markdown
  renderer strips raw HTML entirely and allows only http(s), root-relative,
  fragment, mailto and tel URLs - so nothing in this string can execute. If
  either of those guarantees is ever relaxed, this line becomes an XSS hole.
*/
export function PostBody({ html, toc }: { html: string; toc: TocEntry[] }) {
  /*
    Two entries is not a table of contents, it is a list of the two things
    that were going to be visible anyway. Below three, the column is noise.
  */
  const showToc = toc.length >= 3;

  return (
    <div
      className={
        showToc
          ? "mx-auto grid w-full max-w-[1100px] gutter-x lg:grid-cols-[minmax(0,720px)_minmax(0,1fr)] lg:gap-12"
          : "mx-auto w-full max-w-[720px] gutter-x"
      }
    >
      <div className="order-2 min-w-0 lg:order-1">
        <div className="prose-post pb-16 pt-8">
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>

      {showToc ? (
        /*
          Sticky, and only on large screens. On a phone it would push the
          first paragraph below the fold - the reader arrived to read, not to
          choose a section - so it is hidden entirely rather than collapsed
          into an accordion nothing would open.
        */
        <aside className="order-1 hidden lg:order-2 lg:block">
          <nav
            aria-label="On this page"
            className="sticky top-28 pt-8 text-[13px]"
          >
            <p className="mb-3 uppercase tracking-[0.1em] text-muted">
              On this page
            </p>
            <ul className="flex flex-col gap-2 border-l hairline pl-4">
              {toc.map((entry) => (
                <li
                  key={entry.id}
                  className={entry.level === 3 ? "pl-3" : undefined}
                >
                  <a
                    href={`#${entry.id}`}
                    className="block leading-snug text-body transition-colors duration-200 hover:text-signal"
                  >
                    {entry.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      ) : null}
    </div>
  );
}
