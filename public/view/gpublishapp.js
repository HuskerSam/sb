'use strict';
class gPublishApp extends gAppSuper  {
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
    let workspaceCode = urlParams.get('z');
    let blockCode = urlParams.get('y');

    if (workspaceCode) {
      let data = gAPPP.a.modelSets['projectTitles'].getValuesByFieldLookup('code', workspaceCode);
      if (data)
        workspace = gAPPP.a.modelSets['projectTitles'].lastKeyLookup;
    }
    this.a.profile.selectedWorkspace = workspace;
    this.a.initProjectModels(workspace);

    this.a._activateModels();
    this.initialUILoad = false;

    gAPPP.a.workspaceLoadedCallback = () => {
      if (blockCode) {
        let data = gAPPP.a.modelSets['block'].getValuesByFieldLookup('blockCode', blockCode);
        if (data)
          block = gAPPP.a.modelSets['block'].lastKeyLookup;
      }

      gAPPP.a.profile['selectedBlockKey' + workspace] = block;
      this.mV = new cViewPublished();
      this._updateApplicationStyle();
    };
  }
}
