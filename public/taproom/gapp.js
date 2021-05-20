class gTapRoomApp extends gInstanceSuper {
  constructor() {
    super();
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE)
      .then(() => this.a.signInAnon());

    this._loadDataLists('fontfamilydatalist')
  }
  async profileReadyAndLoaded() {
    this.loadStarted = true;

    let urlParams = new URLSearchParams(window.location.search);

    let name = urlParams.get('name');
    let nameWid = null;
    if (name) {
      let csvImport = await new gCSVImport();
      nameWid = await csvImport.widForName(name);

      if (!nameWid) {
        this.mV = new cTapRoomView();
        this._updateApplicationStyle();
        this.mV.noProjectFoundCanvas.style.display = '';

        gAPPP.a.modelSets['projectTitles'].childListeners.push((values, type, fireData) => setTimeout(() => window.location.reload(), 1000));
        return;
      }
    }

  let nameWid = null;

    let workspace = urlParams.get('w');
    if (!workspace)
      workspace = urlParams.get('wid');
    this.blockId = urlParams.get('b');
    let workspaceCode = urlParams.get('z');
    this.blockCode = urlParams.get('y');

    if (workspaceCode) {
      let data = gAPPP.a.modelSets['projectTitles'].getValuesByFieldLookup('tags', workspaceCode);
      if (data)
        workspace = gAPPP.a.modelSets['projectTitles'].lastKeyLookup;
    }

    if (!nameWid)
      if (workspace)
        nameWid = workspace;
    if (nameWid)
      this.loadedWID = nameWid;
    else
      this.loadedWID = workspace;
    this.a.profile.selectedWorkspace = this.loadedWID;
    super.profileReadyAndLoaded();
  }
  async workspaceLoaded(wId) {
    await super.workspaceLoaded(wId);
    if (this.blockCode) {
      let data = gAPPP.a.modelSets['block'].getValuesByFieldLookup('blockCode', this.blockCode);
      if (data)
        this.blockId = gAPPP.a.modelSets['block'].lastKeyLookup;
    }

    if (!this.blockId) {
      this.blockId = gAPPP.a.modelSets['block'].getIdByFieldLookup('blockCode', 'demo');
    }

    gAPPP.a.profile['selectedBlockKey' + wId] = this.blockId;
    gAPPP.blockInURL = this.blockId;
    this.mV = new cTapRoomView();
    this._updateApplicationStyle();
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
