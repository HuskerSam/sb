/* firebase bound data list */
class mFirebaseList extends mFirebaseSuper {
  constructor(referencePath, listtag) {
    super(referencePath, false);

    this.keyList = true;
    this.fireDataByKey = {};
    this.fireDataValuesByKey = {};

    this.domTitleList = document.createElement('datalist');
    this.domTitleList.id = listtag + 'datatitlelookuplist';
    document.body.appendChild(this.domTitleList);
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
    let me = this;
    return new Promise(function(resolve, reject) {
      var storageRef = firebase.storage().ref();
      var auth = firebase.auth();
      storageRef.child(me.referencePath + '/' + id + '/' + filename).putString(dataString).then(function(snapshot) {
        resolve(snapshot);
      }).catch(function(error) {
        reject(error);
      });
    });
  }
  setBlob(id, blob, filename) {
    let me = this;
    return new Promise(function(resolve, reject) {
      var storageRef = firebase.storage().ref();
      var auth = firebase.auth();
      storageRef.child(me.referencePath + '/' + id + '/' + filename).put(blob).then(function(snapshot) {
        resolve(snapshot);
      }).catch(function(error) {
        reject(error);
      });
    });
  }
  createWithBlobString(data, blobString, filename) {
    let me = this;
    return new Promise((resolve, reject) => {
      let key = me.getKey();

      if (blobString) {
        me.setString(key, blobString, filename).then(sr => {
          data.url = sr.downloadURL;
          data.type = 'url';
          data.size = sr.totalBytes;

          me.set(key, data).then(r => resolve(r));
        }).catch(e => reject(e));
      }
      else {
        me.set(key, data).then(r => resolve(r));
      }
    });
  }
  newScene(sceneString, title) {
    let me = this;
    return new Promise(function(resolve, reject) {
      let key = me.getKey();

      me.setString(key, sceneString, 'file.babylon').then(function(snapshot) {
        if (!title)
          title = new Date().toISOString();

        let sceneData = sStatic.getDefaultDataCloned('scene');
        sceneData.title = title;
        sceneData.url = snapshot.downloadURL;
        sceneData.type = 'url';
        sceneData.size = snapshot.totalBytes;

        me.set(key, sceneData).then(function(e) {
          resolve(e);
        })
      }).catch(function(error) {
        reject(error);
      });
    });
  }
  newTexture(textureBlob, title) {
    let me = this;
    return new Promise((resolve, reject) => {
      let key = me.getKey();
      me.setBlob(key, textureBlob, 'texturefile').then(function(snapshot) {
        let textureData = sStatic.getDefaultDataCloned('texture');
        textureData.title = title;
        textureData.url = snapshot.downloadURL;
        textureData.size = snapshot.totalBytes;

        me.set(key, textureData).then(e => {
          resolve(e);
        })
      }).catch(function(error) {
        reject(error);
      });
    });
  }
  newMaterial(title) {
    let me = this;
    return new Promise((resolve, reject) => {
      let key = me.getKey();
      let data = sStatic.getDefaultDataCloned('material');
      data.title = title;

      me.set(key, data).then(function(e) {
        resolve(e);
      });
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
    let me = this;
    return new Promise((resolve, reject) => {
      let newKey = this.getKey();
      let data = this.getCache(key);
      let newData = JSON.parse(JSON.stringify(data));
      me.set(newKey, newData);
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
    let innerHTML = '';
    for (let i in this.fireDataValuesByKey)
      innerHTML += '<option>' + this.fireDataValuesByKey[i]['title'].toString() + '</option>';
    this.domTitleList.innerHTML = innerHTML;
  }
}
