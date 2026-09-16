import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";
import { getPublishedPost } from "@/lib/posts-query";
import { brand } from "@/lib/content";
import { truncateAtWord } from "@/lib/posts";

/*
  The share card for a single article, drawn per post.

  Why it earns its place: a link shared without an image gets a small grey
  placeholder in Slack, LinkedIn and X, and a post nobody clicks is a post
  nobody links to. Making one by hand for every article is work that stops
  happening after the third one, so it is generated from the post's own fields
  instead - which means every article has a decent card forever, including the
  ones written in a hurry.

  Only used when the post has no cover_url of its own; the page's metadata
  prefers a real image when one is set.

  Built to match app/opengraph-image.tsx deliberately - same mark, same fonts,
  same wash, same mint rule. Two cards from one site that look like two sites
  is worse than one plain card, because the inconsistency is what gets noticed.

  Node runtime, not edge: this reads the post from Supabase with the service
  role client and the fonts off disk, both of which are Node paths.
*/
export const runtime = "nodejs";
export const alt = "Article cover";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const asset = (...p: string[]) => path.join(process.cwd(), ...p);

const font = (file: string) =>
  fs.readFileSync(
    asset("node_modules", "geist", "dist", "fonts", "geist-sans", file),
  );

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);

  const title = post?.title ?? brand.name;
  /*
    The subheading. The excerpt is what the writer already wrote to summarise
    the piece, so it is the right sentence - trimmed at a word boundary so the
    card never ends mid-word, which is the tell of a generated image.
  */
  const subheading = post?.excerpt
    ? truncateAtWord(post.excerpt, 120)
    : brand.tagline;

  const mark = fs.readFileSync(asset("public", "brand", "mark.png"));
  const markSrc = `data:image/png;base64,${mark.toString("base64")}`;

  /*
    Type size steps down as the headline grows so a long title fills the card
    rather than overflowing it. Three buckets is enough - the difference
    between 62 and 64 characters does not need its own size.
  */
  const titleSize = title.length > 90 ? 50 : title.length > 55 ? 60 : 72;

  /* Palette copied from the @theme block. Satori has no cascade and no custom
     properties, so these cannot be read from globals.css. */
  const ink = "#000000";
  const paper = "#eaf2ed";
  const body = "#9daea5";
  const muted = "#64756b";
  const signal = "#3ddc97";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: ink,
          backgroundImage:
            "radial-gradient(900px 520px at 78% 12%, rgba(15,122,79,0.30), rgba(0,0,0,0) 70%)",
          padding: "64px 80px",
          fontFamily: "Geist",
        }}
      >
        {/* Lockup, same order and spacing as the header and the site card. */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={markSrc} width={58} height={50} alt="" />
          <span
            style={{
              fontSize: 28,
              fontWeight: 500,
              color: paper,
              letterSpacing: "-0.02em",
            }}
          >
            {brand.name}
          </span>
          <span style={{ fontSize: 26, color: muted }}>/</span>
          <span style={{ fontSize: 26, color: muted }}>Blog</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: titleSize,
              fontWeight: 500,
              lineHeight: 1.08,
              letterSpacing: "-0.035em",
              color: paper,
              maxWidth: 1000,
            }}
          >
            {title.length > 120 ? `${title.slice(0, 118)}…` : title}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 26,
              fontSize: 26,
              lineHeight: 1.4,
              color: body,
              maxWidth: 880,
            }}
          >
            {subheading}
          </div>
        </div>

        {/* One mint element, same job as on the site card: it carries the
            thing worth knowing before you click. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 23,
              fontWeight: 500,
              color: signal,
            }}
          >
            <div
              style={{
                width: 34,
                height: 2,
                backgroundColor: signal,
                display: "flex",
              }}
            />
            {post?.reading_minutes
              ? `${post.reading_minutes} min read`
              : "Field notes"}
          </div>
          <div style={{ display: "flex", fontSize: 22, color: muted }}>
            {brand.domain}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Geist",
          data: font("Geist-Regular.ttf"),
          weight: 400,
          style: "normal",
        },
        {
          name: "Geist",
          data: font("Geist-Medium.ttf"),
          weight: 500,
          style: "normal",
        },
      ],
    },
  );
}
