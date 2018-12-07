'use strict';
class gDemoApp extends gAppSuper {
  constructor() {
    super();
    this.a = new gAuthorization();
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
    this.a.signInAnon();
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

      this.mV = new cViewDemo();
      this._updateApplicationStyle();
      this.mV.updateProjectList(gAPPP.a.modelSets['projectTitles'].fireDataValuesByKey, gAPPP.a.profile.selectedWorkspace);
      this._updateApplicationStyle();
    };
  }
}
