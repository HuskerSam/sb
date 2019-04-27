'use strict';
class gApp extends gAppSuper {
  constructor() {
    super();
    this.loadingView = document.getElementById('loadingview');
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

      this.mV = new cView();
      this._updateApplicationStyle();
    };
  }
  _updateApplicationStyle() {

  }
  _initAuthUI() {
    let div = document.createElement('div');
    div.innerHTML = this._loginPageTemplate('MDL Example');
    div = div.firstChild;
    document.body.insertBefore(div, document.body.firstChild);
    this.updateAppLayout();
    this.__initFormHandlers();
    this.loadingView.style.display = 'none';
  }
  __initFormHandlers() {
    document.querySelector('#sign-in-button').addEventListener('click', e => gAPPP.a.signIn(), false);
    this.emailBtn = document.querySelector('#sign-in-email-button');
    this.emailBtn.addEventListener('click', e => {
      let email = document.querySelector('#sign-in-by-email-link').value;
      gAPPP.a.signInByEmail(email);
      this.emailBtn.innerHTML = 'Email Sent';
      setTimeout(() => this.emailBtn.innerHTML = 'Send Link', 5000);
    }, false);
  }
}
