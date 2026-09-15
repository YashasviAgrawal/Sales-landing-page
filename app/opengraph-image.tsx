import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";
import { brand } from "@/lib/content";

/*
  The share card. The metadata in layout.tsx already asks for a
  summary_large_image, so without this file every link to the site unfurls as
  a blank rectangle with a domain under it - the one place the positioning
  gets seen before anybody has decided whether to click.

  Rendered at build time, not requested from a service, so it cannot drift
  from the page: the headline below is the same openGraph title the metadata
  sends, and the mark is the same file the header uses.

  Twitter reuses this automatically - `twitter.images` falls back to the
  openGraph image - so there is no second card to keep in sync.
*/

export const alt =
  "Sales Brain - Your revenue isn't broken everywhere. It's broken in one place.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const asset = (...p: string[]) => path.join(process.cwd(), ...p);

const font = (file: string) =>
  fs.readFileSync(
    asset("node_modules", "geist", "dist", "fonts", "geist-sans", file)
  );

export default async function Image() {
  const mark = fs.readFileSync(asset("public", "brand", "mark.png"));
  const markSrc = `data:image/png;base64,${mark.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          /* --color-ink-950, with the ambient green the site puts in the
             light rather than the surfaces. */
          backgroundColor: "#000000",
          backgroundImage:
            "radial-gradient(900px 520px at 78% 12%, rgba(15,122,79,0.30), rgba(0,0,0,0) 70%)",
          padding: "72px 80px",
          fontFamily: "Geist",
        }}
      >
        {/* Lockup, same order and spacing as the header. */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={markSrc} width={72} height={62} alt="" />
          <span
            style={{
              fontSize: 34,
              fontWeight: 500,
              color: "#eaf2ed",
              letterSpacing: "-0.02em",
            }}
          >
            {brand.name}
          </span>
        </div>

        {/* The big idea, verbatim. Typographic apostrophes, as everywhere
            else on the site. */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 500,
              lineHeight: 1.06,
              letterSpacing: "-0.035em",
              color: "#eaf2ed",
              maxWidth: 940,
            }}
          >
            Your revenue isn’t broken everywhere. It’s broken in one place.
          </div>
          <div
            style={{
              marginTop: 34,
              fontSize: 29,
              fontWeight: 400,
              color: "#9daea5",
            }}
          >
            Every agency sells you a cure. We find the disease first.
          </div>
        </div>

        {/* One mint element, carrying the offer. Mint marks the action on the
            page, and it does the same job here. */}
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
              fontSize: 25,
              fontWeight: 500,
              color: "#3ddc97",
            }}
          >
            <div
              style={{
                width: 34,
                height: 2,
                backgroundColor: "#3ddc97",
                display: "flex",
              }}
            />
            Free 45-minute Revenue Leak Audit. No pitch.
          </div>
          <div style={{ fontSize: 23, color: "#64756b" }}>{brand.domain}</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: font("Geist-Regular.ttf"), weight: 400, style: "normal" },
        { name: "Geist", data: font("Geist-Medium.ttf"), weight: 500, style: "normal" },
      ],
    }
  );
}
