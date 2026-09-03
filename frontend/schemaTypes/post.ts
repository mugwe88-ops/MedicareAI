import { defineField, defineType } from "sanity";

export const postType = defineType({
  name: "post",
  title: "Blog Post",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt / Short Summary",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alternative Text",
          description: "Important for accessibility and SEO.",
        },
      ],
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Health Guide", value: "Health Guide" },
          { title: "Women's Health", value: "Women's Health" },
          { title: "Mental Health", value: "Mental Health" },
          { title: "Preventive Care", value: "Preventive Care" },
        ],
      },
      initialValue: "Health Guide",
    }),
    defineField({
      name: "readingTime",
      title: "Reading Time (Manual Override in minutes)",
      type: "number",
      description: "Leave empty to calculate automatically from body text.",
    }),
    defineField({
      name: "author",
      title: "Author Name",
      type: "string",
      initialValue: "Swift MD Medical Team",
    }),
    defineField({
      name: "medicalReviewer",
      title: "Medical Reviewer",
      type: "string",
      initialValue: "Dr. Swift MD Clinical Board",
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "keyTakeaways",
      title: "Key Takeaways (Bullet points for quick summary box)",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "body",
      title: "Article Content",
      type: "array",
      of: [
        {
          type: "block",
          // Explicitly whitelist styles to match frontend portableTextComponents
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading 2", value: "h2" },
            { title: "Heading 3", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
          lists: [{ title: "Bullet", value: "bullet" }],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
            ],
            annotations: [
              {
                title: "URL",
                name: "link",
                type: "object",
                fields: [
                  {
                    title: "URL",
                    name: "href",
                    type: "url",
                  },
                ],
              },
            ],
          },
        },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            {
              name: "alt",
              type: "string",
              title: "Alternative Text",
              description: "Description of the illustration for screen readers.",
            },
          ],
        },
      ],
    }),
    defineField({
      name: "ctaEnabled",
      title: "Enable 'Book a Doctor' CTA Card at bottom?",
      type: "boolean",
      initialValue: true,
    }),
  ],
});r