class FireSet {
  constructor(dataPrefix, domPrefix, keyList, itemTemplateFunction) {
    let me = this;
    this.active = true;
    this.userId = firebase.auth().currentUser.uid;
    this.dataPrefix = dataPrefix;
    this.domPrefix = domPrefix;
    this.domContainer = document.getElementById(this.domPrefix + '-content');
    this.keyList = keyList;
    this.itemTemplateFunction = itemTemplateFunction;
    this.notiRef = firebase.database().ref(this.dataPrefix);
    this.notiRef.on('child_added', (data) => me.childAdded(data));
    this.notiRef.on('child_changed', (data) => me.childChanged(data));
    this.notiRef.on('child_removed', (data) => me.childRemoved(data));
  }
  destroy() {
    if (! this.active)
      return;
    this.domContainer.innerHTML = '';
    this.notiRef.off();
    this.active = false;
  }
  getKey() {
    return firebase.database().ref().child(this.dataPrefix).push().key
  }
  childAdded(fireData) {
    this.domContainer.insertBefore(this.createDOM(fireData), this.domContainer.firstChild);
  }
  childChanged(fireData) {
    var div = document.getElementById(this.domPrefix + '-' + fireData.key);
    for (let i in this.keyList) {
      try {
        let key = this.keyList[i];
        let ele = div.getElementsByClassName(this.domPrefix + '-' + key)[0];
        let val = fireData.val()[key];
        if (val !== undefined)
          ele.innerText = fireData.val()[key];
      } catch (e) {
        console.log('FireSet.childChanged ' + key + ' failed', e);
      }
    }
  }
  childRemoved(fireData) {
    let post = document.getElementById(this.domPrefix + '-' + fireData.key);
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
    let html = this.itemTemplateFunction(this.domPrefix, fireData);
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
    if (details_div)
      details_div.addEventListener('click',(e) => me.showPopup(e, fireData), false);

    return outer.childNodes[0];
  }
  showPopup(e, fireData) {
    if (this.domPrefix === 'meshes')
      meshespopup.show(fireData);
    if (this.domPrefix ==='textures')
      alert(fireData.val().url);
  }
  removeElement(e, fireKey) {
    if (!confirm('Are you sure you want to delete this ' + this.domPrefix + '?'))
      return;
    let updates = {};
    updates['/' + this.dataPrefix + '/' + fireKey] = null;
    firebase.database().ref().update(updates).then(function(e) {});
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
