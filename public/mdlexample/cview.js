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
}
