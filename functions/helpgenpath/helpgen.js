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

class HelpGen {
  static getTemplate(helpBody) {
    return `<!doctype html>
    <html lang="en">

    <head>
      <meta charset="utf-8">
      <title>Scene Builder Help Contents</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link rel="shortcut icon" href="https://handtop.com/images/handtop.png">
    </head>

    <body>
      ${helpBody}
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

    let fetched = await fetch(`https://handtop.com/doc/${item}help.html`, {
      cache: "no-cache"
    });

    if (fetched.status !== 200) {
      return res.status(200).send('help item not found');
    }

    let data = await fetched.text();
    return res.status(200).send(data);
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
      let html = HelpGen.getTemplate(helpBody);
      return res.status(200).send(html);
    }
    return res.send("GET Only");
  }
  static async helpListToHTMLAnchorList() {
    let fetched = await fetch('https://handtop.com/doc/helplist.json', {
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
