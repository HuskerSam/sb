class gAuthorization {
  constructor(signInQS, signOutQS) {
    this.currentUser = null;
    this.uid = null;
    this.fireSets = [];
    this.modelSets = {};

    this.modelSets['userProfile'] = new mFirebaseProfile();
    this.fireSets.push(this.modelSets['userProfile']);

    this.modelSets['projectTitles'] = new mFirebaseProject('projectTitles', true);
    this.modelSets['projectTitles'].valueChangedEvents = true;
    this.modelSets['projectTitles'].childListeners.push((values, type, fireData) => this.onProjectTitlesChange(values, type, fireData));
    this.fireSets.push(this.modelSets['projectTitles']);

    document.querySelector(signInQS).addEventListener('click', e => this.signIn(), false);
    document.querySelector(signOutQS).addEventListener('click', e => this.signOut(), false);

    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    firebase.auth().onAuthStateChanged(u => this.onAuthStateChanged(u));
  }
  onProjectTitlesChange(values, type, fireData) {
    if (type === 'value') {
      gAPPP.workspaceListLoaded = true;
      gAPPP.a.modelSets['projectTitles'].fireDataValuesByKey = values;
      gAPPP.profileReady();
      return;
    }

    if (gAPPP.mV)
      gAPPP.mV.updateProjectList(gAPPP.a.modelSets['projectTitles'].fireDataValuesByKey, null);
  }
  onAuthStateChanged(user) {
    //ignore unwanted events
    if (user && this.uid === user.uid) {
      return;
    }

    if (user) {
      this.currentUser = user;
      this.uid = user.uid;
      this.loggedIn = true;
      this.modelSetsInited = {};

      //check for profile reset
      let searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('reset') === 'true')
        this.resetProfile();

      this.loadProfile();
    } else {
      this.currentUser = null;
      this.loggedIn = false;
      this.uid = null;
      this._deactivateModels();
    }

    this.updateAuthUI();
  }
  initModelSet(setTag) {
    this.modelSetsInited[setTag] = true;

    if (gAPPP.initialUILoad)
      return;
    let workspaceLoaded = true;
    for (let i in this.modelSets)
      if (!this.modelSetsInited[i]) {
        workspaceLoaded = false;
        break;
      }

    if (workspaceLoaded)
      this.workspaceLoaded();
  }
  workspaceLoaded() {
    if (!this.initialBlockLoad) {
      let key = 'selectedBlockKey' + gAPPP.workspace;
      gAPPP.mV._updateSelectedBlock(gAPPP.a.profile[key]);
      this.initialBlockLoad = true;
    }
  }
  get profile() {
    let model = this.modelSets['userProfile'];
    if (model.active)
      if (model.profile)
        return model.profile;
      else
        this.resetProfile();
    return {};
  }
  signIn() {
    let urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('server') === 'true') {
      firebase.auth().signInAnonymously();
      return;
    }

    this.provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(this.provider);
  }
  signOut() {
    firebase.auth().signOut();
    location.reload(); // just dump the dom and restart
  }
  updateAuthUI() {
    let loginPage = document.getElementById('login-page');
    let mainPage = document.getElementById('main-page');

    if (this.loggedIn) {
      loginPage.style.display = 'none';
      mainPage.style.display = 'block';
    } else {
      loginPage.style.display = 'block';
      mainPage.style.display = 'none';
    }
  }
  resetProfile() {
    this.modelSets['userProfile'].setObject({
      fontSize: '12',
      canvasColor: '.1,.3,.1',
      lightIntensity: '.4',
      selectedWorkspace: 'default',
      showBoundsBox: true,
      showFloorGrid: true,
      showForceWireframe: false,
      showSceneGuides: true,
      cameraName: "Default Camera",
      gridAndGuidesDepth: '15'
    });
  }
  _activateModels() {
    for (let c in this.fireSets)
      this.fireSets[c].activate();
  }
  _deactivateModels() {
    for (let c in this.fireSets)
      this.fireSets[c].deactivate();
  }
  initProjectModels(workspaceId) {
    this.modelSets['mesh'] = new mFirebaseList(workspaceId, 'mesh', true);
    this.fireSets.push(this.modelSets['mesh']);
    this.modelSets['shape'] = new mFirebaseList(workspaceId, 'shape', true);
    this.fireSets.push(this.modelSets['shape']);
    this.modelSets['block'] = new mFirebaseList(workspaceId, 'block', true);
    this.modelSets['block'].childSets.push('blockchild');
    this.modelSets['block'].childSets.push('frame');
    this.fireSets.push(this.modelSets['block']);
    this.modelSets['blockchild'] = new mFirebaseList(workspaceId, 'blockchild', false);
    this.modelSets['blockchild'].childSets.push('frame');
    this.fireSets.push(this.modelSets['blockchild']);
    this.modelSets['frame'] = new mFirebaseList(workspaceId, 'frame', false);
    this.fireSets.push(this.modelSets['frame']);
    this.modelSets['texture'] = new mFirebaseList(workspaceId, 'texture', true);
    this.fireSets.push(this.modelSets['texture']);
    this.modelSets['material'] = new mFirebaseList(workspaceId, 'material', true);
    this.fireSets.push(this.modelSets['material']);
  }
  loadProfile() {
    this.modelSets['userProfile'].activate();
    this.modelSets['projectTitles'].activate();
  }
}
