import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://yourdomain.com"; // Replace with your domain

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/'], // Protect private API & admin pages from indexing
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}