class cView extends bView {
  constructor() {
    super();
    this.canvasHelper.cameraShownCallback = () => this._workspaceLoadedAndInited();
    this.canvasHelper.initExtraOptions();

    document.querySelector('.user-name').innerHTML = gAPPP.a.currentUser.email;

    this.profile_description_panel_btn = document.getElementById('profile_description_panel_btn');
    this.profile_description_panel_btn.addEventListener('click', e => this.toggleProfilePanel());
  }
  _workspaceLoadedAndInited() {
    if (this.cameraShown)
      return;
    this.cameraShown = true;
    this.__workspaceInitedPostTimeout();
  }
  async __workspaceInitedPostTimeout() {
    this.canvasHelper.noTestError = true;
    this.canvasHelper.cameraChangeHandler();

    try {
      this.canvasHelper.playAnimation();
    } catch (e) {
      console.log('play anim error', e);
    }

    return Promise.resolve();
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
  _headerTemplate() {
    return `<div id="header-panel-template">
  <div id="profile-header-panel">
    <select id="profile_current_role">
      <option>Employee</option>
      <option>Contractor</option>
      <option>Manager</option>
      <option>Owner</option>
      <option>Administrator</option>
    </select>
    &nbsp;
    <span class="user-name"></span>
    &nbsp;
    <button id="sign-out-button" style="font-size:1.1em;" class="btn-sb-icon"><i class="material-icons">account_box</i> Sign out </button>
  </div>
  <button id="profile_description_panel_btn" style="float:right;" class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--primary"><i class="material-icons">person</i></button>
  <select id="view_layout_select" style="float:right;">
    <option>Full</option>
    <option>Top</option>
    <option>Left</option>
    <option>Bottom</option>
    <option>Right</option>
    <option>None</option>
  </select>
  <div id="record_field_list">
    <form autocomplete="off" onsubmit="return false;"></form>
  </div>
</div>
`;
  }
}
