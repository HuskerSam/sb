import gCSVImport from '/lib/gcsvimport.js';

export default class cGenerate {
  constructor(domPanel, subKey, bView) {
    this.domPanel = domPanel;
    this.bView = bView;
    this.templates = {
      "assetTemplates": {
        "Grocery": "asset.csv"
      },
      "sceneTemplates": {
        "Produce": "layout.csv",
        "Produce Large": "largescene.csv"
      },
      "productTemplates": {
        "Produce 1": "product.csv",
        "Produce Large": "largeproduct.csv"
      }
    };

    this.domPanel.innerHTML = this.template();
    this.register();
    let html = '';
    if (this.bView.workplacesSelect)
      html = this.bView.workplacesSelect.innerHTML;
    if (this.bView.canvasHelper) {
      this.bView.canvasHelper.loadingScreen.style.display = 'none';
    }
    this.bView.dialog.classList.add('generatelayout');

    this.csvGenerateRefreshProjectLists(html);
  }
  template() {
    return `<div class="cgenerate_panel_wrapper">
    <b>Last Generated Animation</b>
    &nbsp;
    <span class="generated csv_data_date_span"></span>
    <input type="file" class="add_animation_asset_download_file" style="display:none">
    <input type="file" class="add_animation_scene_download_file" style="display:none">
    <input type="file" class="add_animation_product_download_file" style="display:none">
    <select class="layout_data_action_select" >
      <option>Import Data</option>
      <option>Download Assets</option>
      <option>Upload Assets</option>
      <option>Download Layout</option>
      <option>Upload Layout</option>
      <option>Download Products</option>
      <option>Upload Products</option>
    </select>
    <br>
    <input class="generate_animation_new_wrk_name" type="text" />
    <button class="generate_new_animation_workspace_button"><i class="material-icons">gavel</i><i class="material-icons">add</i></button>
    <button class="generate_animation_workspace_button"><i class="material-icons">gavel</i><i class="material-icons">cached</i></button>

    <div class="workspace-csv-panel-item">
      <select class="add_animation_asset_choice">
        <option value="current" selected>Assets Data</option>
        <option value="workspace">Workspace Assets</option>
        <option value="template">Template Assets</option>
        <option value="none">No Assets</option>
      </select>
      <select class="add_animation_asset_animation" style="display:none;"></select>
      <select class="add_animation_asset_template">
        <option>select template</option>
      </select>
      <span class="asset_workspace csv_data_date_span"></span>
    </div>
    <div class="workspace-csv-panel-item">
      <select class="add_animation_scene_choice">
        <option value="current" selected>Layout Data</option>
        <option value="workspace">Workspace Layout</option>
        <option value="template">Template Layout</option>
        <option value="none">No Layout</option>
      </select>
      <select class="add_animation_scene_animation" style="display:none;"></select>
      <select class="add_animation_scene_template">
        <option>select template</option>
      </select>
      <span class="scene_workspace csv_data_date_span"></span>
    </div>
    <div class="workspace-csv-panel-item">
      <select class="add_animation_product_choice">
        <option value="current" selected>Products Data</option>
        <option value="workspace">Workspace Products</option>
        <option value="template">Template Products</option>
        <option value="none">No Products</option>
      </select>
      <select class="add_animation_product_animation" style="display:none;"></select>
      <select class="add_animation_product_template" style="display:none;">
        <option>select template</option>
      </select>
      <span class="product_workspace csv_data_date_span"></span>
    </div>
    <hr>
    <div class="form_canvas_wrapper generate_help">
      <div class="help-viewer help-overlay" style="display:block;"></div>
    </div>
    </div>`;
  }
  async register() {
    this.add_animation_asset_animation = this.domPanel.querySelector('.add_animation_asset_animation');
    this.add_animation_asset_template = this.domPanel.querySelector('.add_animation_asset_template');
    this.add_animation_asset_choice = this.domPanel.querySelector('.add_animation_asset_choice');
    this.import_asset_templates_select = this.domPanel.querySelector('.import_asset_templates_select');

    this.add_animation_scene_animation = this.domPanel.querySelector('.add_animation_scene_animation');
    this.add_animation_scene_template = this.domPanel.querySelector('.add_animation_scene_template');
    this.add_animation_scene_choice = this.domPanel.querySelector('.add_animation_scene_choice');
    this.import_scene_templates_select = this.domPanel.querySelector('.import_scene_templates_select');

    this.add_animation_product_animation = this.domPanel.querySelector('.add_animation_product_animation');
    this.add_animation_product_template = this.domPanel.querySelector('.add_animation_product_template');
    this.add_animation_product_choice = this.domPanel.querySelector('.add_animation_product_choice');
    this.import_product_templates_select = this.domPanel.querySelector('.import_product_templates_select');

    this.add_animation_asset_choice.addEventListener('input', e => this.updateCSVDataDisplay('asset'));
    this.add_animation_scene_choice.addEventListener('input', e => this.updateCSVDataDisplay('scene'));
    this.add_animation_product_choice.addEventListener('input', e => this.updateCSVDataDisplay('product'));

    this.import_asset_workspaces_select = this.domPanel.querySelector('.import_asset_workspaces_select');
    this.import_scene_workspaces_select = this.domPanel.querySelector('.import_scene_workspaces_select');
    this.import_product_workspaces_select = this.domPanel.querySelector('.import_product_workspaces_select');

    this.generate_new_animation_workspace_button = this.domPanel.querySelector('.generate_new_animation_workspace_button');
    this.generate_new_animation_workspace_button.addEventListener('click', e => this.generateNewAnimation());
    this.generate_animation_workspace_button = this.domPanel.querySelector('.generate_animation_workspace_button');
    this.generate_animation_workspace_button.addEventListener('click', e => this.generateNewAnimation(false));

    await gAPPP.updateGenerateDataTimes();

    this.layout_data_action_select = this.domPanel.querySelector('.layout_data_action_select');
    this.layout_data_action_select.addEventListener('change', e => this.updateLayoutOptions());

    this.add_animation_asset_download_file = this.domPanel.querySelector('.add_animation_asset_download_file');
    this.add_animation_scene_download_file = this.domPanel.querySelector('.add_animation_scene_download_file');
    this.add_animation_product_download_file = this.domPanel.querySelector('.add_animation_product_download_file');
    this.add_animation_asset_download_file.addEventListener('change', e => this.csvGenerateUploadCSV('asset'));
    this.add_animation_scene_download_file.addEventListener('change', e => this.csvGenerateUploadCSV('scene'));
    this.add_animation_product_download_file.addEventListener('change', e => this.csvGenerateUploadCSV('product'));

    this.domPanel.querySelector('.generated.csv_data_date_span').innerHTML = gAPPP.animationGeneratedDateDisplay;

    function __loadList(sel, list, htmlPrefix = '') {
      let html = '';
      for (let c = 0; c < list.length; c++)
        html += `<option>${list[c]}</option>`;
      sel.innerHTML = htmlPrefix + html;
    }

    __loadList(this.add_animation_asset_template, Object.keys(this.templates.assetTemplates));
    __loadList(this.add_animation_scene_template, Object.keys(this.templates.sceneTemplates));
    __loadList(this.add_animation_product_template, Object.keys(this.templates.productTemplates));
    this.updateCSVDataDisplay('asset');
    this.updateCSVDataDisplay('scene');
    this.updateCSVDataDisplay('product');

    let res = await fetch(`/docraw/overviewhelp.html`, {
      cache: "no-cache"
    })
    let html = await res.text();
    this.domPanel.querySelector('.help-viewer').innerHTML = html;

    this.bView._updateHelpSections(true, this.domPanel.querySelector('.help-viewer'));

    this.generate_animation_new_wrk_name = this.domPanel.querySelector('.generate_animation_new_wrk_name');
    this.generate_animation_new_wrk_name.value = 'Created ' + new Date().toISOString().substring(0, 10);

    return Promise.resolve();
  }
  async updateLayoutOptions() {
    let index = this.layout_data_action_select.selectedIndex;

    if (index === 1)
      this.csvGenerateDownloadCSV('asset');
    else if (index === 3)
      this.csvGenerateDownloadCSV('scene');
    else if (index === 5)
      this.csvGenerateDownloadCSV('product');
    else if (index === 4)
      this.add_animation_scene_download_file.click();
    else if (index === 2)
      this.add_animation_asset_download_file.click();
    else if (index === 6)
      this.add_animation_product_download_file.click();

  }
  async updateCSVDataDisplay(type) {
    let value = this['add_animation_' + type + '_choice'].value;

    let dSpan = this.domPanel.querySelector(`.${type}_workspace.csv_data_date_span`);
    dSpan.innerHTML = gAPPP[type + `RowsDateDisplay`];
    this['add_animation_' + type + '_template'].style.display = 'none';
    this['add_animation_' + type + '_animation'].style.display = 'none';
    if (value === 'none') {
      dSpan.innerHTML = '';
    }
    if (value === 'template') {
      this['add_animation_' + type + '_template'].style.display = 'inline-block';
      dSpan.innerHTML = '';
    }
    if (value === 'workspace') {
      dSpan.innerHTML = '';
      this['add_animation_' + type + '_animation'].style.display = 'inline-block';
      this._csvUpdateWorkspaceCSVDisplayDate(type);
      if (!this['add_animation_' + type + '_animation'].handlerAddedAlready) {
        this['add_animation_' + type + '_animation'].handlerAddedAlready = true;
        this['add_animation_' + type + '_animation'].addEventListener('change', e => this._csvUpdateWorkspaceCSVDisplayDate(type));
      }
    }
  }
  async setCSVData(type, targetProjectId) {
    let sourceProjectId = gAPPP.loadedWID;
    let choice = this[`add_animation_${type}_choice`].value;
    let data = null;

    if (choice === 'current') {
      let csvImport = new gCSVImport(sourceProjectId);
      data = await csvImport.readProjectRawData(type + 'Rows');
    }
    if (choice === 'workspace') {
      let id = this.domPanel.querySelector(`.add_animation_${type}_animation`).value;
      let csvImport = new gCSVImport(id);
      data = await csvImport.readProjectRawData(type + 'Rows');
    }
    if (choice === 'template') {
      let title = this[`add_animation_${type}_template`].value;
      let filename = this.templates[`${type}Templates`][title];
      let response = await fetch(this.bView.templateBasePath + filename, {
        cache: "no-cache"
      });
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
      let csvImport = new gCSVImport(targetProjectId);
      await csvImport.writeProjectRawData(type + 'Rows', data);
    }

    return Promise.resolve();
  }
  async generateNewAnimation(genNew = true) {
    let newTitle = this.generate_animation_new_wrk_name.value.trim();

    if (newTitle.length === 0 && genNew) {
      this.generate_animation_new_wrk_name.focus();
      alert('need a name for new workspace');
      return;
    }

    this.bView.context.activate(null);
    this.bView.canvasHelper.hide();

    let wId = gAPPP.loadedWID;
    if (genNew) {
      wId = gAPPP.a.modelSets['projectTitles'].getKey();
      let tags = 'active,' + 'gd:' + new Date().toISOString();
      await this.bView._addProject(newTitle, wId, false, tags);
    }

    await Promise.all([
      this.setCSVData('asset', wId),
      this.setCSVData('scene', wId)
    ]);

    await this.setCSVData('product', wId);

    this.bView.generateAnimation(true, wId);

    return '';
  }
  csvGenerateUploadCSV(csvType) {
    if (this[`add_animation_${csvType}_download_file`].files.length > 0) {
      Papa.parse(this[`add_animation_${csvType}_download_file`].files[0], {
        header: true,
        complete: async (results) => {
          let csvImport = new gCSVImport(gAPPP.loadedWID);
          if (results.data)
            await csvImport.writeProjectRawData(csvType + 'Rows', results.data);


          await gAPPP.updateGenerateDataTimes();
          this.updateCSVDataDisplay('asset');
          this.updateCSVDataDisplay('scene');
          this.updateCSVDataDisplay('product');
          this.layout_data_action_select.selectedIndex = 0;
        }
      });
    }

    return;
  }
  csvGenerateDownloadCSV(name) {
    let csvImport = new gCSVImport(gAPPP.loadedWID);
    csvImport.readProjectRawData(name + 'Rows')
      .then(rows => {
        let csvResult = Papa.unparse(rows);
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csvResult));
        element.setAttribute('download', name + '.csv');

        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);

        this.layout_data_action_select.selectedIndex = 0;
      });
  }
  _csvUpdateWorkspaceCSVDisplayDate(type) {
    let csvImport = new gCSVImport(this['add_animation_' + type + '_animation'].value);
    let dSpan = this.domPanel.querySelector(`.${type}_workspace.csv_data_date_span`);
    csvImport.readProjectRawDataDate(type + 'Rows')
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
