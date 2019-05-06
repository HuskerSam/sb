class cBlockImport() {
  constructor(panel) {

  }

  initSceneEditFields() {
    let editInfoBlocks = gAPPP.a.modelSets['block'].queryCache('blockFlag', 'displayfieldedits');

    let listHTML = '';
    this.sceneFieldEditBlocks = [];

    let checked = " selected";
    for (let id in editInfoBlocks) {
      let data = editInfoBlocks[id].genericBlockData;
      let parts = data.split('||');
      let mainLabel = parts[0];
      let tab = parts[1];
      let name = parts[2];
      let asset = parts[3];
      let fieldList = [];
      for (let c = 4, l = parts.length; c < l; c++) {
        let subParts = parts[c].split(':');
        let field = subParts[0];
        let type = subParts[1];

        fieldList.push({
          field,
          type
        });
      }

      this.sceneFieldEditBlocks.push({
        mainLabel,
        tab,
        name,
        asset,
        fieldList
      });

      listHTML += `<option${checked} value="${this.sceneFieldEditBlocks.length - 1}">${mainLabel}</option>`;
      checked = '';
    }

    this.scene_options_edit_fields = document.getElementById('scene_options_edit_fields');
    this.scene_options_list = document.getElementById('scene_options_list');
    this.scene_options_list.innerHTML = listHTML;
    this.scene_options_list.addEventListener('input', e => this.sceneOptionsBlockListChange());
  }
  sceneOptionsBlockListChange() {
    let index = this.scene_options_list.selectedIndex;
    if (index < 0)
      return;
    let fieldData = this.sceneFieldEditBlocks[index];

    let fieldHtml = '<input type="file" class="sotexturepathuploadfile" style="display:none;" />';
    let name = fieldData.name;
    let asset = fieldData.asset;

    for (let c = 0, l = fieldData.fieldList.length; c < l; c++) {
      let type = fieldData.fieldList[c].type;
      let field = fieldData.fieldList[c].field;

      if (type === 'num') {
        let v = this.__getSceneOptionsValue(fieldData.tab, name, asset, field);
        fieldHtml += '<div class="scene_num_field_wrapper mdl-textfield mdl-js-textfield mdl-textfield--floating-label">' +
          `<input data-field="${field}" class="mdl-textfield__input" type="text" value="${v}" data-tab="${fieldData.tab}"` +
          `data-type="${type}" data-name="${name}" data-asset="${asset}" id="scene_edit_field_${c}_${field}" />` +
          `<label class="mdl-textfield__label" for="scene_edit_field_${c}_${field}">${field}</label>` +
          '</div>';
      }

      if (type === 'image') {
        let v = this.__getSceneOptionsValue(fieldData.tab, name, asset, field);
        fieldHtml += '<div><div class="scene_image_field_wrapper mdl-textfield mdl-js-textfield mdl-textfield--floating-label">' +
          `<input data-field="${field}" class="mdl-textfield__input" type="text" value="${v}" data-tab="${fieldData.tab}"` +
          `data-type="${type}" data-name="${name}" data-asset="${asset}" id="scene_edit_field_${c}_${field}" />` +
          `<label class="mdl-textfield__label" for="scene_edit_field_${c}_${field}">${field}</label>` +
          '</div>' +
          `<button data-fieldid="scene_edit_field_${c}_${field}" class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--primary sceneoptionsupload">` +
          `<i class="material-icons">cloud_upload</i></button></div>`;
      }
    }

    this.scene_options_edit_fields.innerHTML = fieldHtml;
    this.soUploadImageFile = this.scene_options_edit_fields.querySelector('.sotexturepathuploadfile');
    this.soUploadImageFile.addEventListener('change', e => {
      this.__sceneUploadImageFile(e).then(() => {});
    });
    let inputs = this.scene_options_edit_fields.querySelectorAll('input');
    inputs.forEach(i => i.addEventListener('input', e => this.__sceneOptionsValueChange(i, e)));
    let uploadButtons = this.scene_options_edit_fields.querySelectorAll('button.sceneoptionsupload');
    uploadButtons.forEach(i => i.addEventListener('click', e => {
      this.soUploadImageFile.btnCTL = i;
      this.soUploadImageFile.editCTL = this.scene_options_edit_fields.querySelector('#' + i.dataset.fieldid);
      this.soUploadImageFile.click();
    }));
    componentHandler.upgradeDom();
  }
  async __sceneUploadImageFile() {
    let fileBlob = this.soUploadImageFile.files[0];

    if (!fileBlob)
      return Promise.resolve();

    this.soUploadImageFile.editCTL.parentElement.MaterialTextfield.change('Uploading...');

    let fireSet = gAPPP.a.modelSets['block'];
    let key = this.productData.sceneId + '/scenedatafiles';
    let uploadResult = await fireSet.setBlob(key, fileBlob, fileBlob.name);
    this.soUploadImageFile.editCTL.parentElement.MaterialTextfield.change(uploadResult.downloadURL);
    this.__sceneOptionsValueChange(this.soUploadImageFile.editCTL);
    return Promise.resolve();
  }
  __sceneOptionsValueChange(ctl, e) {
    let data = ctl.dataset;
    this.__setSceneOptionsValue(data.tab, data.name, data.asset, data.field, ctl.value)
      .then(() => {});
  }
  async __setSceneOptionsValue(tab, name, asset, field, value) {
    if (tab === 'layout')
      tab = 'scene';
    if (!this.editTables[tab])
      return Promise.resolve();

    let dataChanged = false;
    let rows = this.editTables[tab].getData();
    for (let c = 0, l = rows.length; c < l; c++)
      if (rows[c]['name'] === name && rows[c]['asset'] === asset) {
        if (rows[c][field] !== value) {
          dataChanged = true;
          rows[c][field] = value;
        }
      }

    if (dataChanged) {
      this.editTables[tab].setData(rows);
      this.__tableChangedHandler();
    }

    return Promise.resolve();
  }
  __getSceneOptionsValue(tab, name, asset, field) {
    if (tab === 'layout')
      tab = 'scene';
    if (!this.editTables[tab])
      return '';
    let rows = this.editTables[tab].getData();
    for (let c = 0, l = rows.length; c < l; c++)
      if (rows[c]['name'] === name && rows[c]['asset'] === asset)
        return rows[c][field];

    return '';
  }
  __sortProductRows(p) {
    return p.sort((a, b) => {
      let aIndex = GLOBALUTIL.getNumberOrDefault(a.index, 0);
      let bIndex = GLOBALUTIL.getNumberOrDefault(b.index, 0);
      if (aIndex > bIndex)
        return 1;
      if (aIndex < bIndex)
        return -1;
      return 0;
    });
  }


  initFieldEdit() {
    this.fieldDivByName = {};
    this.record_field_list_form.innerHTML = '<input type="file" class="texturepathuploadfile" style="display:none;" />';

    for (let c = 0, l = this.fieldList.length; c < l; c++) {
      let title = this.fieldList[c];
      let id = 'fieldid' + c.toString();
      this.fieldDivByName[title] = document.createElement('div');
      this.fieldDivByName[title].setAttribute('class', 'mdl-textfield mdl-js-textfield mdl-textfield--floating-label');
      this.fieldDivByName[title].innerHTML = `<input id="${id}" type="text" class="mdl-textfield__input fieldinput ${title}edit" list="${this.fieldList[c]}list" />` +
        `<label class="mdl-textfield__label" for="${id}">${this.fieldList[c]}</label>`;

      if (title === 'x') {
        let select = document.createElement('select');
        select.style.position = 'absolute';
        select.style.top = '-.75em';
        select.style.right = '5px';
        select.style.width = '1.5em';
        select.setAttribute('id', 'select-position-preset');
        select.setAttribute('class', 'mdl-textfield__input');
        componentHandler.upgradeElement(select);
        this.fieldDivByName[title].appendChild(select);
        this.fieldDivByName[title].style.position = 'relative';
      }
      if (title === 'image') {
        let btn = document.createElement('button');
        btn.style.position = 'absolute';
        btn.style.top = '-2.5em';
        btn.style.left = '75%';
        btn.innerHTML = '<i class="material-icons">cloud_upload</i>';
        btn.setAttribute('class', 'mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--primary texturepathupload');
        componentHandler.upgradeElement(btn);
        this.fieldDivByName[title].appendChild(btn);
        this.fieldDivByName[title].style.position = 'relative;'
      }

      componentHandler.upgradeElement(this.fieldDivByName[title]);
      this.record_field_list_form.appendChild(this.fieldDivByName[title]);
    }

    this.uploadImageButton = this.record_field_list_form.querySelector('.texturepathupload');
    this.uploadImageEditField = this.record_field_list_form.querySelector('.imageedit');
    this.uploadImageFile = this.record_field_list_form.querySelector('.texturepathuploadfile');
    this.uploadImageFile.addEventListener('change', e => this.__uploadImageFile());
    this.uploadImageButton.addEventListener('click', e => this.uploadImageFile.click());

    let btn = document.createElement('button');
    btn.setAttribute('id', 'update_product_fields_post');
    btn.setAttribute('class', 'mdl-button mdl-js-button mdl-button--fab mdl-button--colored');
    btn.innerHTML = '<i class="material-icons">add</i>';
    componentHandler.upgradeElement(btn);
    this.record_field_list_form.appendChild(btn);
    this.addNewBtn = document.getElementById('update_product_fields_post');
    this.addNewBtn.addEventListener('click', e => this.addNewProduct(e));

    this.assetEditField = this.record_field_list_form.querySelector('.assetedit');
    this.assetEditField.addEventListener('input', e => this.updateVisibleEditFields());

    this.updateVisibleEditFields();
  }
  updateVisibleEditFields() {
    let fieldsToShow = null;
    if (this.assetEditField.value === 'message')
      fieldsToShow = this.messageOnlyFields;
    else if (this.assetEditField.value === 'product')
      fieldsToShow = this.productOnlyFields;

    for (let i in this.fieldDivByName) {
      if (fieldsToShow) {
        if (fieldsToShow.indexOf(i) === -1)
          this.fieldDivByName[i].style.display = 'none';
        else
          this.fieldDivByName[i].style.display = '';
      } else {
        if (i !== 'asset' && i !== 'name' && i !== 'index')
          this.fieldDivByName[i].style.display = 'none';
        else
          this.fieldDivByName[i].style.display = '';
      }
    }
  }
  updateProductList() {


    /*
          rowH += ` &nbsp;<button class="remove mdl-button mdl-js-button mdl-button--icon mdl-button--primary" data-id="${row.name}"><i class="material-icons">delete</i></button>`;
          let x = GLOBALUTIL.getNumberOrDefault(row.x, 0).toFixed(1);
          let y = GLOBALUTIL.getNumberOrDefault(row.y, 0).toFixed(1);
          let z = GLOBALUTIL.getNumberOrDefault(row.z, 0).toFixed(1);
          let pos = this.__checkForPosition(row.x, row.y, row.z);
          */


    /*
        let tRows = this.productListDiv.querySelectorAll('.table-row-product-list');
        for (let c = 0, l = tRows.length; c < l; c++)
          tRows[c].addEventListener('click', e => {
            return this.showSelectedProduct(e.currentTarget.dataset.id);
          });

        let removeBtns = this.productListDiv.querySelectorAll('.remove');
        for (let c2 = 0, l2 = removeBtns.length; c2 < l2; c2++)
          removeBtns[c2].addEventListener('click', e => {
            return this.removeProductByName(e.currentTarget.dataset.id, e);
          });
          */
  }
  removeProductByName(name, e) {
    gAPPP.a.readProjectRawData(gAPPP.a.profile.selectedWorkspace, 'productRows')
      .then(products => {
        let outProducts = []
        for (let c = 0, l = products.length; c < l; c++)
          if (products[c].name !== name)
            outProducts.push(products[c]);

        gAPPP.a.writeProjectRawData(gAPPP.a.profile.selectedWorkspace, 'productRows', outProducts)
          .then(() => this.reloadScene())
          .then(() => {});
      });

    if (e) {
      e.preventDefault();
    }
  }
  __productByName(name) {
    for (let c = 0, l = this.productData.products.length; c < l; c++)
      if (this.productData.products[c].origRow.name === name)
        return this.productData.products[c];

    if (name === 'FollowCamera')
      return {
        origRow: this.productData.cameraOrigRow
      };

    return null;
  }
  showSelectedProduct(name) {
    let fields = this.record_field_list_form.querySelectorAll('.fieldinput');
    let p = this.__productByName(name);
    let row = {};
    if (p)
      row = p.origRow;

    if (row.asset === 'block') {
      row.asset = 'displayproduct';
    }
    for (let c = 0, l = this.fieldList.length; c < l; c++) {
      let f = fields[c];
      let v = row[this.fieldList[c]];
      v = (v !== undefined) ? v : '';
      f.parentElement.MaterialTextfield.change(v);
    }

    this.updateVisibleEditFields();
  }
  addNewProduct(e) {
    let fields = this.record_field_list_form.querySelectorAll('.fieldinput');

    let name = fields[0].value;
    if (!name) {
      alert('name required');
      return;
    }
    let assetType = fields[1].value;
    if (!assetType) {
      alert('asset type required');
      return;
    }

    let newRow = {};
    for (let c = 0, l = fields.length; c < l; c++)
      newRow[this.fieldList[c]] = fields[c].value;

    let rows = this.editTables['product'].getData();
    rows.push(newRow);
    this.editTables['product'].setData(rows);
    this.__tableChangedHandler();

    e.preventDefault();
    return true;
  }

}
