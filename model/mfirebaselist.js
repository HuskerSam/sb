class mFirebaseList extends mFirebaseSuper {
  constructor(referencePath, listtag) {
    super(referencePath, false);

    this.keyList = true;
    this.fireDataByKey = {};
    this.fireDataValuesByKey = {};

    this.domTitleList = null;
    if (listtag) {
      this.domTitleList = document.createElement('datalist');
      this.domTitleList.id = listtag + 'datatitlelookuplist';
      document.body.appendChild(this.domTitleList);
    }
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
  commitData(values, key) {
    this.set(key, values);
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

          this.set(key, data).then(r => resolve(r));
        }).catch(e => reject(e));
      } else {
        this.set(key, data).then(r => resolve(r));
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
        resolve(snapshot);
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
              r => resolve(r));
          }).catch(
          error => reject(error));
      } else {
        this.set(key, data).then(r => resolve(r));
      }
    });
  }
  newScene(sceneString, title) {
    return new Promise((resolve, reject) => {
      let key = this.getKey();

      this.setString(key, sceneString, 'scene.babylon').then(
        snapshot => {
          if (!title)
            title = new Date().toISOString();

          let sceneData = sStatic.getDefaultDataCloned('scene');
          sceneData.title = title;
          sceneData.url = snapshot.downloadURL;
          sceneData.type = 'url';
          sceneData.size = snapshot.totalBytes;

          this.set(key, sceneData).then(
            e => resolve(e)).catch(
            error => reject(error))
        });
    });
  }
  newMaterial(title) {
    return new Promise((resolve, reject) => {
      let key = this.getKey();
      let data = sStatic.getDefaultDataCloned('material');
      data.title = title;

      this.set(key, data).then(e => resolve(e));
    });
  }
  removeByKey(key) {
    return new Promise((resolve, reject) => {
      let updates = {};
      updates['/' + this.referencePath + '/' + key] = null;
      firebase.database().ref().update(updates).then(e => resolve(e));
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
    for (let i in this.fireDataValuesByKey)
      if (this.fireDataValuesByKey[i][field] === value)
        return this.fireDataValuesByKey[i];
    return null;
  }
  _updateDomLookupList() {
    if (!this.domTitleList)
      return;
    let innerHTML = '';
    for (let i in this.fireDataValuesByKey)
      innerHTML += '<option>' + this.fireDataValuesByKey[i]['title'].toString() + '</option>';
    this.domTitleList.innerHTML = innerHTML;
  }
}
