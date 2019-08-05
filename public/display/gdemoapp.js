class gDemoApp extends gInstanceSuper {
  constructor() {
    super();
    this.filterActiveWorkspaces = true;
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE)
      .then(() => this.a.signInAnon());
  }
  profileReadyAndLoaded() {
    this.loadStarted = true;
    let workspace = this.a.profile.selectedWorkspace;

    let urlParams = new URLSearchParams(window.location.search);
    let newWid = urlParams.get('wid');
    if (newWid) {
      workspace = newWid;
      gAPPP.a.modelSets['userProfile'].commitUpdateList([{
        field: 'selectedWorkspace',
        newValue: newWid
      }]);
    }
    this.loadedWID = workspace;

    this.a.initProjectModels(workspace);
    this.a._activateModels();
    this.initialUILoad = false;

    this.workspaceProcessed = false;
    gAPPP.a.workspaceLoadedCallback = () => {
      if (this.workspaceProcessed) return;

      this.workspaceProcessed = true;
      gAPPP.a.profile['selectedBlockKey' + workspace] = gAPPP.a.modelSets['block'].getIdByFieldLookup('blockCode', 'demo');

      this.mV = new cViewDemo();
      this.mV.updateProjectList(gAPPP.a.modelSets['projectTitles'].fireDataValuesByKey, workspace, true);
      this._updateApplicationStyle();
    };
  }
  _loginPageTemplate(title = `Dynamic Reality App`) {
    return `<div id="firebase-app-login-page" style="display:none;">Loading...</div>`;
  }
  initializeAuthUI() {
    let div = document.createElement('div');
    div.innerHTML = this._loginPageTemplate('eXtended Reality Grafter');
    div = div.firstChild;
    document.body.insertBefore(div, document.body.firstChild);
  }
}
