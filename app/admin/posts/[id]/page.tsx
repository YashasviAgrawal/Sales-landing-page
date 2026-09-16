import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { adminGetPost } from "@/lib/posts-query";
import { brand } from "@/lib/content";
import { AdminNav } from "@/components/admin/admin-nav";
import { PostEditor } from "../post-editor";
import { updatePost } from "../actions";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await adminGetPost(id);
  return { title: post?.title ?? "Post" };
}

export default async function EditPostPage({ params }: Props) {
  const admin = await requireAdmin();
  const { id } = await params;

  const post = await adminGetPost(id);
  if (!post) notFound();

  /*
    updatePost takes the id as its first argument, so it is bound here rather
    than smuggled through a hidden form field. `.bind` on a Server Action
    encodes the argument into the action's own closure on the server - the
    browser never sees it and cannot change it, which a hidden input could
    not promise.
  */
  const action = updatePost.bind(null, post.id);

  return (
    <div className="min-h-screen bg-ink-950">
      <AdminNav email={admin.email} current="posts" />
      <main className="mx-auto max-w-[1240px] px-4 pt-6 sm:px-6">
        <PostEditor
          post={post}
          action={action}
          defaultAuthor={brand.founder}
        />
      </main>
    </div>
  );
}
