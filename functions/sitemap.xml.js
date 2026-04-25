// Cloudflare Pages Function — generates sitemap.xml dynamically from Supabase
// Env var required: SUPABASE_KEY (set in Pages dashboard → Settings → Environment variables)

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
    // Fetch published articles
    const articlesResp = await fetch(
      `${SUPABASE_URL}/rest/v1/ivy_articles?select=slug,updated_at,created_at&published=eq.true&order=updated_at.desc&limit=2000`,
      { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } }
    );
    if (!articlesResp.ok) {
      return new Response(`Upstream error (articles): ${articlesResp.status}`, { status: 502 });
    }
    const articles = await articlesResp.json();

    // Fetch categories
    const catsResp = await fetch(
      `${SUPABASE_URL}/rest/v1/ivy_categories?select=slug`,
      { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } }
    );
    const cats = catsResp.ok ? await catsResp.json() : [];

    const baseUrl = 'https://ivylife.com.tw';
    const today = new Date().toISOString().slice(0, 10);
    const escape = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));

    const urls = [];
    urls.push(`  <url><loc>${baseUrl}/</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>`);
    urls.push(`  <url><loc>${baseUrl}/about</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>`);

    for (const c of cats) {
      if (c.slug) {
        urls.push(`  <url><loc>${baseUrl}/category?cat=${escape(c.slug)}</loc><changefreq>daily</changefreq><priority>0.8</priority></url>`);
      }
    }

    for (const a of articles) {
      if (!a.slug) continue;
      const lastmod = (a.updated_at || a.created_at || today).slice(0, 10);
      urls.push(`  <url><loc>${baseUrl}/article/${escape(a.slug)}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`);
    }

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
