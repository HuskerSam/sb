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
  static getTemplate(helpBody, title, urlFrag, desc, helpOptions = '', video = '', reviewed = '', deployed = '', value = '', includeList = false) {
    if (!reviewed)
      reviewed = '';
    if (!video)
      video = '';
    let reviewHTML = '';
    let listHTML = '';
    let reviewClassName = 'list_help_view';
    if (reviewed) {
      reviewHTML = `<div class="review_text">Reviewed: ${reviewed}</div>`;
      reviewClassName = 'item_help_view';
    }
    if (includeList) {
      listHTML = `<div class="list_html_div"><select id="help_template_select" value="${value}">${helpOptions}</select><br>`;

      listHTML += ` &nbsp; <a href="${video}" ${ video ? '' : 'style="visibility:hidden;"'} target="_blank"><i class="material-icons">ondemand_video</i></a>`;
      listHTML += ` &nbsp; <a href="${deployed}" ${ deployed ? '' : 'style="visibility:hidden;"'} target="_blank"><i class="material-icons">animation</i></a>`;

      listHTML += reviewHTML;
      listHTML += '</div>';
    }
    return `<!doctype html>
    <html lang="en">

    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link rel="shortcut icon" href="https://handtop.com/images/${includeList ? 'funnel64' : 'logo64' }.png">
      <link rel="canonical" href="https://handtop.com/doc/${urlFrag}" />
      <meta property="og:title" content="${title}" />
      <meta property="og:url" content="https://handtop.com/doc/${urlFrag}" />
      <meta property="og:site_name" content="Handtop" />
      <meta property="og:image" content="https://handtop.com/images/home8sec.gif" />
      <meta property="og:type" content="website" />
      <meta property="og:description" content="${desc}" />
      <meta property="fb:app_id" content="461141618064403" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined">
    </head>

    <body class="${reviewClassName} vtdocpage">
    <link rel="stylesheet" href="https://handtop.com/public.css">
    <div class="home_page_wrapper${!includeList ? ' contents_wrapper' : ''}">
      <div class="option_bar">
        <a href="/" class="logo">
          <img alt="small logo image" class="small_logo" src="https://handtop.com/images/${includeList ? 'funnel64' : 'logo64' }.png">
        </a>
        ${ includeList ? '<a href="/doc/">Contents</a>' : '' }
        <div class="search_box_wrapper">
          <div class="gcse-search"></div>
        </div>
        <a href="mailto:support@handtop.com?subject=URGENT:Reference Question" target="_blank"><i class="material-icons alternate_email">alternate_email</i></a>
      </div>
      <div class="help_gen_list_wrapper">
        ${listHTML}
      </div>
      <div class="help_body">${helpBody}</div>
      <div class="footer_bar">
      <a href="/addon/"><img src="https://handtop.com/images/logo64.png"
         style="width:1.5em;top:.35em;position:relative;"> Tools</a><a
       href="https://gsuite.google.com/marketplace/app/visual_tools/453466452088" target="_blank"><img src="https://handtop.com/images/logo64.png"
          style="width:1.5em;top:.35em;position:relative;"> Install</a><a
        href="/retail/"><img src="https://handtop.com/images/logo64.png"
           style="width:1.5em;top:.35em;position:relative;"> Catalogs</a><a href="/privacy.html">Privacy</a><a
        href="/about/">About</a><a target="_blank" href="mailto:contact@handtop.com?subject=sent from handtop.com">contact@handtop.com</a>
        <div class="copyright">
          Lincoln, Nebraska, USA 68508
          <br>© 1998 - 2021 Handtop.
          <br>All Rights Reserved.
        </div>
      </div>
    </div>
    <script>
      let ctl = document.getElementById('help_template_select');
      if (ctl) {
        if (ctl.length < 2)
          ctl.style.display = 'none';
        ctl.addEventListener('input', e => {
          let v = ctl.value;
          let a = document.createElement('a');
          a.setAttribute('href', 'https://handtop.com/doc/' + v);
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        });

        ctl.focus();
      }

      window.customCSEID = '0b2a9868105e1e42e';
      window.customPH = ' Search reference...';
    </script>
    <script src="/homepagestuff.js"></script>
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
            <priority>1</priority>
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
      return res.status(404).send('help item not found');
    }

    let data = await fetched.text();

    let helpData = await this.helpListToHTMLAnchorList(item);
    let helpList = await helpData.data;
    let helpItem = null;
    helpList.forEach(i => {
      if (i.value === item) helpItem = i;
    });
    let title = 'Visual Tools Reference';
    if (helpItem)
      title = helpItem.category + ': ' + helpItem.title;
    let regex = /(<([^>]+)>)/ig;
    let desc = data.replace(regex, "");
    desc = desc.substring(0, 200);
    let html = HelpGen.getTemplate(data, title, item, desc, helpData.options, helpItem.video, helpItem.reviewed, helpItem.deployed, helpItem.value, true);
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
      let html = HelpGen.getTemplate(helpBody, 'Visual Tools Documentation', '', 'Visual Tools reference documentation');
      return res.status(200).send(html);
    }
    return res.send("GET Only");
  }
  static async helpListToHTMLAnchorList(value) {
    let fetched = await fetch('https://handtop.com/docraw/helplist.json', {
      cache: "no-cache"
    });
    let data = await fetched.json();

    let html = '';
    let xml = '';
    let options = '';
    let lastCat = '';
    let counter = 1;
    data.forEach(i => {
      if (lastCat !== i.category) {
        if (counter !== 1)
          html += '</div>';
        html += '<div style="clear:both;"></div><div class="header_wrapper"><h2 class="h2_ctr_' + counter.toString() + '">' + i.category + '</h2></div><div class="item_wrapper">';
        counter++;
        lastCat = i.category;
      }

      let displayTitle = i.title;
      html += `<div class="help_display_item">`;
      html += ` <a href="https://handtop.com/doc/${i.value}">${displayTitle}</a>`;
      html += `<div class="reviewed">${i.reviewed}</div>`;
      html += `<div class="sub_bar">`;
      //`<a href="${i.value}" target="_blank"><i class="material-icons">open_in_new</i></a>`;
      html += ` <a href="${i.video}" ${ i.video ? '' : 'style="visibility:hidden;"'} target="_blank"><i class="material-icons">ondemand_video</i></a>`;
      html += ` <a href="${i.deployed}" ${ i.deployed ? '' : 'style="visibility:hidden;"'} target="_blank"><i class="material-icons">animation</i></a>`;
      html += `</div>`;
      html += '</div>';

      options += `<option value="${i.value}" ${i.value === value ? 'selected' : ''}>${i.category}: ${i.title}</option>`;

      xml += `<url>
            <loc>https://handtop.com/doc/${i.value}</loc>
              <lastmod>${new Date().toISOString().substring(0, 10)}</lastmod>
              <changefreq>daily</changefreq>
              <priority>1</priority>
          </url>`;
    });

    if (html)
      html += '</div>';

    return {
      data,
      html,
      xml,
      options
    }
  }
}
