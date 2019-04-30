class gInstanceSuper {
  constructor(a) {
    window.gAPPP = this;
    this.storagePrefix = 'https://firebasestorage.googleapis.com/v0/b/husker-ac595.appspot.com/o/';
    this.styleProfileDom = null;
    this.activeContext = null;
    this.lastStyleProfileCSS = '';
    this.cdnPrefix = 'https://s3-us-west-2.amazonaws.com/hcwebflow/';
    this.publishURL = '/view/'
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
  get dialogs() {
    return this.mV.dialogs;
  }
  handleDataUpdate() {
    this._handleDataUpdate();
  }
  profileReadyAndLoaded() {
    this.loadStarted = true;
    let wId = this.a.profile.selectedWorkspace;
    this.a.initProjectModels(wId);
    this.a._activateModels();
    this.initialUILoad = false;

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

    if (this.a.profile.showDelete) {
      css += '.band-background-preview .delete-edit-panel-button { display: inline-block; }';
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

    <label><input id="sign-in-by-email-link" name="email" type="email" style="width:14em;" placeholder="Email (no password)"></label>
    <button id="sign-in-email-button" class="btn btn-primary">Send Link</button>
  </div>
</div>`;
  }
}
