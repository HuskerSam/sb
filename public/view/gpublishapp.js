class gPublishApp extends gInstanceSuper {
  constructor() {
    super();
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE)
      .then(() => this.a.signInAnon());
  }
  async profileReadyAndLoaded() {
    this.loadStarted = true;

    let urlParams = new URLSearchParams(window.location.search);

    let name = urlParams.get('name');
    let nameWid = null;
    if (name) {
      let csvImport = await new gCSVImport();
      nameWid = await csvImport.widForName(name);
    }


    let workspace = urlParams.get('w');
    let block = urlParams.get('b');
    let workspaceCode = urlParams.get('z');
    let blockCode = urlParams.get('y');

    if (workspaceCode) {
      let data = gAPPP.a.modelSets['projectTitles'].getValuesByFieldLookup('tags', workspaceCode);
      if (data)
        workspace = gAPPP.a.modelSets['projectTitles'].lastKeyLookup;
    }
    if (nameWid)
      this.loadedWID = nameWid;
    else
      this.loadedWID = workspace;
    workspace = this.loadedWID;
    this.a.initProjectModels(this.loadedWID);

    this.a._activateModels();
    this.initialUILoad = false;

    gAPPP.a.workspaceLoadedCallback = () => {
      if (blockCode) {
        let data = gAPPP.a.modelSets['block'].getValuesByFieldLookup('blockCode', blockCode);
        if (data)
          block = gAPPP.a.modelSets['block'].lastKeyLookup;
      }

      if (!block) {
        block = gAPPP.a.modelSets['block'].getIdByFieldLookup('blockCode', 'demo');
      }

      gAPPP.a.profile['selectedBlockKey' + workspace] = block;
      gAPPP.blockInURL = block;
      this.mV = new cViewPublished();
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
