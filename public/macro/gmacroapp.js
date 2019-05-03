class gMacroApp extends gInstanceSuper {
  constructor() {
    super();

    this.loadDataLists('sbimageslist').then(() => {});
    this.loadDataLists('sbmesheslist').then(() => {});
    this.loadDataLists('skyboxlist').then(() => {});
    this.loadDataLists('fontfamilydatalist').then(() => {});
  }
  workspaceLoaded(wId) {
    if (this.workspaceProcessed) return;
    this.workspaceProcessed = true;
    let urlParams = new URLSearchParams(window.location.search);
    let layoutMode = urlParams.get('layoutmode');
    if (!layoutMode)
      layoutMode = gAPPP.a.profile.formLayoutMode;
    this.mV = new cMacroView(layoutMode, urlParams.get('tag'), urlParams.get('key'), urlParams.get('childkey'));
  }
  initializeAuthUI() {
    this.authUIInited = true;
    let div = document.createElement('div');
    div.innerHTML = this._loginPageTemplate('Scene Builder Macros');
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
