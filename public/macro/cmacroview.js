class cMacroView extends bView {
  constructor(layoutMode, tag, key, childKey) {
    super('None', tag, key, false, childKey);
    this.canvasHelper.initExtraOptions();

    this.refreshProjectList().then(() => {});
    this._updateGoogleFonts().then(() => {});

    this.workplacesSelect = document.querySelector('#workspaces-select');
    this.workplacesSelectEditName = document.querySelector('#edit-workspace-name');
    this.workplacesSelectEditCode = document.querySelector('#edit-workspace-code');
    this.workplacesRemoveButton = document.querySelector('#remove-workspace-button');
    this.workplacesSelect.addEventListener('input', e => this.selectProject());
    this.workplacesSelectEditName.addEventListener('input', e => this.updateWorkspaceNameCode());
    this.workplacesSelectEditCode.addEventListener('input', e => this.updateWorkspaceNameCode());
    this.addProjectButton = document.querySelector('#add-workspace-button');
    this.addProjectButton.addEventListener('click', e => this.addProject());
    this.addProjectName = document.querySelector('#new-workspace-name');
    this.addProjectCode = document.querySelector('#new-workspace-code');
    this.workplacesRemoveButton.addEventListener('click', e => this.deleteProject());

    this.userProfileName = this.dialog.querySelector('.user-info');
    this.fontToolsContainer = this.dialog.querySelector('#profile-header-panel');
    this.fontFields = sDataDefinition.bindingFieldsCloned('fontFamilyProfile');
    this.fontFieldsContainer = this.fontToolsContainer.querySelector('.fields-container');
    this.fontTools = new cBandProfileOptions(null, this.fontFields, this.fontFieldsContainer, this.fontFieldsContainer);
    this.fontTools.fireFields.values = gAPPP.a.profile;
    this.fontTools.activate();

    this.profile_description_panel_btn = document.getElementById('profile_description_panel_btn');
    this.profile_description_panel_btn.addEventListener('click', e => this.toggleProfilePanel());
  }
  toggleProfilePanel() {
    if (this.profilePanelShown) {
      this.profilePanelShown = false;
      this.profile_description_panel_btn.classList.remove('button-expanded');
      document.getElementById('profile-header-panel').classList.remove('expanded');
    } else {
      this.profilePanelShown = true;
      this.profile_description_panel_btn.classList.add('button-expanded');
      document.getElementById('profile-header-panel').classList.add('expanded');
    }
  }
  initDataUI() {
    this.signOutBtn = document.querySelector('#sign-out-button');
    if (this.signOutBtn)
      this.signOutBtn.addEventListener('click', e => gAPPP.a.signOut(), false);
  //  this.dataview_record_tag = this.dialog.querySelector('#dataview_record_tag');
  //  this.dataview_record_key = this.dialog.querySelector('#dataview_record_key');
  }
  initDataFields() {
    if (this.fireSetCallback)
      this.fireSet.removeListener(this.fireSetCallback);
  }
  splitLayoutTemplate() {
    return `<div id="firebase-app-main-page" style="display:none;flex-direction:column;">
      <div id="renderLoadingCanvas" style="display:none;"><br><br>Working...</div>
      <div id="main-view-wrapper">
        <div class="form_canvas_wrapper"></div>
        <div class="form_panel_view_dom">
          <div id="profile-header-panel">${this.profilePanelTemplate()}</div>
          <div class="header_wrapper" style="line-height: 3em;">
            <b>&nbsp;Workspace</b>
            <select id="workspaces-select"></select>
            <button id="profile_description_panel_btn" style="float:right;" class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--primary"><i class="material-icons">person</i></button>
          </div>
          <div class="data-view-container">
          </div>
        </div>
      </div>
    </div>
    <datalist id="fontfamilydatalist"></datalist>
    <datalist id="skyboxlist"></datalist>
    <datalist id="sbmesheslist"></datalist>`;
  }
}
