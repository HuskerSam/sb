let firebase = require("firebase-admin");
const fetch = require('node-fetch');
const sourceApp = require('express')();
const cors = require('cors');

sourceApp.use(cors({
  origin: true
}));

module.exports = {};
module.exports.helpGen = sourceApp;

sourceApp.get('/sitemap.xml', async (req, res) => await HelpGen.genSiteMap(req, res));
sourceApp.get('/doc/:helpitem', async (req, res) => await HelpGen.genItemPath(req, res));
sourceApp.get('/doc/', async (req, res) => await HelpGen.genPage(req, res));
sourceApp.get('/doc', async (req, res) => await HelpGen.genPage(req, res));

class HelpGen {
  static getTemplate(helpBody, title, urlFrag) {
    return `<!doctype html>
    <html lang="en">

    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link rel="shortcut icon" href="https://handtop.com/images/handtop.png">
      <link rel="canonical" href="https://handtop.com/doc/${urlFrag}" />
      <meta property="og:title" content="${title}" />
      <meta property="og:url" content="https://handtop.com/doc/${urlFrag}" />
      <meta property="og:site_name" content="Handtop" />
      <meta property="og:image" content="https://handtop.com/retail/pipeline.jpg" />
      <meta property="og:type" content="website" />
      <meta property="fb:app_id" content="461141618064403" />
    </head>

    <body>
    <link rel="stylesheet" href="https://handtop.com/public.css">
    <div class="home_page_wrapper">
      <div class="option_bar">
        <a href="/" class="logo">
          <img alt="small logo image" class="small_logo" src="https://handtop.com/images/handtop.png">
          <img alt="Handtop" style="height:65px" src="https://handtop.com/images/handtoplogo.png">
        </a>
        <a href="/doc/">Documentation</a>
        <div style="float:right;width:20em;margin-top:-20px;">
          <div class="gcse-search"></div>
        </div>
      </div>
      <div style="padding: 20px;">${helpBody}</div>
      <div class="footer_bar">
        <a target="_blank" href="mailto:contact@handtop.com?subject=sent from handtop.com">contact@handtop.com</a>
        &nbsp;
        <a href="/privacy.html">Privacy Policy</a>
        <br><br>
        Lincoln, Nebraska, USA 68508
        <br>© 1998 - 2021 Handtop. All Rights Reserved.
      </div>
    </div>
    <script src="https://cse.google.com/cse.js?cx=0b2a9868105e1e42e"></script>
    </body>

    </html>`;
  }
  static getSiteMap(helpBodyXML) {
    return `<?xml version="1.0" encoding="utf-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
        <url>
            <loc>https://handtop.com/</loc>
            <lastmod>${new Date().toISOString().substring(0, 10)}</lastmod>
            <changefreq>daily</changefreq>
            <priority>1</priority>
        </url>
        <url>
            <loc>https://handtop.com/retail/</loc>
            <lastmod>${new Date().toISOString().substring(0, 10)}</lastmod>
            <changefreq>daily</changefreq>
            <priority>1</priority>
        </url>
        <url>
            <loc>https://handtop.com/about/</loc>
            <lastmod>${new Date().toISOString().substring(0, 10)}</lastmod>
            <changefreq>daily</changefreq>
            <priority>.5</priority>
        </url>
        <url>
            <loc>https://handtop.com/dc/</loc>
            <lastmod>${new Date().toISOString().substring(0, 10)}</lastmod>
            <changefreq>daily</changefreq>
            <priority>.5</priority>
        </url>
        <url>
            <loc>https://handtop.com/addon/</loc>
            <lastmod>${new Date().toISOString().substring(0, 10)}</lastmod>
            <changefreq>daily</changefreq>
            <priority>.5</priority>
        </url>
        <url>
            <loc>https://handtop.com/doc/</loc>
            <lastmod>${new Date().toISOString().substring(0, 10)}</lastmod>
            <changefreq>daily</changefreq>
            <priority>.5</priority>
        </url>
        ${helpBodyXML}
    </urlset>`;
  }
  static async genItemPath(req, res) {
    let item = req.params.helpitem;

    let fetched = await fetch(`https://handtop.com/docraw/${item}help.html`, {
      cache: "no-cache"
    });

    if (fetched.status !== 200) {
      return res.status(200).send('help item not found');
    }

    let data = await fetched.text();

    let listFetch = await fetch('https://handtop.com/docraw/helplist.json', {
      cache: "no-cache"
    });
    let helpList = await listFetch.json();
    let helpItem = null;
    helpList.forEach(i => {
      if (i.value === item) helpItem = i;
    });
    let title = 'Visual Catalogs Documentation';
    if (helpItem)
      title = helpItem.title;
    let html = HelpGen.getTemplate(data, title, item);
    return res.status(200).send(html);
  }
  static async genSiteMap(req, res) {
    res.set("Access-Control-Allow-Origin", "*");
    if (req.method === 'GET') {
      let helpDataList = await this.helpListToHTMLAnchorList();
      let helpBody = helpDataList.xml;
      let html = HelpGen.getSiteMap(helpBody);
      res.set('Content-Type', 'text/xml');
      return res.status(200).send(html);
    }
    return res.send("GET Only");
  }
  static async genPage(req, res) {
    res.set("Access-Control-Allow-Origin", "*");
    if (req.method === 'GET') {
      let helpDataList = await this.helpListToHTMLAnchorList();
      let helpBody = helpDataList.html;
      let html = HelpGen.getTemplate(helpBody, 'Visual Catalogs Documentation', '/');
      return res.status(200).send(html);
    }
    return res.send("GET Only");
  }
  static async helpListToHTMLAnchorList() {
    let fetched = await fetch('https://handtop.com/docraw/helplist.json', {
      cache: "no-cache"
    });
    let data = await fetched.json();

    let html = '';
    let xml = '';
    data.forEach(i => {
      html += `<a href="https://handtop.com/doc/${i.value}">${i.title}</a>`;
      if (i.video)
        html += ` &nbsp; <a href="${i.video}" target="_blank">video</a>`;
      html += '<br><br>\n';

      xml += `<url>
            <loc>https://handtop.com/doc/${i.value}</loc>
              <lastmod>${new Date().toISOString().substring(0, 10)}</lastmod>
              <changefreq>daily</changefreq>
              <priority>1</priority>
          </url>`;
    });

    return {
      html,
      xml
    }
  }
}
