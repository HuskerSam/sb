class clsAuthorizationController {
  constructor(signInQS, signOutQS) {
    let me = this;
    this.currentUser = {};
    this.fireSets = [];

    document.querySelector(signInQS).addEventListener('click', () => me.signIn(), false);
    document.querySelector(signOutQS).addEventListener('click', () => me.signOut(), false);

    firebase.auth().onAuthStateChanged((user) => me.onAuthStateChanged(user));
  }
  userWriteData() {
    firebase.database().ref('users/' + this.currentUser.uid).set(this.currentUser.toJSON());
  }
  signIn() {
    this.provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(this.provider);
  }
  signOut() {
    firebase.auth().signOut();
  }
  updateUI() {
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
  onAuthStateChanged(user) {
    //ignore unwanted events
    if (user && this.currentUser.uid === user.uid) {
      return;
    }

    for (let i in this.fireSets)
      this.fireSets[i].destroy();
    this.fireSets = [];

    if (user) {
      this.currentUser = user;
      this.loggedIn = true;
      this.userWriteData();

      this.meshesFireSet = new clsFirebaseModel('lib_meshes', 'meshes', ['title'], this.defaultItemTemplate);
      this.fireSets.push(this.meshesFireSet);
      this.texturesFireSet = new clsFirebaseModel('lib_textures', 'textures', ['title'], this.defaultItemTemplate);
      this.fireSets.push(this.texturesFireSet);
      this.materialsFireSet = new clsFirebaseModel('lib_materials', 'materials', ['title'], this.defaultItemTemplate);
      this.fireSets.push(this.materialsFireSet);
      this.scenesFireSet = new clsFirebaseModel('lib_scenes', 'scenes', ['title'], this.defaultItemTemplate);
      this.fireSets.push(this.scenesFireSet);
    } else {
      this.currentUser = {};
      this.loggedIn = false;
    }

    this.updateUI();
  }
  newMesh(meshString, meshName) {
    let me = this;
    return new Promise(function(resolve, reject) {
      let key = me.meshesFireSet.getKey();

      me.meshesFireSet.setString(key, meshString, 'file.babylon').then(function(snapshot) {
        let title = meshName;
        if (!title)
          title = new Date().toISOString();

        let meshData = gAPPP.renderEngine.getNewMeshData();
        meshData.title = title;
        meshData.meshName = meshName;
        meshData.url = snapshot.downloadURL;
        meshData.type = 'url';
        meshData.size = snapshot.totalBytes;

        me.meshesFireSet.set(key, meshData).then(function(e) {
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
      let key = me.scenesFireSet.getKey();

      me.scenesFireSet.setString(key, sceneString, 'file.babylon').then(function(snapshot) {
        if (!title)
          title = new Date().toISOString();

        let sceneData = gAPPP.renderEngine.getNewSceneData();
        sceneData.title = title;
        sceneData.url = snapshot.downloadURL;
        sceneData.type = 'url';
        sceneData.size = snapshot.totalBytes;

        me.scenesFireSet.set(key, sceneData).then(function(e) {
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
      let key = me.meshesFireSet.getKey();
      me.texturesFireSet.setBlob(key, textureBlob, 'texturefile').then(function(snapshot) {
        let textureData = gAPPP.renderEngine.getNewTextureData();
        textureData.title = title;
        textureData.url = snapshot.downloadURL;
        textureData.size = snapshot.totalBytes;

        me.texturesFireSet.set(key, textureData).then(function(e) {
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
      let key = me.meshesFireSet.getKey();
      let data = gAPPP.renderEngine.getNewMaterialData();
      data.title = title;

      me.materialsFireSet.set(key, data).then(function(e) {
        resolve(e);
      });
    });
  }

  fileToURL(file) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.addEventListener("loadend", function() {
        resolve(reader.result);
      });
      reader.readAsText(file);
    }, false);
  }
  urlToDataURL(url) {
    let me = this;
    return new Promise(function(resolve, reject) {
      let xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'blob';

      xhr.onload = function(e) {
        if (this.status == 200) {
          let blob = new Blob([this.response]);
          me.fileToURL(blob).then((r) => {
            resolve(r);
          });
        }
      };
      xhr.send();
    });
  }
  defaultItemTemplate(domPrefix, fireData) {
    return `<div id="${domPrefix}-${fireData.key}" class="firebase-item">
  <div class="${domPrefix}-title"></div>
  <button class="${domPrefix}-remove btn-toolbar-icon"><i class="material-icons">delete</i></button>
  <button class="${domPrefix}-details btn-toolbar-icon"><i class="material-icons">settings</i></button>
</div>`;
  }
}
