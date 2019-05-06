class gInstanceSuper {
  constructor(a) {
    window.gAPPP = this;
    this.storagePrefix = 'https://firebasestorage.googleapis.com/v0/b/husker-ac595.appspot.com/o/';
    this.styleProfileDom = null;
    this.activeContext = null;
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
  loadDataLists(name) {
    return fetch(`/global/${name}.json`)
      .then(rrr => rrr.json())
      .then(json => {
        let list = document.getElementById(name);
        if (!list) {
          list = document.createElement('datalist');
          list.setAttribute('id', name);
          document.body.appendChild(list);
        }
        let outHtml = '';
        for (let c = 0, l = json.length; c < l; c++)
          outHtml += `<option>${json[c]}</option>`
        list.innerHTML = outHtml;
      });
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
  workspaceLoaded(workspaceId) {}
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
    let css = '* { ';
    let fontSize = this._parseFontSize(this.a.profile.fontSize);
    css += 'font-size:' + fontSize.toString() + 'pt;';
    if (this.a.profile.fontFamily)
      css += 'font-family:' + this.a.profile.fontFamily + ';';
    css += '}';

    let bkgColor = 'rgb(255, 245, 220)';
    let foreColor = 'rgb(50, 50, 50)';
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
      border: solid 2px ${bkgColor};
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

    <label><input id="sign-in-by-email-link" name="email" type="email" style="width:14em;" placeholder="Email (no password)"></label>
    <button id="sign-in-email-button" class="btn btn-primary">Send Link</button>
  </div>
</div>`;
  }
}
