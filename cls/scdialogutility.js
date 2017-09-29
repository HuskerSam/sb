class SCDialogUtility {
  constructor(id) {
    let me = this;
    this.dialog = document.getElementById(id);
    this.okBtn = this.dialog.querySelector('.save-details');
    this.cancelBtn = this.dialog.querySelector('.close-details');
    this.editors = [];

    this.cancelBtn.addEventListener('click', () => me.close(), false);
    this.okBtn.addEventListener('click', () => me.save(), false);
  }
  save() {
    this.close();
  }
  close() {
    $(this.dialog).modal('hide');
  }
  initEditors() {
    if (this.editors.length !== 0)
      return;

    let aceId = 'utility-ace-editor-json';
    let aceDiv = document.getElementById(aceId);
    if (aceDiv) {
      this.aceEditor = gAPPP.u.editor(aceId);
      this.aceEditor.$blockScrolling = Infinity;
      this.editors.push(this.aceEditor);
    }
  }
  showAce(json) {
    this.initEditors();
    json = js_beautify(json);
    this.aceEditor.setValue(json);

    $(this.dialog).modal('show');

    this.cancelBtn.focus();
  }
}
