'use strict';
window.addEventListener('load', () => new gPublishApp());
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

    this.a.profile.selectedWorkspace = workspace;
    this.a.initProjectModels(workspace);

    gAPPP.a.profile['selectedBlockKey' + workspace] = block;
    this.mV = new cViewPublished();
    this.a._activateModels();
    this.initialUILoad = false;
    this._updateApplicationStyle();
  }
}
