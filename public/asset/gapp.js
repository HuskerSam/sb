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
          this.mV.updateSelectedRecord();
        }
      }
    });
    this.loadPickerData();
    this.loadTextures();

    firebase.auth().getRedirectResult().then(result => {
      if (!firebase.auth().currentUser)
        if (GLOBALUTIL.getCookie('autoGoogleLogin') === '1')
          if (!result.user)
            this.a.signIn(true);
    });
  }
  async profileReadyAndLoaded() {
    let urlParams = new URLSearchParams(window.location.search);

    let name = urlParams.get('name');
    let newWid = null;
    if (name) {
      let csvImport = await new gCSVImport();
      newWid = await csvImport.widForName(name);
    }

    if(!newWid)
      newWid = urlParams.get('wid');

    if (newWid) {
      if (newWid !== this.a.profile.selectedWorkspace) {
        await gAPPP.a.modelSets['userProfile'].commitUpdateList([{
          field: 'selectedWorkspace',
          newValue: newWid
        }]);
        this.a.profile.selectedWorkspace = newWid;
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
    document.querySelector('#sign-in-button').addEventListener('click', e => {
      let chkbox = document.getElementById('stay_logged_in_with_google');
      gAPPP.a.signIn(chkbox ? chkbox.checked : false);
    }, false);
    this.emailSignInButton = document.querySelector('#sign-in-email-button');
    if (this.emailSignInButton) {
      this.signInEmail = document.getElementById('sign-in-by-email-link');
      this.emailSignInButton.addEventListener('click', e => {
        let email = this.signInEmail.value;
        if (!email) {
          alert('email required');
          return;
        }
        gAPPP.a.signInByEmail(email);
      });
    }
  }
  async updateGenerateDataTimes() {
    let csvImport = new gCSVImport(gAPPP.loadedWID);
    let results = await Promise.all([
      csvImport.readProjectRawDataDate('assetRows'),
      csvImport.readProjectRawDataDate('sceneRows'),
      csvImport.readProjectRawDataDate('productRows'),
      csvImport.readProjectRawDataDate('animationGenerated')
    ]);
    this.assetRowsDate = results[0];
    this.assetRowsDateDisplay = (this.assetRowsDate) ? GLOBALUTIL.shortDateTime(gAPPP.assetRowsDate) : 'none';
    this.sceneRowsDate = results[1];
    this.sceneRowsDateDisplay = (this.sceneRowsDate) ? GLOBALUTIL.shortDateTime(gAPPP.sceneRowsDate) : 'none';
    this.productRowsDate = results[2];
    this.productRowsDateDisplay = (this.productRowsDate) ? GLOBALUTIL.shortDateTime(gAPPP.productRowsDate) : 'none';
    this.animationGeneratedDate = results[3];
    this.animationGeneratedDateDisplay = (this.animationGeneratedDate) ? GLOBALUTIL.shortDateTime(gAPPP.animationGeneratedDate) : 'none';

    this.animationRegenerationNeeded = false;
    if (this.animationGeneratedDate) {
      if (this.assetRowsDate > this.animationGeneratedDate)
        this.animationRegenerationNeeded = true;
      if (this.sceneRowsDate > this.animationGeneratedDate)
        this.animationRegenerationNeeded = true;
      if (this.productRowsDate === null)
        this.animationRegenerationNeeded = true;
      if (this.productRowsDate > this.animationGeneratedDate)
        this.animationRegenerationNeeded = true;
    }

    if (this.mV) {
      if (this.animationRegenerationNeeded)
        this.mV.dialog.classList.add('animation_regeneration_needed');
      else
        this.mV.dialog.classList.remove('animation_regeneration_needed');
    }

    return;
  }
}
