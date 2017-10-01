/* firebase bound data list with events - 1 instance per firebase collection/list */
'use strict';
class MDLFirebaseList extends mdlFirebaseReference {
  constructor(dataPrefix) {
    super(dataPrefix);

    this.fireDataByKey = {};
    this.fireDataValuesByTitle = {};
    this.fireDataValuesByKey = {};
  }
  getKey() {
    return firebase.database().ref().child(this.dataPrefix).push().key
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
