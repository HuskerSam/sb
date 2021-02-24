document.addEventListener('DOMContentLoaded', e => window.helpHelperApp = new HelperAPP());

class HelperAPP {
  constructor() {
    if (!window.frameElement) {
      let newDiv = document.createElement('div');
      newDiv.innerHTML = this.headerTemplate();
      document.body.insertBefore(newDiv, document.body.firstChild);
    }

    let searchParams = new URLSearchParams(window.location.search);
    this.help_item_list = document.getElementById('help_item_list');
    if (this.help_item_list && searchParams.get("freshfetch") === "1")
      this.helpListToHTMLAnchorList();

    let s = document.createElement('script');
    s.setAttribute('src', 'https://cse.google.com/cse.js?cx=0b2a9868105e1e42e');
    document.body.appendChild(s);
  }
  headerTemplate() {
    return `<link rel="stylesheet" href="https://handtop.com/public.css">
    <div class="option_bar">
      <a href="/" style="border:none;text-decoration:none;float:left;position:relative;top:-8px;">
        <img alt="small logo image" style="height:40px;position:relative;top:-18px;" src="https://handtop.com/images/handtop.png">
        <img alt="Handtop" style="height:65px" src="https://handtop.com/images/handtoplogo.png">
      </a>
      <a href="/doc" style="font-weight:bold">Help Contents</a>
      <a href="/retail">Visual Catalogs</a>
      <a href="/about">About</a>
      <div style="float:right;width:20em;">
        <div class="gcse-search"></div>
      </div>
    </div>
    <div style="display:block;clear:both;"></div>`;
  }
  async helpListToHTMLAnchorList() {
    console.log('live fetch of html list')
    let fetched = await fetch('https://handtop.com/doc/helplist.json', {
      cache: "no-cache"
    });
    let data = await fetched.json();

    let html = '';
    let xml = '';
    data.forEach(i => {
      html += `${i.title}: <a href="${i.value}help.html">${i.value}help.html</a>`;
      if (i.video)
        html += ` &nbsp; <a href="${i.video}" target="_blank">video</a>`;
      html += '<br><br>\n';

      xml += `<url>
            <loc>https://handtop.com/doc/${i.value}help.html</loc>
              <lastmod>2021-02-01</lastmod>
              <changefreq>daily</changefreq>
              <priority>1</priority>
          </url>`;
    });
    window.xmlGuts = xml;
    window.helpGuts = html; // CRITICAL NOTE : copy contents to index.html source file save and deploy for search engine to update
    this.help_item_list.innerHTML = html;
  }
}
