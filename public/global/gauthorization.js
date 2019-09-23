class gAuthorization {
  constructor(signInQS, signOutQS) {
    this.currentUser = null;
    this.uid = null;
    this.fireSets = [];
    this.modelSets = {};

    this.modelSets['userProfile'] = new mFirebaseProfile();
    this.fireSets.push(this.modelSets['userProfile']);

    //check for profile reset
    let searchParams = new URLSearchParams(window.location.search);
    this.profileReset = (searchParams.get('reset') === 'true');

    this.modelSets['projectTitles'] = new mFirebaseProject('projectTitles', true);
    this.modelSets['projectTitles'].valueChangedEvents = true;
    this.modelSets['projectTitles'].childListeners.push((values, type, fireData) => this.onProjectTitlesChange(values, type, fireData));
    this.fireSets.push(this.modelSets['projectTitles']);

    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
    firebase.auth().onAuthStateChanged(u => this.onAuthStateChanged(u));

    this.workspaceLoadedCallback = null;
    this.updateAuthUICallback = null;
  }
  signInWithURL() {
    if (!firebase.auth().isSignInWithEmailLink)
      return;
    if (firebase.auth().isSignInWithEmailLink(window.location.href) !== true)
      return;

    let email = window.localStorage.getItem('emailForSignIn');
    if (!email)
      email = window.prompt('Please provide your email for confirmation');

    firebase.auth().signInWithEmailLink(email, window.location.href)
      .then((result) => this.__finishSignInURL(result.user))
      .catch(e => console.log(e));
  }
  __finishSignInURL(user) {
    window.localStorage.removeItem('emailForSignIn');
    this.onAuthStateChanged(user);
    window.history.replaceState({}, document.title, "/edit/");
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
  async onAuthStateChanged(user) {
    //ignore unwanted events
    if (user && this.uid === user.uid) {
      return;
    }

    if (user) {
      this.currentUser = user;
      this.uid = user.uid;
      this.loggedIn = true;
      this.modelSetsInited = {};

      if (this.profileReset)
        await this.resetProfile();

      this.loadProfile();
    } else {
      this.currentUser = null;
      this.loggedIn = false;
      this.uid = null;
      this._deactivateModels();
    }

    this.updateAuthUI();
    return;
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
      if (this.workspaceLoadedCallback)
        this.workspaceLoadedCallback();

      this.initialBlockLoad = true;
    }
  }
  get profile() {
    let model = this.modelSets['userProfile'];
    if (model.active)
      if (model.profile)
        return model.profile;
      else {
        if (!this.anonymous) {
          this.resetProfile();
          return model.profile;
        } else {
          return {};
        }
      }
  }
  __setAutoGoogleLogin(set) {
    if (set)
      GLOBALUTIL.setCookie('autoGoogleLogin', '1', 7);
    else
      GLOBALUTIL.setCookie('autoGoogleLogin', '', 7);
  }
  signIn(autoGoogleLogin = false) {
    let urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('server') === 'true') {
      this.signInAnon();
      return;
    }

    this.__setAutoGoogleLogin(autoGoogleLogin);

    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
      .then(() => {
        this.provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithRedirect(this.provider);
      });
  }
  async signInByEmail(email) {
    let actionCodeSettings = {
      url: window.location.href,
      handleCodeInApp: true
    };
    await firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings);

    window.localStorage.setItem('emailForSignIn', email);
    alert('Email Sent');
  }
  clearProjectData(key) {
    if (!key)
      return;

    let basePath = `/project/${key}/`;
    let fireUpdates = {
      [basePath + 'block']: null,
      [basePath + 'blockchild']: null,
      [basePath + 'frame']: null,
      [basePath + 'material']: null,
      [basePath + 'mesh']: null,
      [basePath + 'shape']: null,
      [basePath + 'texture']: null
    };

    return firebase.database().ref().update(fireUpdates);
  }
  async writeProjectRawData(key, rawName, data) {
    if (!key || !rawName)
      return Promise.resolve();

    let fireUpdates = {
      [`/project/${key}/rawData${rawName}`]: data,
      [`/project/${key}/rawData${rawName}Date`]: new Date()
    };

    return firebase.database().ref().update(fireUpdates);
  }
  async readProjectRawData(key, rawName) {
    if (!key || !rawName)
      return Promise.resolve();

    return firebase.database().ref(`/project/${key}/rawData${rawName}`).once('value')
      .then(r => r.val());
  }
  async readProjectRawDataDate(key, rawName) {
    if (!key || !rawName)
      return Promise.resolve();

    return firebase.database().ref(`/project/${key}/rawData${rawName}Date`).once('value')
      .then(r => r.val());
  }
  async signInAnon() {
    this.anonymous = true;
    await firebase.auth().signOut();
    firebase.auth().signInAnonymously();
  }
  signOut() {
    this.__setAutoGoogleLogin(false);
    firebase.auth().signOut();
    location.reload(); // just dump the dom and restart
  }
  updateAuthUI() {
    if (this.updateAuthUICallback)
      this.updateAuthUICallback();
  }
  async resetProfile() {
    let profileData = {
      fontSize: '9',
      lightIntensity: '.4',
      selectedWorkspace: 'default',
      showBoundsBox: true,
      showFloorGrid: false,
      cameraUpdates: false,
      cameraSaves: true,
      showForceWireframe: false,
      showSceneGuides: true,
      cameraName: "Default Camera",
      gridAndGuidesDepth: '15'
    };

    if (this.anonymous) {
      profileData.cameraUpdates = true;
      profileData.cameraSaves = true;
      profileData.showSceneGuides = false;
      profileData.showBoundsBox = false;
      profileData.showFloorGrid = false;
    }
    await this.modelSets['userProfile'].setObject(profileData);

    return;
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
