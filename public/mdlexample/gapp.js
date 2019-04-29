class gApp extends gInstanceSuper {
  constructor() {
    super();
  }
  profileReadyAndLoaded() {
    this.loadStarted = true;
    let workspace = this.a.profile.selectedWorkspace;
    this.a.initProjectModels(workspace);
    this.a._activateModels();
    this.initialUILoad = false;

    this.workspaceProcessed = false;
    gAPPP.a.workspaceLoadedCallback = () => {
      if (this.workspaceProcessed) return;

      this.workspaceProcessed = true;
      gAPPP.a.profile['selectedBlockKey' + workspace] = gAPPP.a.modelSets['block'].getIdByFieldLookup('blockCode', 'demo');

      this.layoutMode = gAPPP.a.profile.mdlAppLayoutMode;
      this.mV = new cView();
      this._updateApplicationStyle();
    };
  }
  _updateApplicationStyle() {

  }
  _initAuthUI() {
    this.authUIInited = true;
    let div = document.createElement('div');
    div.innerHTML = this._loginPageTemplate('MDL Example');
    div = div.firstChild;
    document.body.insertBefore(div, document.body.firstChild);
    document.querySelector('#sign-in-button').addEventListener('click', e => gAPPP.a.signIn(), false);
    this.emailBtn = document.querySelector('#sign-in-email-button');
    this.emailBtn.addEventListener('click', e => {
      let email = document.querySelector('#sign-in-by-email-link').value;
      gAPPP.a.signInByEmail(email);
      this.emailBtn.innerHTML = 'Email Sent';
      setTimeout(() => this.emailBtn.innerHTML = 'Send Link', 5000);
    }, false);
  }
  updateAppLayout() {
    let div = document.createElement('div');
    div.innerHTML = this._fullLayout();
    div = div.firstChild;
    document.body.insertBefore(div, document.body.firstChild);


    console.log('1', this.layoutMode);
////    if (this.layoutMode === 'horizontal')
  //    return this._horizontalLayout();

//    return this._fullLayout();
  }
  _fullLayout() {
    return `<div id="firebase-app-main-page" style="display:none;">
      <div id="renderLoadingCanvas" style="display:none;"><br><br>Working...</div>
      <div id="main-view-wrapper">
        <div class="popup-canvas-wrapper main-canvas-wrapper"></div>
      </div>
    </div>`;
  }
  _horizontalLayout() {
    return ``;
  }
  _verticalLayout() {
    return ``;
  }
}
