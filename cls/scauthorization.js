/*  singleton firebase authorization controller (owns firebase bound models)   */
'use sctrict';
class scAuthorization {
  constructor(signInQS, signOutQS) {
    let me = this;
    this.currentUser = null;
    this.uid = null;
    this.fireSets = [];
    this.modelSets = {};
    this.profile = {};
    this.styleProfileDom = null;

    document.querySelector(signInQS).addEventListener('click', () => me.signIn(), false);
    document.querySelector(signOutQS).addEventListener('click', () => me.signOut(), false);

    firebase.auth().onAuthStateChanged((user) => me.onAuthStateChanged(user));
  }
  userWriteData() {
    firebase.database().ref('users/' + this.currentUser.uid).set(this.currentUser.toJSON());
  }
  userWriteProfileData() {
    firebase.database().ref('usersprofile/' + this.currentUser.uid).set(this.profile);
  }
  signIn() {
    this.provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(this.provider);
  }
  signOut() {
    firebase.auth().signOut();
  }
  updateAuthUI() {
    let loginPage = document.getElementById('login-page');
    let mainPage = document.getElementById('main-page');

    if (this.loggedIn) {
      loginPage.style.display = 'none';
      mainPage.style.display = '';
    } else {
      loginPage.style.display = '';
      mainPage.style.display = 'none';
    }
  }
  userReadProfileData() {
    let me = this;
    this.fireDataProfileRef = firebase.database().ref('usersprofile/' + this.currentUser.uid);
    this.fireDataProfileRef.on('value', (snapshot) => {
      me.profile = snapshot.val();
      if (! me.profile)
        me.profile = {
          canvasColor: '',
          fontFamily: '',
          fontSize: ''
        };
      me.applyProfileSettings();
    });
  }
  applyProfileSettings() {
    if (this.styleProfileDom !== null) {
      this.styleProfileDom.parentNode.removeChild(this.styleProfileDom);
    }

    let css = 'html, body { ';

    if (this.profile.fontSize !== '')
      css += 'font-size:' + this.profile.fontSize + ';';
    if (this.profile.fontFamily !== '')
      css += 'font-family:' + this.profile.fontFamily + ';';
    css += '}';

    this.styleProfileDom = document.createElement('style');
    this.styleProfileDom.innerHTML = css;
    document.body.appendChild(this.styleProfileDom);

    gAPPP.renderEngine.sceneDetails.scene.clearColor = gAPPP.renderEngine.color(gAPPP.a.profile.canvasColor);
  }
  onAuthStateChanged(user) {
    //ignore unwanted events
    if (user && this.uid === user.uid) {
      return;
    }

    for (let i in this.fireSets)
      this.fireSets[i].destroy();
    this.fireSets = [];

    if (user) {
      this.initAuthorizedData(user);
  } else {
      this.currentUser = null;
      this.loggedIn = false;
    }

    this.updateAuthUI();
  }
  initFireData() {
    this.modelSets['meshes'] = new MDLFirebaseList('lib_meshes');
    this.fireSets.push(this.modelSets.meshes);
    this.modelSets['textures'] = new MDLFirebaseList('lib_textures');
    this.fireSets.push(this.modelSets.textures);
    this.modelSets['materials'] = new MDLFirebaseList('lib_materials');
    this.fireSets.push(this.modelSets.materials);
    this.modelSets['scenes'] = new MDLFirebaseList('lib_scenes');
    this.fireSets.push(this.modelSets.scenes);
  }
  initAuthorizedData(user) {
    this.currentUser = user;
    this.uid = user.uid;
    this.loggedIn = true;
    this.userWriteData();
    this.initFireData();
    this.userReadProfileData();
    gAPPP.initToolbars();
  }
}
