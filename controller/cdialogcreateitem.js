class cDialogCreateItem {
  constructor(tag, title, hideFileDom) {
    this.tag = tag;

    let d = document.createElement('div');
    d.innerHTML = document.getElementById('scene-builder-create-dialog-template').innerHTML;
    d.setAttribute('role', 'dialog');
    d.setAttribute('class', 'modal fade create-dialog');
    this.dialog = d;

    this.canvas = this.dialog.querySelector('.create-preview-canvas');
    if (this.canvas) {
      this.context = new cContext(this.canvas);
    }

    this.fileDom = this.dialog.querySelector('input[type="file"]');
    if (hideFileDom)
      this.fileDom.style.display = 'none';
    else
      this.fileDom.addEventListener('change', e => this.fileDomChange(e), false);

    this.createBtn = this.dialog.querySelector('.create');
    this.cancelBtn = this.dialog.querySelector('.cancel');
    this.popupButtons = this.dialog.querySelector('.popup-buttons');
    this.progressBar = this.dialog.querySelector('.popup-progress-bar');
    this.dialog.querySelector('.modal-title').innerHTML = title;
    this.titleDom = this.dialog.querySelector('.input-title');
    $(this.dialog).on('hidden.bs.modal', () => this.close()); //force cleanup if closed via escape
    $(this.dialog).on('shown.bs.modal', () => this._shown());

    this.cancelBtn.addEventListener('click', () => this.close(), false);
    this.createBtn.addEventListener('click', (e) => this.create(), false);
  }
  _shown() {
    this.context.activate(null);
    this._showFocus();
  }
  _showFocus() {
    if (this.hideFileDom)
      this.titleDom.focus();
    else
      this.fileDom.focus();

    gAPPP.resize();
  }
  close() {
    $(this.dialog).modal('hide');
    gAPPP.mV.context.activate();
  }
  show() {
    this.popupButtons.style.display = 'block';
    this.progressBar.style.display = 'none';
    this.clear();

    $(this.dialog).modal('show');
  }
  clear() {
    this.titleDom.value = '';
    this.fileDom.value = '';
  }
  fileDomChange(e) {
    if (this.fileDom.files.length > 0) {
      if (this.titleDom.value === '') {
        this.titleDom.value = this.fileDom.files[0].name.replace('.babylon', '');
        this.createBtn.focus();
      }
    }
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
    this.context.createObject(this.tag, title, file).then(r => {
      console.log(r);
      this.clear();
      this.popupButtons.style.display = 'block';
      this.progressBar.style.display = 'none';
      this.close();
    });
  }
}
