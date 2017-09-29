class clsFirebaseModel {
  constructor(dataPrefix, domPrefix, keyList) {
    let me = this;
    this.active = true;
    this.userId = firebase.auth().currentUser.uid;
    this.dataPrefix = dataPrefix;
    this.domPrefix = domPrefix;
    let qs = '#sb-' + this.domPrefix + '-floating-toolbar-item .sb-floating-toolbar-content';
    this.domContainer = document.querySelector(qs);
    this.keyList = keyList;
    this.notiRef = firebase.database().ref(this.dataPrefix);
    this.notiRef.on('child_added', (data) => me.childAdded(data));
    this.notiRef.on('child_changed', (data) => me.childChanged(data));
    this.notiRef.on('child_removed', (data) => me.childRemoved(data));
    this.fireDataStash = {};
    this.fireDataName = {};
    this.fireDataValues = {};
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
    this.domContainer.insertBefore(this.createDOM(fireData), this.domContainer.firstChild);
  }
  updateStash(fireData, remove) {
    let key = fireData.key;
    if (remove) {

      delete this.fireDataStash[key];
      delete this.fireDataValues[key];
      if (this.fireDataName[key])
        delete this.fireDataName[key];
      return;
    }

    this.fireDataStash[key] = fireData;
    this.fireDataValues[key] = fireData.val();
    if (this.fireDataValues[key].title)
      this.fireDataName[this.fireDataValues[key].title] = this.fireDataValues[key];
  }
  childChanged(fireData) {
    this.updateStash(fireData);
    var div = document.querySelector('.' + this.domPrefix + '-' + fireData.key);
    let values = fireData.val();
    for (let i in this.keyList) {
      try {
        let key = this.keyList[i];
        let ele = div.getElementsByClassName(this.domPrefix + '-' + key)[0];
        let val = values[key];
        if (val !== undefined)
          ele.innerText = values[key];
      } catch (e) {
        console.log('FireSet.childChanged ' + key + ' failed', e);
      }
    }
  }
  childRemoved(fireData) {
    this.updateStash(fireData, true);
    let post = document.querySelector('.' + this.domPrefix + '-' + fireData.key);
    if (post)
      this.domContainer.removeChild(post);
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
  createDOM(fireData) {
    let me = this;

    let domPrefix = this.domPrefix;
    let html = `<div class="firebase-item ${domPrefix}-${fireData.key}"><div class="${domPrefix}-title"></div>`;
    html += `<button class="${domPrefix}-remove btn-toolbar-icon"><i class="material-icons">delete</i></button>`;
    html += `<button class="${domPrefix}-details btn-toolbar-icon"><i class="material-icons">settings</i></button>`;
    html += `</div>`

    var outer = document.createElement('div');
    outer.innerHTML = html.trim();
    for (let i in this.keyList) {
      let key = this.keyList[i];
      try {
        let ele = outer.getElementsByClassName(this.domPrefix + '-' + key)[0];
        let val = fireData.val()[key];
        if (val !== undefined)
          ele.innerText = val;
      } catch (e) {
        console.log('FireSet.createNode ' + key + ' failed', e);
      }
    }

    let remove_div = outer.getElementsByClassName(this.domPrefix + '-remove')[0];
    if (remove_div)
      remove_div.addEventListener('click', (e) => me.removeElement(e, fireData.key), false);

    let details_div = outer.getElementsByClassName(this.domPrefix + '-details')[0];
    let key = fireData.key;
    if (details_div)
      details_div.addEventListener('click', (e) => me.showPopup(e, key), false);

    return outer.childNodes[0];
  }
  showPopup(e, key) {
    if (this.domPrefix === 'textures-edit')
      return alert(this.fireDataStash[key].val().url);
    if (gAPPP.dialogs[this.domPrefix + '-edit'])
      return gAPPP.dialogs[this.domPrefix + '-edit'].show(this.fireDataStash[key], this);
  }
  removeElement(e, fireKey) {
    if (!confirm('Are you sure you want to delete this ' + this.domPrefix + '?'))
      return;
    let updates = {};
    updates['/' + this.dataPrefix + '/' + fireKey] = null;
    firebase.database().ref().update(updates).then(function(e) {});
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
    return new Promise(function(resolve, reject) {
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
    return new Promise(function(resolve, reject) {
      let key = me.getKey();
      let data = gAPPP.renderEngine.getNewMaterialData();
      data.title = title;

      me.set(key, data).then(function(e) {
        resolve(e);
      });
    });
  }
}
