class mFirebaseList extends bFirebase {
  constructor(workspaceid, tag, datalist = false) {
    super(tag, false);

    if (workspaceid)
      this.referencePath = '/project/' + workspaceid + '/' + tag + '/';
    this.keyList = true;
    this.fireDataByKey = {};
    this.fireDataValuesByKey = {};
    this.childSets = [];

    this.domTitleList = null;
    if (datalist) {
      this.domTitleList = document.createElement('datalist');
      this.domTitleList.id = this.tag + 'datatitlelookuplist';
      document.body.appendChild(this.domTitleList);
    }

    this.startingOptionList = '';
    if (this.tag === 'material')
      this.startingOptionList = '<option>color: 1,1,1</option><option>color: 0,0,0</option><option>color: 1,0,0</option><option>color: 0,1,0</option><option>color: 0,0,1</option>';

    if (this.tag === 'texture'){
      this.startingOptionList = document.getElementById('sbimageslist').innerHTML;
    }

    this.childOrderByKey = [];
    this._updateDomLookupList();
  }
  notifyChildren(fireData, type) {
    super.notifyChildren(fireData, type);
    this._updateDomLookupList();
  }
  getKey() {
    return firebase.database().ref().child(this.referencePath).push().key;
  }
  getCache(key) {
    if (key)
      return this.fireDataValuesByKey[key];
    return null;
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
  childMoved(fireData) {
    this.getCache(fireData.key).sortKey = fireData.val().sortKey;

    this._updateDomLookupList();
    super.childMoved(fireData);
  }
  updateStash(fireData, remove) {
    let key = fireData.key;
    if (remove) {
      delete this.fireDataByKey[key];
      delete this.fireDataValuesByKey[key];
      return;
    }

    this.fireDataByKey[key] = fireData;
    this.fireDataValuesByKey[key] = fireData.val();
  }
  set(id, jsonData) {
    let updates = {};
    updates['/' + this.referencePath + '/' + id] = jsonData;
    return firebase.database().ref().update(updates);
  }
  setString(id, dataString, filename) {
    return new Promise((resolve, reject) => {
      let storageRef = firebase.storage().ref();
      let auth = firebase.auth();
      let ref = storageRef.child(this.referencePath + '/' + id + '/' + filename);

      ref.putString(dataString).then(
        snapshot => resolve(snapshot)).catch(
        error => reject(error));
    });
  }
  setBlob(id, blob, filename) {
    return new Promise((resolve, reject) => {
      let storageRef = firebase.storage().ref();
      let auth = firebase.auth();
      let ref = storageRef.child(this.referencePath + '/' + id + '/' + filename)
      ref.put(blob).then(
        snapshot => resolve(snapshot)).catch(
        error => reject(error));
    });
  }
  createWithBlobString(data, blobString, filename) {
    return new Promise((resolve, reject) => {
      let key = this.getKey();

      if (blobString) {
        this.setString(key, blobString, filename).then(sr => {
          data.url = sr.downloadURL;
          data.type = 'url';
          data.size = sr.totalBytes;

          this.set(key, data).then(r => resolve({
            key,
            url: data.url
          }));
        }).catch(e => reject(e));
      } else {
        this.set(key, data).then(r => resolve({
          key,
          url: ''
        }));
      }
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
        this.commitUpdateList(updates, key);
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
        this.commitUpdateList(updates, key);
        resolve({
          result: snapshot,
          url: snapshot.downloadURL
        });
      });
    });
  }
  createWithBlob(data, blob, filename) {
    return new Promise((resolve, reject) => {
      let key = this.getKey();

      if (blob) {
        this.setBlob(key, blob, filename).then(
          sr => {
            data.url = sr.downloadURL;
            data.type = 'url';
            data.size = sr.totalBytes;

            this.set(key, data).then(
              r => resolve({
                url: data.url,
                key
              }));
          }).catch(
          error => reject(error));
      } else {
        this.set(key, data).then(r => resolve({
          key,
          url: ''
        }));
      }
    });
  }
  queryCache(keyName, keyValue) {
    let results = {};
    for (let i in this.fireDataValuesByKey)
      if (this.fireDataValuesByKey[i][keyName] === keyValue)
        results[i] = this.fireDataValuesByKey[i];

    return results;
  }
  fetchByKeyNOTUSED(key) {
    return new new Promise((resolve, reject) => {
      if (!key)
        return resolve(null);

      let cache = this.getCache(key);

      if (cache)
        return resolve(cache);

      let once = firebase.database().ref(this.referencePath + '/' + key);
      once.once('value', snapshot => resolve(snapshot.val()));
    });
  }
  removeByKey(key) {
    if (!key) {
      alert('invalid removebykey (empty key)');
      return;
    }
    let values = this.getCache(key);
    return new Promise((resolve, reject) => {
      let updates = {};
      updates['/' + this.referencePath + '/' + key] = null;

      for (let c = 0, l = this.childSets.length; c < l; c++) {
        let children = gAPPP.a.modelSets[this.childSets[c]].queryCache('parentKey', key)

        for (let i in children)
          gAPPP.a.modelSets[this.childSets[c]].removeByKey(i).then(final => {});
      }
      firebase.database().ref().update(updates).then(e => {
        if (!values)
          return resolve(e);
        let url = values['url'];
        if (url === undefined)
          url = '';
        if (url.indexOf(key) !== -1) {
          let shortPath = url.replace(gAPPP.storagePrefix, '');
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
  cloneByKey(key) {
    return new Promise((resolve, reject) => {
      let newKey = this.getKey();
      let data = this.getCache(key);
      let newData = JSON.parse(JSON.stringify(data));
      this.set(newKey, newData);
      resolve(newKey);
    });
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
  getIdByFieldLookup(field, value) {
    let obj = this.getValuesByFieldLookup(field, value);
    if (obj)
      return this.lastKeyLookup;

    return null;
  }
  _updateDomLookupList() {
    this.updateChildOrder();
    if (!this.domTitleList)
      return;
    let innerHTML = this.startingOptionList;
    let list = this.childOrderByKey;
    for (let i = list.length - 1; i >= 0; i--) {
      if (this.fireDataValuesByKey[list[i]]) {
        let option = '<option>' + this.fireDataValuesByKey[list[i]]['title'] + '</option>';
        innerHTML = option + innerHTML;
      }
    }

    this.domTitleList.innerHTML = innerHTML;
  }
  commitUpdateList(fieldUpdates, key) {
    if (!key) {
      console.log('commitUpdateList no key error', fieldUpdates, key);
      return;
    }
    return super.commitUpdateList(fieldUpdates, key);
  }
}
