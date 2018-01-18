class cDialogUserProfile extends cDialogSuper {
  constructor(dialog, tag, dataViewContainer, fieldsContainer) {
    super(dialog, tag, dataViewContainer, fieldsContainer);
    this.addProjectButton = document.querySelector('#add-workspace-button');
    this.addProjectButton.addEventListener('click', e => this.addProject());
    this.addProjectName = document.querySelector('#new-workspace-name');
    this.deleteWorkspaceButton = document.querySelector('#remove-workspace');
    this.deleteWorkspaceButton.addEventListener('click', e => this.deleteProject());
  }
  show() {
    let userInfoSpan = this.dialog.querySelector('.user-info');
    let userImage = this.dialog.querySelector('.user-image-display');
    this.user = gAPPP.a.currentUser;
    userInfoSpan.innerHTML = this.user.displayName + '<br>' + this.user.email;
    userImage.setAttribute('src', this.user.photoURL);
    this.fireFields.values = gAPPP.a.profile;

    super.show();
  }
  addProject() {
    let newTitle = this.addProjectName.value.trim();
    if (newTitle.length === 0) {
      alert('need a name for workspace');
      return;
    }
    let key = gAPPP.a.modelSets['project'].getKey();
    firebase.database().ref('project/' + key).set({
      title: newTitle
    });
  }
  deleteProject() {
    if (confirm('Are you sure you want to delete this project?'))
      if (confirm('Really?  Really sure?  this won\'t come back...')) {
        gAPPP.a.modelSets['project'].removeByKey(gAPPP.mV.workplacesSelect.value);
        gAPPP.a.modelSets['userProfile'].commitUpdateList([{
          field: 'selectedWorkspace',
          newValue: 'default'
        }]);
        setTimeout(() => location.reload(), 100);
      }
  }
}
