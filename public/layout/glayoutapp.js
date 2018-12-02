'use strict';
class gLayoutApp extends gAppSuper {
  constructor() {
    super();
    this.a = new gAuthorization();
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
    this.a.signInAnon();
  }
  profileReadyAndLoaded() {
    this.loadStarted = true;
    let blockCode = 'demo';
    let workspace = gAPPP.a.modelSets['projectTitles'].getIdByFieldLookup('code', 'Week 1');

    this.a.profile.selectedWorkspace = workspace;
    this.a.initProjectModels(workspace);

    this.a._activateModels();
    this.initialUILoad = false;

    this.workspaceProcessed = false;
    gAPPP.a.workspaceLoadedCallback = () => {
      if (this.workspaceProcessed) return;

      this.workspaceProcessed = true;
      gAPPP.a.profile['selectedBlockKey' + workspace] = gAPPP.a.modelSets['block'].getIdByFieldLookup('blockCode', 'demo');

      this.mV = new cViewLayout();
      this._updateApplicationStyle();
    };
  }
}
