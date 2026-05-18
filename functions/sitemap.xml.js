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
    const articlesResp = await fetch(
      `${SUPABASE_URL}/rest/v1/ivy_articles?select=slug,updated_at,created_at,cover_image,title,category_id&published=eq.true&order=updated_at.desc&limit=2000`,
      { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } }
    );
    if (!articlesResp.ok) {
      return new Response(`Upstream error (articles): ${articlesResp.status}`, { status: 502 });
    }
    const articles = await articlesResp.json();

    const catsResp = await fetch(
      `${SUPABASE_URL}/rest/v1/ivy_categories?select=id,slug`,
      { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } }
    );
    const cats = catsResp.ok ? await catsResp.json() : [];

    const baseUrl = 'https://ivylife.com.tw';
    const today = new Date().toISOString().slice(0, 10);
    const escape = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));

    // Build per-category lastmod from latest article
    const catLastMod = {};
    for (const a of articles) {
      if (!a.category_id) continue;
      const lm = (a.updated_at || a.created_at || today).slice(0, 10);
      if (!catLastMod[a.category_id] || lm > catLastMod[a.category_id]) {
        catLastMod[a.category_id] = lm;
      }
    }

    const urls = [];
    urls.push(`  <url><loc>${baseUrl}/</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>`);
    urls.push(`  <url><loc>${baseUrl}/about</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>`);

    for (const c of cats) {
      if (!c.slug) continue;
      const lm = catLastMod[c.id] || today;
      urls.push(`  <url><loc>${baseUrl}/category/${escape(c.slug)}</loc><lastmod>${lm}</lastmod><changefreq>daily</changefreq><priority>0.8</priority></url>`);
    }

    for (const a of articles) {
      if (!a.slug) continue;
      const lastmod = (a.updated_at || a.created_at || today).slice(0, 10);
      let entry = `  <url><loc>${baseUrl}/article/${escape(a.slug)}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority>`;
      if (a.cover_image && /^https?:\/\//i.test(a.cover_image)) {
        entry += `<image:image><image:loc>${escape(a.cover_image)}</image:loc>` +
          (a.title ? `<image:title>${escape(a.title)}</image:title>` : '') +
          `</image:image>`;
      }
      entry += `</url>`;
      urls.push(entry);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'X-Generated-By': 'pages-function',
        'X-Article-Count': String(articles.length),
        'X-Category-Count': String(cats.length),
      },
    });
  } catch (e) {
    return new Response(`Error: ${e.message}`, { status: 500 });
  }
}
