'use strict';
window.addEventListener('load', () => new gPublishApp());
class gPublishApp extends gAppSuper  {
  constructor() {
    super();
    this.a = new gAuthorization();
    this.a.signInAnon();
  }
  profileReadyAndLoaded() {
    this.loadStarted = true;
    this.a.profile.selectedWorkspace = '-L68zu9XhDvRv4Ovarit';
    this.a.initProjectModels('-L68zu9XhDvRv4Ovarit');

    gAPPP.a.profile['selectedBlockKey' + '-L68zu9XhDvRv4Ovarit'] = '-L69-1-gFwtSDsmFvgbv';
    this.mV = new cViewPublished();
    this.a._activateModels();
    this.initialUILoad = false;
    this._updateApplicationStyle();

//    this.initialBlockLoad = true;
  }
}
