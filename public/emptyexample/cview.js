class cView extends bView {
  constructor() {
    super();
    this.canvasHelper.cameraShownCallback = () => {
      this._workspaceLoadedAndInited();
    };

    this.canvasActionsDom = document.querySelector('.canvas-actions');
    this.canvasActionsDom.classList.add('canvas-actions-shown');

    this.lightBarFields = [{
      title: '<i class="material-icons">wb_sunny</i><span id="light_intensity_value">1</span>',
      fireSetField: 'lightIntensity',
      helperType: 'singleSlider',
      rangeMin: '0',
      rangeMax: '2',
      rangeStep: '.01',
      displayType: 'number',
      group: 'group2',
      groupClass: 'light-intensity-user-panel'
    }];
    this.cameraFieldsContainer = this.canvasActionsDom.querySelector('.lightbar-fields-container');

    this.cameraToolsBtn = document.createElement('button');
    this.cameraToolsBtn.style.display = 'none';
    this.cameraTools = new cBandProfileOptions(this.cameraToolsBtn, this.lightBarFields, this.cameraFieldsContainer, this.canvasActionsDom);
    this.cameraTools.fireFields.values = gAPPP.a.profile;
    this.cameraTools.activate();

    this.cameraExtrasArea = document.getElementById('extra-options-camera-area');
    this.cameraExtrasArea.innerHTML =
      `<label class="mdl-switch mdl-js-switch" for="auto-move-camera" id="auto-move-camera-component">
      <input type="checkbox" id="auto-move-camera" class="mdl-switch__input" checked>
      <span class="mdl-switch__label"><i class="material-icons">camera_enchance<i></span>
    </label>`;
    componentHandler.upgradeElement(document.getElementById('auto-move-camera-component'));
    this.autoMoveCameraInput = document.getElementById('auto-move-camera');
    this.autoMoveCameraInput.addEventListener('input', () => this.toggleAutoMoveCamera());

    document.querySelector('.user-name').innerHTML = gAPPP.a.currentUser.email;

    //this.scene_data_expand_btn = document.getElementById('scene_data_expand_btn');
    //this.scene_data_expand_btn.addEventListener('click', e => this.toggleSceneDataView());

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
  toggleAutoMoveCamera() {
    if (this.autoMoveCameraInput.checked) {
      this.canvasHelper.cameraSelect.selectedIndex = 2;
      this.canvasHelper.cameraChangeHandler();
    } else {
      this.canvasHelper.cameraSelect.selectedIndex = 0;
      this.canvasHelper.cameraChangeHandler();
    }
  }
}
