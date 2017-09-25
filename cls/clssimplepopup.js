class clsSimplePopup {
  constructor(dialogQS, fields, openBtnQS, babyHelper) {
    let me = this;
    this.babyHelper = babyHelper;
    this.dialog = document.querySelector(dialogQS);
    this.openBtn = document.querySelector(openBtnQS);
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

    if (!this.dialog.showModal) {
      dialogPolyfill.registerDialog(this.dialog);
    }
    this.openBtn.addEventListener('click', () => me.show(), false);
    this.cancelBtn.addEventListener('click', () => me.close(), false);
    this.createBtn.addEventListener('click', (e) => me.create(), false);
  }
  close() {
    this.dialog.close();
  }
  show() {
    this.popupButtons.style.display = 'block';
    this.popupContent.style.display = 'block';
    this.progressBar.style.display = 'none';
    this.clear();
    this.dialog.showModal();
  }
  importMesh() {
    let me = this;
    return new Promise((resolve, reject) => {
      let id = this.fieldsValues['id'];
      let file = this.fileDom.files[0];
      gAPPP.firebaseHelper.fileToURL(file)
        .then((d) => gAPPP.sceneBuilder.babyHelper.serializeMesh(id, "", "data:" + d)
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

    this.importMesh().then((mesh) => {
      let id = this.fieldsValues['id'];
      let strMesh = JSON.stringify(mesh);
      gAPPP.firebaseHelper.newMesh(strMesh, id)
        .then((r) => {
          me.clear();
          me.fileDom.value = '';
          this.popupButtons.style.display = 'block';
          this.popupContent.style.display = 'block';
          this.progressBar.style.display = 'none';
          me.dialog.close();
        });
    });
  }
}
