import gCSVImport from '/lib/gcsvimport.js';

export default class cWorkspace {
  constructor(domPanel, subKey, bView) {
    this.domPanel = domPanel;
    this.bView = bView;

    gAPPP.updateGenerateDataTimes()
      .then(() => {
        if (subKey === 'Details') {
          this.workspaceDetailsInit();
        }
        if (subKey === 'Overview') {
          this.workspaceOverviewInit();
        }
        if (subKey === 'Generate' || subKey === 'LayoutProducts' || subKey === 'LayoutCustom') {
          this.domPanel.innerHTML = this.workspaceLayoutTemplate();
          this.workspaceLayoutRegister();

          if (this.bView.canvasHelper) {
            this.bView.canvasHelper.loadingScreen.style.display = 'none';
          }
        }
      });
  }
  async workspaceDetailsInit() {
    let html = this.workspaceDetailsTemplate();
    this.domPanel.innerHTML = html;
    this.workspaceDetailsRegister();

    return;
  }
  async workspaceOverviewInit() {
    let html = '';
    let blockCount = Object.keys(this.bView.sets.block.fireDataValuesByKey).length;
    let shapeCount = Object.keys(this.bView.sets.shape.fireDataValuesByKey).length;
    let meshCount = Object.keys(this.bView.sets.mesh.fireDataValuesByKey).length;
    let textureCount = Object.keys(this.bView.sets.texture.fireDataValuesByKey).length;
    let materialCount = Object.keys(this.bView.sets.material.fireDataValuesByKey).length;

    html += `<div style="padding:.75em;"><a href="${this.bView.genQueryString(null, null, null, null, 'Details')}" class="tag_key_redirect" data-value="Details" data-type="w">Details</a>
      &nbsp;<a href="${this.bView.genQueryString(null, null, null, null, 'Generate')}" class="tag_key_redirect" data-value="Generate" data-type="w">Generate</a>
      </div>`;

    let getAssetLinks = (asset) => {
      let set = gAPPP.a.modelSets[asset];
      set.updateChildOrder();
      let keyOrder = set.childOrderByKey;
      let html = '';
      //keyOrder = keyOrder.slice(0, 5);

      keyOrder.forEach(i => {
        let data = set.fireDataValuesByKey[i];
        let d = new Date(data.sortKey);
        if (data.sortKey === undefined)
          d = new Date('1/1/1970');
        let od = d.toISOString().substring(0, 10);
        od += ' ' + d.toISOString().substring(11, 16);
        let href = this.bView.genQueryString(null, asset, i);

        let url = data.renderImageURL;
        let img = '';
        if (url) {
          img = `style="background-image:url(${url})"`;
        }

        html += `<a class="workspace-asset-link-display tag_key_redirect app-control" data-tag="${asset}" data-key="${i}" href="${href}">
          <span class="img-holder" ${img}></span>${data.title}<br><span>${od}</span></a>`;
      });

      return html;
    }

    html += `<div style="line-height:1.5em;padding:.5em;">
    <div class="workspace_band_wrapper">
      <a href="${this.bView.genQueryString(null, 'block', '')}" class="navigate_tag_select app-control" data-value="block">Blocks<br>${blockCount}</a>
      ${getAssetLinks('block')}
    </div>
    <div class="workspace_band_wrapper">
      <a href="${this.bView.genQueryString(null, 'mesh', '')}" class="navigate_tag_select app-control" data-value="mesh">Meshes<br>${meshCount}</a>
      ${getAssetLinks('mesh')}
    </div>
    <div class="workspace_band_wrapper">
      <a href="${this.bView.genQueryString(null, 'shape', '')}" class="navigate_tag_select app-control" data-value="shape">Shapes<br>${shapeCount}</a>
      ${getAssetLinks('shape')}
    </div>
    <div class="workspace_band_wrapper">
      <a href="${this.bView.genQueryString(null, 'material', '')}" class="navigate_tag_select app-control" data-value="material">Materials<br>${materialCount}</a>
      ${getAssetLinks('material')}
    </div>
    <div class="workspace_band_wrapper">
      <a href="${this.bView.genQueryString(null, 'texture', '')}" class="navigate_tag_select app-control" data-value="texture">Textures<br>${textureCount}</a>
      ${getAssetLinks('texture')}
    </div>`;

    let gi = new gCSVImport(gAPPP.loadedWID);
    let sceneRecords = await gi.dbFetchByLookup('block', 'blockFlag', 'scene');
    if (sceneRecords.recordIds.length > 0) {
      let href = this.bView.genQueryString(null, 'block', sceneRecords.recordIds[0]);
      html += `Generated animation block: <b><a href="${href}" class="tag_key_redirect" data-tag="block"
       data-key="${sceneRecords.recordIds[0]}">${sceneRecords.records[0].title}</a></b> <span class="csv_data_date_span">${gAPPP.animationGeneratedDateDisplay}</span>`;
      html += ` &nbsp; <a href="/display?wid=${gAPPP.loadedWID}" target="_blank">/display</a>`;
      html += '<br>';
    } else {
      html += 'Generated animation block: none<br>';
    }

    let baskets = await gi.dbFetchByLookup('block', 'blockFlag', 'basket');
    if (baskets.recordIds.length > 0) {
      let href = this.bView.genQueryString(null, 'block', baskets.recordIds[0]);
      html += `Basket Block: <a href="${href}" class="tag_key_redirect" data-tag="block" data-key="${baskets.recordIds[0]}">${baskets.records[0].title}</a><br>`;
    } else {
      html += 'Basket Block: none<br>'
    }

    let fontsData = await gi.dbFetchByLookup('block', 'blockFlag', 'googlefont');
    html += `Web Font Blocks (${fontsData.records.length}): `;
    for (let c = 0, l = fontsData.records.length; c < l; c++) {
      let href = this.bView.genQueryString(null, 'block', fontsData.recordIds[c]);
      html += ` &nbsp; <a href="${href}" style="font-family:'${fontsData.records[c].genericBlockData}'" class="tag_key_redirect" data-tag="block" data-key="${fontsData.recordIds[c]}">${fontsData.records[c].title}</a>`;
    }
    html += '<br>';

    let result = await firebase.database().ref(gi.path('blockchild'))
      .orderByChild('animationIndex')
      .startAt(-100000)
      .once('value');
    let recordsById = result.val();
    let animationStops = 0;
    if (recordsById)
      animationStops = Object.keys(recordsById).length;
    html += `Animation Stops: ${animationStops}<br>`;
    html += `Mesh [sb:] ${gAPPP.cdnPrefix}meshes/<br>`;
    html += `Texture [sb:] ${gAPPP.cdnPrefix}textures/<br>`;


    let blocksData = await gi.dbFetchByLookup('block', 'blockFlag', 'displayblock');
    html += `Display Blocks (${blocksData.records.length}): `;
    for (let c = 0, l = blocksData.records.length; c < l; c++) {
      let href = this.bView.genQueryString(null, 'block', blocksData.recordIds[c]);
      html += ` &nbsp; <a href="${href}" class="tag_key_redirect" data-tag="block" data-key="${blocksData.recordIds[c]}">${blocksData.records[c].title}</a>`;
    }
    html += '<br>';

    html += '</div>';
    this.domPanel.innerHTML = html;
    this.bView.workspace_show_home_btn.style.visibility = 'hidden';
    this.domPanel.querySelectorAll('.navigate_tag_select').forEach(i => {
      i.addEventListener('click', e => {
        this.bView.dataview_record_tag.value = e.currentTarget.dataset.value;
        this.bView.key = e.currentTarget.dataset.key;
        this.bView.updateRecordList();
        e.preventDefault();
        return false;
      })
    });
    this.domPanel.querySelectorAll('.tag_key_redirect').forEach(i => {
      i.addEventListener('click', e => {
        if (e.currentTarget.dataset.type === 'w') {
          this.bView.dataview_record_key.value = e.currentTarget.dataset.value;
          this.bView.updateSelectedRecord();
        } else {
          this.bView.dataview_record_tag.value = e.currentTarget.dataset.tag;
          this.bView.key = e.currentTarget.dataset.key;
          this.bView.updateRecordList(this.bView.key);
        }
        e.preventDefault();
        return false;
      })
    });

    return;
  }
  workspaceDetailsTemplate() {
    return `<div style="line-height:2.5em;padding: .5em">
    <label><span>Workspace Name </span><input id="edit-workspace-name" type="text" /></label>
    <button id="remove-workspace-button" class="btn-sb-icon"><i class="material-icons">delete</i></button>
    <br>
    <label><span>Workspace Tags (,) </span><input id="edit-workspace-code" type="text" /></label>
    &nbsp;
    <input type="file" style="display:none;" class="import_csv_file">
    <input type="file" style="display:none;" class="import_asset_json_file">
    <br><br>
    <button class="import_csv_records">Import CSV</button>
    &nbsp;
    <button class="import_asset_json_button">Import JSON</button>
    &nbsp;
    <button class="export_asset_json_button">Export Workspace</button>
    </div>`;
  }
  workspaceDetailsRegister() {
    this.bView.workplacesSelectEditName = this.domPanel.querySelector('#edit-workspace-name');
    if (gAPPP.lastWorkspaceName)
      this.bView.workplacesSelectEditName.value = gAPPP.lastWorkspaceName;
    this.bView.workplacesSelectEditCode = this.domPanel.querySelector('#edit-workspace-code');
    if (gAPPP.lastWorkspaceCode)
      this.bView.workplacesSelectEditCode.value = gAPPP.lastWorkspaceCode;
    this.workplacesRemoveButton = this.domPanel.querySelector('#remove-workspace-button');
    this.bView.workplacesSelectEditName.addEventListener('input', e => this.workspaceUpdateTagsList());
    this.bView.workplacesSelectEditCode.addEventListener('input', e => this.workspaceUpdateTagsList());
    this.workplacesRemoveButton.addEventListener('click', e => this.bView.deleteProject());

    this.import_csv_file = this.domPanel.querySelector('.import_csv_file');
    this.import_csv_file.addEventListener('change', e => this.workspaceImportCSV());
    this.import_csv_records = this.domPanel.querySelector('.import_csv_records');
    this.import_csv_records.addEventListener('click', e => this.import_csv_file.click());

    this.import_asset_json_file = this.domPanel.querySelector('.import_asset_json_file');
    this.import_asset_json_file.addEventListener('change', e => this.workspaceImportJSON());
    this.import_asset_json_button = this.domPanel.querySelector('.import_asset_json_button');
    this.import_asset_json_button.addEventListener('click', e => this.import_asset_json_file.click());
    this.export_asset_json_button = this.domPanel.querySelector('.export_asset_json_button');
    this.export_asset_json_button.addEventListener('click', e => this.workspaceExportJSON());
  }
  workspaceImportCSV() {
    if (this.import_csv_file.files.length > 0) {
      Papa.parse(this.import_csv_file.files[0], {
        header: true,
        complete: results => {
          if (results.data) {
            for (let c = 0, l = results.data.length; c < l; c++) {
              new gCSVImport(gAPPP.loadedWID).addCSVRow(results.data[c]);
            }
          }
        }
      });
    }
  }
  workspaceUpdateTagsList() {
    let name = this.bView.workplacesSelectEditName.value.trim();
    let code = this.bView.workplacesSelectEditCode.value.trim();

    if (name.length < 1)
      return;

    gAPPP.a.modelSets['projectTitles'].commitUpdateList([{
      field: 'title',
      newValue: name
    }, {
      field: 'tags',
      newValue: code
    }], this.bView.workplacesSelect.value);
  }
  async workspaceExportJSON() {
    let projectData = await firebase.database().ref('/project/' + gAPPP.loadedWID).once('value');
    let json = projectData.val();

    json.assetExportTag = 'workspace';
    json.assetExportKey = gAPPP.loadedWID;
    let jsonStr = JSON.stringify(json, null, 4);

    let element = document.createElement('a');
    let title = json.title;
    if (!title)
      title = 'workspace';
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(jsonStr));
    element.setAttribute('download', title + '.json');

    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
  async workspaceImportJSON() {
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

        if (eleType === 'workspace') {
          if (!gAPPP.loadedWID) {
            alert('no loaded workspace');
            return;
          }
          if (confirm(`WORKSPACE IMPORT\n Importing this file will blend (possibly overwrite) ` +
              ` with the current workspace - continue?`)) {
            let updates = {};
            let tagList = ['block', 'blockchild', 'frame', 'material', 'shape', 'texture', 'mesh'];
            tagList.forEach(tag => {
              let coll = json[tag];
              for (let key in coll) {
                updates['/project/' + gAPPP.loadedWID + '/' + tag + '/' + key] = coll[key];
              }
            });
            return firebase.database().ref().update(updates);
          }
          return;
        }

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

  url(rawUrl) {
    if (rawUrl.substring(0, 3) === 'sb:') {
      rawUrl = gAPPP.cdnPrefix + 'textures/' + rawUrl.substring(3);
    }
    return rawUrl;
  }

  static assetJSON(tag, key) {
    if (!tag)
      return '';
    if (!key)
      return '';

    let asset = gAPPP.a.modelSets[tag].getCache(key);
    if (!asset)
      return '';
    let ele = Object.assign({}, asset);

    if (tag === 'block') {
      let frames = gAPPP.a.modelSets['frame'].queryCache('parentKey', key);
      let framesArray = [];
      for (let i in frames)
        framesArray.push(frames[i]);
      ele.frames = framesArray;

      let children = gAPPP.a.modelSets['blockchild'].queryCache('parentKey', key);
      let childArray = [];
      for (let childKey in children) {
        let childFrames = gAPPP.a.modelSets['frame'].queryCache('parentKey', childKey);
        let childFramesArray = [];
        for (let i in childFrames)
          childFramesArray.push(childFrames[i]);
        children[childKey].frames = childFramesArray;
        childArray.push(children[childKey]);
      }
      ele.children = childArray;

    }
    delete ele.renderImageURL;
    ele.assetExportTag = tag;
    ele.assetExportKey = key;
    return JSON.stringify(ele, null, 4);
  }
}
