class cGenerate {
  constructor(domPanel, subKey, bView) {
    this.domPanel = domPanel;
    this.bView = bView;

    this.domPanel.innerHTML = this.template();
    this.register();
    let html = '';
    if (this.bView.workplacesSelect)
      html = this.bView.workplacesSelect.innerHTML;
    this.csvGenerateRefreshProjectLists(html);
  }
  template() {
    return `<div class="cgenerate_panel_wrapper">
    <b>Last Generated Animation</b>
    &nbsp;
    <span class="generated csv_data_date_span"></span>
    <br>
    <button class="add_animation_asset_download_btn btn-sb-icon"><i class="material-icons">file_download</i></button>
    <button class="add_animation_asset_upload_btn btn-sb-icon"><i class="material-icons">cloud_upload</i></button>
    <b>Asset CSV Data</b>
    <input type="file" class="add_animation_asset_download_file" style="display:none">
    <span class="asset csv_data_date_span"></span>
    <br>
    <button class="add_animation_scene_download_btn btn-sb-icon"><i class="material-icons">file_download</i></button>
    <button class="add_animation_scene_upload_btn btn-sb-icon"><i class="material-icons">cloud_upload</i></button>
    <b>Layout CSV Data</b>
    <input type="file" class="add_animation_scene_download_file" style="display:none">
    <span class="layout csv_data_date_span"></span>
    <br>
    <button class="add_animation_product_download_btn btn-sb-icon"><i class="material-icons">file_download</i></button>
    <button class="add_animation_product_upload_btn btn-sb-icon"><i class="material-icons">cloud_upload</i></button>
    <b>Products CSV Data</b>
    <input type="file" class="add_animation_product_download_file" style="display:none">
    <span class="product csv_data_date_span"></span>
    <br>
    <button class="generate_animation_workspace_button" style="float:right;">Generate</button>
    <label style="float:right;"><input type="checkbox" checked  class="generate_clear_wrkspace" /> Clear Workspace &nbsp;</label>
    <div class="workspace-csv-panel-item" style="clear:both;">
      <select class="add_animation_asset_choice">
        <option>Assets CSV Data</option>
        <option>Workspace Assets</option>
        <option>Template Assets</option>
        <option>No Assets</option>
      </select>
      <select class="add_animation_asset_animation" style="display:none;"></select>
      <select class="add_animation_asset_template" style="display:none;">
        <option>select template</option>
      </select>
      <span class="asset_workspace csv_data_date_span"></span>
    </div>
    <div class="workspace-csv-panel-item">
      <select class="add_animation_scene_choice">
        <option>Layout CSV Data</option>
        <option>Workspace Layout</option>
        <option>Template Layout</option>
        <option>No Layout</option>
      </select>
      <select class="add_animation_scene_animation" style="display:none;"></select>
      <select class="add_animation_scene_template" style="display:none;">
        <option>select template</option>
      </select>
      <span class="scene_workspace csv_data_date_span"></span>
    </div>
    <div class="workspace-csv-panel-item">
      <select class="add_animation_product_choice">
        <option>Products CSV Data</option>
        <option>Workspace Products</option>
        <option>Template Products</option>
        <option>No Products</option>
      </select>
      <select class="add_animation_product_animation" style="display:none;"></select>
      <select class="add_animation_product_template" style="display:none;">
        <option>select template</option>
      </select>
      <span class="product_workspace csv_data_date_span"></span>
    </div>
    <button class="generate_new_animation_workspace_button" style="float:right;">Generate New</button>
    <input class="generate_animation_new_wrk_name" type="text" style="float:right;" />
    </div>`;
  }
  async register() {
    this.templates = {
      "assetTemplates": {
        "All Assets": "asset.csv"
      },
      "sceneTemplates": {
        "Produce": "layout.csv"
      },
      "productTemplates": {
        "Produce Sales Week 1": "product.csv"
      }
    };

    this.add_animation_asset_animation = this.domPanel.querySelector('.add_animation_asset_animation');
    this.add_animation_asset_template = this.domPanel.querySelector('.add_animation_asset_template');
    this.add_animation_asset_choice = this.domPanel.querySelector('.add_animation_asset_choice');
    this.add_animation_asset_download_btn = this.domPanel.querySelector('.add_animation_asset_download_btn');
    this.import_asset_templates_select = this.domPanel.querySelector('.import_asset_templates_select');
    this.add_animation_asset_upload_btn = this.domPanel.querySelector('.add_animation_asset_upload_btn');
    this.add_animation_asset_download_file = this.domPanel.querySelector('.add_animation_asset_download_file');
    this.add_animation_asset_upload_btn.addEventListener('click', e => this.add_animation_asset_download_file.click());
    this.add_animation_asset_download_file.addEventListener('change', e => this.csvGenerateUploadCSV('asset'));
    this.add_animation_asset_download_btn.addEventListener('click', e => this.csvGenerateDownloadCSV('asset'));

    this.add_animation_scene_animation = this.domPanel.querySelector('.add_animation_scene_animation');
    this.add_animation_scene_template = this.domPanel.querySelector('.add_animation_scene_template');
    this.add_animation_scene_choice = this.domPanel.querySelector('.add_animation_scene_choice');
    this.add_animation_scene_download_btn = this.domPanel.querySelector('.add_animation_scene_download_btn');
    this.add_animation_scene_upload_btn = this.domPanel.querySelector('.add_animation_scene_upload_btn');
    this.import_scene_templates_select = this.domPanel.querySelector('.import_scene_templates_select');
    this.add_animation_scene_download_file = this.domPanel.querySelector('.add_animation_scene_download_file');
    this.add_animation_scene_upload_btn.addEventListener('click', e => this.add_animation_scene_download_file.click());
    this.add_animation_scene_download_file.addEventListener('change', e => this.csvGenerateUploadCSV('scene'));
    this.add_animation_scene_download_btn.addEventListener('click', e => this.csvGenerateDownloadCSV('scene'));

    this.add_animation_product_animation = this.domPanel.querySelector('.add_animation_product_animation');
    this.add_animation_product_template = this.domPanel.querySelector('.add_animation_product_template');
    this.add_animation_product_choice = this.domPanel.querySelector('.add_animation_product_choice');
    this.add_animation_product_download_btn = this.domPanel.querySelector('.add_animation_product_download_btn');
    this.add_animation_product_upload_btn = this.domPanel.querySelector('.add_animation_product_upload_btn');
    this.import_product_templates_select = this.domPanel.querySelector('.import_product_templates_select');
    this.add_animation_product_download_file = this.domPanel.querySelector('.add_animation_product_download_file');
    this.add_animation_product_upload_btn.addEventListener('click', e => this.add_animation_product_download_file.click());
    this.add_animation_product_download_file.addEventListener('change', e => this.csvGenerateUploadCSV('product'));
    this.add_animation_product_download_btn.addEventListener('click', e => this.csvGenerateDownloadCSV('product'));

    this.add_animation_asset_choice.addEventListener('input', e => this.csvGenerateTemplate('asset'));
    this.add_animation_scene_choice.addEventListener('input', e => this.csvGenerateTemplate('scene'));
    this.add_animation_product_choice.addEventListener('input', e => this.csvGenerateTemplate('product'));

    this.import_asset_workspaces_select = this.domPanel.querySelector('.import_asset_workspaces_select');
    this.import_scene_workspaces_select = this.domPanel.querySelector('.import_scene_workspaces_select');
    this.import_product_workspaces_select = this.domPanel.querySelector('.import_product_workspaces_select');

    this.generate_animation_workspace_button = this.domPanel.querySelector('.generate_animation_workspace_button');
    this.generate_animation_workspace_button.addEventListener('click', e => this.csvGenerateAnimation());
    this.csvGenerateInitLists();

    gAPPP.updateGenerateDataTimes()
      .then(() => {
        this.domPanel.querySelector('.asset.csv_data_date_span').innerHTML = gAPPP.assetRowsDateDisplay;
        this.domPanel.querySelector('.layout.csv_data_date_span').innerHTML = gAPPP.sceneRowsDateDisplay;
        this.domPanel.querySelector('.product.csv_data_date_span').innerHTML = gAPPP.productRowsDateDisplay;
        this.domPanel.querySelector('.generated.csv_data_date_span').innerHTML = gAPPP.animationGeneratedDateDisplay;
      });

    return Promise.resolve();
  }
  async csvGenerateInitLists() {
    function __loadList(sel, list, htmlPrefix = '') {
      let html = '';
      for (let c = 0; c < list.length; c++)
        html += `<option>${list[c]}</option>`;
      sel.innerHTML = htmlPrefix + html;
    }

    __loadList(this.add_animation_asset_template, Object.keys(this.templates.assetTemplates));
    __loadList(this.add_animation_scene_template, Object.keys(this.templates.sceneTemplates));
    __loadList(this.add_animation_product_template, Object.keys(this.templates.productTemplates));

    return Promise.resolve();
  }
  csvGenerateReloadScene(animationKey = false) {
    if (!animationKey)
      animationKey = gAPPP.a.profile.selectedWorkspace;
    if (!animationKey)
      return;

    this.bView.canvasHelper.hide();
    gAPPP.a._deactivateModels();
//generate_clear_wrkspace
    setTimeout(async () => {
      let csvImport = new gCSVImport(animationKey);
      await gAPPP.a.clearProjectData(animationKey);
      let assets = await gAPPP.a.readProjectRawData(animationKey, 'assetRows');
      await csvImport.importRows(assets);
      let scene = await gAPPP.a.readProjectRawData(animationKey, 'sceneRows');
      await csvImport.importRows(scene);
      let products = await gAPPP.a.readProjectRawData(animationKey, 'productRows');
      await csvImport.importRows(products);
      await csvImport.addCSVDisplayFinalize();
      gAPPP.a.writeProjectRawData(animationKey, 'animationGenerated', null);
      this.bView._updateQueryString(animationKey, 'Layout');

      window.location.href = `/asset/?wid=${animationKey}&subview=Layout`;
    }, 10);

  }
  async csvGenerateData(type, targetProjectId) {
    let sourceProjectId = gAPPP.a.profile.selectedWorkspace;
    let choice = document.getElementById(`add_animation_${type}_choice`).value;
    let data = null;

    if (choice === 'Current') {
      data = await gAPPP.a.readProjectRawData(sourceProjectId, type + 'Rows');
    }
    if (choice === 'Animation') {
      let id = document.getElementById(`add_animation_${type}_animation`);
      data = await gAPPP.a.readProjectRawData(id, type + 'Rows');
    }
    if (choice === 'Template') {
      let title = this[`add_animation_${type}_template`].value;
      let filename = this.templates[`${type}Templates`][title];
      let response = await fetch(this.bView.templateBasePath + filename);
      let csvData = await response.text();
      let csvJSON = await new Promise((resolve) => {
        Papa.parse(csvData, {
          header: true,
          complete: results => resolve(results)
        });
      });

      if (csvJSON.data) data = csvJSON.data;
    }

    if (data) {
      await gAPPP.a.writeProjectRawData(targetProjectId, type + 'Rows', data);
    }

    return Promise.resolve();
  }
  csvGenerateImportCSV() {
    if (this.import_csv_file.files.length > 0) {
      Papa.parse(this.import_csv_file.files[0], {
        header: true,
        complete: results => {
          if (results.data) {
            for (let c = 0, l = results.data.length; c < l; c++) {
              new gCSVImport(gAPPP.a.profile.selectedWorkspace).addCSVRow(results.data[c]).then(() => {});
            }
          }
        }
      });
    }
  }
  csvGenerationImportJSON() {
    if (this.import_asset_json_file.files.length > 0) {
      let reader = new FileReader();
      reader.onload = e => onJSONLoad(e);
      reader.readAsText(this.import_asset_json_file.files[0]);
      let onJSONLoad = (e) => {
        let json = e.target.result;
        try {
          json = JSON.parse(json);
        } catch (e) {
          alert('error parsing json check console');
          console.log('error parsing json for import', e);
          return;
        }

        let eleType = json.assetExportTag;

        if (!gAPPP.a.modelSets[eleType]) {
          alert('no supported assetExportTag found');
          return;
        }

        delete json.assetExportTag;
        delete json.assetExportKey;
        if (eleType !== 'block') {
          json.sortKey = new Date().getTime();
          gAPPP.a.modelSets[eleType].createWithBlobString(json).then(results => {
            this.bView.openNewWindow(eleType, results.key);
          });
        } else {
          json.sortKey = new Date().getTime();
          let blockFrames = json.frames;
          let blockChildren = json.children;

          let __importFrames = (frames, parentKey) => {
            for (let c = 0, l = frames.length; c < l; c++) {
              frames[c].parentKey = parentKey;
              gAPPP.a.modelSets['frame'].createWithBlobString(frames[c]).then(frameResult => {});
            }
          };

          json.children = undefined;
          delete json.children;
          json.frames = undefined;
          delete json.frames;
          gAPPP.a.modelSets['block'].createWithBlobString(json).then(blockResults => {
            __importFrames(blockFrames, blockResults.key);

            for (let c = 0, l = blockChildren.length; c < l; c++) {
              let child = blockChildren[c];
              let childFrames = child.frames;
              child.frames = undefined;
              delete child.frames;
              child.parentKey = blockResults.key;

              gAPPP.a.modelSets['blockchild'].createWithBlobString(child).then(
                childResults => __importFrames(childFrames, childResults.key));
            }

            this.bView.openNewWindow(eleType, blockResults.key);
          });
        }
      };
    }
  }
  async csvGenerateAnimation() {
    let genNew = false;
    let newTitle = this.domPanel.querySelector('#generate_animation_new_wrk_name').value.trim();

    if (newTitle.length === 0 && genNew) {
      this.domPanel.querySelector('#generate_animation_new_wrk_name').focus();
      alert('need a name for new workspace');
      return;
    }

    if (!genNew && !confirm('This will clear existing data - proceed?'))
      return;

    this.bView.canvasHelper.hide();

    let wId = gAPPP.a.profile.selectedWorkspace;
    if (genNew) {
      wId = gAPPP.a.modelSets['projectTitles'].getKey();
      await this.bView._addProject(newTitle, wId, false);
    }

    await Promise.all([
      this.csvGenerateData('asset', wId),
      this.csvGenerateData('scene', wId)
    ]);

    await this.csvGenerateData('product', wId);

    this.csvGenerateReloadScene(wId);

    return '';
  }
  csvGenerateUploadCSV(csvType) {
    if (this[`add_animation_${csvType}_download_file`].files.length > 0) {
      Papa.parse(this[`add_animation_${csvType}_download_file`].files[0], {
        header: true,
        complete: async (results) => {
          if (results.data)
            await gAPPP.a.writeProjectRawData(gAPPP.a.profile.selectedWorkspace, csvType + 'Rows', results.data);
        }
      });
    }

    return;
  }
  csvGenerateDownloadCSV(name) {
    gAPPP.a.readProjectRawData(gAPPP.a.profile.selectedWorkspace, name + 'Rows')
      .then(rows => {
        let csvResult = Papa.unparse(rows);
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csvResult));
        element.setAttribute('download', name + '.csv');

        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      });
  }
  csvGenerateTemplate(type) {
    let value = this['add_animation_' + type + '_choice'].value;

    let dSpan = this.domPanel.querySelector(`.${type}_workspace.csv_data_date_span`);
    dSpan.innerHTML = '';
    this['add_animation_' + type + '_template'].style.display = 'none';
    this['add_animation_' + type + '_animation'].style.display = 'none';

    if (value.indexOf('Template') !== -1) {
      this['add_animation_' + type + '_template'].style.display = 'inline-block';
    }
    if (value.indexOf('Workspace') !== -1) {
      this['add_animation_' + type + '_animation'].style.display = 'inline-block';
      this._csvUpdateWorkspaceCSVDisplayDate(type);
      if (!this['add_animation_' + type + '_animation'].handlerAddedAlready) {
        this['add_animation_' + type + '_animation'].handlerAddedAlready = true;
        this['add_animation_' + type + '_animation'].addEventListener('change', e => this._csvUpdateWorkspaceCSVDisplayDate(type));
      }
    }
  }
  _csvUpdateWorkspaceCSVDisplayDate(type) {
    let dSpan = this.domPanel.querySelector(`.${type}_workspace.csv_data_date_span`);
    gAPPP.a.readProjectRawDataDate(this['add_animation_' + type + '_animation'].value, type + 'Rows')
      .then(r => {
        dSpan.innerHTML = (r) ? GLOBALUTIL.shortDateTime(r) : 'none';
      });
  }
  csvGenerateRefreshProjectLists(optionHTML) {
    this._csvGenerateRefreshProjectList(`add_animation_asset_animation`, optionHTML);
    this._csvGenerateRefreshProjectList('add_animation_scene_animation', optionHTML);
    this._csvGenerateRefreshProjectList('add_animation_product_animation', optionHTML);
  }
  _csvGenerateRefreshProjectList(thisid, optionHTML, prefixOptionHTML = '') {
    if (!this[thisid])
      return;
    let curIndex = this[thisid].selectedIndex;
    this[thisid].innerHTML = prefixOptionHTML + optionHTML;
    this[thisid].selectedIndex = (curIndex > 0) ? curIndex : 0;
  }
}
