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
    this.loadDataLists('sbimageslist');
    this.loadDataLists('sbstoreimageslist');
    this.loadDataLists('sbmesheslist');
    this.loadDataLists('skyboxlist');
    this.loadDataLists('fontfamilydatalist');
    this.loadTextures();

    firebase.auth().getRedirectResult().then(result => {
      if (!firebase.auth().currentUser)
        if (GLOBALUTIL.getCookie('autoGoogleLogin') === '1')
          if (!result.user)
            this.a.signIn(true);
    });
  }
  async loadTextures() {
    let rrr = await fetch(`/assetlist/textures.json`)
    let json = await rrr.json();

    this.textureTextures = [];
    this.bumpTextures = [];
    this.floorTextures = [];
    this.wallTextures = [];
    this.rawTexturesFile = json;
    this.texturesFromFile = [];
    for (let c = 0, l = json.length; c < l; c++) {
      let filterStr = json[c].filters;
      if (!filterStr)
        filterStr = '';
      let filters = filterStr.split(',');
      if (json[c].type === 'bump')
        this.bumpTextures.push(json[c].path);
      if (json[c].type === 'texture')
        this.textureTextures.push(json[c].path);
      if (filters.indexOf('floor') !== -1)
        this.floorTextures.push(json[c].path);
      if (filters.indexOf('wall') !== -1)
        this.wallTextures.push(json[c].path);

      this.texturesFromFile[json[c].path] = json[c];
    }

    this.meshesDetails = [];
    let meshesResponse = await fetch(`/assetlist/meshes.json`)
    let text = await meshesResponse.text();
    let meshesJson = JSON.parse(text);
    for (let c = 0, l = meshesJson.length; c < l; c++)
      this.meshesDetails.push(meshesJson[c]);

    this.appendDataList('floorTexturesDataList', this.floorTextures);
    this.appendDataList('wallTexturesDataList', this.wallTextures);

    return;
  }
  appendDataList(listid, options, defaults = ['color: 1,1,1']) {
    let currentList = document.getElementById(listid);
    if (currentList)
      currentList.remove();

    currentList = document.createElement('datalist');
    currentList.id = listid;

    let outHtml = '';
    for (let c = 0, l = defaults.length; c < l; c++)
      outHtml += `<option>${defaults[c]}</option>`;

    for (let c = 0, l = options.length; c < l; c++)
      outHtml += `<option>${options[c]}</option>`;

    currentList.innerHTML = outHtml;
    document.body.appendChild(currentList);
  }
  async profileReadyAndLoaded() {
    let urlParams = new URLSearchParams(window.location.search);
    let newWid = urlParams.get('wid');
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
    let results = await Promise.all([
      gAPPP.a.readProjectRawDataDate(gAPPP.loadedWID, 'assetRows'),
      gAPPP.a.readProjectRawDataDate(gAPPP.loadedWID, 'sceneRows'),
      gAPPP.a.readProjectRawDataDate(gAPPP.loadedWID, 'productRows'),
      gAPPP.a.readProjectRawDataDate(gAPPP.loadedWID, 'animationGenerated')
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
