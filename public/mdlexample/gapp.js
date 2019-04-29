class gApp extends gInstanceSuper {
  constructor() {
    super();
  }
  workspaceLoaded(wId) {
    if (this.workspaceProcessed) return;

    this.workspaceProcessed = true;
    gAPPP.a.profile['selectedBlockKey' + wId] = gAPPP.a.modelSets['block'].getIdByFieldLookup('blockCode', 'demo');

    this.mV = new cView(gAPPP.a.profile.mdlAppLayoutMode, 'shape', null, true);
    this._updateApplicationStyle();
  }
  _updateApplicationStyle() {}
  initializeAuthUI() {
    this.authUIInited = true;
    let div = document.createElement('div');
    div.innerHTML = this._loginPageTemplate('MDL Example');
    div = div.firstChild;
    document.body.insertBefore(div, document.body.firstChild);
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
