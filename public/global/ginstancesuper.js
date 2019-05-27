class gInstanceSuper {
  constructor(a) {
    window.gAPPP = this;
    this.storagePrefix = 'https://firebasestorage.googleapis.com/v0/b/husker-ac595.appspot.com/o/';
    this.styleProfileDom = null;
    this.activeContext = null;
    this.fontsAdded = {};
    this.lastStyleProfileCSS = '';
    this.cdnPrefix = 'https://s3-us-west-2.amazonaws.com/hcwebflow/';
    this.shapeTypes = [
      'box', 'cylinder', 'sphere', 'text', 'plane', 'torus', 'torusknot'
    ];
    this._initShapesList();

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
  async loadDataLists(name) {
    let rrr = await fetch(`/global/${name}.json`)
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
  handleDataUpdate() {
    this._handleDataUpdate();
  }
  profileReadyAndLoaded() {
    this.loadStarted = true;
    let wId = this.a.profile.selectedWorkspace;
    this.a.initProjectModels(wId);
    this.a._activateModels();
    this.initialUILoad = false;
    this._updateApplicationStyle();

    this.workspaceProcessed = false;
    gAPPP.a.workspaceLoadedCallback = () => this.workspaceLoaded(wId);
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
    let workspace = this.a.profile.selectedWorkspace;
    if (!workspace)
      workspace = 'default';
    return workspace;
  }
  _handleDataUpdate() {
    if (this.initialUILoad)
      return;

    this._updateApplicationStyle();
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
      this.loadDataLists('fontfamilydatalist');
      //allow fonts to reflow
      return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), 1);
      });
    }
  }
  _initShapesList() {
    this._domShapeList = document.createElement('datalist');
    this._domShapeList.id = 'applicationdynamicshapelistlookuplist';

    let innerHTML = '';
    for (let i in this.shapeTypes)
      innerHTML += '<option>' + this.shapeTypes[i] + '</option>';
    this._domShapeList.innerHTML = innerHTML;

    document.body.appendChild(this._domShapeList);
  }
  _updateApplicationStyle() {
    let canvasColor = gAPPP.a.profile.canvasColor;
    if (!canvasColor)
      canvasColor = '';
    let bkg = GLOBALUTIL.color(canvasColor);
    let bkgColor = GLOBALUTIL.colorRGB255(canvasColor);
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
      boundsBack
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

    .app-panel, .app-border, .app-control {
      border-style: outset;
      border-radius: 1em;
    }


    .tabulator .tabulator-header .tabulator-col {
      background: ${ctlColor};
    }

    .tabulator .tabulator-header .tabulator-col.tabulator-frozen {
      background: ${bkgColor};
    }

    .tabulator .tabulator-cell {
      background: ${bkgColor};
    }

    .tabulator-row .tabulator-cell.tabulator-row-handle .tabulator-row-handle-box .tabulator-row-handle-bar {
      background: ${foreColor}
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
      }`;
    }

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
    <br>
  </div>
</div>`;
    /*
        <label><input id="sign-in-by-email-link" name="email" type="email" style="width:14em;" placeholder="Email (no password)"></label>
        <button id="sign-in-email-button" class="btn btn-primary">Send Link</button>
    */
  }
}
