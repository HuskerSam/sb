class gGeoApp extends gInstanceSuper {
  constructor() {
    super();
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE)
      .then(() => this.a.signInAnon());
  }
  profileReadyAndLoaded() {
    this.loadStarted = true;

    let data = gAPPP.a.modelSets['projectTitles'].getValuesByFieldLookup('tags', 'demo');
    let workspace = '';
    if (data)
      workspace = gAPPP.a.modelSets['projectTitles'].lastKeyLookup;

    this.loadedWID = workspace;
    this.a.initProjectModels(workspace);

    this.a._activateModels();
    this.initialUILoad = false;

    gAPPP.a.workspaceLoadedCallback = () => {
      let data = gAPPP.a.modelSets['block'].getValuesByFieldLookup('blockCode', 'demo');
      let block = '';
      if (data)
        block = gAPPP.a.modelSets['block'].lastKeyLookup;

      gAPPP.a.profile['selectedBlockKey' + workspace] = block;
      gAPPP.blockInURL = block;
      this.mV = new cGeoView();
      this.mV.initBlockKey = block;
      this._updateApplicationStyle();
    };
  }
  _loginPageTemplate(title = `Dynamic Reality App`) {
    return `<div id="firebase-app-login-page" style="display:none;">Loading...</div>`;
  }
  initializeAuthUI() {
    let div = document.createElement('div');
    div.innerHTML = this._loginPageTemplate('eXtended Reality Viewer');
    div = div.firstChild;
    document.body.insertBefore(div, document.body.firstChild);
  }
}
