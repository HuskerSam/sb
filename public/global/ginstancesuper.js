class cAppDefaults {
  constructor() {
    this.fontsAdded = {};
    this.storagePrefix = 'https://firebasestorage.googleapis.com/v0/b/husker-ac595.appspot.com/o/';
    this.cdnPrefix = 'https://s3-us-west-2.amazonaws.com/hcwebflow/';
    this.shapeTypes = [
      'box', 'cylinder', 'sphere', 'text', 'plane', 'torus', 'torusknot'
    ];
    this._domShapeList = document.createElement('datalist');
    this._domShapeList.id = 'applicationdynamicshapelistlookuplist';
    this.jsonLibPrefix = '';

    let innerHTML = '';
    for (let i in this.shapeTypes)
      innerHTML += '<option>' + this.shapeTypes[i] + '</option>';
    this._domShapeList.innerHTML = innerHTML;

    document.body.appendChild(this._domShapeList);
  }
  async _loadDataLists(name) {
    let rrr = await fetch(`${this.jsonLibPrefix}/assetlist/${name}.json`)
    let json = await rrr.json();

    let list = document.getElementById(name);
    if (!list) {
      list = document.createElement('datalist');
      list.setAttribute('id', name);
      document.body.appendChild(list);
    }
    let outHtml = '';
    for (let c = 0, l = json.length; c < l; c++)
      outHtml += `<option>${json[c]}</option>`;

    if (name === 'fontfamilydatalist') {
      Object.keys(this.fontsAdded).forEach(font => outHtml = `<option>${font}</option>` + outHtml);
    }

    list.innerHTML = outHtml;

    return;
  }
  async loadPickerData() {
    let listsHTML = `<datalist id="framecommandoptionslist">
            <option>Set</option>
            <option>GSet</option>
            <option>Animation</option>
            <option>Video</option>
            <option>Audio</option>
            <option>Function</option>
            <option>Camera</option>
          </datalist>
          <datalist id="framecommandfieldslist">
            <option>videoURL</option>
            <option>videoHeight</option>
            <option>videoWidth</option>
            <option>fogType</option>
            <option>fogDensity</option>
            <option>skybox</option>
            <option>groundMaterial</option>
            <option>material</option>
            <option>play</option>
            <option>pause</option>
            <option>stop</option>
            <option>position</option>
            <option>target</option>
          </datalist>
          <datalist id="blockchildtypelist">
            <option>block</option>
            <option>mesh</option>
            <option>shape</option>
            <option>light</option>
            <option>camera</option>
          </datalist>
          <datalist id="htmlvideosourcelist">
            <option>video/webm</option>
            <option>video/mp4</option>
            <option>video/ogg</option>
          </datalist>
          <datalist id="fogtypelist">
            <option>none</option>
            <option>EXP</option>
            <option>EXP2</option>
            <option>LINEAR</option>
          </datalist>
          <datalist id="lightsourceslist">
            <option>Point</option>
            <option>Directional</option>
            <option>Spot</option>
            <option>Hemispheric</option>
          </datalist>
          <datalist id="camerasourceslist">
            <option>UniversalCamera</option>
            <option>ArcRotate</option>
            <option>FollowCamera</option>
            <option>DeviceOrientationCamera</option>
            <option>WebVRFreeCamera</option>
          </datalist>`;
    let div = document.createElement('div');
    div.innerHTML = listsHTML;
    div.style.display = 'none';
    document.body.appendChild(div);
    return await Promise.all([
      this._loadDataLists('sbimageslist'),
      this._loadDataLists('sbstoreimageslist'),
      this._loadDataLists('sbmesheslist'),
      this._loadDataLists('skyboxlist'),
      this._loadDataLists('fontfamilydatalist')
    ]);
  }
  async loadTextures() {
    this.texturesFromFile = [];
    let promises = [];
    promises.push(this.loadTextureList(`${this.jsonLibPrefix}/assetlist/floorlist.json`, 'floorTexturesDataList'));
    promises.push(this.loadTextureList(`${this.jsonLibPrefix}/assetlist/walllist.json`, 'wallTexturesDataList'));
    promises.push(this.loadTextureList(`${this.jsonLibPrefix}/assetlist/texturelist.json`, 'textureTexturesDataList'));
    promises.push(this.loadTextureList(`${this.jsonLibPrefix}/assetlist/normallist.json`, 'normalTexturesDataList'));
    promises.push(this.loadTextureList(`${this.jsonLibPrefix}/assetlist/groundlist.json`, 'groundTexturesDataList'));

    await Promise.all(promises);

    await this.loadMeshes();

    return null;
  }
  async loadTextureList(url, listid) {
    let fetched = await fetch(url);
    let data = await fetched.json();

    if (!data)
      return [];
    let list = [];
    data.forEach(i =>      {
      this.texturesFromFile[i.path] = i;
      list.push(i.path);
    });
    this.appendDataList(listid, list, []);

    return data;
  }
  async loadMeshes() {
    this.meshesDetails = [];
    let meshesResponse = await fetch(`${this.jsonLibPrefix}/assetlist/meshes.json`)
    let text = await meshesResponse.text();
    let meshesJson = JSON.parse(text);
    this.meshesPaths = [];
    for (let c = 0, l = meshesJson.length; c < l; c++) {
      this.meshesDetails.push(meshesJson[c]);
      this.meshesPaths.push(meshesJson[c].meshpath);
    }

    this.appendDataList('meshesDefaultsDataList', this.meshesPaths, []);

    return;
  }
  appendDataList(listid, options, defaults = ['color: 1,1,1']) {
    let currentList = document.getElementById(listid);
    if (currentList)
      currentList.remove();

    currentList = document.createElement('datalist');
    currentList.id = listid;

    let outHtml = '';
    for (let c = 0, l = defaults.length; c < l; c++)
      outHtml += `<option>${defaults[c]}</option>`;

    for (let c = 0, l = options.length; c < l; c++)
      outHtml += `<option>${options[c]}</option>`;

    currentList.innerHTML = outHtml;
    document.body.appendChild(currentList);
  }
  async updateHelpView(helpTag, dom) {
    if (this.help_topic_picker_select) {
      this.help_topic_picker_select.value = helpTag;
    }
    let rawHelpTag = helpTag;

    if (helpTag === 'texture')
      helpTag = 'material';
    if (helpTag !== '')
      helpTag += 'help';
    else
      helpTag = 'overview';
    let res = await fetch(`${this.jsonLibPrefix}/docraw/${helpTag}.html`, {
      cache: "no-cache"
    })
    let html = await res.text();

    if (dom)
      dom.innerHTML = html;

    if (this.helpViewCallback)
      this.helpViewCallback(rawHelpTag, dom);

    return html;
  }
}

class gInstanceSuper extends cAppDefaults {
  constructor() {
    super();
    window.gAPPP = this;
    this.styleProfileDom = null;
    this.activeContext = null;
    this.lastStyleProfileCSS = '';

    window.addEventListener("resize", () => this.resize());
    firebase.database().ref('/.info/serverTimeOffset').once('value').then((data) => this.serverOffsetTime = data.val());

    this.initialUILoad = true;

    this.initializeAuthUI();
    let div = document.createElement('div');
    div.id = 'firebase-app-main-page';
    document.body.insertBefore(div, document.body.firstChild);

    this.a = new gAuthorization();
    this.a.signInWithURL();
    this.a.updateAuthUICallback = () => this.updateAuthUI();
  }
  updateAuthUI() {
    let loginPage = document.getElementById('firebase-app-login-page');
    let mainPage = document.getElementById('firebase-app-main-page');

    if (this.a.loggedIn) {
      loginPage.style.display = 'none';
      mainPage.style.display = 'flex';
    } else {
      loginPage.style.display = 'block';
      mainPage.style.display = 'none';
    }
  }
  initializeAuthUI() {}
  profileReadyAndLoaded() {
    this.loadStarted = true;

    if (!this.loadedWID) {
      let wId = this.a.profile.selectedWorkspace;
      if (!wId)
        wId = 'default';
      this.loadedWID = wId;
    }
    this.a.initProjectModels(this.loadedWID);
    this.a._activateModels();
    this.initialUILoad = false;
    this._updateApplicationStyle();

    this.workspaceProcessed = false;
    gAPPP.a.workspaceLoadedCallback = () => this.workspaceLoaded(this.loadedWID);
  }
  async workspaceLoaded(workspaceId) {
    await this._updateGoogleFonts();
    return;
  }
  profileReady() {
    if (!this.initialUILoad)
      return;
    if (this.loadStarted)
      return;
    if (this.profileLoaded && this.workspaceListLoaded) {
      this.profileReadyAndLoaded();
    }
  }
  get workspace() {
    let workspace = this.loadedWID;
    if (!workspace)
      workspace = 'default';
    return workspace;
  }
  resize() {
    if (this.activeContext)
      this.activeContext.engine.resize();
  }
  _parseFontSize(str) {
    if (str === undefined)
      str = '';
    let size = parseFloat(str);
    if (isNaN(size))
      size = 9;
    if (size < 7)
      size = 7;
    if (size > 22)
      size = 22;
    return size;
  }
  async _updateGoogleFonts() {
    let editInfoBlocks = gAPPP.a.modelSets['block'].queryCache('blockFlag', 'googlefont');
    let fontLoaded = false;
    for (let id in editInfoBlocks) {
      let fontName = editInfoBlocks[id].genericBlockData;
      let origFontName = fontName;
      fontName = fontName.replace(/ /g, '+');

      if (!this.fontsAdded[origFontName]) {
        this.fontsAdded[origFontName] = true;
        let newLink = document.createElement('style');
        newLink.innerHTML = `@import url(https://fonts.googleapis.com/css?family=${fontName});`;
        document.body.append(newLink);
        let newSpan = document.createElement('span');
        newSpan.setAttribute('style', `font-family:${origFontName}`);
        document.body.append(newSpan);
        let a = newSpan.offsetHeight;
        newSpan.style.display = 'none';
        fontLoaded = true;
      }
    }

    if (fontLoaded) {
      this._loadDataLists('fontfamilydatalist');
      //allow fonts to reflow
      return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), 100);
      });
    }
  }
  __genBaseAppStyle() {
    let canvasColor = gAPPP.a.profile.canvasColor;
    if (!canvasColor)
      canvasColor = '';
    let opacityLevel = gAPPP.a.profile.opacityLevel;
    if (!opacityLevel)
      opacityLevel = .5;

    let bkg = GLOBALUTIL.color(canvasColor);
    let bkgColor = GLOBALUTIL.colorRGB255(canvasColor);
    let bkgColorTransparent = bkgColor.replace('rgb(', '');
    bkgColorTransparent = bkgColorTransparent.replace(')', '');
    bkgColorTransparent = 'rgba(' + bkgColorTransparent + ',' + opacityLevel.toString() + ')';
    let foreColor = 'rgb(50, 50, 50)';
    let boundsLines = '.1,.1,.1';
    let boundsBack = '.9,.9,.9';
    let ctlColor = 'rgb(250, 250, 250)';
    let ctlHalfColor = 'rgba(250, 250, 250, .7)';
    let niteMode = false;
    if ((bkg.r) + (bkg.b) + (2.5 * bkg.g) < 2) {
      let a = foreColor;
      foreColor = ctlColor;
      ctlHalfColor = 'rgba(50, 50, 50, .7)';
      ctlColor = a;
      niteMode = true;
      boundsBack = '.1,.1,.1';
      boundsLines = '.9,.9,.9';
    }
    this.appStyleDetails = {
      foreColor,
      bkgColor,
      ctlColor,
      ctlHalfColor,
      niteMode,
      boundsLines,
      boundsBack,
      opacityLevel
    };

    let css = '* { ';
    let fontSize = this._parseFontSize(this.a.profile.fontSize);
    css += 'font-size:' + fontSize.toString() + 'pt;';
    if (this.a.profile.fontFamily)
      css += 'font-family:' + this.a.profile.fontFamily + ';';
    css += `color:${foreColor};
      background: transparent;
    }

    select, input, button, textarea, .app-control {
      background-color: ${ctlColor};
      border-radius: .5em;
      border-color: rgb(200, 200, 200);
    }

    .app-panel {
      background: ${bkgColor};
    }

    .app-transparent {
      background: ${bkgColorTransparent};
    }

    .app-panel, .app-border, .app-control {
      border-style: outset;
      border-radius: 1em;
    }

    .app-inverted, .app-inverted i {
      color: ${ctlColor};
      background: ${foreColor}
    }
    `;

    css += `#main-view-wrapper { background: ${bkgColor}}`;

    css += `
    ::-webkit-scrollbar {
      height: 24px;
      width: 24px;
      background: ${bkgColor};
    }

    ::-webkit-scrollbar-thumb {
      background: none;
      background-image: radial-gradient(${foreColor} 10%,
        ${bkgColor});
      border: solid .05em ${bkgColor};
      border-radius: 5ex;
    }

    ::-webkit-scrollbar-corner {
      background: ${bkgColor};
    }

    input[type=range] {
      -webkit-appearance: none;
      background: transparent;
      margin: 0;
    }

    input[type=range]::-webkit-slider-runnable-track {
      width: 100%;
      cursor: pointer;
      background: radial-gradient(${foreColor} 40%,
        ${bkgColor});
      height: 2.5em;
      border: solid .1em ${bkgColor};
      border-radius: .75em;
    }

    input[type=range]::-webkit-slider-thumb {
      height: 2.3em;
      width: 2em;
      -webkit-appearance: none;
      border-radius: .75em;
      border: none;
      background-image: linear-gradient(90deg,
        ${foreColor},
        ${bkgColor},
        ${foreColor});
    }`;

    css += `
    .gutter {
      background-image: linear-gradient(0deg,
        ${bkgColor},
        ${foreColor},
        ${bkgColor});
      background-size: 100% 100%;
      background-position: center;
      background-repeat: no-repeat;
      background-color: ${foreColor};
      border: solid 0px ${bkgColor};
      border-radius: 5ex;
      border-bottom-right-radius: 0;
      border-top-right-radius: 0;
    }

    .gutter.gutter-horizontal {
      background-image: linear-gradient(90deg,
        ${bkgColor},
        ${foreColor},
        ${bkgColor});
      cursor: ew-resize;
      margin-top: 0px;
      border-left: solid 0px ${bkgColor};
      background-size: 100% 100%;
      border-radius: 0;
    }`;

    if (niteMode) {
      css += `
      .app-panel, .app-border, button, select, .app-control, input  {
        border-style: solid;
        border-radius: 0;
      }

      input[type=range]::-webkit-slider-runnable-track {
        background: rgb(50, 50, 50);
        border: outset .1em silver;
        border-radius: .1em;
      }

      .form-group-container-group {
        border-radius: 0;
        border-style: solid;
      }

      input[type=range]::-webkit-slider-thumb {
        background: rgb(250, 250, 250);
        border-radius: .1em;
      }

      ::-webkit-scrollbar-thumb {
        background: none;
        background-image: radial-gradient(${foreColor} 10%,
          ${bkgColor} 35%,
        ${foreColor} 70%);
        border: solid .05em ${bkgColor};
        border-radius: .1em;
      }

      .gutter {
        background-image: linear-gradient(0deg,
          ${foreColor},
          ${bkgColor},
          ${foreColor},
          ${bkgColor},
          ${foreColor});
        background-color: ${foreColor};
        border: solid 0px ${bkgColor};
        border-radius: .05em;
        border-bottom-right-radius: 0;
        border-top-right-radius: 0;
      }

      .gutter.gutter-horizontal {
        background-image: linear-gradient(90deg,
          ${foreColor},
          ${bkgColor},
          ${foreColor},
          ${bkgColor},
          ${foreColor});
        cursor: ew-resize;
        margin-top: 0px;
        border-left: solid 0px ${bkgColor};
        background-size: 100% 100%;
        border-radius: 0;
      }

      .band-background-preview .img-holder {
        background-image: url(/images/addimage_nitemode.svg);
      }

      .workspace-asset-link-display .img-holder {
        background-image: url(/images/addimage_nitemode.svg);
      }
      `;
    }
    return css;
  }
  _updateApplicationStyle() {
    let css = this.__genBaseAppStyle();
    if (this.lastStyleProfileCSS === css)
      return;
    this.lastStyleProfileCSS = css;

    if (this.styleProfileDom !== null) {
      this.styleProfileDom.parentNode.removeChild(this.styleProfileDom);
    }

    this.styleProfileDom = document.createElement('style');
    this.styleProfileDom.innerHTML = css;
    document.body.appendChild(this.styleProfileDom);
    this.resize();
  }
  _loginPageTemplate(title = `Dynamic Reality App`) {
    return `<div id="firebase-app-login-page" style="display:none;">
  <h3>${title}</h3>
  <div>
    <button id="sign-in-button" class="btn btn-primary">Sign in with Google</button>
    <br>
    <label><input type="checkbox" id="stay_logged_in_with_google" checked /> login with google automatically</label>
    <br>
    <label><input id="sign-in-by-email-link" name="email" type="email" style="width:14em;" placeholder="Email (no password)"></label>
    <button id="sign-in-email-button" class="btn btn-primary">Send Link</button>
  </div>
</div>`;


  }
}
