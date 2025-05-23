import sDataDefinition from '/lib/sdatadefinition.js';
import gUtility from '/lib/gutility.js';
import wBlock from '/lib/wBlock.js';

export class cFirestoreData {
  constructor(type, id, tag, childId) {
    this.tag = tag;
    this.referencePath = this.tag;
    this.active = false;
    this.childListeners = [];
    this.values = {};
    this.sortKey = 'sortKey';

    if (type === 'workspace') {
      this.referencePath = '/project/' + id + '/' + tag;
    } else if (type === 'profile') {
      this.referencePath = '/profile';
      this.uid = id;
      this.tag = 'profile';
      datalist = false;
    } else if (type === 'project') {
      this.tag = 'project';
      this.referencePath = '/project';
      this.sortKey = 'title';
    } else if (type === 'blockchild') {
      this.tag = 'blockchild';
      this.referencePath = '/project/' + id + "/block/" + childId + "/children";
    } else {
      alert('invalid cFirestoreData type');
      this.referencePath = '/boguspath';
    }

    this.fireDataByKey = {};
    this.fireDataValuesByKey = {};

    this.domTitleList = null;
    if (datalist) {
      this.domTitleList = document.createElement('datalist');
      this.domTitleList.id = this.tag + 'datatitlelookuplist';
      document.body.appendChild(this.domTitleList);
    }

    this.childOrderByKey = [];
    this.updateDomLookupList();
  }
  deactivate() {
    if (!this.active)
      return;
    if (this.notiRef) {
      this.notiRef();
      this.notiRef = null;
    }
    this.active = false;
  }
  async activate() {
    if (this.active)
      return -1;

    this.active = true;
    return new Promise((resolve) => {
      let resolved = false;
      this.firestoreRef = firebase.firestore().collection(this.referencePath);
      this.notiRef = firebase.firestore().collection(this.referencePath);

      if (this.sortKey)
        this.notiRef = this.notiRef.orderBy(this.sortKey)

      this.notiRef.onSnapshot(snapshot => {
        let docCount = 0;
        snapshot.docChanges().forEach(change => {
          docCount++;
          if (change.type === "added")
            this.childAdded(change);
          if (change.type === "modified")
            this.childChanged(change);
          if (change.type === "removed")
            this.childRemoved(change);
        });

        if (!resolved)
          resolve(docCount);
      });
    });
  }
  clear() {
    this.values = {};
    this.fireDataByKey = {};
    this.fireDataValuesByKey = {};
    this.notifyChildren(null, 'clear');
  }
  childAdded(fireData) {
    this.updateStash(fireData);
    this.notifyChildren(fireData, 'add');
  }
  childChanged(fireData) {
    this.updateStash(fireData);
    this.notifyChildren(fireData, 'change');
  }
  childRemoved(fireData) {
    this.updateStash(fireData, true);
    this.notifyChildren(fireData, 'remove');
  }
  async cloneByKey(key) {
    let newKey = this.getKey();
    let data = this.getCache(key);
    let newData = JSON.parse(JSON.stringify(data));
    await this.firestoreRef.doc(newKey).set(newData);
    return newKey;
  }
  async createWithBlob(data, blob, filename) {
    let key = this.getKey();

    if (blob) {
      let sr = await this.setBlob(key, blob, filename);

      data.url = sr.downloadURL;
      data.type = 'url';
      data.size = sr.totalBytes;

      await this.firestoreRef.doc(key).set(data);
      return {
        url: data.url,
        key
      };
    }

    await this.firestoreRef.doc(key).set(data);
    return {
      key,
      url: ''
    };
  }
  async createWithBlobString(data, blobString, filename) {
    let key = this.firestoreRef.doc().id;

    if (blobString) {
      let sr = await this.setString(key, blobString, filename);

      data.url = sr.downloadURL;
      data.type = 'url';
      data.size = sr.totalBytes;

      let r = await this.firestoreRef.doc(key).set(data);
      return {
        key,
        url: data.url
      };
    }

    let r = await this.firestoreRef.doc(key).set(data);
    return {
      key,
      url: ''
    };
  }
  getCache(key) {
    if (key)
      return this.fireDataValuesByKey[key];
    return null;
  }
  getIdByFieldLookup(field, value) {
    let obj = this.getValuesByFieldLookup(field, value);
    if (obj)
      return this.lastKeyLookup;

    return null;
  }
  getKey() {
    return this.firestoreRef.doc().id;
  }
  getValuesByFieldLookup(field, value) {
    this.lastKeyLookup = null;
    for (let i in this.fireDataValuesByKey)
      if (this.fireDataValuesByKey[i][field] === value) {
        this.lastKeyLookup = i;
        return this.fireDataValuesByKey[i];
      }
    return null;
  }
  notifyChildren(fireData, type) {
    for (let i in this.childListeners) {
      let values = fireData !== null ? this.getCache(fireData.doc.id) : null;
      if (type === 'remove')
        values = this.lastValuesDeleted;
      fireData.lastValuesChanged = this.lastValuesChanged;
      this.childListeners[i](values, type, fireData);
    }
    this.updateDomLookupList();
  }
  queryCacheContains(keyName, keyValue) {
    let results = {};
    for (let i in this.fireDataValuesByKey)
      if (this.fireDataValuesByKey[i][keyName])
        if (this.fireDataValuesByKey[i][keyName].toString().indexOf(keyValue) !== -1)
          results[i] = this.fireDataValuesByKey[i];

    return results;
  }
  queryCache(keyName, keyValue) {
    let results = {};
    for (let i in this.fireDataValuesByKey)
      if (this.fireDataValuesByKey[i][keyName] === keyValue)
        results[i] = this.fireDataValuesByKey[i];

    return results;
  }
  removeByKey(key) {
    if (!key) {
      alert('invalid removebykey (empty key)');
      return Promise.resolve();
    }
    let values = this.getCache(key);
    return new Promise((resolve, reject) => {
      let updates = {};
      updates['/' + this.referencePath + '/' + key] = null;

      firebase.database().ref().update(updates).then(e => {
        if (!values)
          return resolve(e);
        let url = values['url'];
        if (url === undefined)
          url = '';
        if (url.indexOf(key) !== -1) {
          let shortPath = url.replace(this.storagePrefix, '');
          shortPath = decodeURIComponent(shortPath);
          shortPath = shortPath.substr(0, shortPath.indexOf('?'));
          let storageRef = firebase.storage().ref();
          let ref = storageRef.child(shortPath);
          return ref.delete().then(e => resolve(e));
        }

        resolve(e);
      });
    });
  }
  removeListener(callback) {
    let indexToRemove = this.childListeners.indexOf(callback);
    if (indexToRemove !== 1)
      this.childListeners.splice(indexToRemove, 1);
  }
  setBlob(id, blob, filename) {
    return new Promise((resolve, reject) => {
      let storageRef = firebase.storage().ref();
      let ref = storageRef.child(this.referencePath + '/' + id + '/' + filename);
      let snapshot;
      ref.put(blob)
        .then(r => {
          snapshot = r;
          return ref.getDownloadURL();
        }).then(url => {
          snapshot.downloadURL = url;
          resolve(snapshot)
        }).catch(error => reject(error));
    });
  }
  async setString(id, dataString, filename) {
    let storageRef = firebase.storage().ref();
    let ref = storageRef.child(this.referencePath + '/' + id + '/' + filename);
    let snapshot = await ref.putString(dataString)
    snapshot.downloadURL = await ref.getDownloadURL();

    return snapshot;
  }
  startingOptionList() {
    if (this.tag === 'material')
      return '<option>color: 1,1,1</option><option>color: 0,0,0</option><option>color: 1,0,0</option><option>color: 1,.5,0</option><option>color: 0,1,0</option><option>color: 0,0,1</option><option>ecolor: 1,0,0</option><option>decolor: 1,0,0</option>';

    if (this.tag === 'texture') {
      let dl = document.getElementById('sbimageslist');
      if (dl)
        return dl.innerHTML;
    }

    return '';
  }
  async update(updates, key = null) {
    if (!key && this.tag !== 'profile') {
      console.log('update no key error', updates, key);
      return;
    }
    if (this.tag === 'profile')
      key = this.uid;

    let updatePath = this.referencePath + '/' + key;

    if (!this.fireDataValuesByKey[key])
      this.fireDataValuesByKey[key] = {};

    Object.assign(this.fireDataValuesByKey[key], updates);
    return firebase.firestore().doc(updatePath).set(updates, {
      merge: true
    });
  }
  updateBlobString(key, blobString, filename) {
    return new Promise((resolve, reject) => {
      this.setString(key, blobString, filename).then(snapshot => {
        let updates = [{
          field: 'url',
          newValue: snapshot.downloadURL,
          oldValue: this.getCache(key)['url']
        }, {
          field: 'size',
          newValue: snapshot.totalBytes,
          oldValue: this.getCache(key)['size']
        }];
        this.update(updates, key);
        resolve({
          result: snapshot,
          url: snapshot.downloadURL
        });
      });
    });
  }
  updateBlob(key, blob, filename, urlField = 'url') {
    return new Promise((resolve, reject) => {
      this.setBlob(key, blob, filename).then(snapshot => {
        let updates = [{
          field: urlField,
          newValue: snapshot.downloadURL,
          oldValue: this.getCache(key)['url']
        }, {
          field: 'size',
          newValue: snapshot.totalBytes,
          oldValue: this.getCache(key)['size']
        }];
        this.update(updates, key);
        resolve({
          result: snapshot,
          url: snapshot.downloadURL
        });
      });
    });
  }
  updateChildOrder() {
    this.childOrderByKey = [];

    for (let i in this.fireDataByKey)
      this.childOrderByKey.push(i);

    this.childOrderByKey.sort((a, b) => {
      let valA = this.fireDataValuesByKey[a].sortKey;
      let valB = this.fireDataValuesByKey[b].sortKey;

      if (valA)
        if (!valB)
          return 1;

      if (valB)
        if (!valA)
          return -1;

      if (valA && valB)
        return valA > valB ? 1 : -1;

      return a > b ? 1 : -1;
    });

    this.childOrderByKey.reverse();
  }
  updateDomLookupList() {
    this.updateChildOrder();
    if (!this.domTitleList)
      return;
    let innerHTML = this.startingOptionList();
    let list = this.childOrderByKey;
    this.titleMap = {};
    for (let i = list.length - 1; i >= 0; i--) {
      if (this.fireDataValuesByKey[list[i]]) {
        let option = '<option>' + this.fireDataValuesByKey[list[i]]['title'] + '</option>';
        innerHTML = option + innerHTML;
        this.titleMap[this.fireDataValuesByKey[list[i]]['title']] = list[i];
      }
    }

    this.domTitleList.innerHTML = innerHTML;
  }
  updateStash(fireData, remove) {
    let key = fireData.doc.id;
    this.lastValuesDeleted = null;
    if (remove) {
      this.lastValuesDeleted = this.fireDataValuesByKey[key];
      delete this.fireDataByKey[key];
      delete this.fireDataValuesByKey[key];
      return;
    }

    this.fireDataByKey[key] = fireData;
    this.lastValuesChanged = this.fireDataValuesByKey[key];
    this.fireDataValuesByKey[key] = fireData.doc.data();
  }
}
class cAuthorization {
  constructor() {
    this.currentUser = null;
    this.uid = null;
    this.modelSets = {};

    //check for profile reset
    let searchParams = new URLSearchParams(window.location.search);
    this.profileReset = (searchParams.get('reset') === 'true');

    firebase.auth().onAuthStateChanged(u => this.onAuthStateChanged(u));

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
    window.history.replaceState({}, document.title, "/asset/");
  }
  onProjectTitlesChange(values, type, fireData) {
    //TO FIX
    //  this.mV.updateProjectList(this.a.modelSets['project'].fireDataValuesByKey, null);
  }
  async onAuthStateChanged(user) {
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

    let workspaceLoaded = true;
    for (let i in this.modelSets)
      if (!this.modelSetsInited[i]) {
        workspaceLoaded = false;
        break;
      }

    if (workspaceLoaded)
      this.workspaceLoaded();
  }
  get profile() {
    let model = this.modelSets['profile'];
    if (model && model.active) {
      this._profile = model.getCache(this.uid);
      if (!this._profile)
        this.resetProfile();
      return this._profile;
    }

    return null;
  }
  signIn() {
    let urlParams = new URLSearchParams(window.location.search);

    this.provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(this.provider);
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
  async signInAnon() {
    this.anonymous = true;
    firebase.auth().signInAnonymously();
  }
  signOut() {
    firebase.auth().signOut();
    location.reload(); // just dump the dom and restart
  }
  updateAuthUI() {
    if (this.updateAuthUICallback)
      this.updateAuthUICallback();
  }
  async resetProfile() {
    this._profile = this._defaultProfile(this.anonymous);
    await this.modelSets['profile'].update(this._profile, 'user');
    return;
  }
  _defaultProfile(anon = true) {
    let profileData = {
      fontSize: '12',
      lightIntensity: '.75',
      selectedWorkspace: '',
      showBoundsBox: true,
      showFloorGrid: true,
      cameraUpdates: true,
      cameraSaves: true,
      opacityLevel: '1',
      showForceWireframe: false,
      showSceneGuides: true,
      cameraName: "Camera",
      gridAndGuidesDepth: '15',
      canvasColor: '1.00,0.78,0.39',

    };

    if (anon) {
      profileData.displayName = 'User ' + Math.floor(1000 + Math.random() * 9000).toString();
      profileData.cameraUpdates = true;
      profileData.cameraSaves = true;
      profileData.showSceneGuides = false;
      profileData.showBoundsBox = false;
      profileData.showFloorGrid = false;
    }

    return profileData;
  }
  async _activateModels() {
    let promises = [];
    for (let key in this.modelSets)
      promises.push(this.modelSets[key].activate());

    return Promise.all(promises);
  }
  _deactivateModels() {
    for (let key in this.modelSets)
      this.modelSets[key].deactivate();
  }
}
export class cAppDefaults {
  constructor() {
    this.fontsAdded = {};
    this.storagePrefix = 'https://firebasestorage.googleapis.com/v0/b/husker-ac595.appspot.com/o/';
    this.cdnPrefix = 'https://s3-us-west-2.amazonaws.com/hcwebflow/';
    this.shapeTypes = [
      'box', 'cylinder', 'sphere', 'text', 'plane', 'torus', 'torusknot'
    ];
    this._domShapeList = document.createElement('datalist');
    this._domShapeList.id = 'applicationdynamicshapelistlookuplist';
    this.jsonLibPrefix = '';

    let innerHTML = '';
    for (let i in this.shapeTypes)
      innerHTML += '<option>' + this.shapeTypes[i] + '</option>';
    this._domShapeList.innerHTML = innerHTML;

    document.body.appendChild(this._domShapeList);
  }
  async _loadDataLists(name) {
    let rrr = await fetch(`${this.jsonLibPrefix}/assetlist/${name}.json`)
    let json = await rrr.json();

    let list = document.getElementById(name);
    if (!list) {
      list = document.createElement('datalist');
      list.setAttribute('id', name);
      document.body.appendChild(list);
    }
    let outHtml = '';
    for (let c = 0, l = json.length; c < l; c++)
      outHtml += `<option>${json[c]}</option>`;

    if (name === 'fontfamilydatalist') {
      Object.keys(this.fontsAdded).forEach(font => outHtml = `<option>${font}</option>` + outHtml);
    }

    list.innerHTML = outHtml;

    return;
  }
  async loadPickerData() {
    let listsHTML = `<datalist id="framecommandoptionslist">
            <option>Set</option>
            <option>GSet</option>
            <option>Animation</option>
            <option>Video</option>
            <option>Audio</option>
            <option>Function</option>
            <option>Camera</option>
          </datalist>
          <datalist id="framecommandfieldslist">
            <option>videoURL</option>
            <option>videoHeight</option>
            <option>videoWidth</option>
            <option>fogType</option>
            <option>fogDensity</option>
            <option>skybox</option>
            <option>groundMaterial</option>
            <option>material</option>
            <option>play</option>
            <option>pause</option>
            <option>stop</option>
            <option>position</option>
            <option>target</option>
          </datalist>
          <datalist id="blockchildtypelist">
            <option>block</option>
            <option>mesh</option>
            <option>shape</option>
            <option>light</option>
            <option>camera</option>
          </datalist>
          <datalist id="htmlvideosourcelist">
            <option>video/webm</option>
            <option>video/mp4</option>
            <option>video/ogg</option>
          </datalist>
          <datalist id="fogtypelist">
            <option>none</option>
            <option>EXP</option>
            <option>EXP2</option>
            <option>LINEAR</option>
          </datalist>
          <datalist id="lightsourceslist">
            <option>Point</option>
            <option>Directional</option>
            <option>Spot</option>
            <option>Hemispheric</option>
          </datalist>
          <datalist id="camerasourceslist">
            <option>UniversalCamera</option>
            <option>ArcRotate</option>
            <option>FollowCamera</option>
            <option>DeviceOrientationCamera</option>
            <option>WebVRFreeCamera</option>
          </datalist>`;
    let div = document.createElement('div');
    div.innerHTML = listsHTML;
    div.style.display = 'none';
    document.body.appendChild(div);
    return await Promise.all([
      this._loadDataLists('sbimageslist'),
      this._loadDataLists('sbstoreimageslist'),
      this._loadDataLists('sbmesheslist'),
      this._loadDataLists('skyboxlist'),
      this._loadDataLists('fontfamilydatalist')
    ]);
  }
  async loadTextures() {
    this.texturesFromFile = [];
    let promises = [];
    promises.push(this.loadTextureList(`${this.jsonLibPrefix}/assetlist/floorlist.json`, 'floorTexturesDataList'));
    promises.push(this.loadTextureList(`${this.jsonLibPrefix}/assetlist/walllist.json`, 'wallTexturesDataList'));
    promises.push(this.loadTextureList(`${this.jsonLibPrefix}/assetlist/texturelist.json`, 'textureTexturesDataList'));
    promises.push(this.loadTextureList(`${this.jsonLibPrefix}/assetlist/normallist.json`, 'normalTexturesDataList'));
    promises.push(this.loadTextureList(`${this.jsonLibPrefix}/assetlist/groundlist.json`, 'groundTexturesDataList'));

    await Promise.all(promises);

    await this.loadMeshes();

    return null;
  }
  async loadTextureList(url, listid) {
    let fetched = await fetch(url);
    let data = await fetched.json();

    if (!data)
      return [];
    let list = [];
    data.forEach(i => {
      this.texturesFromFile[i.path] = i;
      list.push(i.path);
    });
    this.appendDataList(listid, list, []);

    return data;
  }
  async loadMeshes() {
    this.meshesDetails = [];
    let meshesResponse = await fetch(`${this.jsonLibPrefix}/assetlist/meshes.json`)
    let text = await meshesResponse.text();
    let meshesJson = JSON.parse(text);
    this.meshesPaths = [];
    for (let c = 0, l = meshesJson.length; c < l; c++) {
      this.meshesDetails.push(meshesJson[c]);
      this.meshesPaths.push(meshesJson[c].meshpath);
    }

    this.appendDataList('meshesDefaultsDataList', this.meshesPaths, []);

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
  async updateHelpView(helpTag, dom) {
    if (this.help_topic_picker_select) {
      this.help_topic_picker_select.value = helpTag;
    }
    let rawHelpTag = helpTag;

    if (helpTag === 'texture')
      helpTag = 'material';
    if (helpTag !== '')
      helpTag += 'help';
    else
      helpTag = 'overview';
    let res = await fetch(`${this.jsonLibPrefix}/docraw/${helpTag}.html`, {
      cache: "no-cache"
    })
    let html = await res.text();

    if (dom)
      dom.innerHTML = html;

    if (this.helpViewCallback)
      this.helpViewCallback(rawHelpTag, dom);

    return html;
  }
}
export default class cWebApplication extends cAppDefaults {
  constructor() {
    super();
    this.key = null;
    window.gAPPP = this;
    this.styleProfileDom = null;
    this.activeContext = null;
    this.lastStyleProfileCSS = '';
    this.templateBasePath = 'https://s3-us-west-2.amazonaws.com/hcwebflow/templates/';
    this.canvasFBRecordTypes = ['blockchild', 'block', 'mesh', 'shape', 'material', 'texture'];

    window.addEventListener("resize", () => this.resize);
    firebase.database().ref('/.info/serverTimeOffset').once('value')
      .then((data) => this.serverOffsetTime = data.val());

    this.authInitUI();
    this.mainInitUI();

    this.authInit();
  }
  resize() {
    if (this.activeContext)
      this.activeContext.engine.resize();
  }
  closeHeaderBands() {}
  mainInitUI() {
    //if (this.context)
    //  this.context.deactivate();

    if (!this.layoutMode)
      this.layoutMode = 'Left';

    this.dialog = document.querySelector('#firebase-app-main-page');
    if (this.dialog)
      document.body.removeChild(this.dialog);
    this.dialog = null;

    let div = document.createElement('div');
    div.innerHTML = this.layoutTemplate();
    div = div.firstChild;
    document.body.insertBefore(div, document.body.firstChild);
    this.dialog = document.querySelector('#firebase-app-main-page');
    this.mainViewWrapper = this.dialog.querySelector('#main-view-wrapper');
  }
  async mainUpdateUI() {
    this.sets.profile = new cFirestoreData('profile', this.a.uid);
    await this.sets.profile.activate();

    this.styleUpdate();
    await this.initCanvas();
    this._initAssetUI();

    this.sets.project = new cFirestoreData('project');
    await this.sets.project.activate();

    if (!this.loadedWID) {
      this.loadedWID = this.a.profile.selectedWorkspace;
    }
    let project = null;

    if (this.loadedWID)
      project = this.sets.project.getCache(this.loadedWID);

    if (!project) {
      let keys = Object.keys(this.sets.project.fireDataValuesByKey);
      if (keys.length === 0) {
        project = null;
      } else {
        this.loadedWID = keys[0]
        project = this.sets.project.getCache(this.loadedWID);
      }
    }

    this.initProjectModels();
    await this.a._activateModels();

    if (this.context)
      this.context.deactivate();

    await this.splitLayout();
    this.signOutButton = this.dialog.querySelector('.signout-button');
    this.signOutButton.addEventListener('click', e => this.a.signOut());


    let saveKey = 'selectedBlockKey' + this.loadedWID;
    let rootKey = this.sets.block.getIdByFieldLookup('blockCode', 'demo');
    await this._updateSelectedBlock(rootKey);

    await this._updateGoogleFonts();
  }
  __updateSceneBlockBand(blockKey) {}
  show(scene) {
    this.context.activate(scene);
    if (this.canvasHelper) {
      this.canvasHelper.show();
    }
  }
  _updateSelectedBlock(blockKey = null) {
    if (!blockKey) {
      this.key = '';
      this.canvasHelper.show();
      return;
    }

    if (this.key !== blockKey) {
      this.show(null);
      this.canvasHelper.hide();
      let blockData = this.sets.block.getCache(profileKey);
      if (blockData) {
        this.__updateSceneBlockBand(profileKey);

        if (blockData.url)
          this.context.loadSceneURL(blockData.url).then(result => {
            this.__loadBlock(profileKey, blockData);
          });
        else
          this.__loadBlock(profileKey, blockData);
      } else {
        this.key = '';
        this.canvasHelper.show();
      }
    }
  }
  async loadRootBlock() {
    this.canvasHelper.logClear();
    let startTime = Date.now();

    let b = new wBlock(this.context);
    //document.title = blockData.title;
    b.staticType = 'block';
    b.staticLoad = true;
    b.blockKey = this.loadedWID;
    b.isContainer = true;
    this.context.setActiveBlock(b);
    this.scene = this.context.scene;
    this.rootBlock = b;
    this.canvasHelper.__updateVideoCallback();
    this.key = profileKey;
    this.rootBlock.setData(blockData);
    setTimeout(() => {
      this.canvasHelper.show();
      this._updateContextWithDataChange();
      this.activeContext.activeBlock.setData();
      this.profileUpdate();
      this.context.scene.switchActiveCamera(this.context.camera, this.context.canvas);
    }, 50);

    this.canvasHelper.logMessage('load: ' + (Date.now() - startTime).toString() + 'ms');
    this.canvasHelper.reportEngineDetails();
  }
  async initCanvas() {
    let canvasTemplate = this._canvasPanelTemplate();
    this.canvasWrapper = document.body.querySelector('.form_canvas_wrapper');
    this.canvasWrapper.innerHTML = canvasTemplate;

    this.canvas = this.dialog.querySelector('.popup-canvas');
    let wContext = await import('/lib/wcontext.js');
    this.context = new wContext.default(this, this.canvas, this.geoOptions);
    this.canvasActions = this.dialog.querySelector('.canvas-actions');
    this.canvasActions.style.display = '';
    this.loadedSceneURL = '';

    let cCanvasLib = await import('/lib/ccanvas.js');
    this.canvasHelper = new cCanvasLib.default(this);
    this.context.canvasHelper = this.canvasHelper;
    this.canvasHelper.hide();
    this.canvasHelper.saveAnimState = true;
    //this.canvasHelper.cameraShownCallback = () => this.canvasReady();
  }
  _canvasPanelTemplate() {
    return `<canvas class="popup-canvas"></canvas>
  <div class="video-overlay"><video></video></div>
  <div class="help-overlay"></div>
  <div class="canvas-actions">
    <button class="btn-sb-icon scene-options"><i class="material-icons">settings_brightness</i></button>
    <div class="scene-options-panel app-panel" style="display:none;">
      <div>
        <button class="signout-button">Sign Out</button>
      </div>
      <div class="scene-fields-container"></div>
      <div class="render-log-wrapper" style="display:none;">
        <button class="btn-sb-icon log-clear"><i class="material-icons">clear_all</i></button>
        <textarea class="render-log-panel" spellcheck="false"></textarea>
        <div class="fields-container" style="display:none;"></div>
      </div>
      <br>
      <button class="btn-sb-icon stop-button"><i class="material-icons">stop</i></button>
      <button class="btn-sb-icon video-button"><i class="material-icons">fiber_manual_record</i></button>
      <button class="btn-sb-icon download-button"><i class="material-icons">file_download</i></button>
      <button class="btn-sb-icon show-hide-log"><i class="material-icons">info_outline</i></button>
    </div>
    <div class="canvas-play-bar">
      <button class="btn-sb-icon play-button"><i class="material-icons">play_arrow</i></button>
      <button class="btn-sb-icon pause-button"><i class="material-icons">pause</i></button>
      <div class="run-length-label"></div>
      <input class="animate-range" type="range" step="any" value="0" min="0" max="100" />

      <div class="lightbar-fields-container"></div>
      <div class="camera-options-panel">
        <select class="camera-select"></select>
        <div>
          <div class="camera-slider-label"><i class="material-icons" style="transform:rotate(90deg)">straighten</i></div>
          <input class="camera-select-range-height-slider" type="range" step=".25" min="-15" max="40" />
        </div>
        <div>
          <div class="camera-slider-label">FOV</div>
          <input class="camera-select-range-fov-slider" type="range" step=".01" min="-1" max="2.5" value=".8" />
        </div>
        <div>
          <div class="camera-slider-label"><i class="material-icons">straighten</i></div>
          <input class="camera-select-range-slider" type="range" step="any" min="1" max="300" />
        </div>
        <div class="fields-container"></div>
        <div id="extra-options-camera-area"></div>
      </div>
    </div>
  </div>
  <button class="none-layout-mode-flip btn-sb-icon" style="display:none;"><i class="material-icons">code</i></button>`;
  }
  initProjectModels() {
    if (!this.loadedWID)
      return;
    this.sets.mesh = new cFirestoreData('workspace', this.loadedWID, 'mesh');
    this.sets.shape = new cFirestoreData('workspace', this.loadedWID, 'shape');
    this.sets.block = new cFirestoreData('workspace', this.loadedWID, 'block');
    this.sets.texture = new cFirestoreData('workspace', this.loadedWID, 'texture');
    this.sets.material = new cFirestoreData('workspace', this.loadedWID, 'material');

    this.registerFirebaseModels();
  }
  get sets() {
    return this.a.modelSets;
  }
  authInit() {
    this.a = new cAuthorization();
    this.a.signInWithURL();
    this.a.updateAuthUICallback = () => this.authUpdateUI();
  }
  authInitUI() {
    let div = document.createElement('div');
    div.innerHTML = this._loginPageTemplate();
    div = div.firstChild;
    document.body.insertBefore(div, document.body.firstChild);

    document.querySelector('#sign-in-button').addEventListener('click', e => {
      this.a.signIn();
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
        this.a.signInByEmail(email);
      });
    }
  }
  authUpdateUI() {
    let loginPage = document.getElementById('firebase-app-login-page');
    let mainPage = document.getElementById('firebase-app-main-page');

    if (this.a.loggedIn) {
      loginPage.style.display = 'none';
      mainPage.style.display = 'flex';
      this.mainUpdateUI();
    } else {
      loginPage.style.display = 'block';
      mainPage.style.display = 'none';
    }
  }
  get workspace() {
    let workspace = this.loadedWID;
    if (!workspace)
      workspace = 'default';
    return workspace;
  }
  _parseFontSize(str) {
    if (str === undefined)
      str = '';
    let size = parseFloat(str);
    if (isNaN(size))
      size = 9;
    if (size < 7)
      size = 7;
    if (size > 22)
      size = 22;
    return size;
  }
  async _updateGoogleFonts() {
    let editInfoBlocks = this.sets['block'].queryCache('blockFlag', 'googlefont');
    let fontLoaded = false;
    for (let id in editInfoBlocks) {
      let fontName = editInfoBlocks[id].genericBlockData;
      let origFontName = fontName;
      fontName = fontName.replace(/ /g, '+');

      if (!this.fontsAdded[origFontName]) {
        this.fontsAdded[origFontName] = true;
        let newLink = document.createElement('style');
        newLink.innerHTML = `@import url(https://fonts.googleapis.com/css?family=${fontName});`;
        document.body.append(newLink);
        let newSpan = document.createElement('span');
        newSpan.setAttribute('style', `font-family:${origFontName}`);
        document.body.append(newSpan);
        let a = newSpan.offsetHeight;
        newSpan.style.display = 'none';
        fontLoaded = true;
      }
    }

    if (fontLoaded) {
      this._loadDataLists('fontfamilydatalist');
      //allow fonts to reflow
      return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), 100);
      });
    }
  }
  __genBaseAppStyle() {
    let canvasColor = this.a.profile.canvasColor;
    if (!canvasColor)
      canvasColor = '';
    let opacityLevel = this.a.profile.opacityLevel;
    if (!opacityLevel)
      opacityLevel = .5;

    let bkg = gUtility.color(canvasColor);
    let bkgColor = gUtility.colorRGB255(canvasColor);
    let bkgColorTransparent = bkgColor.replace('rgb(', '');
    bkgColorTransparent = bkgColorTransparent.replace(')', '');
    bkgColorTransparent = 'rgba(' + bkgColorTransparent + ',' + opacityLevel.toString() + ')';
    let foreColor = 'rgb(50, 50, 50)';
    let boundsLines = '.1,.1,.1';
    let boundsBack = '.9,.9,.9';
    let ctlColor = 'rgb(250, 250, 250)';
    let ctlHalfColor = 'rgba(250, 250, 250, .7)';
    let niteMode = false;
    if ((bkg.r) + (bkg.b) + (2.5 * bkg.g) < 2) {
      let a = foreColor;
      foreColor = ctlColor;
      ctlHalfColor = 'rgba(50, 50, 50, .7)';
      ctlColor = a;
      niteMode = true;
      boundsBack = '.1,.1,.1';
      boundsLines = '.9,.9,.9';
    }
    this.appStyleDetails = {
      foreColor,
      bkgColor,
      ctlColor,
      ctlHalfColor,
      niteMode,
      boundsLines,
      boundsBack,
      opacityLevel
    };

    let css = '* { ';
    let fontSize = this._parseFontSize(this.a.profile.fontSize);
    css += 'font-size:' + fontSize.toString() + 'pt;';
    if (this.a.profile.fontFamily)
      css += 'font-family:' + this.a.profile.fontFamily + ';';
    css += `color:${foreColor};
      background: transparent;
    }

    select, input, button, textarea, .app-control {
      background-color: ${ctlColor};
      border-radius: .5em;
      border-color: rgb(200, 200, 200);
    }

    .app-panel {
      background: ${bkgColor};
    }

    .app-transparent {
      background: ${bkgColorTransparent};
    }

    .app-panel, .app-border, .app-control {
      border-style: outset;
      border-radius: 1em;
    }

    .app-inverted, .app-inverted i {
      color: ${ctlColor};
      background: ${foreColor}
    }
    `;

    css += `#main-view-wrapper { background: ${bkgColor}}`;

    css += `
    ::-webkit-scrollbar {
      height: 24px;
      width: 24px;
      background: ${bkgColor};
    }

    ::-webkit-scrollbar-thumb {
      background: none;
      background-image: radial-gradient(${foreColor} 10%,
        ${bkgColor});
      border: solid .05em ${bkgColor};
      border-radius: 5ex;
    }

    ::-webkit-scrollbar-corner {
      background: ${bkgColor};
    }

    input[type=range] {
      -webkit-appearance: none;
      background: transparent;
      margin: 0;
    }

    input[type=range]::-webkit-slider-runnable-track {
      width: 100%;
      cursor: pointer;
      background: radial-gradient(${foreColor} 40%,
        ${bkgColor});
      height: 2.5em;
      border: solid .1em ${bkgColor};
      border-radius: .75em;
    }

    input[type=range]::-webkit-slider-thumb {
      height: 2.3em;
      width: 2em;
      -webkit-appearance: none;
      border-radius: .75em;
      border: none;
      background-image: linear-gradient(90deg,
        ${foreColor},
        ${bkgColor},
        ${foreColor});
    }`;

    css += `
    .gutter {
      background-image: linear-gradient(0deg,
        ${bkgColor},
        ${foreColor},
        ${bkgColor});
      background-size: 100% 100%;
      background-position: center;
      background-repeat: no-repeat;
      background-color: ${foreColor};
      border: solid 0px ${bkgColor};
      border-radius: 5ex;
      border-bottom-right-radius: 0;
      border-top-right-radius: 0;
    }

    .gutter.gutter-horizontal {
      background-image: linear-gradient(90deg,
        ${bkgColor},
        ${foreColor},
        ${bkgColor});
      cursor: ew-resize;
      margin-top: 0px;
      border-left: solid 0px ${bkgColor};
      background-size: 100% 100%;
      border-radius: 0;
    }`;

    if (niteMode) {
      css += `
      .app-panel, .app-border, button, select, .app-control, input  {
        border-style: solid;
        border-radius: 0;
      }

      input[type=range]::-webkit-slider-runnable-track {
        background: rgb(50, 50, 50);
        border: outset .1em silver;
        border-radius: .1em;
      }

      .form-group-container-group {
        border-radius: 0;
        border-style: solid;
      }

      input[type=range]::-webkit-slider-thumb {
        background: rgb(250, 250, 250);
        border-radius: .1em;
      }

      ::-webkit-scrollbar-thumb {
        background: none;
        background-image: radial-gradient(${foreColor} 10%,
          ${bkgColor} 35%,
        ${foreColor} 70%);
        border: solid .05em ${bkgColor};
        border-radius: .1em;
      }

      .gutter {
        background-image: linear-gradient(0deg,
          ${foreColor},
          ${bkgColor},
          ${foreColor},
          ${bkgColor},
          ${foreColor});
        background-color: ${foreColor};
        border: solid 0px ${bkgColor};
        border-radius: .05em;
        border-bottom-right-radius: 0;
        border-top-right-radius: 0;
      }

      .gutter.gutter-horizontal {
        background-image: linear-gradient(90deg,
          ${foreColor},
          ${bkgColor},
          ${foreColor},
          ${bkgColor},
          ${foreColor});
        cursor: ew-resize;
        margin-top: 0px;
        border-left: solid 0px ${bkgColor};
        background-size: 100% 100%;
        border-radius: 0;
      }

      .band-background-preview .img-holder {
        background-image: url(/images/addimage_nitemode.svg);
      }

      .workspace-asset-link-display .img-holder {
        background-image: url(/images/addimage_nitemode.svg);
      }
      `;
    }
    return css;
  }
  styleUpdate() {
    let css = this.__genBaseAppStyle();
    if (this.lastStyleProfileCSS === css)
      return;
    this.lastStyleProfileCSS = css;

    if (this.styleProfileDom !== null) {
      this.styleProfileDom.parentNode.removeChild(this.styleProfileDom);
    }

    this.styleProfileDom = document.createElement('style');
    this.styleProfileDom.innerHTML = css;
    document.body.appendChild(this.styleProfileDom);
  }
  _loginPageTemplate(title = `Dynamic Reality App`) {
    return `<div id="firebase-app-login-page" style="display:none;">
      <h3>${title}</h3>
      <div>
        <button id="sign-in-button" class="btn btn-primary">Sign in with Google</button>
        <hr>
        <label><input id="sign-in-by-email-link" name="email" type="email" style="width:14em;" placeholder="Email (no password)"></label>
        <button id="sign-in-email-button" class="btn btn-primary">Email link to logon</button>
      </div>
    </div>`;
  }
  splitLayout() {
    if (['Left', 'Right', 'Top', 'Bottom'].indexOf(this.layoutMode) !== -1) {
      this.form_panel_view_dom = document.querySelector('.form_panel_view_dom');
      this.form_canvas_wrapper = document.querySelector('.form_canvas_wrapper');

      let l = this.form_canvas_wrapper;
      let r = this.form_panel_view_dom;
      if (this.layoutMode === 'Right' || this.layoutMode === 'Bottom') {
        l = this.form_panel_view_dom;
        r = this.form_canvas_wrapper;
        l.parentNode.insertBefore(l, r);
      }

      let splitOrientation = 'horizontal';
      if (this.layoutMode === 'Top' || this.layoutMode === 'Bottom') {
        splitOrientation = 'vertical';
        this.dialog.style.display = 'block';
      } else {
        this.form_panel_view_dom.parentNode.style.display = 'flex';
        this.dialog.style.display = 'flex';
      }
      this.splitInstance = window.Split([l, r], {
        sizes: [40, 60],
        gutterSize: 20,
        direction: splitOrientation,
        onDragEnd: () => this.resize(),
        onDrag: () => this.resize()
      });
    } else if (['Edit', 'View'].indexOf(this.layoutMode) !== -1) {
      this.form_panel_view_dom = document.querySelector('.form_panel_view_dom');
      this.form_canvas_wrapper = document.querySelector('.form_canvas_wrapper');
      this.dialog.style.display = 'block';
      this.codeModeFromView = this.dialog.querySelector('.none-layout-mode-flip');
      this.codeModeFromView.style.display = 'inline-block';
      this.codeModeFromView.addEventListener('click', async e => {
        await this.sets.profile.update({
          formLayoutMode: 'Top'
        });

        setTimeout(() => location.reload(), 1);
      });
      if (this.layoutMode === 'Edit') {
        this.form_canvas_wrapper.style.display = 'none';
        this.mainViewWrapper.style.display = 'flex';
      }

      if (this.layoutMode === 'View') {
        this.form_panel_view_dom.style.display = 'none';
      }
    } else if (this.layoutMode === 'Demo') {
      this.dialog.style.display = 'block';
    }
    if (!this.layoutMode)
      this.layoutMode = '';
    this.dialog.classList.add('bview-layoutmode-' + this.layoutMode.toLowerCase());
  }
  layoutTemplate() {
    if (['Left', 'Right', 'Top', 'Bottom', 'View', 'Edit'].indexOf(this.layoutMode) !== -1)
      return this.splitLayoutTemplate();

    return `<div id="firebase-app-main-page" style="display:none;">
  <div id="renderLoadingCanvas" style="display:none;"><br><br>Working...</div>
  <div id="main-view-wrapper">
    <div class="form_canvas_wrapper"></div>
  </div>
</div>`;
  }
  profilePanelTemplate() {
    return `<div id="record_field_list">
      <form autocomplete="off" onsubmit="return false;"></form>
    </div>
    <button id="sign-out-button" style="float:right;"><i class="material-icons">account_box</i> Sign out </button>
    <button id="user-profile-dialog-reset-button" style="float:right;"><i class="material-icons">account_circle</i> Reset Profile </button>
    <select id="view_layout_select" style="float:right;">
      <option>View</option>
      <option>Top</option>
      <option>Left</option>
      <option>Bottom</option>
      <option>Right</option>
      <option>Edit</option>
    </select>
    <div class="fields-container" style="float:right;clear:right;"></div>
    <div style="clear:both;display:inline-block;float:right;">
      <img src='' class="user-profile-image" />
      <div class="user-profile-info"></div>
    </div>`;
  }
  updateProjectList(rawRecordList, selectedWorkspace = null) {
    this.projectList = rawRecordList;
    if (!this.workplacesSelect)
      return;

    let html = '';
    let records = {};

    if (this.filterActiveWorkspaces) {
      for (let i in rawRecordList) {
        let r = rawRecordList[i];
        let tagList = (r.tags) ? r.tags.split(',') : [];
        if (tagList.indexOf('active') !== -1)
          records[i] = r;
      }
    } else {
      records = rawRecordList;
    }


    let orderedRecords = [];
    for (let i in records) {
      records[i].id = i;
      orderedRecords.push(records[i]);
    }
    orderedRecords.sort((a, b) => {
      if (a.title > b.title) return -1;
      if (a.title < b.title) return 1;

      return 0;
    });

    for (let c = 0, l = orderedRecords.length; c < l; c++) {
      let code = '';
      if (orderedRecords[c].tags)
        code = orderedRecords[c].tags;
      let o = `<option value="${orderedRecords[c].id}">${orderedRecords[c].title}</option>`;

      if (orderedRecords[c].id === 'default')
        html += o;
      else
        html = o + html;
    }
    let val = selectedWorkspace;
    if (val === null)
      val = this.workplacesSelect.value;
    this.workplacesSelect.innerHTML = html;
    this.workplacesSelect.value = val;

    if (!records || !records[val])
      return;
    this.lastWorkspaceName = records[val].title;
    this.lastWorkspaceCode = records[val].tags;

    if (this.workplacesSelectEditName) {
      this.workplacesSelectEditName.value = records[val].title;
      let code = '';
      if (records[val].tags)
        code = records[val].tags;
      this.workplacesSelectEditCode.value = code;
      gAPPP.workspaceCode = code;
    }

    if (this.workplacesSelect.selectedIndex === -1) {
      this.workplacesSelect.selectedIndex = 0;
      this.selectProject();
    }
  }
  expandAll() {
    if (this.fireFields)
      this.fireFields.helpers.expandAll();
    this.detailsShown = true;

    this.sets.profile.update({
      applicationDetailsShown: this.detailsShown
    });
  }
  collapseAll() {
    if (this.fireFields)
      this.fireFields.helpers.collapseAll();
    this.detailsShown = false;

    this.sets.profile.update({
      applicationDetailsShown: this.detailsShown
    });
  }
  _updateQueryString(newWid) {
    let queryString = `?wid=${newWid}`;

    let url = window.location.protocol + "//" + window.location.host + window.location.pathname + queryString;

    if (url !== this.url) {
      window.history.pushState({
        path: url
      }, '', url);
      this.url = url;
    }

    return;
  }
  _updateContextWithDataChange(tag, values, type, fireData) {
    if (this.rootBlock)
      this.rootBlock.handleDataUpdate(tag, values, type, fireData);
    if (this.canvasHelper)
      this.canvasHelper.testError();
  }
  registerFirebaseModels() {
    this.canvasFBRecordTypes.forEach(recType => {
      if (this.sets[recType])
        this.sets[recType].childListeners.push(
          (values, type, fireData) => this._updateContextWithDataChange(recType, values, type, fireData));
    });
    if (this.sets.profile)
      this.sets.profile.childListeners.push(
        (values, type, fireData) => this.profileUpdate(values, type, fireData));
  }
}
