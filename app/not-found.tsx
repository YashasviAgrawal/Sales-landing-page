import Link from "next/link";
import { brand } from "@/lib/content";
import { WordReveal } from "@/components/ui/word-reveal";
import { Reveal } from "@/components/ui/reveal";
import { MagneticCta } from "@/components/ui/magnetic-cta";

/*
  A real 404, so a mistyped or stale URL lands somewhere branded with a way
  back, rather than on the framework’s bare default.
*/
export default function NotFound() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center px-5 py-24">
      <div className="mx-auto w-full max-w-[54ch] text-center">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal">
            404
          </p>
        </Reveal>

        <WordReveal
          as="h1"
          trigger="mount"
          delay={0.1}
          text="This one really is broken."
          highlight="really is broken."
          className="display-tight mx-auto mt-6 max-w-[18ch] text-4xl font-medium sm:text-6xl"
        />

        <Reveal delay={0.45}>
          <p className="mt-7 text-[17px] leading-relaxed text-body">
            The address you asked for does not exist. Everything {brand.name}{" "}
            does lives on one page, so the way back is short.
          </p>
        </Reveal>

        <Reveal delay={0.55}>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <MagneticCta href="/">Back to the start</MagneticCta>
            <MagneticCta href={brand.bookingUrl} variant="ghost">
              Book the free audit
            </MagneticCta>
          </div>
        </Reveal>

        <Reveal delay={0.65}>
          <p className="mt-10 text-[14px] text-muted">
            Or read the{" "}
            <Link href="/terms" className="link-underline text-body">
              terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="link-underline text-body">
              privacy policy
            </Link>
            .
          </p>
        </Reveal>
      </div>
    </main>
  );
}
