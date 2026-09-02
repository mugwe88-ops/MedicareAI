import { client, urlFor } from "@/lib/sanity";
import { PortableText, PortableTextComponents } from "@portabletext/react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

// Custom PortableText components with inline body image rendering & styling
const portableTextComponents: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      if (!value) return null;
      let src = "";
      if (typeof value === "string") {
        src = value;
      } else if (value.asset?.url) {
        src = value.asset.url;
      } else {
        try {
          src = urlFor(value).url();
        } catch {
          return null;
        }
      }

      return (
        <div className="relative w-full h-72 sm:h-96 my-8 rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-100">
          <Image
            src={src}
            alt={value.alt || "Article content image"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
          />
        </div>
      );
    },
  },
  block: {
    h2: ({ children }) => (
      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-10 mb-4 pb-2 border-b-2 border-slate-100 flex items-center gap-3">
        <span className="w-1.5 h-6 bg-primary rounded-full inline-block" />
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-bold text-slate-800 mt-6 mb-3">{children}</h3>
    ),
    normal: ({ children }) => (
      <p className="text-slate-700 text-lg leading-relaxed mb-6">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-8 p-6 border-l-4 border-primary bg-sky-50/80 rounded-r-2xl text-slate-800 font-medium text-lg italic shadow-sm">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="space-y-3 my-6 pl-2">{children}</ul>
    ),
  },
  listItem: {
    bullet: ({ children }) => (
      <li className="flex items-start gap-3 text-slate-700 text-base sm:text-lg">
        <span className="h-2.5 w-2.5 rounded-full bg-primary mt-2 shrink-0" />
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
          className="text-primary font-semibold underline hover:text-cyan-600 transition"
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
  medicalReviewer?: string;
  readingTime?: number;
  coverImage?: any;
  excerpt?: string;
  keyTakeaways?: string[];
  body?: any;
  ctaEnabled?: boolean;
}

// Automatic reading time calculator
function calculateReadTime(body: any): number {
  if (!body) return 3;
  const text = JSON.stringify(body);
  const wordCount = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

// Robust Image Resolver for Sanity URLs and direct string links
function resolveImageUrl(source: any): string | null {
  if (!source) return null;
  if (typeof source === "string") return source;
  if (source.asset?.url) return source.asset.url;
  try {
    return urlFor(source).url();
  } catch (error) {
    console.error("Failed to parse image with urlFor:", error);
    return null;
  }
}

async function getPost(slug: string): Promise<Post | null> {
  // Querying raw coverImage so urlFor can extract _ref cleanly
  const query = `*[_type == "post" && slug.current == $slug][0] {
    title,
    category,
    publishedAt,
    author,
    medicalReviewer,
    readingTime,
    coverImage,
    excerpt,
    keyTakeaways,
    ctaEnabled,
    "body": coalesce(body, content)
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

  const readTime = post.readingTime || calculateReadTime(post.body);
  const heroImageUrl = resolveImageUrl(post.coverImage);

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-8">
      <article className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
        
        {/* 1. Hero banner with cover image */}
        <div className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-sky-800 p-6 sm:p-10 pt-8 text-white">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-white bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition mb-6 backdrop-blur-md"
          >
            &larr; Back to Articles
          </Link>

          <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-slate-800">
            {heroImageUrl ? (
              <Image
                src={heroImageUrl}
                alt={post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 896px"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-cyan-600 to-blue-800 text-white p-6 text-center">
                <svg className="w-16 h-16 opacity-40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-semibold opacity-80">{post.category || "Health Guide"}</span>
              </div>
            )}
          </div>
        </div>

        {/* 2. Category badge, read time & title */}
        <div className="p-6 sm:p-12 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3.5 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-extrabold uppercase tracking-wider">
              {post.category || "Health Guide"}
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              {readTime} min read
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-4">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg text-slate-600 font-medium mb-6">
              {post.excerpt}
            </p>
          )}

          {/* 3. Author card */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-primary text-white font-black flex items-center justify-center text-base shadow-md">
                SM
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  By {post.author || "Swift MD Medical Team"}
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  Reviewed by: {post.medicalReviewer || "Clinical Board"}
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1.5 rounded-lg">
              Published: {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "Recent"}
            </div>
          </div>
        </div>

        {/* Article Body Area */}
        <div className="p-6 sm:p-12 pt-8">
          
          {/* 4. Key Takeaways Box */}
          {post.keyTakeaways && post.keyTakeaways.length > 0 && (
            <div className="mb-10 p-6 rounded-2xl bg-sky-50 border-l-4 border-primary shadow-sm">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-cyan-900 mb-3 flex items-center gap-2">
                <span>💡</span> Key Takeaways
              </h3>
              <ul className="space-y-2">
                {post.keyTakeaways.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700 text-base font-medium">
                    <span className="text-primary font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 5. Rendered Body Content */}
          {post.body && (
            <PortableText
              value={post.body}
              components={portableTextComponents}
            />
          )}

          {/* 6. "Book a Doctor" CTA Card */}
          {post.ctaEnabled !== false && (
            <div className="mt-14 p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 text-white shadow-2xl space-y-4 text-center sm:text-left sm:flex sm:items-center sm:justify-between sm:space-y-0 sm:gap-6">
              <div className="space-y-2 max-w-lg">
                <h3 className="text-2xl font-black tracking-tight">
                  Need Personalized Medical Advice?
                </h3>
                <p className="text-sm text-cyan-100 leading-relaxed font-medium">
                  Speak directly with certified doctors and medical specialists on Swift MD today.
                </p>
              </div>
              <Link
                href="/signup"
                className="inline-block px-7 py-3.5 bg-primary hover:bg-cyan-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg transition shrink-0"
              >
                Book a Doctor
              </Link>
            </div>
          )}

        </div>
      </article>
    </main>
  );
}