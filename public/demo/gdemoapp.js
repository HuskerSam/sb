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

    let urlParams = new URLSearchParams(window.location.search);
    let workspace = urlParams.get('w');
    let block = urlParams.get('b');
    this.workspaceCode = urlParams.get('z');
    let blockCode = urlParams.get('y');

    blockCode = 'demo';

    if (!this.workspaceCode)
      this.workspaceCode = 'Week 1';
    if (this.workspaceCode) {
      let data = gAPPP.a.modelSets['projectTitles'].getValuesByFieldLookup('code', this.workspaceCode);
      if (data)
        workspace = gAPPP.a.modelSets['projectTitles'].lastKeyLookup;
    }
    this.a.profile.selectedWorkspace = workspace;
    this.a.initProjectModels(workspace);

    this.a._activateModels();
    this.initialUILoad = false;

    this.workspaceProcessed = false;
    gAPPP.a.workspaceLoadedCallback = () => {
      if (this.workspaceProcessed)
        return;
      this.workspaceProcessed = true;

      if (blockCode) {
        let data = gAPPP.a.modelSets['block'].getValuesByFieldLookup('blockCode', blockCode);
        if (data)
          block = gAPPP.a.modelSets['block'].lastKeyLookup;
      }

      gAPPP.a.profile['selectedBlockKey' + workspace] = block;

      this.mV = new cViewDemo();
      this._updateApplicationStyle();
    };
  }
}
