class cDataTable {
  constructor() {
    this.fieldList = [
      'index', 'name', 'asset',
      'text1', 'text2', 'image', 'block',
      'sku', 'price', 'count', 'pricetext',
      'height', 'width',
      'x', 'y', 'z',
      'rx', 'ry', 'rz'
    ];
    this.messageOnlyFields = [
      'index', 'name', 'asset', 'text1', 'text2',
      'height', 'width', 'x', 'y', 'z'
    ];
    this.productOnlyFields = [
      'index', 'name', 'asset',
      'text1', 'image', 'block',
      'sku', 'price', 'count', 'pricetext',
      'x', 'y', 'z'
    ];

    this.allColumnList = [
      'name', 'asset', 'parent', 'childtype', 'shapetype', 'frametime', 'frameorder', 'height', 'width', 'depth',
      'materialname', 'texturepath', 'bmppath', 'color', 'meshpath', 'diffuse', 'ambient', 'emissive', 'scalev', 'scaleu', 'visibility',
      'x', 'y', 'z', 'rx', 'ry', 'rz', 'sx', 'sy', 'sz', 'cameratargetblock', 'cameraradius', 'cameraheightoffset', 'cameramovetime',
      'blockcode', 'introtime', 'finishdelay', 'runlength', 'startx', 'starty', 'startz', 'startrx', 'startry', 'startrz', 'blockflag',
      'texturetext', 'texturetextrendersize', 'texture2dfontweight', 'textfontsize', 'textfontfamily', 'textfontcolor', 'genericblockdata'
    ];
    this.productColumnList = this.fieldList;
    this.assetColumnList = this.allColumnList;
    this.sceneColumnList = this.allColumnList;
    this.rightAlignColumns = [
      'price', 'count', 'height', 'width', 'x', 'y', 'z', 'rx', 'ry', 'rz'
    ];
  }
  async loadDataTable(tableName) {
    let results = await gAPPP.a.readProjectRawData(gAPPP.a.profile.selectedWorkspace, tableName + 'Rows')
    let data = [];
    if (results) data = results;

    if (tableName === 'product')
      data = this.__sortProductRows(data);

    let columns = [];
    let topLeftTitle = (tableName === 'product') ? '<i class="material-icons">add_to_queue</i>' : '';
    columns.push({
      rowHandle: true,
      formatter: "handle",
      headerSort: false,
      cssClass: 'row-handle-table-cell',
      frozen: true,
      width: 45,
      minWidth: 45,
      title: topLeftTitle
    });
    if (tableName !== 'product')
      columns.push({
        rowHandle: true,
        formatter: "rownum",
        headerSort: false,
        align: 'center',
        frozen: true,
        width: 30
      });
    columns.push({
      formatter: (cell, formatterParams) => {
        return "<i class='material-icons'>delete</i>";
      },
      headerSort: false,
      frozen: true,
      align: 'center',
      cssClass: 'delete-table-cell',
      tag: 'delete',
      cellClick: (e, cell) => {
        cell.getRow().delete();
        this.__reformatTable(tableName);
      },
      width: 30
    });
    columns.push({
      formatter: (cell, formatterParams) => {
        return "<i class='material-icons'>add</i>";
      },
      headerSort: false,
      frozen: true,
      align: 'center',
      tag: 'addBelow',
      cssClass: 'add-table-cell',
      cellClick: (e, cell) => {
        cell.getTable().addData([{
            name: ''
          }], false, cell.getRow())
          .then(rows => {
            this.__reformatTable(tableName);
            rows[0].getCells()[2].edit();
          })
      },
      width: 30
    });

    let colList = this[tableName + 'ColumnList'];
    for (let c = 0, l = colList.length; c < l; c++) {
      let field = colList[c];
      let rightColumn = this.rightAlignColumns.indexOf(field) !== -1;
      let align = rightColumn ? 'right' : 'left';
      let longLabel = colList[c].length > 9;
      let cssClass = rightColumn ? 'right-column-data' : '';
      let minWidth = rightColumn ? 75 : 150;
      if (!rightColumn && longLabel)
        cssClass += 'tab-header-cell-large';

      columns.push({
        title: field,
        field,
        editor: true,
        headerSort: false,
        align,
        formatter: rightColumn ? 'money' : undefined,
        layoutColumnsOnNewData: true,
        columnResizing: 'headerOnly',
        cssClass,
        headerVertical: longLabel,
        minWidth
      });
    }

    if (tableName === 'product') {
      columns[4].frozen = true;
      columns[3].frozen = true;
      let tCol = columns[4];
      let tCol2 = columns[3];
      columns[4] = columns[2];
      columns[3] = columns[1];
      columns[2] = tCol;
      columns[1] = tCol2;
      tCol2.title = '';
      columns[0].headerClick = (e, col) => this.toggleProductAddView(col);
    } else {
      columns[4].frozen = true;
      let tCol = columns[4];
      columns[4] = columns[3];
      columns[3] = columns[2];
      columns[2] = tCol;
    }
    columns[1].align = 'right';
    columns[1].cssClass = 'right-column-data';
    columns[1].minWidth = 45;
    columns[2].minWidth = 200;

    this.editTables[tableName] = new Tabulator(`#${tableName}_tab_table`, {
      data,
      virtualDom: true,
      height: '100%',
      width: '100%',
      movableRows: true,
      movableColumns: false,
      selectable: false,
      layout: "fitData",
      columns,
      dataEdited: data => this.__tableChangedHandler(true),
      rowMoved: (row) => this._rowMoved(tableName, row)
    });

    document.getElementById(`import_${tableName}_csv_btn`).addEventListener('click', e => {
      this.saveCSVType = tableName;
      this.importFileDom.click();
    });
    document.getElementById('download_' + tableName + '_csv').addEventListener('click', e => this.downloadCSV(tableName));

    this.editTables[tableName].cacheData = JSON.stringify(this.editTables[tableName].getData());

    document.getElementById(`ui-${tableName}-tab`).addEventListener('click', e => {
      this.__reformatTable(tableName);
      //    this.editTables[tableName].redraw(true);
      this.editTables[tableName].setColumnLayout();
    });
  }
  _rowMoved(tableName, row) {
    let tbl = this.editTables[tableName];
    let data = tbl.getData();

    let indexes = [];
    for (let c = 0, l = data.length; c < l; c++)
      indexes.push(data[c].index);

    indexes.sort((a, b) => {
      let aIndex = GLOBALUTIL.getNumberOrDefault(a, 0);
      let bIndex = GLOBALUTIL.getNumberOrDefault(b, 0);
      if (aIndex > bIndex)
        return 1;
      if (aIndex < bIndex)
        return -1;
      return 0;
    });

    for (let c = 0, l = data.length; c < l; c++)
      data[c].index = indexes[c];
    tbl.setData(data).then(() => {});
    this.__tableChangedHandler();
  }
  async __saveChanges() {
    this.canvasHelper.hide();

    await Promise.all([
      this.__saveTable('asset'),
      this.__saveTable('product'),
      this.__saveTable('scene')
    ]);

    return this.reloadScene();
  }
  __reformatTable(tableName) {
    let tbl = this.editTables[tableName];
    let rows = tbl.getRows();
    for (let c = 0, l = rows.length; c < l; c++)
      rows[c].reformat();

    this.__tableChangedHandler();
  }
  ___testTableDirty(tableName) {
    let tbl = this.editTables[tableName];
    let setDirty = false;
    let newCache = JSON.stringify(this.editTables[tableName].getData());
    if (this.editTables[tableName].cacheData !== newCache)
      setDirty = true;

    return setDirty;
  }
  async __saveTable(tableName) {
    if (!this.___testTableDirty(tableName))
      return Promise.resolve();

    let tbl = this.editTables[tableName];
    let data = tbl.getData();

    for (let c = 0, l = data.length; c < l; c++) {
      delete data[c][undefined];

      for (let i in data[c])
        if (data[c][i] === undefined)
          data[c][i] = '';
    }

    await gAPPP.a.writeProjectRawData(gAPPP.a.profile.selectedWorkspace, tableName + 'Rows', data);

    return Promise.resolve();
  }
  __tableChangedHandler(reloadSceneOptions) {
    let dirty = this.___testTableDirty('asset');
    if (!dirty)
      dirty = this.___testTableDirty('scene');
    if (!dirty)
      dirty = this.___testTableDirty('product');

    if (dirty) {
      document.getElementById('changes_commit_header').style.display = 'inline-block';
    } else {
      document.getElementById('changes_commit_header').style.display = 'none';
    }

    if (reloadSceneOptions) {
      this.sceneOptionsBlockListChange();
    }
  }

}
