class gDemoApp extends gInstanceSuper {
  constructor() {
    super();

    this.loadPickerData();

    this.filterActiveWorkspaces = true;
    this.a.signInAnon();
  }
  appDataUpdate(fireData) {
    console.log('appdataupdate', fireData, fireData.val());

    this.appData = {};
    if (fireData.exists())
      this.appData = fireData.val();

    if (this.appData.wid)
      if (this.appData.wid !== gAPPP.loadedWID && this.workspaceProcessed) {
        location.reload(); // just dump the dom and restart
      }

    if (this.mV)
      this.mV.appDataUpdate(this.appData);
  }
  async profileReadyAndLoaded() {
    this.loadStarted = true;

    let appDataQuery = await firebase.database().ref('applicationData').once('value');
    let appData = {
      wid: null
    };
    if (appDataQuery.exists()) {
      appData = appDataQuery.val();
    }
    firebase.database().ref('applicationData').on('value', data => this.appDataUpdate(data));
    //firebase.database().ref('applicationData/child1').set(1234);

    let workspace = appData.wid;

    let urlParams = new URLSearchParams(window.location.search);

    let name = urlParams.get('name');
    let nameWid = null;
    if (name) {
      let csvImport = await new gCSVImport();
      nameWid = await csvImport.widForName(name);
    }

    if (!nameWid)
      nameWid = urlParams.get('wid');

    if (!nameWid) {
      if (name !== 'taproom') {
        name = 'taproom';
        let csvImport = await new gCSVImport();
        nameWid = await csvImport.widForName(name);
      }
    }

    if (nameWid) {
      workspace = nameWid;
      gAPPP.a.modelSets['userProfile'].commitUpdateList([{
        field: 'selectedWorkspace',
        newValue: nameWid
      }]);
    }

    if (!workspace)
      workspace = 'default';
    this.loadedWID = workspace;

    this.a.initProjectModels(workspace);
    this.a._activateModels();
    this.initialUILoad = false;

    this.workspaceProcessed = false;
    gAPPP.a.workspaceLoadedCallback = async () => {
      if (this.workspaceProcessed) return;

      await this._updateGoogleFonts();

      this.workspaceProcessed = true;
      gAPPP.a.profile['selectedBlockKey' + workspace] = gAPPP.a.modelSets['block'].getIdByFieldLookup('blockCode', 'demo');

      this.mV = new cViewDemo();
      this.mV.updateProjectList(gAPPP.a.modelSets['projectTitles'].fireDataValuesByKey, workspace, true);
      this._updateApplicationStyle();
    };
  }
  _loginPageTemplate(title = `Dynamic Reality App`) {
    return `<div id="firebase-app-login-page" style="display:none;">Loading...</div>`;
  }
  initGPSTracking(enable = true) {
    this.gpsEnabled = enable;
    if (this.gpsInited)
      return;

    this.gpsInited = true;
    navigator.geolocation.watchPosition(position => {
      if (!this.gpsEnabled)
        return;
      this.latitude = position.coords.latitude.toFixed(7);
      this.longitude = position.coords.longitude.toFixed(7);

      if (!this.origLatitude)
        this.origLatitude = this.latitude;
      if (!this.origLongitude)
        this.origLongitude = this.longitude;

      if (this.gpsCallback)
        this.gpsCallback(position);

      if (!this.gpsInited) {
        this.gpsInited = true;
        this.gpsReady();
      }
    }, err => {
      if (this.gpsCallback)
        this.gpsCallback(err, true);
    }, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });
  }
  gpsReady() {}
  initializeAuthUI() {
    let div = document.createElement('div');
    div.innerHTML = this._loginPageTemplate('eXtended Reality Grafter');
    div = div.firstChild;
    document.body.insertBefore(div, document.body.firstChild);
  }
  __genBaseAppStyle() {
    let css = super.__genBaseAppStyle();
    let opacityLevel = this.appStyleDetails.opacityLevel;
    let choice_css = `
    button.choice-button-one {
      background: rgba(200, 0, 0, ${opacityLevel});
    }
    button.choice-button-two {
      background: rgba(0, 200, 0, ${opacityLevel});
    }
    button.choice-button-three {
      background: rgba(0, 0, 255, ${opacityLevel});
    }
    button.choice-button-four {
      background: rgba(255, 255, 0, ${opacityLevel});
    }
    `;

    return css + choice_css;
  }
  applicationDataUpdate() {
    if (this.mV)
      this.mV.applicationDataUpdate();
  }
}
