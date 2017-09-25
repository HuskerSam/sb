class clsFirebaseHelper {
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

      this.meshesFireSet = new FireSet('lib_meshes', 'meshes', ['title'], this.defaultItemTemplate);
      this.fireSets.push(this.meshesFireSet);
      this.texturesFireSet = new FireSet('lib_textures', 'textures', ['title'], this.defaultItemTemplate);
      this.fireSets.push(this.texturesFireSet);
      this.materialsFireSet = new FireSet('lib_materials', 'materials', ['title'], this.defaultItemTemplate);
      this.fireSets.push(this.materialsFireSet);
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

        let meshData = me.getNewMeshData();
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
  newTexture(textureBlob, title) {
    let me = this;
    return new Promise(function(resolve, reject) {
      let key = me.meshesFireSet.getKey();
      me.texturesFireSet.setBlob(key, textureBlob, 'texturefile').then(function(snapshot) {
        let textureData = me.getNewTextureData();
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
  newMaterial(title, color) {
    let me = this;
    return new Promise(function(resolve, reject) {
      let key = me.meshesFireSet.getKey();
      let data = me.getNewMaterialData();
      data.title = title;

      me.materialsFireSet.set(key, data).then(function(e) {
        resolve(e);
      });
    });
  }
  getNewMeshData() {
    return {
      title: 'Mesh',
      meshName: '',
      url: '',
      type: 'url',
      size: 0,
      simpleUIDetails: {
        scaleX: 1.0,
        scaleY: 1.0,
        scaleZ: 1.0,
        positionX: 0.0,
        positionY: 0.0,
        positionZ: 0.0,
        rotateX: 0.0,
        rotateY: 0.0,
        rotateZ: 0.0
      }
    };
  }
  getNewTextureData() {
    return {
      title: 'Texture',
      url: '',
      size: 0
    };
  }
  //var materialSphere1 = new BABYLON.StandardMaterial("texture1", scene);
  getNewMaterialData() {
    return {
      title: 'Material',
      alpha: 0.5,
      diffuse: this.getTextureOptionsData(),
      emissive: this.getTextureOptionsData(),
      ambient: this.getTextureOptionsData(),
      specular: this.getTextureOptionsData(),
      specularPower: 32,
      useSpecularOverAlpha: false,
      backFaceCulling: true,
      wireframe: false
    };
  }
  getTextureOptionsData() {
    return {
      color: [.5, .5, .5],
      texture: {
        name: '',
        vOffset: 0.0,
        uOffset: 0.0,
        vScale: 1.0,
        uScale: 1.0,
        hasAlpha: false
      }
    };
  }
  defaultItemTemplate(domPrefix, fireData) {
    return `
<div id="${domPrefix}-${fireData.key}" class="firebase-item">
  <div class="${domPrefix}-title"></div>
  <button class="${domPrefix}-remove mdl-button mdl-js-button mdl-button--icon">
    <i class="material-icons">delete</i>
  </button>
  <button class="${domPrefix}-details mdl-button mdl-js-button mdl-button--icon">
    <i class="material-icons">settings</i>
  </button>
</div>`;
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
}
