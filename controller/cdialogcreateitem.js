class cDialogCreateItem {
  constructor(tag, title, hideFileDom) {
    this.tag = tag;

    let d = document.createElement('dialog');
    d.innerHTML = document.getElementById('scene-builder-create-dialog-template').innerHTML;
    d.setAttribute('class', 'modal-dialog');
    this.dialog = d;
    document.body.append(d);

    this.canvas = this.dialog.querySelector('.create-preview-canvas');
    this.context = new wContext(this.canvas);
    if (this.tag === 'scene' || this.tag === 'mesh')
      this.canvas.style.display = 'block';
    else
      this.canvas.style.display = 'none';

    this.image = this.dialog.querySelector('.create-preview-image');
    if (this.tag === 'texture')
      this.image.style.display = 'inline-block';
    else
      this.image.style.display = 'none';

    this.fileDom = this.dialog.querySelector('input[type="file"]');
    this.hideFileDom = hideFileDom;
    if (this.hideFileDom)
      this.fileDom.style.display = 'none';
    else
      this.fileDom.addEventListener('change', e => this.fileDomChange(e), false);

    this.createBtn = this.dialog.querySelector('.create');
    this.cancelBtn = this.dialog.querySelector('.cancel');
    this.popupButtons = this.dialog.querySelector('.popup-buttons');
    this.progressBar = this.dialog.querySelector('.popup-progress-bar');
    this.dialog.querySelector('.modal-title').innerHTML = title;
    this.titleDom = this.dialog.querySelector('.input-title');
//    $(this.dialog).on('hidden.bs.modal', () => this.close()); //force cleanup if closed via escape
//    $(this.dialog).on('shown.bs.modal', () => this._shown());

    this.cancelBtn.addEventListener('click', e => this.close(), false);
    this.createBtn.addEventListener('click', e => this.create(), false);
    this.titleDom.addEventListener('keypress', e => this._titleKeyPress(e), false);
  }
  clear() {
    this.titleDom.value = '';
    this.fileDom.value = '';
  }
  close() {
    this.dialog.close();
    gAPPP.mV.show();
  }
  create() {
    if (this.titleDom.value.trim() === '') {
      alert('please supply a title');
      return;
    }
    this.popupButtons.style.display = 'none';
    this.progressBar.style.display = 'block';
    let title = this.titleDom.value.trim();
    let file = null;
    if (this.fileDom.files.length > 0)
      file = this.fileDom.files[0];

    if (this.tag !== 'scene')
      this.context.activate(null);
    this.context.createObject(this.tag, title, file).then(results => {
      if (this.tag !== 'texture')
        this.context.renderPreview(this.tag, results.key);
      else {
        gAPPP.a.modelSets['texture'].commitUpdateList([{
          field: 'renderImageURL',
          newValue: results.url
        }], results.key);
      }

      this.clear();
      this.popupButtons.style.display = 'block';
      this.progressBar.style.display = 'none';
      this.close();

      setTimeout(() => gAPPP.dialogs[this.tag + '-edit'].show(results.key), 600);
    });
  }
  fileDomChange(e) {
    this.updateFilePreview();
  }
  show() {
    this.popupButtons.style.display = 'block';
    this.progressBar.style.display = 'none';
    this.clear();
    this.context.activate(null);

    this.dialog.showModal();
  }
  updateFilePreview() {
    if (this.tag === 'mesh' || this.tag === 'scene') {
      if (this.fileDom.files.length > 0) {
        if (this.titleDom.value === '') {
          this.titleDom.value = this.fileDom.files[0].name.replace('.babylon', '');
          this.createBtn.focus();
        }

        if (this.tag === 'mesh') {
          this.context._loadMeshFromDomFile(this.fileDom.files[0]).then(meshes => {
            meshes[0].showBoundingBox = true;
          });
        }
        if (this.tag === 'scene') {
          this.context.loadSceneFromDomFile(this.fileDom.files[0]).then(r => {});
        }
      } else {
        this.context.activate(null);
      }
    }
    if (this.tag === 'texture') {
      if (this.fileDom.files.length > 0) {
        if (this.titleDom.value === '') {
          this.titleDom.value = this.fileDom.files[0].name;
          this.createBtn.focus();
        }

        this.image.setAttribute('src', URL.createObjectURL(this.fileDom.files[0]));
      } else {
        this.image.setAttribute('src', '');
      }
    }
  }
  _showFocus() {
    if (this.hideFileDom)
      this.titleDom.focus();
    else
      this.fileDom.focus();

    gAPPP.resize();
  }
  _shown() {
    this._showFocus();
  }
  _titleKeyPress(e) {
    if (this.hideFileDom)
      if (e.code === 'Enter')
        this.create();
  }
}
