/* create dialog controller - binds to mdlFirebaseList */
class ctlDialogCreateItem {
  constructor(tag, fields) {
    let me = this;
    this.tag = tag;
    this.dialog = document.querySelector('#' + this.tag + '-upload-dialog');
    this.fileDom = this.dialog.querySelector('.popup-file');
    this.progressBar = this.dialog.querySelector('.popup-progress-bar');
    this.createBtn = this.dialog.querySelector('.create');
    this.cancelBtn = this.dialog.querySelector('.cancel');
    this.popupContent = this.dialog.querySelector('.popup-content');
    this.popupButtons = this.dialog.querySelector('.popup-buttons');

    this.fields = fields;
    this.fieldsDom = {};
    for (let i in this.fields)
      this.fieldsDom[this.fields[i]] = this.dialog.querySelector('.simple-popup-field-' + this.fields[i]);

    this.cancelBtn.addEventListener('click', () => me.close(), false);
    this.createBtn.addEventListener('click', (e) => me.create(), false);
  }
  close() {
    $(this.dialog).modal('hide');
    gAPPP.renderEngine.renderDefault();
  }
  show() {
    this.popupButtons.style.display = 'block';
    this.popupContent.style.display = 'block';
    this.progressBar.style.display = 'none';
    this.clear();
    $(this.dialog).modal('show');
  }
  importMesh() {
    let me = this;
    return new Promise((resolve, reject) => {
      let id = this.fieldsValues['id'];
      let file = this.fileDom.files[0];
      scUtility.fileToURI(file)
        .then((d) => gAPPP.renderEngine.serializeMesh(id, "", "data:" + d)
          .then((mesh) => resolve(mesh)));
    });
  }
  scrape() {
    this.fieldsValues = {};
    let emptyField = false;
    for (let i in this.fields) {
      let f = this.fields[i];
      let v = this.fieldsDom[f].value.trim();
      if (v === '')
        emptyField = true;
      this.fieldsValues[f] = v;
    }
    this.emptyField = emptyField;
  }
  clear() {
    this.fieldsValues = {};
    for (let i in this.fields) {
      let f = this.fields[i];
      this.fieldsDom[f].value = '';
    }
    if (this.fileDom)
      this.fileDom.value = '';
  }
  createPromise() {
    let me = this;
    if (this.tag === 'mesh') {
      return new Promise((resolve, reject) => {
        me.importMesh().then((mesh) => {
          let id = me.fieldsValues['id'];
          let strMesh = JSON.stringify(mesh);
          gAPPP.a.modelSets['mesh'].newMesh(strMesh, id).then((r) => resolve(r));
        });
      });
    }
    if (this.tag === 'scene') {
      return new Promise((resolve, reject) => {
        me.getNewSceneSerialized().then((sceneSerial) => {
          let title = me.fieldsValues['title'];
          gAPPP.a.modelSets['scene'].newScene(sceneSerial, title).then((r) => resolve(r));
        });
      });
    }
    if (this.tag === 'texture') {
      return new Promise((resolve, reject) => {
        let title = me.fieldsValues['title'];
        let file = me.fileDom.files[0];
        gAPPP.a.modelSets['texture'].newTexture(file, title).then((r) => resolve(r));
      });
    }
    if (this.tag === 'material') {
      return new Promise((resolve, reject) => {
        let title = me.fieldsValues['title'];
        gAPPP.a.modelSets['material'].newMaterial(title).then((r) => resolve(r));
      });
    }
    return new Promise(resolve => resolve());
  }
  create() {
    let me = this;
    this.scrape();
    if (this.emptyField) {
      alert('required fields missing');
      return;
    }

    this.popupButtons.style.display = 'none';
    this.popupContent.style.display = 'none';
    this.progressBar.style.display = 'block';

    this.createPromise().then((r) => {
      me.clear();
      me.popupButtons.style.display = 'block';
      me.popupContent.style.display = 'block';
      me.progressBar.style.display = 'none';
      me.close();
    });
  }
}
