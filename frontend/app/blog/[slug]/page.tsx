import { client, urlFor } from "@/lib/sanity";
import { PortableText, PortableTextComponents } from "@portabletext/react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const portableTextComponents: PortableTextComponents = {
  marks: {
    link: ({ value, children }) => {
      const isExternal = (value?.href || "").startsWith("http");
      return (
        <a
          href={value?.href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="text-blue-600 font-medium underline hover:text-blue-800 transition"
        >
          {children}
        </a>
      );
    },
  },
};

interface Post {
  title: string;
  category?: string;
  publishedAt?: string;
  author?: string;
  readTime?: string;
  mainImage?: any;
  body?: any;
}

async function getPost(slug: string): Promise<Post | null> {
  const query = `*[_type == "post" && slug.current == $slug][0] {
    title,
    category,
    publishedAt,
    author,
    readTime,
    mainImage,
    "body": coalesce(body, content, details, description)
  }`;

  try {
    return await client.fetch(query, { slug });
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-8">
      <article className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
        <Link
          href="/"
          className="text-xs font-bold text-blue-600 hover:underline inline-block mb-4"
        >
          &larr; Back to Home
        </Link>

        {post.category && (
          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold block w-fit">
            {post.category}
          </span>
        )}

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
          {post.title}
        </h1>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium pb-4 border-b border-slate-100">
          <span>{post.author || "Swift MD Team"}</span>
          <span>•</span>
          <span>{post.readTime || "5 min read"}</span>
        </div>

        {post.mainImage && (
          <div className="relative w-full h-64 sm:h-96 rounded-xl overflow-hidden bg-slate-100">
            <Image
              src={urlFor(post.mainImage).url()}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="prose prose-slate max-w-none pt-4 text-slate-700 leading-relaxed space-y-4">
          {post.body ? (
            <PortableText
              value={post.body}
              components={portableTextComponents}
            />
          ) : (
            <p>No content provided for this post.</p>
          )}
        </div>
      </article>
    </main>
  );
}