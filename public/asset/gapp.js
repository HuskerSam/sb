class gApp extends gInstanceSuper {
  constructor() {
    super();
    window.addEventListener('popstate', () => {
      let urlParams = new URLSearchParams(window.location.search);
      if (this.mV) {
        if (this.mV.tag !== urlParams.get('tag')) {
          this.mV.dataview_record_tag.value = urlParams.get('tag');
          this.mV.updateRecordList(urlParams.get('key'));
        } else if (this.mV.key !== urlParams.get('key')) {
          this.mV.dataview_record_key.value = urlParams.get('key');
          this.mV.updateSelectedRecord().then(() => {});
        } else if (this.mV.childKey !== urlParams.get('childkey')) {
          this.mV.dataview_record_key.value = urlParams.get('childkey');
          this.mV.updateSelectedRecord().then(() => {});
        }
      }
    });
    this.loadDataLists('sbimageslist').then(() => {});
    this.loadDataLists('sbmesheslist').then(() => {});
    this.loadDataLists('skyboxlist').then(() => {});
    this.loadDataLists('fontfamilydatalist').then(() => {});
  }
  profileReadyAndLoaded() {
    let urlParams = new URLSearchParams(window.location.search);
    let newWid = urlParams.get('wid');
    if (newWid) {
      if (newWid !== this.a.profile.selectedWorkspace) {
        gAPPP.a.modelSets['userProfile'].commitUpdateList([{
          field: 'selectedWorkspace',
          newValue: newWid
        }]).then(() => {
          setTimeout(() => location.reload(), 100);
        });
        return;
      }
    }

    super.profileReadyAndLoaded();
  }
  workspaceLoaded(wId) {
    if (this.workspaceProcessed) return;
    this.workspaceProcessed = true;
    let urlParams = new URLSearchParams(window.location.search);
    let layoutMode = urlParams.get('layoutmode');
    if (!layoutMode)
      layoutMode = gAPPP.a.profile.formLayoutMode;
    this.mV = new cView(layoutMode, urlParams.get('tag'), urlParams.get('key'), urlParams.get('childkey'));
  }
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
