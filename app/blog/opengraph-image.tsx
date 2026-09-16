import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";
import { brand } from "@/lib/content";

/*
  The share card for /blog itself.

  The index is a page people link to - "their blog is worth reading" - and
  without this it would fall back to the site-wide card, which argues for the
  audit rather than for the writing. Static, because unlike a post there is
  nothing here that varies.
*/
export const alt = `${brand.name} — field notes on where revenue leaks`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const asset = (...p: string[]) => path.join(process.cwd(), ...p);

const font = (file: string) =>
  fs.readFileSync(
    asset("node_modules", "geist", "dist", "fonts", "geist-sans", file),
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
          backgroundColor: "#000000",
          backgroundImage:
            "radial-gradient(900px 520px at 78% 12%, rgba(15,122,79,0.30), rgba(0,0,0,0) 70%)",
          padding: "72px 80px",
          fontFamily: "Geist",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={markSrc} width={64} height={55} alt="" />
          <span
            style={{
              fontSize: 30,
              fontWeight: 500,
              color: "#eaf2ed",
              letterSpacing: "-0.02em",
            }}
          >
            {brand.name}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 74,
              fontWeight: 500,
              lineHeight: 1.06,
              letterSpacing: "-0.035em",
              color: "#eaf2ed",
              maxWidth: 940,
            }}
          >
            Where the money is leaving.
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 30,
              fontSize: 28,
              color: "#9daea5",
              maxWidth: 880,
              lineHeight: 1.4,
            }}
          >
            Field notes on the seven links revenue runs through, and how to work
            out which one is broken.
          </div>
        </div>

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
              fontSize: 24,
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
            {brand.tagline}
          </div>
          <div style={{ display: "flex", fontSize: 23, color: "#64756b" }}>
            {brand.domain}/blog
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
