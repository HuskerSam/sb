/* firebase bound data list with events - 1 instance per firebase collection/list */
'use strict';
class MDLFirebaseList {
  constructor(dataPrefix) {
    let me = this;
    this.active = true;
    this.userId = firebase.auth().currentUser.uid;
    this.dataPrefix = dataPrefix;
    this.notiRef = firebase.database().ref(this.dataPrefix);
    this.notiRef.on('child_added', (data) => me.childAdded(data));
    this.notiRef.on('child_changed', (data) => me.childChanged(data));
    this.notiRef.on('child_removed', (data) => me.childRemoved(data));
    this.fireDataByKey = {};
    this.fireDataValuesByTitle = {};
    this.fireDataValuesByKey = {};
    this.childListeners = [];
  }
  destroy() {
    if (!this.active)
      return;
    this.domContainer.innerHTML = '';
    this.notiRef.off();
    this.active = false;
  }
  getKey() {
    return firebase.database().ref().child(this.dataPrefix).push().key
  }
  childAdded(fireData) {
    this.updateStash(fireData);
    this.notifyChildren(fireData, 'add');
  }
  notifyChildren(fireData, type) {
    for (let i in this.childListeners)
      this.childListeners[i](fireData, type);
  }
  updateStash(fireData, remove) {
    let key = fireData.key;
    if (remove) {
      delete this.fireDataByKey[key];
      delete this.fireDataValuesByKey[key];
      if (this.fireDataValuesByTitle[key])
        delete this.fireDataValuesByTitle[key];
      return;
    }

    this.fireDataByKey[key] = fireData;
    this.fireDataValuesByKey[key] = fireData.val();
    if (this.fireDataValuesByKey[key].title)
      this.fireDataValuesByTitle[this.fireDataValuesByKey[key].title] = this.fireDataValuesByKey[key];
  }
  childChanged(fireData) {
    this.updateStash(fireData);
    this.notifyChildren(fireData, 'change');
  }
  childRemoved(fireData) {
    this.updateStash(fireData, true);
    this.notifyChildren(fireData, 'remove');
  }
  set(id, jsonData) {
    let updates = {};
    updates['/' + this.dataPrefix + '/' + id] = jsonData;
    return firebase.database().ref().update(updates);
  }
  setString(id, dataString, filename) {
    let me = this;
    return new Promise(function(resolve, reject) {
      var storageRef = firebase.storage().ref();
      var auth = firebase.auth();
      storageRef.child(me.dataPrefix + '/' + id + '/' + filename).putString(dataString).then(function(snapshot) {
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
      storageRef.child(me.dataPrefix + '/' + id + '/' + filename).put(blob).then(function(snapshot) {
        resolve(snapshot);
      }).catch(function(error) {
        reject(error);
      });
    });
  }
  newMesh(meshString, meshName) {
    let me = this;
    return new Promise(function(resolve, reject) {
      let key = me.getKey();

      me.setString(key, meshString, 'file.babylon').then(function(snapshot) {
        let title = meshName;
        if (!title)
          title = new Date().toISOString();

        let meshData = gAPPP.renderEngine.getNewMeshData();
        meshData.title = title;
        meshData.meshName = meshName;
        meshData.url = snapshot.downloadURL;
        meshData.type = 'url';
        meshData.size = snapshot.totalBytes;

        me.set(key, meshData).then(function(e) {
          resolve(e);
        })
      }).catch(function(error) {
        reject(error);
      });
    });
  }
  newScene(sceneString, title) {
    let me = this;
    return new Promise(function(resolve, reject) {
      let key = me.getKey();

      me.setString(key, sceneString, 'file.babylon').then(function(snapshot) {
        if (!title)
          title = new Date().toISOString();

        let sceneData = gAPPP.renderEngine.getNewSceneData();
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
        let textureData = gAPPP.renderEngine.getNewTextureData();
        textureData.title = title;
        textureData.url = snapshot.downloadURL;
        textureData.size = snapshot.totalBytes;

        me.set(key, textureData).then(function(e) {
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
      let data = gAPPP.renderEngine.getNewMaterialData();
      data.title = title;

      me.set(key, data).then(function(e) {
        resolve(e);
      });
    });
  }
  removeByKey(key) {
    return new Promise((resolve, reject) => {
      let updates = {};
      updates['/' + this.dataPrefix + '/' + key] = null;
      firebase.database().ref().update(updates).then(e => resolve(e));
    });
  }
}
