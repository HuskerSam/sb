class gApp extends gInstanceSuper {
  constructor() {
    super();
    window.addEventListener('popstate', () => {
      let urlParams = new URLSearchParams(window.location.search);
      if (this.mV) {
        let subView = urlParams.get('subview');
        let tag = urlParams.get('tag');
        let key = urlParams.get('key');

        if (!tag)
          tag = '';
        if (!key)
          key = '';
        if (this.mV.tag !== tag) {
          this.mV.dataview_record_tag.value = tag;
          this.mV.updateRecordList(key);
        } else if (this.mV.key !== key) {
          this.mV.dataview_record_key.value = key;
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
  async workspaceLoaded(wId) {
    await super.workspaceLoaded(wId);
    if (this.workspaceProcessed) return;
    this.workspaceProcessed = true;
    let urlParams = new URLSearchParams(window.location.search);
    let layoutMode = urlParams.get('layoutmode');
    if (!layoutMode)
      layoutMode = gAPPP.a.profile.formLayoutMode;
    let tag = urlParams.get('tag');
    let key = urlParams.get('key');
    let childkey = urlParams.get('childkey');
    let subview = urlParams.get('subview');
    this.mV = new cView(layoutMode, tag, key, childkey, subview);
  }
  initializeAuthUI() {
    this.authUIInited = true;
    let div = document.createElement('div');
    div.innerHTML = this._loginPageTemplate('Scene Builder Asset Editor');
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
