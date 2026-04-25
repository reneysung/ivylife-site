// Cloudflare Pages Function — generates sitemap.xml dynamically from Supabase
// Env var required: SUPABASE_KEY (set in Pages dashboard, Settings > Environment variables)

export async function onRequest(context) {
  const SUPABASE_URL = 'https://zsebcpfblecwumbaxeaz.supabase.co';
  const KEY = context.env.SUPABASE_KEY;

  if (!KEY) {
    return new Response('Server misconfiguration: SUPABASE_KEY env var missing', {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/ivy_articles?select=slug,old_id,updated_at,created_at&published=eq.true&order=updated_at.desc&limit=2000`,
      { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } }
    );

    if (!r.ok) {
      return new Response(`Upstream error: ${r.status}`, { status: 502 });
    }

    const articles = await r.json();
    const baseUrl = 'https://ivylife.com.tw';
    const today = new Date().toISOString().slice(0, 10);

    const escape = (s) =>
      String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

    const urls = [
      `  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`,
      ...articles.map((a) => {
        const slug = a.old_id || a.slug;
        const lastmod = (a.updated_at || a.created_at || today).slice(0, 10);
        return `  <url>
    <loc>${baseUrl}/article/${escape(slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
      }),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'X-Generated-By': 'pages-function',
        'X-Article-Count': String(articles.length),
      },
    });
  } catch (e) {
    return new Response(`Error: ${e.message}`, { status: 500 });
  }
}
// Cloudflare Pages Function — generates sitemap.xml dynamically from Supabase
// Env var required: SUPABASE_KEY (set in Pages dashboard, Settings > Environment variables)

export async function onRequest(context) {
  const SUPABASE_URL = 'https://zsebcpfblecwumbaxeaz.supabase.co';
  const KEY = context.env.SUPABASE_KEY;

  if (!KEY) {
    return new Response('Server misconfiguration: SUPABASE_KEY env var missing', {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/ivy_articles?select=slug,old_id,updated_at,created_at&published=eq.true&order=updated_at.desc&limit=2000`,
      { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } }
    );

    if (!r.ok) {
      return new Response(`Upstream error: ${r.status}`, { status: 502 });
    }

    const articles = await r.json();
    const baseUrl = 'https://ivylife.com.tw';
    const today = new Date().toISOString().slice(0, 10);

    const escape = (s) =>
      String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

    const urls = [
      `  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`,
      ...articles.map((a) => {
        const slug = a.old_id || a.slug;
        const lastmod = (a.updated_at || a.created_at || today).slice(0, 10);
        return `  <url>
    <loc>${baseUrl}/article/${escape(slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
      }),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'X-Generated-By': 'pages-function',
        'X-Article-Count': String(articles.length),
      },
    });
  } catch (e) {
    return new Response(`Error: ${e.message}`, { status: 500 });
  }
}
