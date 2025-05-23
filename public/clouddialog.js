class AddonSidePanelApp {
  constructor() {
    document.body.innerHTML = this.getDialogTemplate();
    this.helpBackList = [];
    this.helpForwardList = [];
    this.initDom();
    this.initSheetBasedData();
    this.loadTemplateList(true);
    this.app = new cAppDefaults();
    this.app.jsonLibPrefix = 'https://handtop.com';
    this.app.loadTextures();
    this.app.loadPickerData();
    this.fetchHelpList();

    this.widForName = {};
    this.loadBlockWizard();
    this.productPositionInit();
  }
  async fetchHelpList() {
    let fetched = await fetch(this.app.jsonLibPrefix + '/docraw/helplist.json', {
      cache: "no-cache"
    });
    let data = await fetched.json();
    this.cachedHelpItemList = data;
    let html = '';
    data.forEach(i => html += '<option value="' + i.value + '">' + i.category + ': ' + i.title + '</option>');
    this.help_viewer_panel_select.innerHTML = html;
  }
  async setBusy() {
    this.reload_addon.style.borderRadius = '50%';
    this.reload_addon.style.background = 'rgb(150,220,150)';
    this.reload_addon.classList.add('rotate_busy');
  }
  async clearBusy() {
    this.reload_addon.style.borderRadius = '';
    this.reload_addon.style.background = '';
    this.reload_addon.classList.remove('rotate_busy');
  }
  async initSheetBasedData() {
    this.setBusy();
    await this.loadConfiguration();
    await Promise.all([
      this.loadDeployOptions(),
      this.loadProjectSelectList()
    ]);
    if (!this.defaultServerTarget) {
      this.template_filter_select.value = 'Setup';
    } else if (this.template_filter_select.value === 'Setup' &&
      !this.defaultProjectTarget) {
      this.template_filter_select.value = 'Layout';
    }
    this.sheetnameinputdirty = false;
    this.loadTemplateList(true);
    this.positionsFetchRefresh();

    this.clearBusy();
  }
  initDom() {
    let dom_id = [
      'new_sheet_add_name', 'new_sheet_add_to_options', 'create_new_project_sheet_button', 'project_addsheet_preview_data',
      'publish_results', 'target_to_deploy', 'token_to_deploy', 'url_to_deploy', 'project_deploy_select',
      'deploy_options_server_list', 'display_publish_list', 'assets_anchor', 'plot_type_select', 'addon_header_line_2',
      'upload_file_cloud', 'file_upload_name', 'upload_file_input', 'img_preview', 'plotter_output_table',
      'img_preview_link', 'display_publish_single', 'project_set_default_btn', 'preview_panel', 'position_plotter_div',
      'sheetname', 'circuit_template_select', 'help_viewer_panel', 'help_viewer_panel_internal',
      'block_wizard_select_wrapper', 'add_asset_to_projectlist', 'help_viewer_panel_select', 'help_and_details_wrapper_for_split',
      'create_layout_btn', 'add_to_publishlist', 'set_to_defaultproject', 'publishlist_add_chk_wrapper', 'template_description', 'macro_details_wrapper', 'wizard_choices',
      'seconds_to_sample', 'bands_to_combine', 'freq_samples_to_second', 'template_filter_select', 'publishlist_asset_add_chk_wrapper',
      'addon_display_view_select', 'audio', 'audio_file', 'reload_addon', 'selected_target_span', 'selected_project_span', 'publishlist_products_add_chk_wrapper',
      'target_server_set_button', 'selected_server_details_div', 'project_display_view', 'project_deploy_view', 'project_upload_view', 'project_addsheet_view',
      'show_help_panel_btn', 'project_selected_options', 'upload_file_preview_select', 'upload_file_img_preview', 'upload_file_audio_preview',
      'upload_file_mesh_preview', 'song_detail_data_rdo', 'song_raw_data_rdo', 'song_raw_data', 'upload_file_audio_ctl',
      'song_len_sec', 'copy_song_data_to_clipboard', 'display_publish_single_header', 'project_preview_zoom', 'add_products_to_projectlist',
      'plotter_plots_count', 'plotter_points_per_plot', 'plotter_plots_width', 'plotter_plots_depth', 'helper_viewer_panel_open_video_btn',
      'plotter_plots_includelabels', 'plotter_plots_includeradians', 'plotter_plots_radial_includelabels', 'helper_viewer_panel_open_deployed_btn',
      'plotter_copy_csv_to_clipboard', 'plotter_radial_copy_csv_to_clipboard', 'plotter_plots_radial_includeheaders', 'path_frames_copy_csv_to_clipboard',
      'plotter_plots_includeheaders', 'view_current_project_btn', 'path_frames_includeheaders', 'help_new_window_link',
      'details_wrapper_for_split', 'upload_copy_link_to_clipboard', 'deploy_detail_buttons_view',
      'plotter_plots_end_depth', 'plotter_plots_height', 'plotter_plots_end_width', 'plotter_plots_turns', 'path_frames_snappy_motion',
      'plotter_plots_decay_per_turn', 'plotter_plots_item_offset_angle', 'plotter_plots_offset_angle', 'path_frames_easing_option',
      'path_frames_points', 'path_frames_parent', 'path_frames_childtype', 'path_frames_childname', 'path_frames_rotation_time',
      'product_preset_positions_list', 'display_current_project_btn', 'asset_current_project_btn',
      'help_back_button', 'help_forward_button', 'helper_viewer_contents_btn'
    ];

    dom_id.forEach(ctl => {
      this[ctl] = document.getElementById(ctl);
      if (!this[ctl])
        console.log('element for DOM ID ' + ctl + ' not found')
    });

    this.display_publish_list.addEventListener('click', e => this.cloudDeployProjects('all'));
    this.project_deploy_select.addEventListener('input', e => this.loadProjectView());
    this.project_selected_options.addEventListener('input', e => this.loadProjectView());
    this.project_preview_zoom.addEventListener('input', e => this.loadProjectPreview());
    this.deploy_options_server_list.addEventListener('input', e => this.loadServerDetails());
    this.file_upload_name.addEventListener('input', e => this.loadImagePreview());
    this.upload_file_cloud.addEventListener('click', e => this.upload_file_input.click());
    this.upload_file_input.addEventListener('change', e => this.storageUploadProjectFile(e));
    this.display_publish_single.addEventListener('click', e => this.cloudDeployProjects('list_selected'));
    this.display_publish_single_header.addEventListener('click', e => this.cloudDeployProjects('selected'));
    this.view_current_project_btn.addEventListener('click', e => this.projectViewCurrentProject());
    this.display_current_project_btn.addEventListener('click', e => this.projectViewCurrentProject(1));
    this.asset_current_project_btn.addEventListener('click', e => this.projectViewCurrentProject(2));
    this.project_set_default_btn.addEventListener('click', e => this.sheetsStoreSelectedProject());
    this.addon_display_view_select.addEventListener('input', e => this.loadAddonView());
    this.circuit_template_select.addEventListener('input', e => this.loadTemplateDetails(true));
    this.template_filter_select.addEventListener('input', e => this.loadTemplateList());
    this.create_layout_btn.addEventListener('click', e => this.templateCreateSheets());
    this.reload_addon.addEventListener('click', e => this.initSheetBasedData());
    this.target_server_set_button.addEventListener('click', e => this.cloudDeploySetServer());
    this.upload_file_preview_select.addEventListener('input', e => this.cloudDeployUpdateFilePreview());
    this.sheetname.addEventListener('input', e => this.sheetnameinputdirty = true);

    this.wizard_choices.addEventListener('change', e => this.loadBlockWizard());
    this.audio_file.addEventListener('change', e => this.audioProcessFileSelected());
    this.seconds_to_sample.addEventListener('input', e => this.audioProcessUpdateData());
    this.freq_samples_to_second.addEventListener('input', e => this.audioProcessUpdateData());
    this.bands_to_combine.addEventListener('input', e => this.audioProcessUpdateData());
    this.plot_type_select.addEventListener('input', e => this.plotterUpdateView());
    this.show_help_panel_btn.addEventListener('click', e => this.helpPanelToggle());

    this.helper_viewer_panel_open_deployed_btn.addEventListener('click', e => {
      let help_topic = this.help_viewer_panel_select.selectedIndex;
      let helpData = this.cachedHelpItemList[help_topic];

      if (!helpData || !helpData.deployed) {
        alert('No deployed link found');
        return;
      }

      let a = document.createElement('a');
      a.setAttribute('href', helpData.deployed);
      a.setAttribute('target', '_blank');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
    this.helper_viewer_panel_open_video_btn.addEventListener('click', e => {
      let help_topic = this.help_viewer_panel_select.selectedIndex;
      let helpData = this.cachedHelpItemList[help_topic];

      if (!helpData || !helpData.video) {
        alert('No video link found');
        return;
      }

      let a = document.createElement('a');
      a.setAttribute('href', helpData.video);
      a.setAttribute('target', '_blank');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
    this.helper_viewer_contents_btn.addEventListener('click', e => {
      let a = document.createElement('a');
      a.setAttribute('href', 'https://handtop.com/doc/');
      a.setAttribute('target', '_blank');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });

    this.help_viewer_panel_select.addEventListener('input', e => {
      this._updateHelpSelectChange();
    });

    this.song_detail_data_rdo.addEventListener('input', e => this.updateSongDataView());
    this.song_raw_data_rdo.addEventListener('input', e => this.updateSongDataView());
    this.copy_song_data_to_clipboard.addEventListener('click', e => {
      let tInput = document.createElement('input');
      tInput.value = this.song_raw_data.innerHTML;
      document.body.appendChild(tInput);
      tInput.select();
      tInput.setSelectionRange(0, 99999);
      document.execCommand("copy");
      tInput.remove();
    });

    let iall = this.position_plotter_div.querySelectorAll('input');
    iall.forEach(ctl => ctl.addEventListener('input', e => this.plotterUpdatePlot()));
    iall = this.position_plotter_div.querySelectorAll('textarea');
    iall.forEach(ctl => ctl.addEventListener('input', e => this.plotterUpdatePlot()));
    this.plotterUpdateView();
    this.plotter_copy_csv_to_clipboard.addEventListener('click', e => {
      cMacro.copyDataToClipboard(this.plotterRows, [], this.plotter_plots_includeheaders.checked, 3);
    });
    this.plotter_radial_copy_csv_to_clipboard.addEventListener('click', e => {
      cMacro.copyDataToClipboard(this.plotterRows, [], this.plotter_plots_radial_includeheaders.checked, 3);
    });
    this.path_frames_copy_csv_to_clipboard.addEventListener('click', e => {
      cMacro.copyDataToClipboard(this.plotterRows, [], this.path_frames_includeheaders.checked);
    });

    this.upload_copy_link_to_clipboard.addEventListener('click', e => {
      let tInput = document.createElement('input');
      tInput.value = this.img_preview_link.url;
      document.body.appendChild(tInput);
      tInput.select();
      tInput.setSelectionRange(0, 99999);
      document.execCommand("copy");
      tInput.remove();
    });

    if (this.splitProjectsView)
      this.splitProjectsView.destroy();
    this.splitProjectsView = Split(['#project_deploy_select', '#project_detail_view_for_split'], {
      sizes: [40, 60],
      minSize: [.1, .1],
      direction: 'vertical'
    });

    if (this.splitDeployView)
      this.splitDeployView.destroy();
    this.splitDeployView = Split(['#deploy_options_server_list', '#selected_server_details_div'], {
      sizes: [70, 30],
      minSize: [.1, .1],
      direction: 'vertical'
    });

    this.path_frames_points.value = '0,-28,5,20,0,-90deg\n35%,28,,,,0\n50%,,,-20,,90deg\n85%,-28,,,,180deg\n100%,,,20,,270deg';

    if (this.splitPlotterView)
      this.splitPlotterView.destroy();
    this.splitPlotterView = Split(['#plotter_wizard_details', '#plotter_output_split'], {
      sizes: [60, 40],
      minSize: [.1, .1],
      direction: 'vertical'
    });

    this.help_back_button.addEventListener('click', e => {
      if (this.helpBackList.length < 1)
        return;

      let helpTag = this.helpBackList.pop();
      this.helpForwardList.push(this.help_viewer_panel_select.value);
      this.help_viewer_panel_select.value = helpTag;
      this.helpBackButtonPressed = true;
      this._updateHelpSelectChange();
    });
    this.help_forward_button.addEventListener('click', e => {
      if (this.helpForwardList.length < 1)
        return;

      let helpTag = this.helpForwardList.pop();
      this.help_viewer_panel_select.value = helpTag;
      this.helpForwardButtonPressed = true;
      this._updateHelpSelectChange();
    });
    this.create_new_project_sheet_button.addEventListener('click', e => {
      this.projectsAddSheetToProject();
    });
  }
  _updateHelpSelectChange() {
    this.app.updateHelpView(this.help_viewer_panel_select.value, this.helpViewer);
  }

  async loadConfiguration() {
    this.configurationCSV = await this.sheetsJSONforSheetCSV('Configuration');
    if (!this.configurationCSV || this.configurationCSV.length === 0)
      this.configurationCSV = [{}];
    this.mainSpreadsheetID = this.configurationCSV[0]['Parent Spreadsheet'];

    this.defaultServerTarget = '';
    if (this.configurationCSV[0]['Target Server']) {
      this.defaultServerTarget = this.configurationCSV[0]['Target Server'];
      this.target_server_set_button.classList.remove('red');
      this.selected_target_span.innerHTML = this.defaultServerTarget;
    } else {
      this.target_server_set_button.classList.add('red');
      this.selected_target_span.innerHTML = '<span style="color:red;font-size:1em">No Server Target</span>';
      this.addon_display_view_select.value = 'cloud_target';
      this.loadAddonView();
      this.helpPanelVisible = false;
      this.helpPanelToggle();
    }

    this.defaultProjectTarget = '';
    if (this.configurationCSV[0]['Target Project']) {
      this.defaultProjectTarget = this.configurationCSV[0]['Target Project'];
      this.project_set_default_btn.classList.remove('red');
      this.project_set_default_btn.classList.add('blue');
      this.selected_project_span.innerHTML = this.defaultProjectTarget;
    } else {
      this.project_set_default_btn.classList.add('red');
      this.project_set_default_btn.classList.remove('blue');
      this.selected_project_span.innerHTML = '<span style="color:red;font-size:1em">No Project Target</span>';
      if (this.defaultServerTarget !== '') {
        this.addon_display_view_select.value = 'template_view';
        this.loadAddonView();
      }
    }

    this.defaultAppTarget = 'display';
    if (this.configurationCSV[0]['Target Application']) {
      this.defaultAppTarget = this.configurationCSV[0]['Target Application'];
    }

    let pid = this.defaultServerTarget;
    this.gProjectDisplayURL = 'https://' + pid + '.web.app/' + this.defaultAppTarget + '/?name=' + this.defaultProjectTarget;
    this.gProjectEditURL = 'https://' + pid + '.web.app/asset/?name=' + this.defaultProjectTarget;
    this.gProjectViewURL = 'https://' + pid + '.web.app/view/?name=' + this.defaultProjectTarget;

    setTimeout(() => this.dialogUpdateHelp(), 100);

    this.defaultToken = '';
    if (this.configurationCSV[0]['Target Token'])
      this.defaultToken = this.configurationCSV[0]['Target Token'];

    this.projectsSheetName = 'Projects';
  }
  async loadDeployOptions() {
    let deployOptionsRange = "'Deploy Options'!A1:A2";

    let rangeString = this.mainSpreadsheetID + "||||" + deployOptionsRange;
    if (!this.mainSpreadsheetID)
      rangeString = deployOptionsRange;

    let deploys = await this.sheetsJSONforRangeListCSV([rangeString]);

    if (deploys.length === 0)
      return;

    let targetRange = deploys[0].deployrange;
    let assetRString = this.mainSpreadsheetID + "||||'Deploy Options'!" + targetRange;
    if (!this.mainSpreadsheetID)
      assetRString = "'Deploy Options'!" + targetRange;
    let targets = await this.sheetsJSONforRangeListCSV([assetRString]);
    if (!targets || !Array.isArray(targets))
      targets = [];

    this.deployTargets = targets;
    let configDetailsHTML = '';
    if (this.mainSpreadsheetID) {
      let url = "https://docs.google.com/spreadsheets/d/";
      url += this.mainSpreadsheetID.toString();
      this.assets_anchor.innerHTML = '<a target="_blank" href="' + url + '">Open Parent Spreadsheet</a>';
      configDetailsHTML += open;
    } else {
      this.assets_anchor.innerHTML = 'Local';
    }

    let sIndex = this.deploy_options_server_list.selectedIndex;
    let sDefaultIndex = -1;
    let listHTML = '';
    targets.forEach((t, index) => {
      let pid = t['server'];
      if (pid) {
        if (pid === this.defaultServerTarget) {
          sDefaultIndex = index;
        }
        listHTML += '<option>' + pid + '</option>';
      }
    });
    this.deploy_options_server_list.innerHTML = listHTML;
    if (sIndex === -1) sIndex = sDefaultIndex;
    this.deploy_options_server_list.selectedIndex = (sIndex === -1) ? 0 : sIndex;
    this.loadServerDetails();
  }
  async loadServerDetails() {
    let index = deploy_options_server_list.selectedIndex;
    if (index < 0)
      return;
    let t = this.deployTargets[index];
    let id = t['server'];
    if (!id)
      id = '';
    let token = t['token'];
    if (!token)
      token = '';
    this.target_to_deploy.value = id;
    this.token_to_deploy.value = token;
    let url = t['url'];
    if (!url)
      url = 'https://' + id + '.web.app/';
    let navurl = url;
    if (navurl.substring(0, 3) !== 'htt')
      navurl = 'https://' + navurl;
    this.url_to_deploy.innerHTML = '<a target="_blank" style="line-break:anywhere" href="' + navurl + '">' + navurl + '</a>';

    this.selected_server_details_div.innerHTML = t['description'];

    if (this.defaultServerTarget && this.defaultServerTarget === id)
      this.target_server_set_button.classList.remove("blue");
    else
      this.target_server_set_button.classList.add("blue");
  }
  async loadTemplateDetails(clicked = false) {
    let data = this.templateMap[this.circuit_template_select.value];
    if (!data)
      return;
    if (this.sheetname.value === '')
      this.sheetnameinputdirty = false;
    if (data.hint && !this.sheetnameinputdirty) {
      if (data.categories === 'Setup' || data.categories === 'Assets' || data.categories === 'Products' || data.categories === 'Fragments')
        this.sheetname.value = data.hint;
      else
        this.sheetname.value = data.hint + ' ' + Math.floor(100 + Math.random() * 900).toString();
    }

    if (data.description) {
      this.template_description.innerHTML = data.description;
    } else {
      this.template_description.innerHTML = '';
    }

    if (data.categories.indexOf('Layout') !== -1 || data.categories.indexOf('Display') !== -1) {
      this.add_to_publishlist.checked = true;
      this.set_to_defaultproject.checked = true;
      this.publishlist_add_chk_wrapper.style.display = '';
    } else {
      this.add_to_publishlist.checked = false;
      this.set_to_defaultproject.checked = false;
      this.publishlist_add_chk_wrapper.style.display = 'none';
    }

    if (data.categories.indexOf('Assets') !== -1 || data.categories.indexOf('Fragments') !== -1) {
      this.publishlist_asset_add_chk_wrapper.style.display = '';
      this.add_asset_to_projectlist.checked = true;
    } else {
      this.publishlist_asset_add_chk_wrapper.style.display = 'none';
      this.add_asset_to_projectlist.checked = false;
    }

    if (data.categories.indexOf('Products') !== -1) {
      this.publishlist_products_add_chk_wrapper.style.display = '';
      this.add_products_to_projectlist.checked = true;
    } else {
      this.publishlist_products_add_chk_wrapper.style.display = 'none';
      this.add_products_to_projectlist.checked = false;
    }

    if (this.addon_display_view_select.value === 'template_view') {
      if (data.helpkey && clicked) {
        this.app.updateHelpView(data.helpkey, this.helpViewer);
      } else {
        if (this.help_viewer_panel_select.value !== 'addontemplates')
          this.app.updateHelpView('addontemplates', this.helpViewer);
      }
    }

    return;
  }
  async loadBlockWizard() {
    if (this.block_wizard_add_name_div)
      this.block_wizard_add_name_div.remove();

    this.app.mV = this;
    this.helpViewer = this.help_viewer_panel_internal;
    this.macro = new cMacro(this.macro_details_wrapper, this.wizard_choices.value, this.app, true);

    this.block_wizard_add_name_div = document.querySelector('.block_wizard_add_name_div');
    this.block_wizard_select_wrapper.appendChild(this.block_wizard_add_name_div);

    let handleImageTextureUpload = async (fileCtl, field) => {
      let fileBlob = fileCtl.files[0];

      if (!fileBlob)
        return;
      field.value = 'Uploading...';
      let filename = fileBlob.name;

      if (!this._validationConfiguration())
        return;
      if (!this.defaultToken) {
        alert('No default token configured');
      }

      let url = 'https://us-central1-' + this.defaultServerTarget + '.cloudfunctions.net/fileupload?name=' + encodeURIComponent(this.defaultProjectTarget);
      url += '&token=' + encodeURIComponent(this.defaultToken);
      url += '&filename=' + encodeURIComponent(filename);

      let body = new FormData();
      body.append('file', fileBlob);

      let genResponse = await fetch(url, {
        method: "post",
        body
      });
      let genResults = await genResponse.json();
      if (genResults.success)
        if (genResults.result_msg.success) {
          field.value = genResults.result_msg.signed_url;
          let event = new Event('input', {
            bubbles: true,
            cancelable: true,
          });

          field.dispatchEvent(event);
          return genResults;
        }

      field.value = '';
      alert('upload did not complete');
      return null;
    };

    this.macro._handleImageTextureUpload = (fileCtl, field) => {
      return handleImageTextureUpload(fileCtl, field);
    };

    this.dialogUpdateHelp();
    return null;
  }
  async loadAddonView() {
    let wrappers = document.body.querySelectorAll('.main_div_wrapper');
    wrappers.forEach(w => w.style.display = 'none');

    if (this.addon_display_view_select.value !== 'cloud_deploy')
      this.preview_panel.setAttribute('src', '');
    else
      this.loadProjectView();
    if (this.addon_display_view_select.value === 'position_products')
      this.positionsFetchRefresh();


    this.dialogUpdateHelp();

    let ele = document.getElementById(this.addon_display_view_select.value);
    if (ele)
      ele.style.display = 'flex';

    return;
  }
  async dialogUpdateHelp() {
    if (this.addon_display_view_select.value === 'song_import_div') {
      this.currentHelpTag = 'processaudio';
    } else if (this.addon_display_view_select.value === 'cloud_deploy') {
      this.currentHelpTag = 'addonprojects';
    } else if (this.addon_display_view_select.value === 'cloud_target') {
      this.currentHelpTag = 'addonconfiguration';
    } else if (this.addon_display_view_select.value === 'template_view') {
      this.currentHelpTag = 'addontemplates';
    } else if (this.addon_display_view_select.value === 'block_wizards') {
      if (this.macro.tag === 'block' && this.macro.block_wizard_type_select.value === "Scene")
        this.currentHelpTag = "sceneblock";
      else
        this.currentHelpTag = this.wizard_choices.value;
    } else if (this.addon_display_view_select.value === 'position_plotter_div')
      this.currentHelpTag = 'positionplotter';
    else if (this.addon_display_view_select.value === 'position_products')
      this.currentHelpTag = 'positionproducts';

    this.app.help_topic_picker_select = this.help_viewer_panel_select;

    this.app.helpViewCallback = (helpTag, dom, previousTag) => {
      this._helpPanelCallback(helpTag, dom, previousTag);
    };

    await this.app.updateHelpView(this.currentHelpTag, this.helpViewer);
  }
  async loadProjectPreview() {
    if (this.selectedProjectView === 1) {
      this.preview_panel.setAttribute('src', this.projectViewURL);
    } else if (this.selectedProjectView === 2) {
      this.preview_panel.setAttribute('src', this.projectDisplayURL);
    } else {
      this.preview_panel.setAttribute('src', '');
    }

    if (this.selectedProjectView === 1 || this.selectedProjectView === 2) {
      this.project_preview_zoom.style.display = '';
      let scaleF = this.project_preview_zoom.selectedIndex;
      let style = {};

      if (scaleF === 0) {
        style = {
          width: '100%',
          height: '100%',
          transform: 'scale(1)',
          top: '0%',
          left: '0%'
        }
      } else if (scaleF === 1) {
        style = {
          width: '200%',
          height: '200%',
          transform: 'scale(.5)',
          top: '-50%',
          left: '-50%'
        }
      } else if (scaleF === 2) {
        style = {
          width: '400%',
          height: '400%',
          transform: 'scale(.25)',
          top: '-150%',
          left: '-150%'
        }
      }

      for (let key in style) {
        this.preview_panel.style[key] = style[key];
      }
    } else {
      this.project_preview_zoom.style.display = 'none';
    }
    return null;
  }
  async loadTemplateList(initRun = false) {
    if (!this.templateListResults) {
      let genResponse = await fetch('https://handtop.com/addontemplates/templatelist.json', {
        method: "get",
        cache: "no-store"
      });
      this.templateListResults = await genResponse.json();
    }

    let html = '';
    let selectedFilter = this.template_filter_select.value;
    if (!selectedFilter)
      selectedFilter = 'Layout';
    let selected = 'selected';
    let selectedTemplate = this.circuit_template_select.value;
    let templateMap = {};
    let categories = [];
    this.templateListResults.forEach(i => {
      let cats = i.categories;
      if (!cats)
        cats = '';
      cats = cats.split(',');
      if (selectedFilter === 'All' || cats.indexOf(selectedFilter) !== -1) {
        html += '<option ${selected}>' + i.name + '</option>';
      }
      selected = '';
      templateMap[i.name] = i;
      cats.forEach(cat => {
        if (categories.indexOf(cat) === -1 && cat !== '')
          categories.push(cat);
      });
    });
    this.templateMap = templateMap;
    this.circuit_template_select.innerHTML = html;

    let filter_options = '<option>All</option>';
    categories.forEach(cat => filter_options += '<option>' + cat + '</option>');
    this.template_filter_select.innerHTML = filter_options;
    this.template_filter_select.value = selectedFilter;

    if (selectedTemplate)
      this.circuit_template_select.value = selectedTemplate;
    if (this.circuit_template_select.selectedIndex === -1)
      this.circuit_template_select.selectedIndex = 0;
    this.loadTemplateDetails(!initRun);

    if (this.splitTemplatesView)
      this.splitTemplatesView.destroy();
    this.splitTemplatesView = Split(['#circuit_template_select', '#template_description_wrapper'], {
      sizes: [70, 30],
      minSize: [.1, .1],
      direction: 'vertical'
    });
  }
  async loadProjectProducts() {
    if (!this.defaultServerTarget || !this.defaultProjectTarget)
      return null;

    let url = 'https://us-central1-' + this.defaultServerTarget + '.cloudfunctions.net/productsforname/?name=' + encodeURIComponent(this.defaultProjectTarget);
    url += '&token=' + encodeURIComponent(this.defaultToken);
    let genResponse = await fetch(url, {
      method: "get",
      cache: "no-store"
    });
    let genResults = await genResponse.text();
    let r = JSON.parse(genResults);
    return r;
  }
  async loadImagePreview(new_url) {
    if (this.updatingImagePreview) {
      clearTimeout(this.refreshPreview);
      this.refreshPreview = setTimeout(() => this.loadImagePreview(), 50);
      return;
    }
    this.updatingImagePreview = true;
    this.signed_url = new_url;

    let name = this.file_upload_name.value;
    if (!name || !this.defaultServerTarget || !this.defaultToken) {
      this.img_preview.setAttribute('src', '');
      this.img_preview_link.setAttribute('href', '');
      this.img_preview_link.innerHTML = '';
      this.updatingImagePreview = false;
      return;
    }


    let tag = 'cloudupload';
    let wid = 'none';
    let selectedProject = this.project_deploy_select.value;
    if (this.defaultServerTarget)
      wid = this.widForName[selectedProject];

    if (!wid) {
      let url = 'https://us-central1-' + this.defaultServerTarget + '.cloudfunctions.net/widforname/?name=' + encodeURIComponent(selectedProject);
      url += '&token=' + encodeURIComponent(this.defaultToken);
      let genResponse = await fetch(url, {
        method: "get",
        cache: "no-store"
      });
      let genResults = await genResponse.text();
      let r = JSON.parse(genResults);
      wid = r.wid;
      window.bucketName = r.bucket;
      this.widForName[this.defaultServerTarget] = wid;
    }
    this.referencePath = 'project/' + wid + '/' + tag + '/';

    if (!this.signed_url)
      this.signed_url = "https://firebasestorage.googleapis.com/v0/b/" +
      window.bucketName + "/o/" + encodeURIComponent(this.referencePath + name) + "?alt=media&token=" + 'token';

    let signed_url = this.signed_url;
    this.img_preview_link.setAttribute('href', signed_url);
    this.upload_file_audio_ctl.src = signed_url;
    this.img_preview_link.innerHTML = signed_url;
    this.img_preview_link.url = signed_url;

    if (signed_url)
      signed_url += '&randomstuff=' + Number(new Date()).toString();
    this.img_preview.setAttribute('src', signed_url);

    this.updatingImagePreview = false;
  }
  async loadProjectView() {
    if (!this.selectedProjectView)
      this.selectedProjectView = 0;

    let selectedProject = this.project_deploy_select.value;
    let defaultProject = this.defaultProjectTarget;
    if (selectedProject === defaultProject) {
      this.project_set_default_btn.classList.remove("blue");
    } else {
      this.project_set_default_btn.classList.add("blue");
    }
    let pid = this.defaultServerTarget;
    this.projectDisplayURL = 'https://' + pid + '.web.app/' + this.defaultAppTarget + '/?name=' + selectedProject;
    this.projectEditURL = 'https://' + pid + '.web.app/asset/?name=' + selectedProject;
    this.projectViewURL = 'https://' + pid + '.web.app/view/?name=' + selectedProject;

    if (this.project_selected_options.selectedIndex === 5) {
      let a = document.createElement('a');
      a.setAttribute('href', this.projectViewURL);
      a.setAttribute('target', '_blank');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    if (this.project_selected_options.selectedIndex === 6) {
      let a = document.createElement('a');
      a.setAttribute('href', this.projectDisplayURL);
      a.setAttribute('target', '_blank');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    if (this.project_selected_options.selectedIndex === 7) {
      let a = document.createElement('a');
      a.setAttribute('href', this.projectEditURL);
      a.setAttribute('target', '_blank');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    if (this.project_selected_options.selectedIndex > 4 && this.project_selected_options.selectedIndex < 8)
      this.project_selected_options.selectedIndex = this.selectedProjectView;
    this.selectedProjectView = this.project_selected_options.selectedIndex;
    this.loadProjectPreview();

    this.deploy_detail_buttons_view.style.display = (this.selectedProjectView === 0) ? '' : 'none';
    this.project_deploy_view.style.display = (this.selectedProjectView === 0) ? 'flex' : 'none';
    this.project_upload_view.style.display = (this.selectedProjectView === 3) ? 'flex' : 'none';
    this.project_addsheet_view.style.display = (this.selectedProjectView === 4) ? 'flex' : 'none';
    this.project_display_view.style.display = (this.selectedProjectView === 1 || this.selectedProjectView === 2) ? '' : 'none';
    this.loadImagePreview();

    this.projectsUpdateSheetAddView();
  }
  async loadProjectSelectList() {
    let sel = this.project_deploy_select.selectedIndex;
    this.publishList = await this.sheetsJSONforSheetCSV(this.projectsSheetName, false, true);
    let linkListHTML = '';
    let defaultProject = this.defaultProjectTarget;
    let defaultIndex = -1;
    this.publishList.forEach((t, index) => {
      linkListHTML += '<option>' + t['Project Name'] + '</option>';
      if (defaultProject === t['Project Name'])
        defaultIndex = index;
    });
    this.project_deploy_select.innerHTML = linkListHTML;
    if (sel === -1) sel = defaultIndex;
    this.project_deploy_select.selectedIndex = sel > -1 ? sel : 0;
    this.loadProjectView();
  }
  _helpPanelCallback(helpTag, dom) {
    let help_topic = this.help_viewer_panel_select.selectedIndex;
    if (help_topic < 0)
      return;

    if (!this.helpBackButtonPressed && this.previousHelpTag) {
      if (this.helpBackList.length === 0) {
        this.helpBackList.push(this.previousHelpTag);
      } else if (this.previousHelpTag !== this.helpBackList[this.helpBackList.length - 1]) {
        this.helpBackList.push(this.previousHelpTag);
      }
      if (!this.helpForwardButtonPressed)
        this.helpForwardList = [];
    }
    if (this.helpBackList[this.helpBackList.length - 1] === helpTag)
      this.helpBackList.pop();

    this.helpBackButtonPressed = false;
    this.helpForwardButtonPressed = false;
    this.previousPreviousHelpTag = this.previousHelpTag;
    this.previousHelpTag = helpTag;

    if (this.helpBackList.length > 0)
      this.help_back_button.style.visibility = '';
    else
      this.help_back_button.style.visibility = 'hidden';

    if (this.helpForwardList.length > 0)
      this.help_forward_button.style.visibility = '';
    else
      this.help_forward_button.style.visibility = 'hidden';

    let helpData = this.cachedHelpItemList[help_topic];

    if (!helpData || !helpData.video) {
      this.helper_viewer_panel_open_video_btn.style.visibility = 'hidden';
    } else {
      this.helper_viewer_panel_open_video_btn.style.visibility = '';
    }

    if (!helpData || !helpData.deployed) {
      this.helper_viewer_panel_open_deployed_btn.style.visibility = 'hidden';
    } else {
      this.helper_viewer_panel_open_deployed_btn.style.visibility = '';
    }


    let topic = this.help_viewer_panel_select.value;
    let url = 'https://handtop.com/doc/' + topic;
    this.help_new_window_link.setAttribute('href', url);
    this.help_new_window_link.innerHTML = '/' + topic;

    let anchors = dom.querySelectorAll('a');
    anchors.forEach(a => a.addEventListener('click', e => {
      if (a.href.indexOf('https://handtop.com/doc/') !== -1) {
        let tag = a.href.replace('https://handtop.com/doc/', '');
        this.help_viewer_panel_select.value = tag;
        this._updateHelpSelectChange();
        e.preventDefault();
        return true;
      }
    }));
  }

  async sheetsCreateTemplateSheet(layoutName, sheetName) {
    let sheets = layoutName.split(',');

    this.create_layout_btn.classList.add('create_layout_spin');
    this.create_layout_btn.classList.remove('blue');
    let genResponse = await fetch('https://www.handtop.com/addontemplates/template_' + layoutName + '.json', {
      method: "get",
      cache: "no-store"
    });
    let genText = await genResponse.text();

    genText = genText.split('##sheetname').join("'" + sheetName + "'");
    genText = genText.split('##sheetrawname').join(sheetName);

    let genResults = JSON.parse(genText);
    return new Promise(async (resolve, reject) => {
      google.script.run.withSuccessHandler(async (result) => {
        resolve(result);
      }).createSheetFromTemplate(sheetName, genResults);
    });
  }
  async sheetsAddToProjectList(sheetName, assetSheets = [], productSheets = []) {
    let assets = '';
    if (assetSheets.length > 0)
      assetSheets.forEach(s => {
        if (assets !== '')
          assets += ' & "," & ';
        else
          assets += '=';
        assets += 'getDataRangesForSheet(\"' + s + "\")";
      });

    let products = '';
    if (productSheets.length > 0)
      productSheets.forEach(s => {
        if (products !== '')
          products += ' & "," & ';
        else
          products += '=';
        products += 'getDataRangesForSheet(\"' + s + "\")";
      });

    return new Promise((resolve, reject) => {
      google.script.run.withSuccessHandler((result) => {
        resolve(result);
      }).AddRowToProjectList(sheetName, '=getDataRangesForSheet(\"' + sheetName + "\")", assets, products, '');
    });
  }
  async sheetsStoreSelectedProject(project) {
    this.setBusy();
    if (!project)
      project = this.project_deploy_select.value;
    await this.sheetsStoreCSVValue('Configuration', 1, 'Target Project', project);
    this.initSheetBasedData();
  }
  async sheetsStoreCSVValue(sheetName, rowIndex, field, value) {
    return new Promise(async (resolve, reject) => {
      google.script.run.withSuccessHandler((result) => {
        resolve(result);
      }).SetCSVSheetValue(sheetName, rowIndex, field, value);
    });
  }
  async sheetsJSONforSheetCSV(sheetName, refresh = false, formulas = false) {
    return new Promise(async (resolve, reject) => {
      google.script.run.withSuccessHandler((result) => {
        resolve(result);
      }).getJSONFromCSVSheet(sheetName, refresh, formulas);
    });
  }
  async sheetsJSONforRangeListCSV(rangeStrings) {
    return new Promise(async (resolve, reject) => {
      google.script.run.withSuccessHandler((result) => {
        resolve(result);
      }).mergeCSVRangeStrings(rangeStrings, true);
    });
  }
  async sheetsSetAssetsForProject(assetSheetName, projectName, field = "Asset Ranges") {
    this.publishList = await this.sheetsJSONforSheetCSV(this.projectsSheetName, false, true);

    let rowIndex = -1;
    for (let c = 0; c < this.publishList.length; c++) {
      if (this.publishList[c]['Project Name'] === projectName) {
        rowIndex = c;
        break;
      }
    }

    if (rowIndex !== -1) {
      let pubData = this.publishList[rowIndex];
      let assets = pubData.formulaRow[field];
      console.log('assetsformula', assets);
      if (assets !== '')
        assets += ' & "," & ';
      else
        assets += '=';
      assets += 'getDataRangesForSheet(\"' + assetSheetName + "\")";

      await this.sheetsStoreCSVValue(this.projectsSheetName, rowIndex + 1,
        field, assets);
    }
  }

  async cloudDeployUpdateFilePreview() {
    let v = this.upload_file_preview_select.selectedIndex;
    this.upload_file_img_preview.style.display = 'none';
    this.upload_file_mesh_preview.style.display = 'none';
    this.upload_file_audio_preview.style.display = 'none';
    if (v === 0) {
      this.upload_file_img_preview.style.display = 'flex';
    } else if (v === 1) {
      this.upload_file_audio_preview.style.display = '';
    } else {
      this.upload_file_mesh_preview.style.display = '';
    }

    if (v !== 1)
      this.upload_file_audio_ctl.pause();
  }
  async cloudDeploySetServer() {
    this.setBusy();
    let token = this.token_to_deploy.value;
    let server = this.target_to_deploy.value;

    await this.sheetsStoreCSVValue('Configuration', 1, 'Target Token', token);
    await this.sheetsStoreCSVValue('Configuration', 1, 'Target Server', server);

    this.initSheetBasedData();
  }
  async templateCreateSheets() {
    let sheetName = this.sheetname.value;
    let tKey = this.circuit_template_select.value;

    if (!sheetName) {
      alert('Sheet name required');
      return null;
    }
    let templateData = this.templateMap[tKey];
    let result = await this.sheetsCreateTemplateSheet(templateData.mainFile, sheetName);
    let assetSheets = [];
    let productSheets = [];

    if (result !== 'success') {
      alert(result);
    } else {
      if (templateData.fragments || templateData.products) {
        if (!templateData.fragments) templateData.fragments = '';
        if (!templateData.products) templateData.products = '';
        let fragments = templateData.fragments.split(',');
        let products = templateData.products.split(',');
        let both = fragments.concat(products);

        for (let c = 0; c < both.length; c++) {
          let frag = both[c];
          let tData = this.templateMap[frag];

          if (tData) {
            let sheetName = tData.hint;
            if (!sheetName)
              sheetName = frag;
            let fragResult = await this.sheetsCreateTemplateSheet(tData.mainFile, sheetName);

            if (fragResult !== 'success' && fragResult !== 'sheet exists') {
              alert(fragResult);
              break;
            }

            if (fragments.indexOf(frag) !== -1)
              assetSheets.push(sheetName);
            else
              productSheets.push(sheetName);
          }
        }
      }

      if (this.add_to_publishlist.checked)
        await this.sheetsAddToProjectList(sheetName, assetSheets, productSheets);
      if (this.set_to_defaultproject.checked)
        await this.sheetsStoreSelectedProject(sheetName);
      if (this.add_asset_to_projectlist.checked)
        await this.sheetsSetAssetsForProject(sheetName, this.defaultProjectTarget);
      if (this.add_products_to_projectlist.checked)
        await this.sheetsSetAssetsForProject(sheetName, this.defaultProjectTarget, "Catalog Ranges");
    }

    this.create_layout_btn.classList.add('blue');
    this.create_layout_btn.classList.remove('create_layout_spin');

    this.sheetnameinputdirty = false;

    return this.initSheetBasedData();
  }
  _uploadCSVTest(csv, testData = false) {
    if (!csv)
      return false;
    if (csv.length === 0)
      return false;
    let data = csv[0];
    let keys = Object.keys(data);
    let error = false;
    keys.forEach(key => {
      if (key === '#ERROR!') error = true
    });
    if (testData)
      csv.forEach(e => keys.forEach(key => {
        if (e[key] === '#ERROR!') error = true
      }));

    if (error)
      this.user_notify_error = true;
    return error;
  }
  async cloudDeployProjects(filter) {
    if (!this._validationConfiguration())
      return;

    if (this.busy)
      return;

    this.display_publish_list.classList.add('busy_deploy');
    this.display_publish_single.classList.add('busy_deploy');
    this.display_publish_single_header.classList.add('busy_deploy');
    this.publish_results.value = '';
    this.dataCache = {};

    this.busy = true;
    this.user_notify_error = false;
    this.publish_results.value = '';

    this.publishList = await this.sheetsJSONforSheetCSV(this.projectsSheetName, true, true);

    this.projectsFetchCSVTestStatus = this._uploadCSVTest(this.publishList, true);
    if (this.projectsFetchCSVTestStatus) {
      console.log('CSV Validation Error', 'Projects', this.publishList);
      this.publish_results.value += name + ':PROJECTS: Error ';
      this.publish_results.value += 'CSV Validation Error\n\n';
    }

    this.publish_results.value += this.publishList.length.toString() + ' Projects found in ' + this.projectsSheetName + '\n\n';

    let deleteProject = async (name) => {
      let url = 'https://us-central1-' + this.defaultServerTarget + '.cloudfunctions.net/delete/?name=' + encodeURIComponent(name);
      url += '&token=' + encodeURIComponent(this.defaultToken);
      let genResponse = await fetch(url, {
        method: "post"
      });
      let genResults = await genResponse.text();
      let r = {
        result_msg: 'unknown'
      };
      try {
        r = JSON.parse(genResults);
      } catch (e) {
        console.log(e, genResults);
      }

      return r;
    };
    let publishSingle = async (name, assetRanges, circuitRanges, catalogRanges) => {
      console.log(name, assetRanges, circuitRanges, catalogRanges);
      let step = 'Assets';
      try {
        let assetResults = {};
        if (assetRanges) {

          let assets = null;
          if (this.dataCache[assetRanges])
            assets = this.dataCache[assetRanges];

          if (!assets) {
            let ranges = assetRanges.split(',');
            assets = await this.sheetsJSONforRangeListCSV(ranges);
            let csvError = this._uploadCSVTest(assets);
            if (csvError) {
              console.log('CSV Validation Error', name, 'assets', assets);
              this.publish_results.value += name + ':assets: Error ';
              this.publish_results.value += 'CSV Validation Error\n';
            }
            console.log('asset fetch', assets);
          }
          let url = 'https://us-central1-' + this.defaultServerTarget + '.cloudfunctions.net/upload?name=';
          url += encodeURIComponent(name) + '&type=asset';
          url += '&token=' + encodeURIComponent(this.defaultToken);
          let json = JSON.stringify(assets);

          let response = await fetch(url, {
            method: "post",
            body: json
          });
          let r = await response.text();
          assetResults = JSON.parse(r);

          if (assetResults.success) {
            this.dataCache[assetRanges] = assets;
            this.publish_results.value += name + ':assets: ' + assets.length.toString() + '\n';
          } else {
            this.publish_results.value += name + ':assets: Error ';
            this.publish_results.value += assetResults.errorMessage + '\n';
            this.user_notify_error = true;
          }
          this.publish_results.scrollTop = this.publish_results.scrollHeight;
        }
        step = "Circuit";
        let sceneResults = {};
        if (circuitRanges) {

          let scene = null;
          if (this.dataCache[circuitRanges])
            scene = this.dataCache[circuitRanges];

          if (!scene) {
            let ranges = circuitRanges.split(',');
            scene = await this.sheetsJSONforRangeListCSV(ranges);
            let csvError = this._uploadCSVTest(scene);
            if (csvError) {
              console.log('CSV Validation Error', name, 'Circuit', scene);
              this.publish_results.value += name + ':circuit: Error ';
              this.publish_results.value += 'CSV Validation Error\n';
            }

            console.log('circuit fetched', scene);
          }
          let url = 'https://us-central1-' + this.defaultServerTarget + '.cloudfunctions.net/upload?name=';
          url += encodeURIComponent(name) + '&type=scene';
          url += '&token=' + encodeURIComponent(this.defaultToken);
          let json = JSON.stringify(scene);
          let response = await fetch(url, {
            method: "post",
            body: json
          });
          let r = await response.text();
          sceneResults = JSON.parse(r);

          if (sceneResults.success) {
            this.dataCache[circuitRanges] = scene;
            this.publish_results.value += name + ':circuit: ' + scene.length.toString() + '\n';
          } else {
            this.publish_results.value += name + ':circuit: Error ';
            this.publish_results.value += sceneResults.errorMessage + '\n';
            this.user_notify_error = true;
          }
          this.publish_results.scrollTop = this.publish_results.scrollHeight;
        }

        step = "Products";
        let productResults = {};
        if (catalogRanges) {

          let products = null;
          if (this.dataCache[catalogRanges])
            products = this.dataCache[catalogRanges];

          if (!products) {
            let ranges = catalogRanges.split(',');
            products = await this.sheetsJSONforRangeListCSV(ranges);

            let csvError = this._uploadCSVTest(products);
            if (csvError) {
              console.log('CSV Validation Error', name, 'Products', products);
              this.publish_results.value += name + ':products: Error ';
              this.publish_results.value += 'CSV Validation Error\n';
            }

            console.log('products fetch', products);
          }

          let url = 'https://us-central1-' + this.defaultServerTarget + '.cloudfunctions.net/upload?name=';
          url += encodeURIComponent(name) + '&type=product';
          url += '&token=' + encodeURIComponent(this.defaultToken);
          let json = JSON.stringify(products);
          let response = await fetch(url, {
            method: "post",
            body: json
          });
          let r = await response.text();
          productResults = JSON.parse(r);

          if (productResults.success) {
            this.publish_results.value += name + ':products: ' + products.length.toString() + '\n'
          } else {
            this.publish_results.value += name + ':products: Error ';
            this.publish_results.value += productResults.errorMessage + '\n';
            this.user_notify_error = true;
          }
          this.publish_results.scrollTop = this.publish_results.scrollHeight;
        }

        step = "Generate";
        let url = 'https://us-central1-' + this.defaultServerTarget + '.cloudfunctions.net/generate/?name=' + encodeURIComponent(name);
        url += '&token=' + encodeURIComponent(this.defaultToken);
        let genResponse = await fetch(url, {
          method: "post"
        });
        let gr = await genResponse.text();
        let genResults = JSON.parse(gr);

        if (genResults.success) {
          this.publish_results.value += name + ' generated\n\n'
        } else {
          this.publish_results.value += name + ':generate: Error ';
          this.publish_results.value += genResults.errorMessage + '\n';
        }
        this.publish_results.scrollTop = this.publish_results.scrollHeight;

        return {
          genResults,
          productResults,
          assetResults,
          sceneResults
        };
      } catch (error) {
        console.log('e', error);
        this.publish_results.value += '\nERROR ' + step + '\n';
        this.publish_results.value += error.message;
        this.publish_results.scrollTop = this.publish_results.scrollHeight;
        this.user_notify_error = true;
        return {
          error: error
        };
      }
    };

    let promises = [];
    let singleIndex = null;
    if (filter === 'list_selected') {
      singleIndex = this.project_deploy_select.selectedIndex;
    }
    if (filter === 'selected') {
      this.publishList.forEach((i, index) => {
        if (this.defaultProjectTarget === i['Project Name'])
          singleIndex = index;
      });
    }

    let skip = false;
    if (filter !== 'all' && singleIndex === null) {
      alert('project not found');
      skip = true;
    }

    for (let c = 0, end = this.publishList.length; c < end; c++) {
      if ((singleIndex !== null && singleIndex !== c) || skip)
        continue;

      let row = this.publishList[c];
      if (!row)
        console.log('ppp', this.publishList);
      let flags = row.Flags;
      if (!flags) flags = '';
      flags = flags.toLowerCase();

      if (flags.indexOf('ignore') !== -1) {
        this.publish_results.value += row['Project Name'] + ' ignored\n';
        continue;
      }

      if (flags.indexOf('remove') !== -1) {
        let r_result = await deleteProject(row['Project Name']);
        if (r_result.success)
          this.publish_results.value += row['Project Name'] + ' removed\n\n';
        else {
          this.publish_results.value += row['Project Name'] + ' NOT removed\n';
          this.publish_results.value += 'ERROR: ' + r_result.errorMessage + '\n\n';
        }

        continue;
      }


      this.publish_results.scrollTop = this.publish_results.scrollHeight;
      let result = await publishSingle(row['Project Name'], row['Asset Ranges'],
        row['Circuit Ranges'], row['Catalog Ranges']);

      if (this.user_notify_error) {
        this.user_notify_error = false;
        alert('Error deploying ' + row['Project Name'].toString() + ' - please refer to log.');
      }
    }
    this.busy = false;
    this.display_publish_list.classList.remove('busy_deploy');
    this.display_publish_single.classList.remove('busy_deploy');
    this.display_publish_single_header.classList.remove('busy_deploy');

    if (this.addon_display_view_select.value === 'cloud_deploy') {
      this.loadProjectPreview();
    }
    this.publish_results.value += '\nComplete\n\n';
    this.publish_results.scrollTop = this.publish_results.scrollHeight;
  }
  async storageUploadProjectFile(e) {
    let filename = this.file_upload_name.value.trim();
    let selectedProject = this.project_deploy_select.value;

    if (this.file_upload_name.value === '') {
      this.file_upload_name.value = this.upload_file_input.files[0].name;
      filename = this.file_upload_name.value;
    }
    let url = 'https://us-central1-' + this.defaultServerTarget + '.cloudfunctions.net/fileupload?name=' + encodeURIComponent(selectedProject);
    url += '&token=' + encodeURIComponent(this.defaultToken);
    url += '&filename=' + encodeURIComponent(filename);

    let body = new FormData();
    body.append('file', this.upload_file_input.files[0]);

    this.upload_file_cloud.classList.add('green');
    let genResponse = await fetch(url, {
      method: "post",
      body
    });
    let genResults = await genResponse.text();
    let r = {
      result_msg: 'unknown'
    };
    try {
      r = JSON.parse(genResults);
    } catch (e) {
      console.log(e, genResults);
    }

    if (r.success)
      if (r.result_msg.success) {
        this.loadImagePreview(r.result_msg.signed_url);
        this.upload_file_input.value = '';
        this.upload_file_cloud.classList.remove('green');
        return r;
      }
    this.loadImagePreview('');

    this.upload_file_input.value = '';
    this.upload_file_cloud.classList.add('red');
    alert('upload did not complete');
    return r;
  }
  async audioProcessFileSelected() {
    let fileBlobToArrayBuffer = (file) => {
      return new Promise((resolve, reject) => {
        let reader = new FileReader();

        reader.onload = () => {
          let array = new Uint8Array(reader.result);
          resolve(array);
        };

        reader.onerror = (err) => {
          console.log('File Reader Error', err);
          reject(err);
        };

        reader.readAsArrayBuffer(file);
      });
    }
    this.audioProcessSongBytes = await fileBlobToArrayBuffer(this.audio_file.files[0]);
    this.audio.src = URL.createObjectURL(this.audio_file.files[0]);

    return this.audioProcessUpdateData();
  }
  async audioProcessUpdateData() {
    this.song_raw_data.innerHTML = '';
    this.song_len_sec.innerHTML = '';

    if (!this.audioProcessSongBytes) {
      this.song_len_sec.innerHTML = 'No audio file selected';
      return;
    }

    let resampleData = (arrayIn, secondsLength, samplesPerSecondOut) => {
      let outArray = [];
      arrayIn.forEach(bandArray => {
        let outBand = [];
        let sampleCountFactor = bandArray.length / (secondsLength * samplesPerSecondOut);
        let runningFactor = 0;

        let sampleSum = 0.0;
        let sampleFactor = 0;
        let bandIndex = 0;
        let outSampleIndex = 0;
        bandArray.forEach(sample => {
          sampleSum += sample;
          sampleFactor++;
          bandIndex++;

          let sampleTestIndex = Math.floor(bandIndex / sampleCountFactor);

          if (sampleTestIndex > outBand.length) {
            outBand.push(Number((sampleSum / sampleFactor).toFixed(1)));
            sampleSum = 0.0;
            sampleFactor = 0;
          }
        });
        outArray.push(outBand);
      });

      return outArray;
    };
    let fft_song_samples = async (samples_per_rift) => {
      let bufferUsed = 0;
      let song_sample_ctr = 0;
      let song_chunks = [];
      let freq_chunks = [];
      let file_bytes = this.song_samples;

      let smooth_bands = (in_array) => {
        let l = in_array.length;
        let out_array = [];
        this.combined_bands = Number(this.bands_to_combine.value);

        for (let c = 0; c < l; c += this.combined_bands) {
          let sum = 0.0;
          for (let d = 0; d < this.combined_bands; d++) {
            sum += in_array[d + c];
          }

          out_array.push(Math.round(sum / this.combined_bands));
        }

        return out_array;
      };

      while (bufferUsed < (this.song_samples.length - samples_per_rift)) {
        let data_to_process = this.song_samples.slice(bufferUsed, bufferUsed + samples_per_rift);
        bufferUsed += samples_per_rift;
        song_sample_ctr++;

        song_chunks.push(data_to_process);

        let ft = new FFT(samples_per_rift, this.sampleRate);
        ft.forward(data_to_process);
        let fewer_bands = smooth_bands(ft.spectrum);
        freq_chunks.push(fewer_bands);
      }

      return freq_chunks;
    };
    let convert_raw_to_samples = () => {
      let samples = [];
      let ratioToKeep = this.seconds / this.seconds_clip;
      let sampleLimit = this.rawBytes.length / ratioToKeep;

      //convert to 16 bits and clip size
      if (this.bitSize > 8) {
        for (let c = 0, l = this.sampleLimit - 1; c < l; c += 2) {
          samples.push(this.rawBytes[c + 1] * 256 + this.rawBytes[c]);
        }
      } else {
        samples = this.rawBytes;
      }

      return samples;
    };
    let song_bytes = this.audioProcessSongBytes;
    let html_out = '';
    if (song_bytes) {
      let riffTest = new TextDecoder().decode(song_bytes.slice(0, 4));
      if (riffTest !== 'RIFF') {
        alert('must be WAV file - RIFF warning');
//        return;
      }
      this.totalSize = song_bytes[7] * (256 * 256 * 256) +
        song_bytes[6] * (256 * 256) +
        song_bytes[5] * (256) +
        song_bytes[4];
      html_out += 'total size: ' + this.totalSize + '<br>';
      let wavTEST = new TextDecoder().decode(song_bytes.slice(8, 15));
      if (wavTEST !== 'WAVEfmt') {
        alert('must be WAV file - wavefmt warning');
//        return;
      }
      this.sampleBits = song_bytes[19] * (256 * 256 * 256) +
        song_bytes[18] * (256 * 256) +
        song_bytes[17] * (256) +
        song_bytes[16];
      html_out += 'sample bits:' + this.sampleBits + '<br>';

      let audioFormat = song_bytes[21] * (256) +
        song_bytes[20];

      this.channels = song_bytes[23] * (256) +
        song_bytes[22];
      html_out += 'channels: ' + this.channels + '<br>';

      this.sampleRate = song_bytes[27] * (256 * 256 * 256) +
        song_bytes[26] * (256 * 256) +
        song_bytes[25] * (256) +
        song_bytes[24];
      html_out += 'sample rate:' + this.sampleRate + '<br>';

      this.byteRate = song_bytes[31] * (256 * 256 * 256) +
        song_bytes[30] * (256 * 256) +
        song_bytes[29] * (256) +
        song_bytes[28];
      html_out += 'byteRate: ' + this.byteRate + '<br>';

      let blockAlign = song_bytes[33] * (256) +
        song_bytes[32];
      html_out += 'blockAlign: ' + blockAlign + '<br>';

      this.bitRate = song_bytes[35] * (256) +
        song_bytes[34];
      html_out += 'bitRate: ' + this.bitRate + '<br>';
      let dataTEST = new TextDecoder().decode(song_bytes.slice(36, 40));
      if (dataTEST !== 'data') {
        alert('must be WAV file - data test warning');
//        return;
      }

      this.dataChunkHeader = song_bytes[39] * (256 * 256 * 256) +
        song_bytes[38] * (256 * 256) +
        song_bytes[37] * (256) +
        song_bytes[36];
      html_out += 'dataChunkHeader:' + this.dataChunkHeader + '<br>';

      this.fileDataSize = song_bytes[43] * (256 * 256 * 256) +
        song_bytes[42] * (256 * 256) +
        song_bytes[41] * (256) +
        song_bytes[40];
      html_out += 'fileDataSize:' + this.fileDataSize + '<br>';

      this.seconds = this.fileDataSize / this.byteRate;
      this.seconds_clip = this.seconds;
      if (this.seconds_to_sample.value !== '') {
        this.seconds_clip = Number(this.seconds_to_sample.value);
      }
      html_out += 'length: ' + this.seconds.toFixed(1) + 's<br>';

      let v = this.sampleRate * Number(this.bands_to_combine.value);
      html_out += 'freq per band ' + v + 'hz<br>';

      document.getElementById('song_len_sec').innerHTML = html_out;
    } else {
      //alert('no song');
      return;
    }

    let audio_loaded = async () => {
      return new Promise((resolve, reject) => {
        this.audio.onloadeddata = () => {
          resolve();
        }
      });
    };
    let swap_indexes_n2 = (in_array) => {
      let out_array = [];
      let outer_bound = in_array[0].length;

      for (let c = 0; c < outer_bound; c++) {
        let new_n2_array = [];
        for (let d = 0, dl = in_array.length; d < dl; d++)
          new_n2_array.push(in_array[d][c]);

        out_array.push(new_n2_array)
      }

      return out_array;
    };

    this.audio.load();


    await audio_loaded();
    this.time_length = this.audio.duration; // in seconds

    this.rawBytes = song_bytes.slice(44);
    this.song_samples = await convert_raw_to_samples(song_bytes);

    let song_chunks = await fft_song_samples(512);
    let song_chunks_flipped_indexes = swap_indexes_n2(song_chunks);
    let freqData = [];
    for (let i = 0; i < song_chunks_flipped_indexes.length; i++)
      freqData.push(song_chunks_flipped_indexes[i]);
    //resample to 10 per second  2584 @ 60s => 600 @ 60s
    let resampledArray = resampleData(freqData, this.seconds_clip, Number(this.freq_samples_to_second.value));

    this.song_raw_data.innerHTML = JSON.stringify(resampledArray);
  }

  _validationConfiguration() {
    if (!this.defaultServerTarget) {
      alert('No default server set - refer to help');
      return false;
    }

    if (!this.defaultProjectTarget) {
      alert('No default project set - refer to help');
      return false;
    }

    return true;
  }
  projectViewCurrentProject(useDisplayURL = 0) {
    if (!this._validationConfiguration())
      return;
    let a = document.createElement('a');
    a.setAttribute('href', this.gProjectViewURL);
    if (useDisplayURL === 1)
      a.setAttribute('href', this.gProjectDisplayURL);
    if (useDisplayURL === 2)
      a.setAttribute('href', this.gProjectEditURL);

    a.setAttribute('target', '_blank');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  plotterUpdateView() {
    let cat = this.plot_type_select.value;
    let rows = document.querySelectorAll('#position_plotter_div tr');
    let extraRows = document.querySelectorAll('.plotter_output_split tr');

    rows.forEach(r => {
      if (r.dataset.cats && r.dataset.cats.indexOf(cat) === -1)
        r.style.display = 'none';
      else
        r.style.display = '';
    });
    extraRows.forEach(r => {
      if (r.dataset.cats && r.dataset.cats.indexOf(cat) === -1)
        r.style.display = 'none';
      else
        r.style.display = '';
    });

    this.plotterUpdatePlot();

  }
  plotterUpdatePlot() {
    this.plotter_output_table.innerHTML = '';
    let plot_type = this.plot_type_select.value;

    if (plot_type === 'bar_chart_plotter') {
      let lineCount = GLOBALUTIL.getNumberOrDefault(this.plotter_plots_count.value, 1);
      let pointCount = GLOBALUTIL.getNumberOrDefault(this.plotter_points_per_plot.value, 10);
      let width = GLOBALUTIL.getNumberOrDefault(this.plotter_plots_width.value, 10);
      let depth = GLOBALUTIL.getNumberOrDefault(this.plotter_plots_depth.value, 10);
      let includeLabels = this.plotter_plots_includelabels.checked;

      let range = [];
      let widthOffset = width / pointCount;
      let depthOffset = depth / lineCount;

      let y = '0.00';
      let raw_z = 0;
      let rx = '0';
      let ry = '0';
      let rz = '0';
      for (let plotCounter = 0; plotCounter < lineCount; plotCounter++) {
        let plot_points = [];

        let raw_x = 0;
        for (let pointCounter = 0; pointCounter < pointCount; pointCounter++) {
          let x = raw_x.toFixed(2);
          let z = raw_z.toFixed(2);
          let packet = {};
          if (includeLabels)
            packet.label = (pointCounter + 1).toString();
          Object.assign(packet, {
            x,
            y,
            z,
            rx,
            ry,
            rz
          });
          plot_points.push(packet);
          raw_x += widthOffset;
        }
        raw_z += depthOffset;

        range.push(plot_points);
      }

      let allPlots = [];
      range.forEach(r => allPlots = allPlots.concat(r));
      this.plotterRows = allPlots;
      this.plotter_output_table.innerHTML = cMacro._dataRowsToTableHTML(allPlots, [], this.plotter_plots_includeheaders.checked, 3);
    } else if (plot_type === 'radial_plotter') {
      let includeLabels = this.plotter_plots_radial_includelabels.checked;

      let pointCount = GLOBALUTIL.getNumberOrDefault(this.plotter_points_per_plot.value, 10);
      let x_radius = GLOBALUTIL.getNumberOrDefault(this.plotter_plots_width.value, 10) / 2;
      let z_radius = GLOBALUTIL.getNumberOrDefault(this.plotter_plots_depth.value, 10) / 2;
      let x_end = x_radius;
      if (this.plotter_plots_end_width.value !== '')
        x_end = GLOBALUTIL.getNumberOrDefault(this.plotter_plots_end_width.value, 10) / 2;
      let z_end = z_radius;
      if (this.plotter_plots_end_depth.value !== '')
        z_end = GLOBALUTIL.getNumberOrDefault(this.plotter_plots_end_depth.value, 10) / 2;
      let turns = GLOBALUTIL.getNumberOrDefault(this.plotter_plots_turns.value, 1);
      let height = GLOBALUTIL.getNumberOrDefault(this.plotter_plots_height.value, 0);
      let decay = GLOBALUTIL.getNumberOrDefault(this.plotter_plots_decay_per_turn.value, 0);
      let angle_offset = GLOBALUTIL.angleDeg(this.plotter_plots_offset_angle.value, 0);
      let item_offset_angle = GLOBALUTIL.angleDeg(this.plotter_plots_item_offset_angle.value, 0);

      let points = [];
      let pts_per_turn = [];
      for (let c = 0; c < turns; c++) {
        pts_per_turn[c] = Math.floor(pointCount / turns);
      }
      let fraction = pointCount / turns * 1.0 - Math.floor(pointCount / turns);
      let more_pts = Math.round(fraction * turns);
      let turnCtr = 0;
      while (more_pts > 0) {
        pts_per_turn[turnCtr]++;
        more_pts--;
        turnCtr++;
        if (turnCtr >= turns)
          turnCtr = 0;
      }

      if (decay < 0)
        decay = 0;
      if (decay > .99)
        decay = .99;
      let solvePerTurnWithDecay = (pts_turn, decay) => {
        for (let c = 1; c < pts_turn.length; c++) {
          if (pts_turn[c] > 1 &&
            pts_turn[c] > pts_turn[c - 1] * (1.0 - decay)) {
            pts_turn[c - 1]++;
            pts_turn[c]--;
          }
        }
        return pts_turn;
      };

      if (decay > 0) {
        let pts_per_turn_process = [...pts_per_turn];
        let processed_turns = solvePerTurnWithDecay(pts_per_turn_process, decay);
        for (let c = 0; c < pointCount; c++)
          processed_turns = solvePerTurnWithDecay(processed_turns, decay);
        pts_per_turn = processed_turns;
      }

      let pts_turned = 0;
      turnCtr = 0;
      let labelCtr = 0;
      let y_turned = angle_offset;
      for (let c = 0; c < pointCount; c++) {
        let turnPoints = pts_per_turn[turnCtr];
        if (c >= pts_turned + turnPoints) {
          turnCtr++;
          pts_turned += turnPoints;
          turnPoints = pts_per_turn[turnCtr];
          labelCtr = 0;
        }
        labelCtr++;

        let degPerPoint = 360.0 / turnPoints;
        let ratio = c * (1.0 / (pointCount - 1));
        let x_delta = (x_end - x_radius) * ratio;
        let z_delta = (z_end - z_radius) * ratio;
        let x = (x_radius + x_delta) * Math.cos(y_turned);
        let z = (z_radius + z_delta) * Math.sin(y_turned);
        let y = height * ratio;
        let ampRoot = Math.sqrt(x * x + y * y + z * z);
        let ax = x / ampRoot;
        let ay = y / ampRoot;
        let az = z / ampRoot;

        let ry = Math.atan2(ax, az) + item_offset_angle;
        if (!this.plotter_plots_includeradians.checked) {
          ry *= 180 / Math.PI;
          ry = ry.toFixed(3) + 'deg';
        }
        /*
        let rx = Math.atan2(az, ay);
        let rz = Math.atan2(ay, ax);
        if (ry >= Math.PI / 2 && ry <= 3 * Math.PI / 2) {
          rx *= -1;
        } else if (ry >= 3 * Math.PI / 2 && ry <= 5 * Math.PI / 2) {
          rx *= -1;
        } else if (ry >= -1 * Math.PI / 2 && ry <= -3 * Math.PI / 2) {
          rx *= -1;
        }
        */
        let rz = 0;
        let rx = 0;

        y_turned += degPerPoint * Math.PI / 180;

        let packet = {};
        if (includeLabels)
          packet.label = labelCtr.toString();
        Object.assign(packet, {
          x,
          y,
          z,
          rx,
          ry,
          rz
        });
        points.push(packet);
      }

      this.plotterRows = points;
      this.plotter_output_table.innerHTML = cMacro._dataRowsToTableHTML(points, [], this.plotter_plots_radial_includeheaders.checked, 3);
    } else if (plot_type === 'path_frames_plotter') {
      let pts_list = this.path_frames_points.value;
      let pts_arr = pts_list.split('\n');
      let parent = this.path_frames_parent.value;
      let name = this.path_frames_childname.value;
      let childtype = this.path_frames_childtype.value;
      let rotateTime = this.path_frames_rotation_time.value;
      let easingOption = this.path_frames_easing_option.value;
      let snappyMotion = this.path_frames_snappy_motion.checked;

      let frames = [];
      let frameorder = 10;
      let pts_ct = pts_arr.length;
      pts_arr.forEach((str, index) => {
        str += ',,,,,,,,,,,,,,';
        let items = str.split(',');
        let frame = {
          'asset': 'blockchildframe',
          name,
          parent,
          childtype,
          frameorder
        };
        frameorder += 10;
        frame.frametime = items[0];
        if (frame.frametime.indexOf('%') !== -1) {
          if (frame.frametime.indexOf('\'') === -1)
            frame.frametime = '\'' + frame.frametime;
        }
        if (index === 0 && easingOption)
          frame.frametime += ':' + easingOption;

        frame.x = items[1];
        frame.y = items[2];
        frame.z = items[3];
        frame.rx = items[4];
        frame.ry = items[5];
        frame.rz = items[6];
        frame.sx = items[7];
        frame.sy = items[8];
        frame.sz = items[9];
        frame.visibility = items[10];

        if (snappyMotion) {
          if (!rotateTime)
            rotateTime = '10';
          if (index > 0) {
            frame.frametime += 'cp' + rotateTime;
          }
          frames.push(frame);
        } else {
          if (index < pts_ct - 1 && index !== 0 && rotateTime) {
            frame.rx = '';
            frame.ry = '';
            frame.rz = '';
          }

          frames.push(frame);

          if (index < pts_ct - 1 && index !== 0 && rotateTime) {
            frame = {
              'asset': 'blockchildframe',
              name,
              parent,
              childtype,
              frameorder
            };
            frameorder += 10;
            frame.frametime = rotateTime + '++';
            frame.rx = items[4];
            frame.ry = items[5];
            frame.rz = items[6];
            frames.push(frame);
          }
        }
      })

      this.plotterRows = frames;
      this.plotter_output_table.innerHTML = cMacro._dataRowsToTableHTML(frames, [], this.path_frames_includeheaders.checked);
    }
  }
  updateSongDataView() {
    if (this.song_detail_data_rdo.checked) {
      this.song_raw_data.style.display = 'none';
      this.song_len_sec.style.display = '';
    } else {
      this.song_raw_data.style.display = '';
      this.song_len_sec.style.display = 'none';
    }
  }
  helpPanelToggle() {
    if (this.splitHelpInstance)
      this.splitHelpInstance.destroy();
    this.splitHelpInstance = null;
    if (this.helpPanelVisible) {
      this.helpPanelVisible = false;
      this.help_viewer_panel.style.display = 'none';
      this.show_help_panel_btn.style.background = '';
      this.details_wrapper_for_split.style.display = 'flex';
      this.help_and_details_wrapper_for_split.style.display = 'flex';
      this.addon_header_line_2.style.borderBottom = '8px solid white';
    } else {
      this.help_and_details_wrapper_for_split.style.display = 'block';
      this.helpPanelVisible = true;
      this.help_viewer_panel.style.display = '';
      this.addon_header_line_2.style.borderBottom = 'solid 6px rgb(100, 200, 255)';
      this.show_help_panel_btn.style.background = 'rgb(100, 200, 255)';
      this.splitHelpInstance = Split(['#help_viewer_panel', '#details_wrapper_for_split'], {
        sizes: [40, 60],
        direction: 'vertical',
        minSize: [.1, .1]
      });
    }
  }

  async productPositionInit() {
    this.record_field_list_form = document.body.querySelector('#position_products .position_products_fields');
    this.positions_panel = document.body.querySelector('#position_products');

    this.uploadImageButton = this.record_field_list_form.querySelector('.texturepathupload');
    this.uploadImageEditField = this.record_field_list_form.querySelector('.imageedit');

    this.uploadImageFile = document.body.querySelector('.productdescpathuploadfile');
    this.uploadImageFile.addEventListener('change', e => this.productPositionUploadImageFile());
    this.uploadImageButton.addEventListener('click', e => this.uploadImageFile.click());
    this.signImagePreview = document.body.querySelector('.product_image_img');

    this.uploadImageEditField.addEventListener('input', e => this.productPositionUpdateImagePreview());

    this.assetEditField = this.record_field_list_form.querySelector('.assetedit');
    this.assetEditField.addEventListener('input', e => this.productPositionUpdateProductType());

    this.blockEditField = this.record_field_list_form.querySelector('.blockedit');
    this.blockEditField.addEventListener('input', e => this.productPositionUpdateTypeFields());

    this.position_products_table = this.record_field_list_form.querySelector('.position_products_table');

    this.positions_panel.querySelectorAll('.textfontfamilyedit').forEach(i => i.addEventListener('input', e => this.updateFontField(i)));

    this.csv_import_preview = this.positions_panel.querySelector('.csv_import_preview');
    this.copy_csv_to_clipboard = this.positions_panel.querySelector('.positions_copy_csv_to_clipboard');
    this.copy_csv_header_clipboard = this.positions_panel.querySelector('.positions_copy_csv_header_clipboard');
    this.copy_csv_excludeempty_clipboard = this.positions_panel.querySelector('.positions_copy_csv_excludeempty_clipboard');
    this.copy_csv_to_clipboard.addEventListener('click', e => {
      let headers = this.copy_csv_header_clipboard.checked;
      cMacro.copyDataToClipboard([this.export_csv], [], headers);
      return this.positionsAdvanceNextItem(e);
    });
    this.show_hide_raw_csv = this.positions_panel.querySelector('.positions_show_hide_raw_csv');
    this.show_hide_raw_csv.addEventListener('click', e => this.positionsUpdateCSVDisplay(1));
    this.show_hide_table_csv = this.positions_panel.querySelector('.positions_show_hide_table_csv');
    this.show_hide_table_csv.addEventListener('click', e => this.positionsUpdateCSVDisplay(2));
  }
  async positionsFetchRefresh() {
    this.productPositionUpdateProductType();

    this.productDataResults = await this.loadProjectProducts();
    if (!this.productDataResults)
      return;
    this.productData = this.productDataResults.productData;

    let basketListHTML = '';
    if (this.productData.displayBlocks)
      for (let c = 0, l = this.productData.displayBlocks.length; c < l; c++)
        basketListHTML += `<option>${this.productData.displayBlocks[c]}</option>`;
    document.getElementById('blocklist').innerHTML = basketListHTML;

    let positionInfo = this.productData.positionInfo;
    this.positionFrags = [];
    if (positionInfo && positionInfo.genericBlockData) {
      let arr = positionInfo.genericBlockData.split('|');
      let positionHTML = '<option></option>';

      for (let c = 0, l = arr.length; c < l - 5; c += 6) {
        let frag = arr[c] + ',' + arr[c + 1] + ',' + arr[c + 2] + ',' + arr[c + 3] + ',' + arr[c + 4] + ',' + arr[c + 5];
        this.positionFrags.push(frag);
        positionHTML += `<option value="${frag}">${(c / 6) + 1} ${frag}</option>`;
      }

      this.product_preset_positions_list.innerHTML = positionHTML;
      this.product_preset_positions_list.addEventListener('input', e => {
        let vals = this.product_preset_positions_list.value.split(',');

        if (vals.length === 6) {
          let xd = this.record_field_list_form.querySelector('.xedit');
          let yd = this.record_field_list_form.querySelector('.yedit');
          let zd = this.record_field_list_form.querySelector('.zedit');
          let rxd = this.record_field_list_form.querySelector('.rxedit');
          let ryd = this.record_field_list_form.querySelector('.ryedit');
          let rzd = this.record_field_list_form.querySelector('.rzedit');

          xd.value = vals[0];
          yd.value = vals[1];
          zd.value = vals[2];
          rxd.value = vals[3];
          ryd.value = vals[4];
          rzd.value = vals[5];
        }

        this.positionUpdateCSV()

      });
    }

    this.record_field_list_form.querySelectorAll('.position_products_table input[type="text"]')
      .forEach(i => i.addEventListener('input', e => this.positionUpdateCSV()));

    this.positionUpdateCSV();
  }
  updateFontField(textDom) {
    textDom.style.fontFamily = textDom.value;
  }
  positionsAdvanceNextItem(e) {
    let fields = this.record_field_list_form.querySelectorAll('.position_products_table input[type="text"]');

    for (let c = 0, l = fields.length; c < l; c++) {
      let field = fields[c].dataset.field;
      if (['asset', 'displaystyle', 'textfontfamily'].indexOf(field) !== -1) {

      } else if (field !== 'index')
        fields[c].value = '';
      else {
        let num = GLOBALUTIL.getNumberOrDefault(fields[c].value, 0);
        if (num === 100)
          this.copy_csv_header_clipboard.checked = false;
        num += 100;
        fields[c].value = num;
      }

      if (field === 'block')
        fields[c].focus();
    }

    if (this.signImagePreview)
      this.signImagePreview.removeAttribute('src');

    this.positionUpdateCSV();
    e.preventDefault();
    return true;
  }
  productPositionUpdateImagePreview() {
    let url = this.uploadImageEditField.value;
    if (url.substring(0, 3) === 'sb:')
      url = this.macro.cdnPrefix + 'textures/' + url.substring(3);

    this.signImagePreview.setAttribute('src', url);
  }
  async productPositionUploadImageFile() {
    let filename = this.uploadImageFile.files[0].name;

    let url = "https://us-central1-" + this.defaultServerTarget;
    url += '.cloudfunctions.net/fileupload?name=' + encodeURIComponent(this.defaultProjectTarget);
    url += '&token=' + encodeURIComponent(this.defaultToken);
    url += '&filename=' + encodeURIComponent(filename);

    let body = new FormData();
    body.append('file', this.uploadImageFile.files[0]);

    this.upload_file_cloud.classList.add('green');
    let genResponse = await fetch(url, {
      method: "post",
      body
    });
    let genResults = await genResponse.text();
    let r = {
      result_msg: 'unknown'
    };
    try {
      r = JSON.parse(genResults);
    } catch (e) {
      console.log(e, genResults);
    }

    if (r.success)
      if (r.result_msg.success) {
        this.uploadImageEditField.value = r.result_msg.signed_url;
        this.productPositionUpdateImagePreview();
        this.positionUpdateCSV();
        this.uploadImageFile.value = '';
        this.upload_file_cloud.classList.remove('green');
        return r;
      }
    this.uploadImageEditField.value = '';
    this.uploadImageFile.value = '';
    this.productPositionUpdateImagePreview();
    this.positionUpdateCSV();

    this.upload_file_cloud.classList.add('red');

    alert('upload did not complete');
    return r;
  }
  productPositionUpdateProductType() {
    let category = this.assetEditField.value;

    let rows = this.position_products_table.querySelectorAll('tr');

    rows.forEach(row => {
      let cats = row.dataset.cats;
      if (!cats)
        cats = '';
      cats = cats.split(',');
      if (cats.indexOf(category) === -1 && cats[0] !== 'all')
        row.style.display = 'none';
      else
        row.style.display = '';
    });
  }
  productPositionUpdateTypeFields() {
    let blockTitle = this.blockEditField.value;
    let productInfo = null;
    if (this.productData && this.productData.rawDisplayBlocksData) {
      this.productData.rawDisplayBlocksData.records.forEach(r => {
        if (r.title === blockTitle)
          productInfo = r;
      })
    }

    if (productInfo) {
      this.record_field_list_form.querySelector('.nameedit').value = productInfo.origRow.productname;
      this.record_field_list_form.querySelector('.skuedit').value = productInfo.origRow.productname;
      this.record_field_list_form.querySelector('.text1edit').value = productInfo.origRow.productname;
      if (productInfo.origRow.producttext2)
        this.record_field_list_form.querySelector('.text2edit').value = productInfo.origRow.producttext2;
      this.record_field_list_form.querySelector('.pricetextedit').value = productInfo.origRow.productpricetext;
      this.record_field_list_form.querySelector('.imageedit').value = productInfo.origRow.productimage;
      this.record_field_list_form.querySelector('.priceedit').value = productInfo.origRow.productprice;
      this.productPositionUpdateImagePreview();
    }
    this.positionUpdateCSV();
  }
  positionsUpdateCSVDisplay(btnIndex) {
    this.csv_import_preview.style.display = 'none';
    this.show_hide_raw_csv.style.background = '';
    this.show_hide_raw_csv.style.color = '';
    this.show_hide_table_csv.style.background = '';
    this.show_hide_table_csv.style.color = '';

    if (this.csv_import_shown === btnIndex) {
      this.csv_import_shown = 0;
    } else if (btnIndex === 1) {
      this.csv_import_shown = btnIndex;
      this.csv_import_preview.style.display = 'block';
      this.show_hide_raw_csv.style.background = 'rgb(100,100,100)';
      this.show_hide_raw_csv.style.color = 'white';
      this.csv_import_preview.innerHTML = this.csvImportPreviewRaw;
    } else if (btnIndex === 2) {
      this.csv_import_shown = btnIndex;
      this.csv_import_preview.style.display = 'block';
      this.show_hide_table_csv.style.background = 'rgb(100,100,100)';
      this.show_hide_table_csv.style.color = 'white';

      let headers = this.copy_csv_header_clipboard.checked;
      let html = cMacro._dataRowsToTableHTML([this.export_csv], [], headers);

      this.csv_import_preview.innerHTML = html;
    }
  }
  positionUpdateCSV() {
    let category = this.assetEditField.value;
    let csv_row = {
      asset: category
    };

    let t_rows = this.record_field_list_form.querySelectorAll('.position_products_table input[type="text"]');
    let all_fields = [];
    t_rows.forEach(f => {
      if (all_fields.indexOf(f.dataset.field) === -1)
        all_fields.push(f.dataset.field);
      csv_row[f.dataset.field] = '';
    });

    let tr_rows = this.record_field_list_form.querySelectorAll('.position_products_table tr');
    tr_rows.forEach(row => {
      let cats = row.dataset.cats;
      if (!cats)
        cats = '';
      cats = cats.split(',');
      if (cats.indexOf(category) !== -1 || cats[0] === 'all') {
        let fds = row.querySelectorAll('input[type="text"]');
        fds.forEach(i => {
          csv_row[i.dataset.field] = i.value;
        });
      }
    });

    let r = csv_row;
    let header = this.copy_csv_header_clipboard.checked;
    this.export_csv = r;
    if (r) {
      if (window.Papa) {
        this.csvImportPreviewRaw = Papa.unparse([r], {
          header
        });
        this.csv_import_preview.innerHTML = this.csvImportPreviewRaw;
        if (this.csv_import_shown === 2) {
          this.csv_import_shown = 0;
          this.positionsUpdateCSVDisplay(2);
        }
      }
    } else
      this.csv_import_preview.innerHTML = new Date();
  }

  async projectsAddSheetToProject() {
    let name = this.new_sheet_add_name.value;

    if (!name) {
      alert('Sheet name required')
      return;
    }

    await this.initSheetBasedData();

    this.setBusy();
    await this.sheetsStoreCSVValue(name, 1, 'New Sheet', 'Empty');

    let addToType = this.new_sheet_add_to_options.value;
    if (addToType) {
      if (addToType !== "New Project") {
        if (this.project_deploy_select.selectedIndex < 0) {
          alert('Project must be selected');
          return;
        }

        let selectedProject = this.project_deploy_select.value;
        let assets = '';
        let data = this.publishList[this.project_deploy_select.selectedIndex];
        assets = data[addToType];
        if (assets !== '')
          assets += ' & "," & ';
        else
          assets += '=';
        assets += 'getDataRangesForSheet(\"' + name + "\")";
        this.setBusy();

        await this.sheetsSetAssetsForProject(name, selectedProject, addToType);
      } else {
        this.setBusy();
        this.project_deploy_select.value = '';
        await this.sheetsAddToProjectList(name);
        this.setBusy();
        await this.sheetsStoreSelectedProject(name);
      }

      await this.initSheetBasedData();
    }
    this.clearBusy();
  }
  projectsUpdateSheetAddView() {
    this.project_addsheet_preview_data.innerHTML = '';

    if (this.project_deploy_select.selectedIndex < 0)
      return;

    let selectedProject = this.project_deploy_select.value;
    let defaultProject = this.defaultProjectTarget;
    let rowData = this.publishList[this.project_deploy_select.selectedIndex];

    let html = '';
    html += 'Selected: <b>' + selectedProject + '</b><br>';
    html += 'Asset Formula: ' + rowData.formulaRow['Asset Ranges'] + '<br>';
    html += 'Values: ' + rowData['Asset Ranges'] + '<br>';
    html += 'Circuit Formula: ' + rowData.formulaRow['Circuit Ranges'] + '<br>';
    html += 'Values: ' + rowData['Circuit Ranges'] + '<br>';
    html += 'Catalog Formula: ' + rowData.formulaRow['Catalog Ranges'] + '<br>';
    html += 'Values: ' + rowData['Catalog Ranges'] + '<br>';
    this.project_addsheet_preview_data.innerHTML = html;
  }
  getDialogTemplate() {
    return `  <div class="body_flex_wrapper">
        <div class="logo_container"></div>
        <div class="target_header">
          <select id="addon_display_view_select">
            <option value="cloud_target">Configuration</option>
            <option value="cloud_deploy" selected>Projects</option>
            <option value="template_view">Templates</option>
            <option value="block_wizards">Wizards</option>
            <option value="position_products">Positioning</option>
            <option value="position_plotter_div">Plotter</option>
            <option value="song_import_div">Audio</option>
          </select>
          <div style="padding-top:0px;padding-right:4px;">
            <button id="view_current_project_btn" style="margin-right:0"><i class="material-icons">animation</i></button>
            <button id="display_current_project_btn" style="margin-left:4px;margin-right:0"><i class="material-icons">web</i></button>
            <button id="display_publish_single_header" style="margin-left:4px;margin-right:4px;"><i class="material-icons">publish</i></button>
          </div>
          <div style="clear:both;"></div>
        </div>
        <div id="addon_header_line_2">
          <div style="display:flex;flex-direction:row">
            <div class="target_wrapper_div">
              <span id="selected_target_span" class="project_name_span">Loading</span>
              <br>
              <span id="selected_project_span" class="project_name_span">Loading</span>
            </div>
            <div id="header_bar_wrapper_panel">
              <button id="asset_current_project_btn" style="margin-left:0px;margin-right:0px"><i class="material-icons">grid_4x4</i></button>
              <button id="show_help_panel_btn" style="margin-left:4px;margin-right:4px;"><i class="material-icons">help</i></button>
              <button id="helper_viewer_contents_btn" style="margin-right:4px;"><i class="material-icons">manage_search</i></button>
              <button id="reload_addon"><i class="material-icons">refresh</i></button>
            </div>
          </div>
        </div>
        <div id="help_and_details_wrapper_for_split">
          <div id="help_viewer_panel" style="display:none;flex:.7;">
            <div style="display:flex;flex-direction:row;">
              <select id="help_viewer_panel_select"></select>
            </div>
            <div id="help_new_window_link_div">
              <button id="help_back_button"><i class="material-icons">keyboard_arrow_left</i></button>
              <div style="flex:1;overflow:hidden;">
                <a id="help_new_window_link" href="https://handtop.com" target="_blank">handtop.com</a>
              </div>
              <div id="helper_viewer_panel_open_wrapper" style="display:flex;flex-direction:row;flex:0">
                <button id="help_forward_button"><i class="material-icons">keyboard_arrow_right</i></button>
                <button id="helper_viewer_panel_open_deployed_btn" style="margin-left:8px;margin-right:4px;"><i class="material-icons">animation</i></button>
                <button id="helper_viewer_panel_open_video_btn" style="margin-left:4px;"><i class="material-icons">ondemand_video</i></button>
              </div>
            </div>
            <div id="help_viewer_panel_internal"></div>
          </div>
          <div id="details_wrapper_for_split" style="flex:1;overflow:hidden;display:flex;flex-direction:column;">
            <div id="position_plotter_div" class="main_div_wrapper">
              <div id="plotter_wizard_details" style="overflow: hidden auto;margin: 0 8px 0px 8px;">
                <table class="wizard_field_container" style="flex:none;text-align:left;margin: 0 0px">
                  <tr>
                    <td>Plot Type</td>
                    <td>
                      <select id="plot_type_select" style="width:10em;margin-left:4px;">
                        <option value="bar_chart_plotter">Bar Chart</option>
                        <option selected value="radial_plotter">Radial</option>
                        <option value="path_frames_plotter">Path Frames</option>
                      </select>
                    </td>
                    <td></td>
                  </tr>
                  <tr data-cats="path_frames_plotter">
                    <td>Parent</td>
                    <td><input type="text" id="path_frames_parent" value="::scene::" list="blockdatatitlelookuplist" /></td>
                    <td></td>
                  </tr>
                  <tr data-cats="path_frames_plotter">
                    <td>Child Type</td>
                    <td><input type="text" id="path_frames_childtype" value="block" list="blockchildtypelist" /></td>
                    <td></td>
                  </tr>
                  <tr data-cats="path_frames_plotter">
                    <td>Child Name</td>
                    <td><input type="text" id="path_frames_childname" value="::scene::_basketcart" list="blockdatatitlelookuplist" /></td>
                    <td></td>
                  </tr>
                  <tr data-cats="path_frames_plotter">
                    <td>Rotation Time</td>
                    <td><input type="text" id="path_frames_rotation_time" value="500" /></td>
                    <td></td>
                  </tr>
                  <tr data-cats="path_frames_plotter">
                    <td>Easing</td>
                    <td><input type="text" id="path_frames_easing_option" value="" list="easinglookuplist" /></td>
                    <td></td>
                  </tr>
                  <tr data-cats="path_frames_plotter">
                    <td>Snappy Motion</td>
                    <td><input type="checkbox" id="path_frames_snappy_motion" style="width:3em;" /></td>
                    <td></td>
                  </tr>
                  <tr data-cats="path_frames_plotter">
                    <td colspan="3" style="text-align:left;">
                      <b>Point per line:</b> time,x,y,z,rx,ry,rz,sx,sy,sz,visibility<br>
                      <textarea id="path_frames_points" style="width:100%;height:10em;"></textarea>
                    </td>
                  </tr>
                  <tr data-cats="bar_chart_plotter">
                    <td># of series</td>
                    <td><input type="text" id="plotter_plots_count" value="2" /></td>
                    <td></td>
                  </tr>
                  <tr data-cats="bar_chart_plotter,radial_plotter">
                    <td>Points per series</td>
                    <td><input type="text" id="plotter_points_per_plot" value="20" /></td>
                    <td></td>
                  </tr>
                  <tr data-cats="bar_chart_plotter,radial_plotter">
                    <td>Width (x)</td>
                    <td><input type="text" id="plotter_plots_width" value="25" /></td>
                    <td></td>
                  </tr>
                  <tr data-cats="radial_plotter">
                    <td>End Width (x)</td>
                    <td><input type="text" id="plotter_plots_end_width" /></td>
                    <td></td>
                  </tr>
                  <tr data-cats="bar_chart_plotter,radial_plotter">
                    <td>Depth (z)</td>
                    <td><input type="text" id="plotter_plots_depth" value="10" /></td>
                    <td></td>
                  </tr>
                  <tr data-cats="radial_plotter">
                    <td>End Depth (z)</td>
                    <td><input type="text" id="plotter_plots_end_depth" /></td>
                    <td></td>
                  </tr>
                  <tr data-cats="radial_plotter">
                    <td>Height (y)</td>
                    <td><input type="text" id="plotter_plots_height" value="10" /></td>
                    <td></td>
                  </tr>
                  <tr data-cats="radial_plotter">
                    <td>Turns</td>
                    <td><input type="text" id="plotter_plots_turns" value="3" /></td>
                    <td></td>
                  </tr>
                  <tr data-cats="radial_plotter">
                    <td>Decay per turn (0 - 1)</td>
                    <td><input type="text" id="plotter_plots_decay_per_turn" value="" /></td>
                    <td></td>
                  </tr>
                  <tr data-cats="radial_plotter">
                    <td>Start Angle</td>
                    <td><input type="text" id="plotter_plots_offset_angle" /></td>
                    <td></td>
                  </tr>
                  <tr data-cats="radial_plotter">
                    <td>Item start angle</td>
                    <td><input type="text" id="plotter_plots_item_offset_angle" /></td>
                    <td></td>
                  </tr>
                </table>
              </div>
              <div id="plotter_output_split" style="overflow:auto;margin: 0 8px 8px 8px;">
                <table class="wizard_field_container plotter_output" style="margin:0 8px;">
                  <tr data-cats="bar_chart_plotter">
                    <td colspan="3" style="padding-bottom:4px;">
                      <button id="plotter_copy_csv_to_clipboard" style="float:left;"><i class="material-icons">content_copy</i></button>
                      <label><input type="checkbox" id="plotter_plots_includeheaders" checked /><span>headers</span></label>
                      <label><input type="checkbox" id="plotter_plots_includelabels" checked /><span>labels</span></label>
                    </td>
                  </tr>
                  <tr data-cats="radial_plotter">
                    <td colspan="3" style="padding-bottom:4px;">
                      <button id="plotter_radial_copy_csv_to_clipboard" style="float:left;"><i class="material-icons">content_copy</i></button>
                      <label><input type="checkbox" id="plotter_plots_radial_includeheaders" checked /><span>headers</span></label>
                      <label><input type="checkbox" id="plotter_plots_radial_includelabels" /><span>labels</span></label>
                      <label><input type="checkbox" id="plotter_plots_includeradians" /><span>radians</span></label>
                    </td>
                  </tr>
                  <tr data-cats="path_frames_plotter">
                    <td colspan="3" style="padding-bottom:4px;">
                      <button id="path_frames_copy_csv_to_clipboard" style="float:left;"><i class="material-icons">content_copy</i></button>
                      <label><input type="checkbox" id="path_frames_includeheaders" checked /><span>headers</span></label>
                    </td>
                  </tr>
                </table>
                <table id="plotter_output_table" style="width:100%" class="table_export"></table>
              </div>
            </div>
            <div id="cloud_target" class="main_div_wrapper">
              <div id="cloud_target_header_panel" style="padding: 0 8px 8px 8px">
                <table class="wizard_field_container top_view_table" style="flex:none;text-align:left;">
                  <tr>
                    <td>Target</td>
                    <td>
                      <input id="target_to_deploy" type="text" value="handtopbuilder" />
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>Token</td>
                    <td>
                      <input id="token_to_deploy" type="text" value="builder" />
                    </td>
                    <td>
                      <button id="target_server_set_button" class="">Set Server</button>
                    </td>
                  </tr>
                  <tr>
                    <td>Source</td>
                    <td>
                      <div id="assets_anchor" style="padding: 4px 6px;">loading...</div>
                    </td>
                    <td>
                      <div id="url_to_deploy" style="display:inline-block;"></div>
                    </td>
                </table>
              </div>
              <div style="flex:1;overflow:hidden;display:block;">
                <select id="deploy_options_server_list" style="width:calc(100% - 16px)" class="select_list" size="5"></select>
                <div id="selected_server_details_div" class="select_flex_view" style="flex:none;">
                </div>
              </div>
            </div>
            <div id="cloud_deploy" class="main_div_wrapper" style="display:flex">
              <select id="project_deploy_select" class="select_list" size="5"></select>
              <div id="project_detail_view_for_split" style="display:flex;overflow:hidden;flex-direction:column;">
                <div style="margin:4px 8px;text-align:left;">
                  <button id="project_set_default_btn" class="blue"><i class="material-icons">push_pin</i></button>
                  <button id="display_publish_single" style="margin-left:2px;"><i class="material-icons">upgrade</i></button>
                  <select id="project_selected_options" style="width:7em;margin:0 4px;">
                    <option data-view="project_deploy_view">Deploy</option>
                    <option data-view="project_display_view">View</option>
                    <option data-view="project_display_view">Display</option>
                    <option data-view="project_upload_view">Upload</option>
                    <option data-view="project_addsheet_view">Add Sheet</option>
                    <option>Open in /view</option>
                    <option>Open in /display</option>
                    <option>Open in /asset</option>
                  </select>
                  <select id="project_preview_zoom" style="display:none;">
                    <option>1x</option>
                    <option selected>1/2x</option>
                    <option>1/4x</option>
                  </select>
                  <span id="deploy_detail_buttons_view">
                    <button id="display_publish_list" style="margin:0 4px;"><i class="material-icons">publish</i> All</button>
                  </span>
                </div>
                <div class="select_flex_view" style="padding-top:4px;">
                  <div id="project_display_view" style="display:none;height:inherit;flex:1;margin: 0 8px 8px 8px;">
                    <iframe id="preview_panel"></iframe>
                  </div>
                  <div id="project_addsheet_view" style="display:none;flex-direction: column;flex:1;width: 100%;overflow:hidden;margin: 0;padding: 0 8px;line-height:2.5em;">
                    <div style="display:flex;flex-direction:row;">
                      <div>Sheet Name</div>
                      <input id="new_sheet_add_name" type="text" style="width:20px;flex:1;margin-top:4px;margin-left:8px;">
                    </div>
                    <div style="display:flex;flex-direction:row;">
                      <div>Add to </div>
                      <select id="new_sheet_add_to_options" style="margin:0 8px;flex: 1">
                        <option>New Project</option>
                        <option>Asset Ranges</option>
                        <option>Circuit Ranges</option>
                        <option>Catalog Ranges</option>
                        <option value="">None</option>
                      </select>
                      <button id="create_new_project_sheet_button" style="margin:0 8px 0 4px;"><i class="material-icons">add</i></button>
                    </div>
                    <div id="project_addsheet_preview_data" style="flex:1">
                    </div>
                  </div>
                  <div id="project_deploy_view" style="display:none;flex-direction: column;flex:1;padding:8px;padding-top:0;width: 100%;">
                    <div>
                    </div>
                    <textarea id="publish_results" style="flex:1;margin-top:0px;" spellcheck="false"></textarea>
                  </div>
                  <div id="project_upload_view" style="display:none;flex-direction: column;flex:1;width: 100%;overflow:hidden;">
                    <div style="display:flex;flex-direction:row;">
                      <input id="file_upload_name" type="text" style="width:20px;flex:1;margin-top:4px;margin-left:8px;">
                      <button id="upload_file_cloud" style="margin:0 8px 0 4px;"><i class="material-icons">cloud_upload</i></button>
                      <input type="file" id="upload_file_input" style="display:none;">
                      <select id="upload_file_preview_select" style="margin-right:8px;">
                        <option>Image</option>
                        <option>Audio</option>
                        <option>Mesh</option>
                      </select>
                    </div>
                    <div style="flex:1;overflow:hidden;padding:0 8px;align-items:center;justify-content:center;display:flex;" id="upload_file_img_preview">
                      <img id="img_preview" crossorigin="anonymous" style="max-width:100%;max-height:100%">
                    </div>
                    <div style="flex:1;overflow:hidden;display:none;" id="upload_file_audio_preview">
                      <audio id="upload_file_audio_ctl" controls style="width:calc(100% - 32px)"></audio>
                    </div>
                    <div style="flex:1;overflow:hidden;display:none;" id="upload_file_mesh_preview">
                      Preview not available in addon
                    </div>

                    <div id="image_preview_link_footer" style="display:flex;flex-direction:row;overflow:hidden;padding: 0px 8px 4px 8px;">
                      <button id="upload_copy_link_to_clipboard" style="margin-top:4px;"><i class="material-icons">content_copy</i></button>
                      <div style="flex:1;overflow: auto hidden;">
                        <a id="img_preview_link" style="white-space:nowrap;" target="_blank"></a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div id="template_view" class="main_div_wrapper">
              <div style="display:flex;flex-direction:row;padding: 0 8px;">
                <input id="sheetname" style="flex:1;">
                <button id="create_layout_btn" class="blue" style="margin-left:8px"><i class="material-icons">build</i> Create</button>
              </div>
              <div id="template_upper_split" style="display:flex;flex-direction:row;padding:8px;">
                <select id="template_filter_select" style="margin-right:8px;width:9em;">
                  <option>All</option>
                  <option>Setup</option>
                  <option selected>Layouts</option>
                  <option>Blocks</option>
                  <option>Other</option>
                </select>
                <div style="display:none;" id="publishlist_add_chk_wrapper">
                  <label style="flex:1;;"> <input type="checkbox" id="add_to_publishlist" checked><span>Projects</span></label>
                  <label style="flex:1;margin-left:4px;"> <input type="checkbox" id="set_to_defaultproject" checked><span>Default</span></label>
                </div>
                <div id="publishlist_asset_add_chk_wrapper" style="display:none;">
                  <label style="flex:1;"> <input type="checkbox" id="add_asset_to_projectlist" checked><span>Add for Project</span></label>
                </div>
                <div id="publishlist_products_add_chk_wrapper" style="display:none;">
                  <label style="flex:1;"> <input type="checkbox" id="add_products_to_projectlist" checked><span>Add for Project</span></label>
                </div>
              </div>
              <div style="flex:1;overflow:hidden;display:block;">
                <select id="circuit_template_select" class="select_list" size="5">
                </select>
                <div id="template_description_wrapper" style="overflow:hidden;padding:8px;">
                  <div id="template_description" style="overflow: hidden auto;height:100%;width:100%;"></div>
                </div>
              </div>
            </div>
            <div id="block_wizards" class="main_div_wrapper">
              <div id="block_wizard_select_wrapper" style="display:flex;flex-direction:row;padding:0 8px 8px 8px">
                <select id="wizard_choices" style="width:7em">
                  <option value="block">Block</option>
                  <option value="shape">Shape</option>
                  <option value="mesh">Mesh</option>
                  <option value="material">Material</option>
                  <option value="camera">Camera</option>
                  <option value="light">Light</option>
                  <option value="frame">Frame</option>
                </select>
              </div>
              <div id="macro_details_wrapper" style="flex:1;display:flex;flex-direction: column;" class="add_asset_template_panel">
              </div>
            </div>
            <div id="song_import_div" class="main_div_wrapper">
              <table class="wizard_field_container" style="padding: 0px 8px 0 8px">
                <tr>
                  <td colspan="2">WAV Audio File<br>
                    <input type="file" id="audio_file" style="width:90%" /></td>
                  <td></td>
                </tr>
                <tr>
                  <td>seconds to sample<br>(empty for length)</td>
                  <td><input id="seconds_to_sample" type="text" /></td>
                  <td></td>
                </tr>
                <tr>
                  <td>Frequency<br>(samples/sec)</td>
                  <td><input id="freq_samples_to_second" type="text" value="10" /></td>
                  <td></td>
                </tr>
                <tr>
                  <td># of result bands<br>(sample rate / #)</td>
                  <td> <select id="bands_to_combine">
                      <option value="1">256</option>
                      <option value="2">128</option>
                      <option value="4">64</option>
                      <option value="8">32</option>
                      <option value="16" selected>16</option>
                      <option value="32">8</option>
                    </select></td>
                  <td></td>
                </tr>
                <tr>
                  <td colspan="3"><audio id="audio" controls style="width:calc(100% - 16px)"></audio></td>
                </tr>
                <tr>
                  <td colspan="3">
                    <label><input id="song_detail_data_rdo" name="song_data_display" type="radio" checked> Details</label>
                    <label><input id="song_raw_data_rdo" name="song_data_display" type="radio"> Data</label>
                  </td>
                </tr>
              </table>
              <div id="song_len_sec" style="flex:1;margin:0 8px 8px 8px;overflow:hidden;overflow-y:auto;text-align:left;">
                No song file selected
              </div>
              <div id="song_raw_data" style="flex:1;margin:0 8px 8px 8px;overflow:hidden;overflow-y:auto;word-break:break-all;display:none;"></div>
              <div style="padding:4px;text-align:left;">
                <button id="copy_song_data_to_clipboard" style="margin-right:0;"><i class="material-icons">content_copy</i></button>
              </div>
            </div>
            <div id="position_products" class="main_div_wrapper" style="overflow:hidden;">
              <input type="file" class="productdescpathuploadfile" style="display:none;">
              <div class="position_products_fields" style="overflow:hidden auto;flex:1">
                <table class="wizard_field_container position_products_table" style="flex:none;text-align:left;margin: 0 0px">
                  <tr data-cats="all">
                    <td>index</td>
                    <td><input type="text" data-field="index" class="indexedit" value="100" /></td>
                    <td></td>
                  </tr>
                  <tr data-cats="all">
                    <td>asset</td>
                    <td><input type="text" data-field="asset" class="assetedit" value="" list="assetlist" /></td>
                    <td></td>
                  </tr>
                  <tr data-cats="product">
                    <td>block (display)</td>
                    <td><input type="text" data-field="block" class="blockedit" value="" list="blocklist" /></td>
                    <td></td>
                  </tr>
                  <tr data-cats="all">
                    <td>name</td>
                    <td><input type="text" data-field="name" class="nameedit" value="" /></td>
                    <td></td>
                  </tr>
                  <tr data-cats="all">
                    <td>Preset Positions</td>
                    <td colspan="2">
                      <select id="product_preset_positions_list" style="width:90%;margin-left:4px;"></select>
                    </td>
                  </tr>
                  <tr data-cats="all">
                    <td colspan="3">
                      <div style="display:flex;flex-direction:row">
                        <span style="width:8.5em">Position X</span><input type="text" data-field="x" class="xedit" />
                        <span>Y</span><input type="text" class="yedit" data-field="y" />
                        <span>Z</span><input type="text" class="zedit" data-field="z" />
                      </div>
                    </td>
                  </tr>
                  <tr data-cats="all">
                    <td colspan="3">
                      <div style="display:flex;flex-direction:row">
                        <span style="width:8.5em">Rotate X</span><input type="text" class="rxedit" data-field="rx" />
                        <span>Y</span><input type="text" class="ryedit" data-field="ry" />
                        <span>Z</span><input type="text" class="rzedit" data-field="rz" />
                      </div>
                    </td>
                  </tr>
                  <tr data-cats="all">
                    <td>text1</td>
                    <td><input type="text" data-field="text1" class="text1edit" value="" /></td>
                    <td></td>
                  </tr>
                  <tr data-cats="message">
                    <td>text2</td>
                    <td><input type="text" data-field="text2" class="text2edit" value="" /></td>
                    <td></td>
                  </tr>
                  <tr data-cats="product">
                    <td>image</td>
                    <td><input type="text" data-field="image" class="imageedit" value="" /></td>
                    <td><button class="texturepathupload product_image_upload_btn"><i class="material-icons">cloud_upload</i></button></td>
                  </tr>
                  <tr data-cats="product">
                    <td colspan="3">
                      <img class="product_image_img" crossorigin="anonymous" />
                    </td>
                  </tr>
                  <tr data-cats="product">
                    <td>sku</td>
                    <td><input type="text" data-field="sku" class="skuedit" value="" /></td>
                    <td></td>
                  </tr>
                  <tr data-cats="product">
                    <td>price</td>
                    <td><input type="text" data-field="price" class="priceedit" value="" /></td>
                    <td></td>
                  </tr>
                  <tr data-cats="product">
                    <td>pricetext</td>
                    <td><input type="text" data-field="pricetext" class="pricetextedit" value="" /></td>
                    <td></td>
                  </tr>
                  <tr data-cats="message">
                    <td>height</td>
                    <td><input type="text" data-field="height" class="heightedit" value="" /></td>
                    <td></td>
                  </tr>
                  <tr data-cats="message">
                    <td>width</td>
                    <td><input type="text" data-field="width" class="widthedit" value="" /></td>
                    <td></td>
                  </tr>
                  <tr data-cats="all">
                    <td>displaystyle</td>
                    <td><input type="text" data-field="displaystyle" class="displaystyleedit" list="displaystylelist" value="" /></td>
                    <td></td>
                  </tr>
                  <tr data-cats="all">
                    <td>textfontfamily</td>
                    <td><input type="text" data-field="textfontfamily" class="textfontfamilyedit" list="fontfamilydatalist" value="" /></td>
                    <td></td>
                  </tr>
                  <tr data-cats="message">
                    <td>materialname</td>
                    <td><input type="text" data-field="materialname" class="materialnameedit" value="" /></td>
                    <td></td>
                  </tr>
                </table>
              </div>
              <div class="copy_clipboard_footer">
                <button class="positions_copy_csv_to_clipboard" style="flex:0"><i class="material-icons">content_copy</i></button>
                <button class="positions_show_hide_raw_csv" style="flex:0;margin-left:0"><i class="material-icons">view_stream</i></button>
                <button class="positions_show_hide_table_csv" style="flex:0;margin-left:0"><i class="material-icons">view_module</i></button>
                <label><input type="checkbox" checked class="positions_copy_csv_header_clipboard"><span> headers</span></label>
                <br>
                <div class="csv_import_preview"></div>
              </div>
            </div>
          </div>
        </div>
        <datalist id="blockdatatitlelookuplist">
          <option>::scene::</option>
          <option>::scene::_fixturesWrapper</option>
          <option>::scene::_basketcart</option>
          <option>::scene::_chatWrapper</option>
          <option>::scene::_productsWrapper</option>
        </datalist>
        <datalist id="easinglookuplist">
          <option>eo</option>
          <option>ei</option>
          <option>eio</option>
        </datalist>
        <datalist id="blocklist"></datalist>
        <datalist id="assetlist">
          <option>product</option>
          <option>message</option>
        </datalist>
        <datalist id="displaystylelist">
          <option>regular</option>
          <option>3dbasic</option>
          <option>3dmin</option>
        </datalist>
      </div>


      <style>
        .item_holder {
          position: relative;
        }

        .basic_item {
          border-radius: 50%;
          width: 100px;
          height: 40px;
          position: absolute;
          top: 0;
          left: 0;
          color: white;
          font-weight: bold;
          text-align: center;
        }

        body {
          text-align: center;
        }

        .item_holder {
          position: relative;
        }

        .basic_item {
          border-radius: 50%;
          width: 100px;
          height: 40px;
          position: absolute;
          top: 0;
          left: 0;
          color: white;
          font-weight: bold;
          text-align: center;
        }

        select {
          padding-right: 1em;
          padding-left: .5em;
        }

        #preview_panel {
          width: 200%;
          height: 200%;
          transform: scale(.5);
          padding: 0;
          margin: 0;
          position: relative;
          top: -50%;
          left: -50%;
          border: none;
        }

        .csv_import_preview {
          width: inherit;
          overflow: hidden;
          overflow-x: scroll;
        }

        .add_asset_template_panel input {
          margin: 0;
        }

        select.select_list {
          text-align: left;
          margin: 0 8px;
          flex: 1;
          min-height: 3em;
        }

        .select_flex_view {
          flex: 2;
          overflow: hidden;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        select.select_list option {
          padding: 4px;
          font-size: 13px;
        }

        .main_div_wrapper {
          display: none;
          flex: 1;
          overflow: hidden;
          overflow-y: auto;
          flex-direction: column;
        }

        .target_header {
          width: 100%;
          flex: 0;
          display: flex;
          padding-bottom: 6px;
          padding-top: 6px;
          padding-left: 6px;
        }

        .logo_container {
          background-image: url(https://handtop.com/images/logo64.png);
          width: 24px;
          background-repeat: no-repeat;
          background-size: contain;
          position: absolute;
          height: 24px;
          z-index: -1;
          top: 9px;
          left: 6px;
        }

        .project_name_span {
          white-space: nowrap;
          color: blue;
          font-size: 10px;
        }

        #selected_target_span {
          text-align: left;
          color: green;
          font-size: 10px;
        }

        .target_wrapper_div {
          text-align: left;
          overflow: hidden;
          flex: 1;
          padding-left: 6px;
          line-height: 1.1em;
          margin-bottom: -10px;
          margin-top: -1px;
        }

        * {
          font-size: 13px;
        }

        select,
        select option {
          font-size: 13px;
          border-radius: 0;
        }

        button {
          font-size: 12px;
        }

        .body_flex_wrapper {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        #addon_display_view_select {
          flex: 1;
          margin-left: 28px;
          margin-right: 6px;
        }

        #project_display_view {
          overflow: hidden;
        }

        button i.material-icons {
          font-size: 1.5em;
          top: .25em;
        }

        #help_viewer_panel_select {
          flex: 1;
          color: white;
          border-color: white;
          background-image: url(https://ssl.gstatic.com/ui/v1/disclosure/grey-disclosure-arrow-up-down.png), -webkit-linear-gradient(top, rgb(100, 200, 255), rgb(100, 200, 255));
          background-image: url(https://ssl.gstatic.com/ui/v1/disclosure/grey-disclosure-arrow-up-down.png), linear-gradient(top, rgb(100, 200, 255), rgb(100, 200, 255));
        }

        #help_viewer_panel_select option {
          color: black;
        }

        #helper_viewer_panel_open_wrapper {}

        #help_viewer_panel {
          padding: 0;
          border: solid 8px rgb(100, 200, 255);
          border-top: none;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border-bottom: none;
        }

        #help_viewer_panel_internal {
          flex: 1;
          overflow: auto auto;
          text-align: left;
          padding: 4px;
        }

        #help_viewer_panel_internal img {
          max-width: 85vw;
          max-height: 90vh;
        }

        input[type="color"] {
          width: 35px;
          height: 28px;
          margin: 0 .1em;
        }

        input[type="checkbox"] {
          width: 1.5em;
          height: 1.5em;
          margin-bottom: -5px;
        }

        input[type="checkbox"]:checked:after {
          top: -2px;
          left: -2px;
        }

        .plot_display_view {
          display: none;
        }

        .gutter.gutter-vertical {
          background-image: linear-gradient(rgb(100, 200, 255), rgb(100, 200, 255), white, rgb(100, 200, 255),
              rgb(100, 200, 255));
          background-repeat: no-repeat;
          background-position: center;
          background-color: rgb(100, 200, 255);
          background-size: 50px 100%;
        }

        #cloud_target .gutter.gutter-vertical,
        #cloud_deploy .gutter.gutter-vertical,
        #template_view .gutter.gutter-vertical,
        #position_plotter_div .gutter.gutter-vertical {
          background-image: linear-gradient(white, white, silver, white,
              white);
          background-color: white;
          margin: 0 8px;
        }

        #circuit_template_select {
          width: calc(100% - 16px)
        }

        .rotate_busy i {
          animation: spin_rotate_busy 2s linear infinite;
        }

        @keyframes spin_rotate_busy {
          100% {
            transform: rotate(360deg);
          }
        }

        button.busy_deploy {
          background: rgb(150, 220, 150);
          overflow: hidden;
        }

        .busy_deploy i {
          animation: spin_deploy_busy 2s linear infinite;
        }

        @keyframes spin_deploy_busy {
          0% {
            transform: translateY(0%);
          }

          25% {
            transform: translateY(-100%);
          }

          25.001% {
            transform: translateY(100%);
          }

          75% {
            transform: translateY(-100%);
          }

          75.001% {
            transform: translateY(100%);
          }

          100% {
            transform: translateY(0%)
          }
        }

        button.create_layout_spin {
          background: rgb(150, 220, 150);
        }

        .create_layout_spin i {
          animation: spin_build_wrench 1s ease-in-out infinite;
          transform-origin: 20% 20%;
        }

        @keyframes spin_build_wrench {
          0% {
            transform: rotate(0);
          }

          50% {
            transform: rotate(90deg);
          }

          100% {
            transform: rotate(0);
          }
        }



        #position_plotter_div table.wizard_field_container label span {
          top: -.75em;
          margin-left: 2px;
          position: relative;
          font-size: .8em;
        }

        #position_plotter_div input {
          margin-left: 4px;
        }

        table.wizard_field_container.top_view_table tr td:nth-child(1) {
          width: 4.5em;
          min-width: initial;
        }

        table.wizard_field_container.top_view_table tr td:nth-child(3) {
          min-width: initial;
        }

        table.wizard_field_container td:nth-child(2) input {
          width: 100%;
          text-align: left;
        }

        #template_upper_split span {
          font-size: .8em;
        }

        #help_and_details_wrapper_for_split {
          flex: 1;
          display: flex;
          overflow: hidden;
          flex-direction: column;
        }

        table.position_products_table tr td:nth-child(1) {
          padding: 0;
          padding-right: 4px;
        }

        table.position_products_table td span {
          padding-top: 8px;
          margin: 0 0px;
          padding-left: 4px;
        }

        input.gsc-input {
          font-size: 16px;
          padding: 5px !important;
        }

        div .gsst_b {
          padding: 0;
        }

        td.gsc-search-button,
        td.gsc-clear-button,
        td.gsc-input {
          padding: 0;
        }

        table.gsc-search-box td {
          padding: 0;
        }

        form.gsc-search-box {
          padding: 0;
          margin: 0;
        }

        table.gsc-search-box {
          padding: 0;
          margin: 0;
        }

        table.gsc-search-box td.gsc-input {
          padding-right: 8px;
          padding-left: 8px;
        }

        .gsc-search-button-v2 {
          padding: 6px 8px;
          margin-right: 8px;
        }

        #helper_viewer_panel_open_wrapper button,
        #header_bar_wrapper_panel button {
          margin: 0;
        }

        #addon_header_line_2 {
          display: block;
          flex: 0;
          text-align: left;
          padding-right: 8px;
          border-bottom: solid 8px white;
        }

        #help_new_window_link_div {
          text-align: left;
          overflow: hidden;
          padding: 4px 0;
          background: rgb(100, 200, 255);
          display: flex;
          flex-direction: row;
          margin-left: -2px;
        }

        #help_new_window_link_div a {
          text-align: left;
          text-decoration: underline;
          color: white;
        }

        #help_new_window_link {
          position: relative;
          top: 5px;
          left: 2px;
          white-space: nowrap;
        }

        #help_back_button i,
        #help_forward_button i {
          margin: 0 -6px;
        }

        #project_addsheet_preview_data {
          flex: 1;
          text-align: left;
          overflow: auto;
          line-height: 1.25em;
          white-space: nowrap;
        }
      </style>`;
  }
}
