import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { brand } from "@/lib/content";
import { AdminNav } from "@/components/admin/admin-nav";
import { PostEditor } from "../post-editor";
import { createPost } from "../actions";

export const metadata: Metadata = { title: "New post" };
export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-ink-950">
      <AdminNav email={admin.email} current="posts" />
      <main className="mx-auto max-w-[1240px] px-4 pt-6 sm:px-6">
        {/*
          The author defaults to the founder from the copy deck rather than to
          the signed-in admin's email address. The byline is a public, human
          name that appears on the page and in the article's structured data;
          an email address there would be both wrong and a small privacy leak.
        */}
        <PostEditor action={createPost} defaultAuthor={brand.founder} />
      </main>
    </div>
  );
}
