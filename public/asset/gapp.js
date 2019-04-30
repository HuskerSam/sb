class gApp extends gInstanceSuper {
  constructor() {
    super();
    window.addEventListener('popstate', () => {
      let urlParams = new URLSearchParams(window.location.search);
      if (this.mV) {
        if (this.mV.tag !== urlParams.get('tag')) {
          this.mV.key = urlParams.get('key');
          this.mV.dataview_record_tag.value = urlParams.get('tag');
          this.mV.updateRecordList();
        } else if (this.mV.key !== urlParams.get('key')) {
          this.mV.dataview_record_key.value = urlParams.get('key');
          this.mV.updateSelectedRecord().then(() => {});
        }
      }
    });
  }
  workspaceLoaded(wId) {
    if (this.workspaceProcessed) return;
    this.workspaceProcessed = true;
    let urlParams = new URLSearchParams(window.location.search);
    this.mV = new cView(gAPPP.a.profile.mdlAppLayoutMode, urlParams.get('tag'), urlParams.get('key'));
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
