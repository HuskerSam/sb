class gAuthorization {
  constructor(signInQS, signOutQS) {
    this.currentUser = null;
    this.uid = null;
    this.fireSets = [];
    this.modelSets = {};

    this.modelSets['userProfile'] = new mFirebaseProfile();
    this.fireSets.push(this.modelSets['userProfile']);

    this.modelSets['mesh'] = new mFirebaseList('mesh', true);
    this.fireSets.push(this.modelSets['mesh']);
    this.modelSets['shape'] = new mFirebaseList('shape', true);
    this.fireSets.push(this.modelSets['shape']);
    this.modelSets['block'] = new mFirebaseList('block', true);
    this.modelSets['block'].childSets.push('blockchild');
    this.modelSets['block'].childSets.push('frame');
    this.fireSets.push(this.modelSets['block']);
    this.modelSets['blockchild'] = new mFirebaseList('blockchild', false);
    this.modelSets['blockchild'].childSets.push('frame');
    this.fireSets.push(this.modelSets['blockchild']);
    this.modelSets['frame'] = new mFirebaseList('frame', false);
    this.fireSets.push(this.modelSets['frame']);
    this.modelSets['texture'] = new mFirebaseList('texture', true);
    this.fireSets.push(this.modelSets['texture']);
    this.modelSets['material'] = new mFirebaseList('material', true);
    this.fireSets.push(this.modelSets['material']);
    this.modelSets['scene'] = new mFirebaseList('scene', true);
    this.fireSets.push(this.modelSets['scene']);
    this.modelSets['scene'].childListeners.push(v => gAPPP.handleDataUpdate());
    this.modelSets['project'] = new mFirebaseList('project', true);
    this.fireSets.push(this.modelSets['project']);

    document.querySelector(signInQS).addEventListener('click', e => this.signIn(), false);
    document.querySelector(signOutQS).addEventListener('click', e => this.signOut(), false);

    firebase.auth().onAuthStateChanged(u => this.onAuthStateChanged(u));
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

      //check for profile reset
      let searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('reset') === 'true')
        this.resetProfile();

      //save user data to firebase (WWWHHHYYYY?)
      firebase.database().ref('users/' + this.currentUser.uid).set(this.currentUser.toJSON());

      this._activateModels();
    } else {
      this.currentUser = null;
      this.loggedIn = false;
      this.uid = null;
      this._deactivateModels();
    }

    this.updateAuthUI();
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
    this.provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(this.provider);
    firebase.auth().onAuthStateChanged((user) => this.onAuthStateChanged(user));
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
      canvasColor: '.4,.9,1',
      lightIntensity: '.8'
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
}
