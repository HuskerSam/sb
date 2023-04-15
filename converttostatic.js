var fs = require("fs");

let helpList = [{
    "value": "alphausers",
    "title": "Alpha Users",
    "category": "Cloud",
    "reviewed": "2021-05-28",
    "video": "",
    "deployed": ""
  },
  {
    "value": "overview",
    "title": "Cloud Overview",
    "category": "Cloud",
    "reviewed": "2021-05-28",
    "video": "",
    "deployed": "https://dedicateddemos.web.app/view/?name=webApp%20Diagram"
  },
  {
    "value": "workspace",
    "title": "Asset Manager",
    "category": "Cloud",
    "reviewed": "2021-03-28",
    "video": "https://s3.us-west-2.amazonaws.com/hcwebflow/videos/basicsvideo.mp4",
    "deployed": ""
  },
  {
    "value": "displayapp",
    "title": "Display Viewer",
    "category": "Cloud",
    "reviewed": "2021-05-28",
    "video": "https://hcwebflow.s3-us-west-2.amazonaws.com/videos/virtualcatalogintro.mp4",
    "deployed": ""
  },
  {
    "value": "viewer",
    "title": "Asset Viewer",
    "category": "Cloud",
    "reviewed": "2021-03-28",
    "video": "",
    "deployed": ""
  },
  {
    "value": "virtualreality",
    "title": "Virtual Reality",
    "category": "Cloud",
    "reviewed": "2021-05-28",
    "video": "",
    "deployed": ""
  },
  {
    "value": "newinstance",
    "title": "Server Initialization",
    "category": "Cloud",
    "reviewed": "2021-05-28",
    "video": "",
    "deployed": ""
  },
  {
    "value": "authorization",
    "title": "Application Authorization",
    "category": "Cloud",
    "reviewed": "2021-05-28",
    "video": "",
    "deployed": ""
  },
  {
    "value": "csvformat",
    "title": "Data Import Format",
    "category": "Cloud",
    "reviewed": "2021-03-28",
    "video": "",
    "deployed": ""
  },
  {
    "value": "displayarch",
    "title": "Display Generation",
    "category": "Cloud",
    "reviewed": "2021-05-28",
    "video": "",
    "deployed": ""
  },
  {
    "value": "taproomapp",
    "title": "Taproom Application",
    "category": "Cloud",
    "reviewed": "2021-05-28",
    "video": "https://hcwebflow.s3-us-west-2.amazonaws.com/videos/taproomwalkthru.mp4",
    "deployed": "https://dedicateddemos.web.app/view/?name=Beer%20Display"
  },
  {
    "value": "addoninstall",
    "title": "Addon Install",
    "category": "Sheets",
    "reviewed": "2021-04-04",
    "video": "",
    "deployed": ""
  },
  {
    "value": "createlayout",
    "title": "Create Layout",
    "category": "Sheets",
    "reviewed": "2021-03-28",
    "video": "https://hcwebflow.s3-us-west-2.amazonaws.com/videos/template/createlayoutwalkthru.mp4",
    "deployed": "https://dedicateddemos.web.app/view/?name=Create%20Layout%20Logo%20Example"
  },
  {
    "value": "addonconfiguration",
    "title": "Addon Configuration",
    "category": "Sheets",
    "reviewed": "2021-05-28",
    "video": "https://hcwebflow.s3-us-west-2.amazonaws.com/videos/newsheetintro.mp4",
    "deployed": ""
  },
  {
    "value": "addonprojects",
    "title": "Addon Projects",
    "category": "Sheets",
    "reviewed": "2021-03-28",
    "video": "https://hcwebflow.s3-us-west-2.amazonaws.com/videos/projectvideaddon.mp4",
    "deployed": ""
  },
  {
    "value": "addontemplates",
    "title": "Importing Templates",
    "category": "Sheets",
    "reviewed": "2021-05-28",
    "video": "",
    "deployed": ""
  },
  {
    "value": "sheetsfunctions",
    "title": "Sheets Functions",
    "category": "Sheets",
    "reviewed": "2021-05-28",
    "video": "",
    "deployed": ""
  },
  {
    "value": "positionplotter",
    "title": "Position Plotter",
    "category": "Sheets",
    "reviewed": "2021-05-28",
    "video": "https://hcwebflow.s3-us-west-2.amazonaws.com/videos/template/pointsforplot.mp4",
    "deployed": ""
  },
  {
    "value": "positionproducts",
    "title": "Position Products",
    "category": "Sheets",
    "reviewed": "2021-05-28",
    "video": "",
    "deployed": ""
  },
  {
    "value": "processaudio",
    "title": "Process Audio",
    "category": "Sheets",
    "reviewed": "2021-05-28",
    "video": "",
    "deployed": ""
  },
  {
    "value": "createtemplate",
    "title": "Create Template",
    "category": "Sheets",
    "reviewed": "2021-05-28",
    "video": "",
    "deployed": ""
  },
  {
    "value": "block",
    "title": "Blocks and Children",
    "category": "Assets",
    "reviewed": "2021-05-28",
    "video": "https://hcwebflow.s3-us-west-2.amazonaws.com/videos/animatedlinechart.mp4",
    "deployed": "https://dedicateddemos.web.app/view/?name=TRI%20Meter"
  },
  {
    "value": "sceneblock",
    "title": "Scene Blocks",
    "category": "Assets",
    "reviewed": "2021-03-28",
    "video": "",
    "deployed": ""
  },
  {
    "value": "camera",
    "title": "Cameras and Interfaces",
    "category": "Assets",
    "reviewed": "2021-05-28",
    "video": "",
    "deployed": "https://dedicateddemos.web.app/view/?name=Cameras"
  },
  {
    "value": "displayblock",
    "title": "Display Blocks",
    "category": "Assets",
    "reviewed": "2021-03-28",
    "video": "https://hcwebflow.s3-us-west-2.amazonaws.com/videos/spinner7.22.19.mp4",
    "deployed": ""
  },
  {
    "value": "diagramblocks",
    "title": "Diagram Blocks",
    "category": "Assets",
    "reviewed": "2021-03-28",
    "video": "",
    "deployed": ""
  },
  {
    "value": "frame",
    "title": "Frames and Animation",
    "category": "Assets",
    "reviewed": "2021-03-28",
    "video": "",
    "deployed": "https://dedicateddemos.web.app/view/?name=3D%20Flow%20Diagram%20342"
  },
  {
    "value": "light",
    "title": "Lights and Shading",
    "category": "Assets",
    "reviewed": "2021-03-28",
    "video": "",
    "deployed": "https://dedicateddemos.web.app/view/?name=Lights"
  },
  {
    "value": "material",
    "title": "Materials and Textures",
    "category": "Assets",
    "reviewed": "2021-03-28",
    "video": "",
    "deployed": ""
  },
  {
    "value": "mesh",
    "title": "Meshes and .gltf/.glb",
    "category": "Assets",
    "reviewed": "2021-03-28",
    "video": "",
    "deployed": ""
  },
  {
    "value": "shape",
    "title": "Shapes and 3D Text",
    "category": "Assets",
    "reviewed": "2021-03-28",
    "video": "",
    "deployed": "https://dedicateddemos.web.app/view/?name=Shapes%20and%20Frames"
  },
  {
    "value": "webfontblock",
    "title": "Web Fonts",
    "category": "Assets",
    "reviewed": "2021-03-28",
    "video": "",
    "deployed": ""
  },
  {
    "value": "roomwallsblock",
    "title": "Room Walls",
    "category": "Assets",
    "reviewed": "2021-03-28",
    "video": "",
    "deployed": ""
  },
  {
    "value": "importunityassets",
    "title": "Import Unity Assets",
    "category": "Assets",
    "reviewed": "2021-05-09",
    "video": "",
    "deployed": ""
  },
  {
    "value": "texturebakeunity",
    "title": "Bake Textures in Unity",
    "category": "Assets",
    "reviewed": "2021-05-09",
    "video": "",
    "deployed": ""
  },
  {
    "value": "unityblenderglb",
    "title": "GLB export from Unity",
    "category": "Assets",
    "reviewed": "2021-05-11",
    "video": "",
    "deployed": ""
  },
  {
    "value": "twebfontlogo",
    "title": "Web Font Logo",
    "category": "Templates",
    "reviewed": "2021-04-04",
    "video": "",
    "deployed": ""
  },
  {
    "value": "tshapesandframes",
    "title": "Shapes and Frames",
    "category": "Templates",
    "reviewed": "2021-04-04",
    "video": "",
    "deployed": ""
  },
  {
    "value": "tmeshpositions",
    "title": "Mesh Positions",
    "category": "Templates",
    "reviewed": "2021-04-04",
    "video": "",
    "deployed": ""
  },
  {
    "value": "tlightsfun",
    "title": "Lights Fun",
    "category": "Templates",
    "reviewed": "2021-05-28",
    "video": "",
    "deployed": ""
  },
  {
    "value": "tcameraanimations",
    "title": "Camera Animations",
    "category": "Templates",
    "reviewed": "2021-05-28",
    "video": "",
    "deployed": ""
  },
  {
    "value": "tredvideo",
    "title": "Red Video",
    "category": "Templates",
    "reviewed": "2021-05-28",
    "video": "",
    "deployed": "https://dedicateddemos.web.app/view/?name=Red%20Video%20Tutorial"
  },
  {
    "value": "tbluevideo",
    "title": "Blue Video",
    "category": "Templates",
    "reviewed": "2021-05-28",
    "video": "",
    "deployed": "https://dedicateddemos.web.app/view/?name=Blue%20Video%20Tutorial"
  },
  {
    "value": "tdivebarmeshes",
    "title": "Dive Bar Meshes",
    "category": "Templates",
    "reviewed": "2021-05-11",
    "video": "",
    "deployed": "https://dedicateddemos.web.app/view/?name=Dive%20Bar%20Assets%20Display"
  },
  {
    "value": "tbarinteriorkit",
    "title": "Bar Interior Kit",
    "category": "Templates",
    "reviewed": "2021-05-28",
    "video": "",
    "deployed": "https://dedicateddemos.web.app/view/?name=Beer%20Display"
  },
  {
    "value": "shortcolorvideos",
    "title": "Color Videos",
    "category": "Templates",
    "reviewed": "2021-03-28",
    "video": "https://hcwebflow.s3-us-west-2.amazonaws.com/videos/template/shortvideogreen.webm",
    "deployed": ""
  },
  {
    "value": "spinnerdiagram",
    "title": "Spinner",
    "category": "Templates",
    "reviewed": "2021-03-28",
    "video": "",
    "deployed": ""
  },
  {
    "value": "webappdiagram",
    "title": "App Diagram",
    "category": "Templates",
    "reviewed": "2021-05-28",
    "video": "https://hcwebflow.s3-us-west-2.amazonaws.com/videos/template/webglapp.webm",
    "deployed": ""
  },
  {
    "value": "videopickerexample",
    "title": "Video Picker",
    "category": "Templates",
    "reviewed": "2021-03-28",
    "video": "https://hcwebflow.s3-us-west-2.amazonaws.com/videos/videopickerexample.mp4",
    "deployed": "https://dedicateddemos.web.app/view/?name=Video%20Picker"
  },
  {
    "value": "videotexture",
    "title": "Video Texture",
    "category": "Templates",
    "reviewed": "2021-05-28",
    "video": "https://hcwebflow.s3-us-west-2.amazonaws.com/videos/template/videotextureplay.webm",
    "deployed": "https://dedicateddemos.web.app/view/?name=Video%20Texture"
  },
  {
    "value": "tfruitstands",
    "title": "Fruit Stands",
    "category": "Templates",
    "reviewed": "2021-05-28",
    "video": "",
    "deployed": ""
  }
];

//genItemPath('alphausers');

/*
  let helpDataList = helpListToHTMLAnchorList();
  let helpBody = helpDataList.html;
  let html = getTemplate(helpBody, 'Visual Tools Documentation', '', 'Visual Tools reference documentation');
  fs.writeFile('public/doc/index.html', html, err => {
  if (err) {
    console.error(err);
  }
  // file written successfully
});
*/

helpList.forEach(item => {
  genItemPath(item.value);
});

function genItemPath(item) {
  let data = fs.readFileSync(`public/docraw/${item}help.html`, 'utf8');

  let helpData = helpListToHTMLAnchorList(item);
  let helpList = helpData.data;
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
  let html = getTemplate(data, title, item, desc, helpData.options, helpItem.video, helpItem.reviewed, helpItem.deployed, helpItem.value, true);

  if (!fs.existsSync(`public/doc/${item}`)){
      fs.mkdirSync(`public/doc/${item}`, { recursive: true });
  }

  fs.writeFile(`public/doc/${item}/index.html`, html, err => {
    if (err) {
      console.error(err);
    }
  });
}

function helpListToHTMLAnchorList(value) {
  let data = helpList;

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
    html += ` <a href="${i.video}" ${ i.video ? '' : 'style="display:none;"'} target="_blank"><i class="material-icons">ondemand_video</i></a>`;
    html += ` <a href="${i.deployed}" ${ i.deployed ? '' : 'style="display:none;"'} target="_blank"><i class="material-icons">animation</i></a>`;
    html += `</div>`;
    html += '</div>';

    options += `<option value="${i.value}" ${i.value === value ? 'selected' : ''}>${i.category}: ${i.title}</option>`;

    xml += `<url>
          <loc>https://handtop.com/doc/${i.value}</loc>
            <lastmod>${i.reviewed}</lastmod>
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

function getTemplate(helpBody, title, urlFrag, desc, helpOptions = '', video = '', reviewed = '', deployed = '', value = '', includeList = false) {
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

    listHTML += ` &nbsp; <a href="${video}" ${ video ? '' : 'style="display:none;"'} target="_blank"><i class="material-icons">ondemand_video</i></a>`;
    listHTML += ` &nbsp; <a href="${deployed}" ${ deployed ? '' : 'style="display:none;"'} target="_blank"><i class="material-icons">animation</i></a>`;

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

    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined">
    <!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-JGH67VM5RP"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'G-JGH67VM5RP');
    </script>
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
        <br>© 1998 - 2022 Handtop.
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
