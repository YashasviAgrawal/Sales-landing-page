"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";
import { adminGetPost, slugTaken } from "@/lib/posts-query";
import { slugify, validatePost } from "@/lib/posts";

/*
  Create, update and delete for blog posts.

  Same rule as every other admin action file: requireAdmin() runs first in
  every exported function, without exception. A "use server" export is a
  public HTTP endpoint with a generated name, and the middleware matcher does
  not protect it.
*/

export type PostActionState = {
  error?: string;
  ok?: boolean;
  /** Which field the error belongs to, so the editor can point at it. */
  field?: string;
};

/*
  Invalidating the right paths after a write.

  Miss one and the site lies: a published post that does not appear on the
  index, or an edited headline that still shows the old words because the page
  was cached an hour ago. The list is every public surface a post appears on -
  its own page, the index, the sitemap and the feed - plus the admin list.
*/
async function revalidatePost(slug?: string | null) {
  revalidatePath("/admin/posts");
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  revalidatePath("/blog/feed.xml");
  if (slug) revalidatePath(`/blog/${slug}`);
}

/*
  Read the editor's form into the shape validatePost expects.

  Checkboxes are the fiddly part: an unchecked box sends no field at all, so
  `formData.get("noindex")` is null rather than false - which is falsy and
  therefore happens to work, but only by accident. Made explicit here.
*/
function readForm(formData: FormData) {
  return {
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    status: formData.get("status"),
    published_at: formData.get("published_at") || null,
    seo_title: formData.get("seo_title"),
    seo_description: formData.get("seo_description"),
    canonical_url: formData.get("canonical_url"),
    noindex: formData.get("noindex") === "on",
    cover_url: formData.get("cover_url"),
    cover_alt: formData.get("cover_alt"),
    tags: String(formData.get("tags") ?? ""),
    author_name: formData.get("author_name"),
  };
}

export async function createPost(
  _prev: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  await requireAdmin();

  const parsed = validatePost(readForm(formData));
  if (!parsed.ok) return { error: parsed.error };

  if (await slugTaken(parsed.value.slug)) {
    return {
      error: `The URL /blog/${parsed.value.slug} is taken. Change the slug.`,
      field: "slug",
    };
  }

  const { data, error } = await supabaseAdmin()
    .from("posts")
    .insert(parsed.value)
    .select("id,slug")
    .single();

  if (error) {
    console.error("[admin/posts] create failed:", error.message);
    return { error: "Could not create that post." };
  }

  await revalidatePost(data.slug);
  /* Outside any try/catch - redirect throws a control signal Next catches. */
  redirect(`/admin/posts/${data.id}?created=1`);
}

export async function updatePost(
  id: string,
  _prev: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  await requireAdmin();

  const existing = await adminGetPost(id);
  if (!existing) return { error: "That post no longer exists." };

  const parsed = validatePost({
    ...readForm(formData),
    /*
      published_at is taken from the database, not the form. It is the one
      field the editor must not be able to reset by accident: validatePost
      keeps an existing date and only stamps a new one on first publish, and
      feeding it the stored value is what makes "keep" possible. A post's
      publication date is a fact, and a typo fix in year two must not move it.
    */
    published_at: existing.published_at,
  });

  if (!parsed.ok) return { error: parsed.error };

  if (await slugTaken(parsed.value.slug, id)) {
    return {
      error: `The URL /blog/${parsed.value.slug} belongs to another post.`,
      field: "slug",
    };
  }

  const { error } = await supabaseAdmin()
    .from("posts")
    .update(parsed.value)
    .eq("id", id);

  if (error) {
    console.error("[admin/posts] update failed:", error.message);
    return { error: "Could not save that post." };
  }

  /*
    Both slugs, when the URL changed. The old page has to be purged or it
    keeps serving the article from cache at an address that no longer exists.
  */
  await revalidatePost(parsed.value.slug);
  if (existing.slug !== parsed.value.slug) await revalidatePost(existing.slug);

  return { ok: true };
}

/*
  Publish and unpublish as their own actions.

  They could be done by changing the status field and saving, and the editor
  offers that too - but the single most common thing anyone does on a post
  list is push one live, and making that a one-click action from the list
  instead of "open, scroll, change a select, save" is the difference between
  a tool that gets used and one that gets worked around.
*/
export async function setPostStatus(
  id: string,
  status: string,
): Promise<PostActionState> {
  await requireAdmin();

  const existing = await adminGetPost(id);
  if (!existing) return { error: "That post no longer exists." };

  const parsed = validatePost({ ...existing, status });
  if (!parsed.ok) return { error: parsed.error };

  const { error } = await supabaseAdmin()
    .from("posts")
    .update({
      status: parsed.value.status,
      published_at: parsed.value.published_at,
    })
    .eq("id", id);

  if (error) {
    console.error("[admin/posts] status change failed:", error.message);
    return { error: "Could not change that status." };
  }

  await revalidatePost(existing.slug);
  return { ok: true };
}

export async function deletePost(id: string): Promise<PostActionState> {
  await requireAdmin();

  const existing = await adminGetPost(id);

  const { error } = await supabaseAdmin().from("posts").delete().eq("id", id);

  if (error) {
    console.error("[admin/posts] delete failed:", error.message);
    return { error: "Could not delete that post." };
  }

  await revalidatePost(existing?.slug);
  return { ok: true };
}

/*
  Duplicate a post as a new draft.

  The realistic way a second article gets written: copy the one whose shape
  worked, replace the words. The copy is always a draft with a free slug, so
  duplicating can never put an unfinished article live or collide with the
  original's URL.
*/
export async function duplicatePost(id: string): Promise<PostActionState> {
  await requireAdmin();

  const existing = await adminGetPost(id);
  if (!existing) return { error: "That post no longer exists." };

  let slug = slugify(`${existing.title}-copy`);
  for (let n = 2; await slugTaken(slug); n += 1) {
    slug = slugify(`${existing.title}-copy-${n}`);
    if (n > 50) return { error: "Could not find a free URL for the copy." };
  }

  const { data, error } = await supabaseAdmin()
    .from("posts")
    .insert({
      slug,
      title: `${existing.title} (copy)`,
      excerpt: existing.excerpt,
      content: existing.content,
      status: "draft",
      published_at: null,
      seo_title: existing.seo_title,
      seo_description: existing.seo_description,
      /* Deliberately NOT copied: two posts sharing a canonical URL tells
         Google the new one is a duplicate of something else entirely. */
      canonical_url: null,
      noindex: existing.noindex,
      cover_url: existing.cover_url,
      cover_alt: existing.cover_alt,
      tags: existing.tags,
      author_name: existing.author_name,
      reading_minutes: existing.reading_minutes,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[admin/posts] duplicate failed:", error.message);
    return { error: "Could not duplicate that post." };
  }

  revalidatePath("/admin/posts");
  redirect(`/admin/posts/${data.id}`);
}
