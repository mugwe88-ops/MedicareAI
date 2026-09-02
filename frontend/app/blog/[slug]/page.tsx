import { client, urlFor } from "@/lib/sanity";
import { PortableText, PortableTextComponents } from "@portabletext/react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

// Styled components for Sanity Rich Text
const portableTextComponents: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
        <span className="w-2 h-6 bg-blue-600 rounded-full inline-block"></span>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">
        {children}
      </h3>
    ),
    normal: ({ children }) => (
      <p className="text-slate-600 text-base leading-relaxed mb-4">
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-6 p-4 border-l-4 border-blue-600 bg-blue-50/50 rounded-r-xl text-slate-700 font-medium italic">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="space-y-2 my-4 pl-2">{children}</ul>
    ),
  },
  listItem: {
    bullet: ({ children }) => (
      <li className="flex items-start gap-3 text-slate-600 text-sm sm:text-base">
        <span className="h-2 w-2 rounded-full bg-blue-500 mt-2 shrink-0" />
        <span>{children}</span>
      </li>
    ),
  },
  marks: {
    link: ({ value, children }) => {
      const isExternal = (value?.href || "").startsWith("http");
      return (
        <a
          href={value?.href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="text-blue-600 font-semibold underline hover:text-blue-800 transition"
        >
          {children}
        </a>
      );
    },
    strong: ({ children }) => (
      <strong className="font-bold text-slate-900">{children}</strong>
    ),
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
    <main className="min-h-screen bg-slate-100/70 py-12 px-4 sm:px-8">
      <article className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* Top Hero Banner */}
        <div className="p-6 sm:p-12 pb-6 border-b border-slate-100">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition mb-6"
          >
            &larr; Back to Articles
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold uppercase tracking-wider">
              {post.category || "Health Guide"}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {post.readTime || "5 min read"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-6">
            {post.title}
          </h1>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
              SM
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                {post.author || "Swift MD Clinical Team"}
              </p>
              <p className="text-xs text-slate-400">Verified Medical Content</p>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        {post.mainImage && (
          <div className="relative w-full h-72 sm:h-96 bg-slate-100">
            <Image
              src={urlFor(post.mainImage).url()}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Rich Text Body */}
        <div className="p-6 sm:p-12">
          {post.body ? (
            <PortableText
              value={post.body}
              components={portableTextComponents}
            />
          ) : (
            <p className="text-slate-500 italic">
              No content provided for this post.
            </p>
          )}

          {/* Bottom CTA Card */}
          <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white space-y-3 shadow-lg">
            <h3 className="text-lg font-bold">Have Health Concerns?</h3>
            <p className="text-xs text-blue-100 leading-relaxed">
              Consult with registered medical specialists on Swift MD for personalized care and telehealth services.
            </p>
            <Link
              href="/signup"
              className="inline-block mt-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold rounded-xl transition"
            >
              Book Video Consultation
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}