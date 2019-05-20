class gCSVImport {
  constructor(projectId = 'default') {
    this.projectId = projectId;
  }
  path(eleType) {
    return '/project/' + this.projectId + '/' + eleType;
  }
  async dbFetchByLookup(type, field, value) {
    return firebase.database().ref(this.path(type))
      .orderByChild(field)
      .equalTo(value)
      .once('value')
      .then(result => {
        let recordsById = result.val();
        let recordIds = [];
        let records = [];
        for (let key in recordsById) {
          recordIds.push(key);
          records.push(recordsById[key]);
        }

        return {
          recordsById,
          recordIds,
          records
        }
      });
  }
  async dbRemove(type, key) {
    let updates = {};
    if (!type) {
      console.log('no type on db remove');
      return Promise.resolve();
    }
    if (type === 'project') {
      updates['/project/' + key] = null;
      updates['/projectTitles/' + key] = null;
    } else {
      updates['/' + this.path(type) + '/' + key] = null;
    }
    return firebase.database().ref().update(updates);
  }
  async dbSetRecord(type, data, id) {
    if (!id)
      id = firebase.database().ref().child(this.path(type)).push().key;
    let updates = {};
    data.sortKey = new Date().getTime();
    updates['/' + this.path(type) + '/' + id] = data;

    if (data)
      for (let i in data)
        if (data[i] === undefined) delete data[i];

    await firebase.database().ref().update(updates);

    return Promise.resolve({
      key: id
    });
  }
  async dbSetRecordFields(type, data, id) {
    if (!id)
      id = firebase.database().ref().child(this.path(type)).push().key;
    let updates = {};
    for (let i in data)
      updates['/' + this.path(type) + '/' + id + '/' + i] = data[i];
    await firebase.database().ref().update(updates);

    return Promise.resolve({
      key: id
    });
  }
  async dbFetchListByLookup(type, field, value) {
    return firebase.database().ref(this.path(type))
      .orderByChild(field)
      .equalTo(value)
      .once('value')
      .then(result => {
        console.log(result);
        console.log(result.val(), result.id);

        return result.val();
      });
  }
  async setBlobFromString(id, dataString, filename) {
    let storageRef = firebase.storage().ref();
    let ref = storageRef.child(this.referencePath + '/' + id + '/' + filename);
    return ref.putString(dataString)
  }
  async setBlob(id, blob, filename) {
    let storageRef = firebase.storage().ref();
    let ref = storageRef.child(this.referencePath + '/' + id + '/' + filename)
    return ref.put(blob);
  }
  getProductColors() {
    let colors = [
      'decolor: 1,0,0',
      'decolor: 0,1,0',
      'decolor: 0,0,1',
      'decolor: 1,1,0'
    ];
    let buttonColors = [
      'rgb(255,0,0)',
      'rgb(0,255,0)',
      'rgb(0,0,255)',
      'rgb(255,255,0)'
    ];
    let buttonForeColors = [
      'rgb(0,0,0)',
      'rgb(0,0,0)',
      'rgb(255,255,255)',
      'rgb(0,0,0)'
    ];
    return {
      colors,
      buttonColors,
      buttonForeColors
    }
  }
  async addCSVMeshRow(row) {
    let promises = [];

    let meshData = {
      title: row.name,
      materialName: row.materialname,
      url: row.meshpath,
      positionX: row.x,
      positionY: row.y,
      positionZ: row.z,
      rotationX: row.rx,
      rotationY: row.ry,
      rotationZ: row.rz,
      scalingX: row.sx,
      scalingY: row.sy,
      scalingZ: row.sz,
      type: 'url'
    };

    promises.push(this.dbSetRecord('mesh', meshData));

    let diffuseColor = '';
    let diffuseTextureName = '';
    if (row.diffuse === 'x') {
      diffuseColor = row.color;
      diffuseTextureName = row.texturepath;
    }
    let ambientColor = '';
    let ambientTextureName = '';
    if (row.ambient === 'x') {
      ambientColor = row.color;
      ambientTextureName = row.texturepath;
    }
    let emissiveColor = '';
    let emissiveTextureName = '';
    if (row.emissive === 'x') {
      emissiveColor = row.color;
      emissiveTextureName = row.texturepath;
    }

    let materialData = {
      title: row.materialname,
      ambientColor,
      ambientTextureName,
      backFaceCulling: true,
      diffuseColor,
      diffuseTextureName,
      emissiveColor,
      emissiveTextureName,
      bumpTextureName: row.bmppath
    };
    promises.push(this.dbSetRecord('material', materialData));

    return Promise.all(promises);
  }
  async addCSVBlockRow(row) {
    let blockData = {
      title: row.name,
      materialName: row.materialname,
      height: row.height,
      width: row.width,
      depth: row.depth
    };

    if (row.blockcode)
      blockData.blockCode = row.blockcode;

    if (row.sku) {
      blockData.itemId = row.sku;
      blockData.itemTitle = row.text1;
      blockData.itemDesc = row.text2;
      blockData.itemPrice = row.price;
      blockData.itemImage = row.image;
      blockData.itemCount = row.count;
      blockData.itemPriceText = row.pricetext;
      blockData.basketBlock = row.block;
      blockData.origRow = row;
    }

    if (row.genericblockdata)
      blockData.genericBlockData = row.genericblockdata;

    if (row.introtime) {
      blockData.introtime = row.introtime;
      blockData.finishdelay = row.finishdelay;
      blockData.runlength = row.runlength;
    }
    if (row.blockflag) blockData.blockFlag = row.blockflag;

    let blockResult = await this.dbSetRecord('block', blockData);
    if (row.frametime) {
      let frameTime = row.frametime;
      this.dbSetRecord('frame', {
        parentKey: blockResult.key,
        positionX: row.x,
        positionY: row.y,
        positionZ: row.z,
        rotationX: row.rx,
        rotationY: row.ry,
        rotationZ: row.rz,
        scalingX: row.sx,
        scalingY: row.sy,
        scalingZ: row.sz,
        frameOrder: 10,
        frameTime
      });
    }

    return blockResult;
  }
  async csvFetchSceneBlock() {
    let results = await this.dbFetchByLookup('block', 'blockFlag', 'scene');
    if (results.records.length < 1) {
      console.log('scene (blockFlag) - block not found');
      return Promise.resolve({
        results,
        key: null,
        data: {},
        parent: ''
      });
    }

    return Promise.resolve({
      results,
      key: results.recordIds[0],
      data: results.records[0],
      parent: results.records[0].title
    });
  }
  async addCSVBlockChildRow(row) {
    let parentRecords = await this.dbFetchByLookup('block', 'title', row.parent);
    if (parentRecords.records.length < 1) {
      console.log(row.parent, ' - block not found');
      return Promise.resolve();
    }
    let key = parentRecords.recordIds[0];

    let inheritMaterial = false;
    if (row.materialname === 'inherit')
      inheritMaterial = true;

    let blockChildData = {
      materialName: row.materialname,
      parentKey: key,
      childType: row.childtype,
      childName: row.name,
      inheritMaterial
    };

    if (row.index) {
      blockChildData.animationIndex = GLOBALUTIL.getNumberOrDefault(row.index, 0);
      blockChildData.origRow = row;
    }
    if (row.sku)
      blockChildData.sku = row.sku;
    if (row.cameraname)
      blockChildData.cameraName = row.cameraname;
    if (row.origCameraRow)
      blockChildData.origRow = row;
    if (row.realOrigRow)
      blockChildData.origRow = row.realOrigRow;

    if (row.cameratargetblock)
      blockChildData.cameraTargetBlock = row.cameratargetblock;
    if (row.blockflag) blockChildData.blockFlag = row.blockflag;

    console.log(row);
    let childResults = await this.dbSetRecord('blockchild', blockChildData);

    let frameData = {
      parentKey: childResults.key,
      positionX: row.x,
      positionY: row.y,
      positionZ: row.z,
      rotationX: row.rx,
      rotationY: row.ry,
      rotationZ: row.rz,
      scalingX: row.sx,
      scalingY: row.sy,
      scalingZ: row.sz,
      visibility: row.visibility,
      frameOrder: '10',
      frameTime: '0'
    };

    if (row.cameraradius)
      frameData.cameraRadius = row.cameraradius;
    if (row.cameraheightoffset)
      frameData.cameraHeightOffset = row.cameraheightoffset;
    if (row.cameraacceleration)
      frameData.cameraAcceleration = row.cameraacceleration;
    if (row.maxcameraspeed)
      frameData.maxCameraSpeed = row.maxcameraspeed;
    if (row.camerafov)
      frameData.cameraFOV = row.camerafov;
    if (row.camerarotationoffset)
      frameData.cameraRotationOffset = row.camerarotationoffset;
    if (row.startx)
      frameData.cameraOriginX = row.startx;
    if (row.starty)
      frameData.cameraOriginY = row.starty;
    if (row.startz)
      frameData.cameraOriginZ = row.startz;

    return this.dbSetRecord('frame', frameData);
  }
  async addCSVShapeRow(row) {
    let texturename = row.texturepath;
    let bumptexturename = row.bmppath;

    if (row.texturepath) {
      texturename = row.materialname;
      this.dbSetRecord('texture', {
        title: texturename,
        url: row.texturepath,
        uScale: row.scaleu,
        vScale: row.scalev
      }).then(results => {});
    }
    if (row.bmppath) {
      bumptexturename = row.materialname + 'bmp';
      this.dbSetRecord('texture', {
        title: bumptexturename,
        url: row.bmppath,
        uScale: row.scaleu,
        vScale: row.scalev
      }).then(results => {});
    }

    if (row.materialname)
      this.dbSetRecord('material', {
        title: row.materialname,
        ambientColor: row.color,
        ambientTextureName: texturename,
        backFaceCulling: true,
        diffuseColor: row.color,
        diffuseTextureName: texturename,
        emissiveColor: row.color,
        emissiveTextureName: texturename,
        bumpTextureName: bumptexturename
      });

    await this.addParentBlockChild(row);

    return this.dbSetRecord('shape', {
      title: row.name,
      materialName: row.materialname,
      boxHeight: row.height,
      boxWidth: row.width,
      boxDepth: row.depth,
      shapeType: row.shapetype,
      textFontFamily: row.textfontfamily,
      textText: row.texttext,
      textDepth: row.textdepth,
      textSize: row.textsize,
      boxSize: row.boxsize,
      cylinderHeight: row.height,
      cylinderDiameter: row.width,
      cylinderTessellation: row.tessellation,
      cylinderDiameterTop: row.diametertop,
      cylinderDiameterBottom: row.diameterbottom,
      sphereDiameter: row.boxsize,
      sphereSegments: row.tessellation,
      sphereDiameterX: row.width,
      sphereDiameterY: row.height,
      sphereDiameterZ: row.depth
    });
  }
  async addParentBlockChild(row) {
    if (!row.parent)
      return Promise.resolve();

    if (row.parent.substr(0, 9) === '::scene::') {
      let sb = await this.csvFetchSceneBlock();
      row.parent = sb.parent;
    }

    let sceneBC = this.defaultCSVRow();
    sceneBC.asset = 'blockchild';
    sceneBC.childtype = row.asset;
    sceneBC.name = row.name;
    sceneBC.parent = row.parent;
    sceneBC.x = row.x;
    sceneBC.y = row.y;
    sceneBC.z = row.z;
    sceneBC.rx = row.rx;
    sceneBC.ry = row.ry;
    sceneBC.rz = row.rz;
    sceneBC.sx = row.sx;
    sceneBC.sy = row.sy;
    sceneBC.sz = row.sz;

    await this.addCSVRow(sceneBC);

    return Promise.resolve();
  }
  async addCSVBlockChildFrameRow(row) {
    let parentRecords = await this.dbFetchByLookup('block', 'title', row.parent);
    if (parentRecords.records.length < 1) {
      console.log(row.parent, ' - block not found');
      return Promise.resolve();
    }
    let key = parentRecords.recordIds[0];

    let promises = [];
    let bcChildData = await this.dbFetchByLookup('blockchild', 'parentKey', key);
    let children = bcChildData.recordsById;
    for (let c in children) {
      let d = children[c];
      if (d.childType === row.childtype && d.childName === row.name) {
        if (row.y === undefined)
          console.log(row);
        let frameData = {
          parentKey: c,
          positionX: row.x,
          positionY: row.y,
          positionZ: row.z,
          rotationX: row.rx,
          rotationY: row.ry,
          rotationZ: row.rz,
          scalingX: row.sx,
          scalingY: row.sy,
          scalingZ: row.sz,
          visibility: row.visibility,
          frameOrder: row.frameorder,
          frameTime: row.frametime
        };
        promises.push(this.dbSetRecord('frame', frameData));
      }
    }

    return Promise.all(promises);
  }
  async addCSVRowList(rowList) {
    let promises = [];
    for (let c = 0, l = rowList.length; c < l; c++)
      promises.push(this.addCSVRow(rowList[c]));

    return Promise.all(promises);
  }
  async addCSVRow(row) {
    let defaultRow = this.defaultCSVRow();
    row = Object.assign(defaultRow, row);

    switch (row.asset) {
      case 'displaycamera':
        return this.addCSVDisplayCamera(row);
      case 'meshtexture':
        return this.addCSVMeshRow(row);
      case 'block':
        return this.addCSVBlockRow(row);
      case 'blockchild':
        return this.addCSVBlockChildRow(row);
      case 'textplane':
        return this.addCSVTextPlane(row);
      case 'shape':
        return this.addCSVShapeRow(row);
      case 'blockchildframe':
        return this.addCSVBlockChildFrameRow(row);
      case 'animationfinalize':
        return this.addCSVDisplayFinalize(row);
      case 'message':
        return this.addCSVDisplayMessage(row);
      case 'product':
        return this.addCSVDisplayProduct(row);

      case 'shapeandtext':
        return this.addCSVShapeAndText(row);
        //  case 'image':
        //    return this.addCSVDisplayImage(row);
    }

    console.log('type not found', row);
    return;
  }
  async addCSVShapeAndText(row) {
    let height = GLOBALUTIL.getNumberOrDefault(row.height, 1).toFixed(3);
    let width = GLOBALUTIL.getNumberOrDefault(row.width, 1).toFixed(3);
    let depth = GLOBALUTIL.getNumberOrDefault(row.depth, 1).toFixed(3);
    let minDim = Math.min(Math.min(width, height), depth);
    let maxDim = Math.max(Math.max(width, height), depth);
    let blockrow = {
      name: row.name,
      height,
      width,
      depth,
      materialname: ''
    };
    let blockResult = await this.addCSVBlockRow(blockrow);

    let textDepth = GLOBALUTIL.getNumberOrDefault(row.textdepth, .25);
    if (!row.texttextline2)
      row.texttextline2 = '';
    if (!row.texttext)
      row.texttext = '';

    let textLen = Math.max(row.texttext.length, row.texttextline2.length);
    let scale = 2 * width / textLen;
    let positionY = scale * .5;
    let textRow = {
      name: row.name + '_shapeText',
      texttext: row.texttext,
      ry: '-90deg',
      rz: '-90deg',
      sx: scale,
      sy: scale,
      y: positionY.toFixed(3),
      z: (textDepth / 2.0).toFixed(3),
      textfontfamily: row.textfontfamily,
      materialname: row.textmaterial,
      textdepth: textDepth,
      parent: row.name,
      asset: 'shape',
      shapetype: 'text'
    };

    let textRowLine2 = Object.assign({}, textRow);
    textRowLine2.y = (-1 * positionY).toFixed(3);
    textRowLine2.name = textRowLine2.name + '2';
    textRowLine2.texttext = row.texttextline2;

    if (row.texttextline2)
      textRow.y = 0;

    this.addCSVShapeRow(Object.assign(this.defaultCSVRow(), textRow));
    if (row.texttextline2)
      this.addCSVShapeRow(Object.assign(this.defaultCSVRow(), textRowLine2));


    let shapeRow = {};

    if (row.createshapetype === 'box') {
      shapeRow = {
        shapetype: 'box',
        height,
        width,
        depth
      };
    }

    if (row.createshapetype === 'cube') {
      shapeRow = {
        shapetype: 'box',
        boxsize: minDim
      };
    }

    if (row.createshapetype === 'cone' || row.createshapetype === 'cylinder') {
      shapeRow = {
        shapetype: 'cylinder',
        tessellation: row.tessellation,
        width,
        height,
        depth
      }

      if (row.cylinderhorizontal) {
        shapeRow.rz = '90deg';
        shapeRow.height = width;
        shapeRow.width = height;
      }

      if (width !== depth)
        shapeRow.sz = (depth / width).toFixed(3);

      if (row.createshapetype === 'cone')
        shapeRow.diametertop = 0;
    }
    if (row.createshapetype === 'sphere') {
      shapeRow = {
        shapetype: 'sphere',
        boxsize: minDim,
        tessellation: row.tessellation
      };
    }
    if (row.createshapetype === 'ellipsoid') {
      shapeRow = {
        shapetype: 'sphere',
        width,
        height,
        depth,
        tessellation: row.tessellation
      };
    }

    shapeRow.materialname = row.shapematerial;
    shapeRow.parent = row.name;
    shapeRow.name = row.name + "_shape";
    shapeRow.asset = 'shape';
    shapeRow.z = (-1.0 * minDim / 2.0).toFixed(3);

    this.addCSVShapeRow(Object.assign(this.defaultCSVRow(), shapeRow));

    return blockResult;
  }
  async addCSVDisplayProduct(row) {
    let sceneRecords = await this.dbFetchByLookup('block', 'blockFlag', 'scene');
    if (sceneRecords.records.length < 1) {
      console.log('scene (blockFlag) - block not found');
      return Promise.resolve();
    }
    let key = sceneRecords.recordIds[0];
    let sceneData = sceneRecords.records[0];

    let promises = [];
    let blockRow = Object.assign({}, row);
    blockRow.asset = 'block';
    promises.push(this.addCSVRow(blockRow));

    let displayBC = this.defaultCSVRow();
    displayBC.asset = 'blockchild';
    displayBC.childtype = 'block';
    displayBC.name = blockRow.block;
    displayBC.parent = blockRow.name;
    promises.push(this.addCSVRow(displayBC));

    let sceneBC = this.defaultCSVRow();
    sceneBC.asset = 'blockchild';
    sceneBC.childtype = 'block';
    sceneBC.name = blockRow.name;
    sceneBC.parent = sceneData.title;
    sceneBC.x = blockRow.x;
    sceneBC.y = blockRow.y;
    sceneBC.z = blockRow.z;
    sceneBC.rx = blockRow.rx;
    sceneBC.ry = blockRow.ry;
    sceneBC.rz = blockRow.rz;
    sceneBC.sx = blockRow.sx;
    sceneBC.sy = blockRow.sy;
    sceneBC.sz = blockRow.sz;
    sceneBC.index = blockRow.index;
    sceneBC.realOrigRow = row;
    promises.push(this.addCSVRow(sceneBC));

    return Promise.all(promises);
  }
  async addCSVDisplayMessage(row) {
    let sceneRecords = await this.dbFetchByLookup('block', 'blockFlag', 'scene');
    if (sceneRecords.records.length < 1) {
      console.log('scene (blockFlag) - block not found');
      return Promise.resolve();
    }
    let key = sceneRecords.recordIds[0];
    let sceneData = sceneRecords.records[0];

    let textPlaneBlock = this.defaultCSVRow();
    textPlaneBlock.asset = 'textplane';
    textPlaneBlock.name = row.name;
    textPlaneBlock.width = row.width;
    textPlaneBlock.depth = row.depth;
    textPlaneBlock.height = row.height;
    textPlaneBlock.textfontfamily = row.textfontfamily;
    textPlaneBlock.textfontcolor = row.textfontcolor;
    textPlaneBlock.texturetext = row.text1;
    textPlaneBlock.texturetext2 = row.text2;
    textPlaneBlock.textfontsize = row.textfontsize;
    textPlaneBlock.texturetextrendersize = row.texturetextrendersize;
    textPlaneBlock.textfontweight = row.textfontweight;

    let textPlaneBlockBC = this.defaultCSVRow();
    textPlaneBlockBC.asset = 'blockchild';
    textPlaneBlockBC.name = row.name;
    textPlaneBlockBC.childtype = 'block';
    textPlaneBlockBC.parent = sceneData.title;
    textPlaneBlockBC.rx = row.rx;
    textPlaneBlockBC.ry = row.ry;
    textPlaneBlockBC.rz = row.rz;
    textPlaneBlockBC.x = row.x;
    textPlaneBlockBC.y = '-50';
    textPlaneBlockBC.z = row.z;
    textPlaneBlockBC.realOrigRow = row;
    textPlaneBlockBC.index = row.index;

    return Promise.all([
      this.addCSVRow(textPlaneBlock),
      this.addCSVRow(textPlaneBlockBC)
    ]);
  }
  async addCSVTextPlane(row) {
    let promises = [];
    let textPlaneName = row.name + '_textplane';

    let blockWrapper = {
      title: row.name,
      materialName: '',
      height: row.height,
      width: row.width,
      depth: row.depth
    };
    promises.push(this.dbSetRecord('block', blockWrapper)
      .then(r => {
        let textChildBC = this.defaultCSVRow();
        textChildBC.asset = 'blockchild';
        textChildBC.name = textPlaneName;
        textChildBC.childtype = 'shape';
        textChildBC.parent = row.name;
        textChildBC.ry = '90deg';

        return this.addCSVRow(textChildBC);
      }));

    let shapeData = {
      title: textPlaneName,
      materialName: textPlaneName,
      boxHeight: row.height,
      boxWidth: row.width,
      boxDepth: row.depth,
      shapeType: 'plane'
    };
    promises.push(this.dbSetRecord('shape', shapeData));

    if (!row.texturetext)
      row.texturetext = '';
    if (!row.texturetext2)
      row.texturetext2 = '';

    let textureData = {
      textFontFamily: row.textfontfamily,
      hasAlpha: true,
      isText: true,
      textFontColor: row.textfontcolor,
      textureText: row.texturetext,
      textureText2: row.texturetext2,
      url: '',
      title: textPlaneName
    };
    textureData.textFontSize = GLOBALUTIL.getNumberOrDefault(row.textfontsize, 100).toString();
    textureData.textureTextRenderSize = GLOBALUTIL.getNumberOrDefault(row.texturetextrendersize, 512).toString();
    textureData.textFontWeight = row.textfontweight ? row.textfontweight : '';
    textureData.isFittedText = true;

    promises.push(this.dbSetRecord('texture', textureData));

    let materialData = {
      title: textPlaneName,
      ambientColor: '',
      ambientTextureName: textPlaneName,
      backFaceCulling: true,
      diffuseColor: '',
      diffuseTextureName: textPlaneName,
      emissiveColor: '',
      emissiveTextureName: textPlaneName
    };
    promises.push(this.dbSetRecord('material', materialData));

    return Promise.all(promises);
  }
  async __addSignPost(product, productData) {
    let newObjects = [];
    let blockRow = this.defaultCSVRow();
    blockRow.asset = 'block';
    blockRow.height = '1';
    blockRow.width = '2';
    blockRow.depth = '2';
    blockRow.materialname = this.getProductColors().colors[product.colorIndex];
    blockRow.name = product.childName + '_signpost';
    await this.addCSVRow(blockRow);

    let textPlane = this.defaultCSVRow();
    textPlane.asset = 'textplane';
    textPlane.hasalpha = true;
    textPlane.istext = true;
    textPlane.textfontcolor = '0,0,0';
    textPlane.texturetext = product.title;
    textPlane.texturetext2 = product.desc;
    textPlane.width = '10';
    textPlane.height = '10';
    textPlane.depth = '10';
    textPlane.textfontfamily = 'Geneva';
    textPlane.name = product.childName + '_pricedesc';
    newObjects.push(textPlane);

    let blockDescShapeBC = this.defaultCSVRow();
    blockDescShapeBC.asset = 'blockchild';
    blockDescShapeBC.childtype = 'block';
    blockDescShapeBC.parent = blockRow.name;
    blockDescShapeBC.name = textPlane.name;
    blockDescShapeBC.x = '.06';
    blockDescShapeBC.y = '1.5';
    blockDescShapeBC.z = '.5';
    blockDescShapeBC.sx = '.5';
    blockDescShapeBC.sy = '.5';
    blockDescShapeBC.sz = '.5';
    blockDescShapeBC.ry = '180deg';
    newObjects.push(blockDescShapeBC);

    let blockImageShape = this.defaultCSVRow();
    blockImageShape.asset = 'shape';
    blockImageShape.materialname = product.childName + '_signpostimage';
    blockImageShape.name = product.childName + '_signpostimage';
    blockImageShape.scaleu = '1';
    blockImageShape.scalev = '1';
    blockImageShape.shapetype = 'plane';
    blockImageShape.texturepath = product.itemImage;
    blockImageShape.width = '3';
    blockImageShape.height = '3';
    newObjects.push(blockImageShape);

    let blockImageBC = this.defaultCSVRow();
    blockImageBC.asset = 'blockchild';
    blockImageBC.childtype = 'shape';
    blockImageBC.parent = blockRow.name;
    blockImageBC.name = blockImageShape.name;
    blockImageBC.x = '.06';
    blockImageBC.y = '6';
    blockImageBC.ry = '-90deg';
    newObjects.push(blockImageBC);

    let blockSPBC = this.defaultCSVRow();
    blockSPBC.asset = 'blockchild';
    blockSPBC.childtype = 'shape';
    blockSPBC.parent = blockRow.name;
    blockSPBC.name = 'signboard';
    blockSPBC.materialname = 'inherit';
    blockSPBC.y = '5';
    newObjects.push(blockSPBC);

    let blockSP2BC = this.defaultCSVRow();
    blockSP2BC.asset = 'blockchild';
    blockSP2BC.childtype = 'shape';
    blockSP2BC.parent = blockRow.name;
    blockSP2BC.name = 'signpost';
    blockSP2BC.materialname = 'inherit';
    blockSP2BC.x = '-0.05';
    blockSP2BC.y = '1.5';
    newObjects.push(blockSP2BC);

    let blockRowBC = this.defaultCSVRow();
    blockRowBC.asset = 'blockchild';
    blockRowBC.childtype = 'block';
    blockRowBC.parent = product.childName;
    blockRowBC.name = blockRow.name;
    blockRowBC.x = '.1';
    blockRowBC.rz = '10deg';
    blockRowBC.ry = '180deg';
    blockRowBC.y = '-50';
    newObjects.push(blockRowBC);

    await this.addCSVRowList(newObjects);
    //  await this._addSignPost3D(product, productData);

    let showFrame = this.defaultCSVRow();
    showFrame.asset = 'blockchildframe';
    showFrame.name = blockRow.name;
    showFrame.childtype = 'block';
    showFrame.parent = product.childName;
    showFrame.frameorder = '20';
    showFrame.frametime = (product.startShowTime * 1000).toFixed(0) + 'cp700';
    showFrame.y = '2';

    let hideFrame = this.defaultCSVRow();
    hideFrame.asset = 'blockchildframe';
    hideFrame.name = blockRow.name;
    hideFrame.childtype = 'block';
    hideFrame.parent = product.childName;
    hideFrame.frameorder = '30';
    hideFrame.frametime = (product.endShowTime * 1000).toFixed(0) + 'cp700';
    hideFrame.y = '-50';

    let endFrame = this.defaultCSVRow();
    endFrame.asset = 'blockchildframe';
    endFrame.name = blockRow.name;
    endFrame.childtype = 'block';
    endFrame.parent = product.childName;
    endFrame.frameorder = '40';
    endFrame.frametime = (productData.runLength * 1000).toFixed(0);
    endFrame.y = '-50';

    return Promise.all([
      this.addCSVRow(showFrame),
      this.addCSVRow(hideFrame),
      this.addCSVRow(endFrame)
    ]);
  }
  async _addSignPost3D(product, productData) {
    let parent = product.childName + '_signpost';
    let priceText = this.defaultCSVRow();
    priceText.asset = 'shape';
    priceText.name = parent + '_3ddesc';
    priceText.materialname = 'decolor: .5,.1,.1';
    priceText.shapetype = 'text';
    priceText.textfontfamily = 'Arial';
    priceText.texttext = product.desc;
    priceText.textdepth = '.1';
    priceText.textsize = '100';
    priceText.parent = parent;
    priceText.y = '2';
    priceText.x = '.5';
    priceText.ry = '0deg';
    priceText.rz = '-90deg';

    let descText = this.defaultCSVRow();
    descText.asset = 'shape';
    descText.name = parent + '_3ddesc';
    descText.materialname = 'decolor: .5,.1,.1';
    descText.shapetype = 'text';
    descText.textfontfamily = 'Times';
    descText.texttext = product.desc;
    descText.textdepth = '.1';
    descText.textsize = '100';
    descText.parent = parent;
    descText.y = '2';
    descText.x = '.5';
    descText.ry = '0deg';
    descText.rz = '-90deg';
    await this.addCSVRow(descText);

    return Promise.all([
      this.addCSVRow(priceText),
    ]);
    /*
    promises.push(gAPPP.a.modelSets['shape'].createWithBlobString({
      title: product.titleShape,
      materialName: 'decolor: .1,.5,.5',
      shapeType: 'text',
      textFontFamily: 'Times',
      textText: product.title,
      textDepth: '.3',
      textSize: 100
    }));

    promises.push(gAPPP.a.modelSets['blockchild'].createWithBlobString({
      parentKey: product.blockId,
      childType: 'shape',
      childName: product.priceShape,
      inheritMaterial: false
    }).then(childResults => {
      product.priceBlockChildKey = childResults.key;

      return gAPPP.a.modelSets['frame'].createWithBlobString({
        parentKey: product.priceBlockChildKey,
        positionX: '',
        positionY: '2',
        positionZ: '',
        rotationX: '',
        rotationY: '180deg',
        rotationZ: '-90deg',
        scalingX: '',
        scalingY: '',
        scalingZ: '',
        visibility: '',
        frameOrder: 10,
        frameTime: 0
      });
    }));

    promises.push(gAPPP.a.modelSets['blockchild'].createWithBlobString({
      parentKey: product.blockId,
      childType: 'shape',
      childName: product.titleShape,
      inheritMaterial: false
    }).then(childResults => {
      product.titleBlockChildKey = childResults.key;
      return gAPPP.a.modelSets['frame'].createWithBlobString({
        parentKey: product.titleBlockChildKey,
        positionX: '',
        positionY: '3',
        positionZ: '',
        rotationX: '',
        rotationY: '180deg',
        rotationZ: '-90deg',
        scalingX: '',
        scalingY: '',
        scalingZ: '',
        visibility: '',
        frameOrder: 10,
        frameTime: 0
      })
    }));
*/

  }



  async __addTextShowHide(product, productData, origRow) {
    let childName = product.childName;

    let showFrame = this.defaultCSVRow();
    showFrame.asset = 'blockchildframe';
    showFrame.name = childName;
    showFrame.childtype = 'block';
    showFrame.parent = productData.sceneBlock.title;
    showFrame.frameorder = '20';
    showFrame.frametime = (product.startShowTime * 1000).toFixed(0) + 'cp700';
    showFrame.y = origRow.y;

    let hideFrame = this.defaultCSVRow();
    hideFrame.asset = 'blockchildframe';
    hideFrame.name = childName;
    hideFrame.childtype = 'block';
    hideFrame.parent = productData.sceneBlock.title;
    hideFrame.frameorder = '30';
    hideFrame.frametime = (product.endEnlargeTime * 1000).toFixed(0) + 'cp700';
    hideFrame.y = '-50';

    let endFrame = this.defaultCSVRow();
    endFrame.asset = 'blockchildframe';
    endFrame.name = product.childName;
    endFrame.childtype = 'block';
    endFrame.parent = productData.sceneBlock.title;
    endFrame.frameorder = '40';
    endFrame.frametime = (productData.runLength * 1000).toFixed(0);
    endFrame.y = '-50';

    return Promise.all([
      this.addCSVRow(showFrame),
      this.addCSVRow(hideFrame),
      this.addCSVRow(endFrame)
    ]);
  }
  async addCSVDisplayCamera(row) {
    let sceneRecords = await this.dbFetchByLookup('block', 'blockFlag', 'scene');
    if (sceneRecords.records.length < 1) {
      console.log('scene (blockFlag) - block not found');
      return Promise.resolve();
    }
    let sceneData = sceneRecords.records[0];
    let key = sceneRecords.recordIds[0];

    let childCSVRows = [];
    let cameraBlock = this.defaultCSVRow();
    cameraBlock.asset = 'block';
    cameraBlock.name = row.name + '_followblock';
    cameraBlock.width = '1';
    cameraBlock.depth = '1';
    cameraBlock.height = '1';
    cameraBlock.introtime = row.introtime;
    cameraBlock.finishdelay = row.finishdelay;
    cameraBlock.runlength = row.runlength;
    childCSVRows.push(cameraBlock);

    let cameraBlockBC = this.defaultCSVRow();
    cameraBlockBC.asset = 'blockchild';
    cameraBlockBC.name = cameraBlock.name;
    cameraBlockBC.childtype = 'block';
    cameraBlockBC.parent = sceneData.title;
    cameraBlockBC.rx = row.startrx;
    cameraBlockBC.ry = row.startry;
    cameraBlockBC.rz = row.startrz;
    cameraBlockBC.x = row.startx;
    cameraBlockBC.y = row.starty;
    cameraBlockBC.z = row.startz;
    childCSVRows.push(cameraBlockBC);

    let cam = this.defaultCSVRow();
    cam.asset = 'blockchild';
    cam.cameraacceleration = '.005';
    cam.camerafov = '0.8';
    cam.cameraname = "demo";
    cam.cameraradius = row.cameraradius;
    cam.cameraheightoffset = row.cameraheightoffset;
    cam.camerarotationoffset = '0';
    cam.maxcameraspeed = '10';
    cam.cameratargetblock = "block:" + cameraBlock.name;
    cam.childtype = 'camera';
    cam.name = row.name;
    cam.parent = sceneData.title;
    cam.rx = row.rx;
    cam.ry = row.ry;
    cam.rz = row.rz;
    cam.x = row.x;
    cam.y = row.y;
    cam.z = row.z;
    cam.startx = row.startx;
    cam.starty = row.starty;
    cam.startz = row.startz;
    cam.origCameraRow = row;
    childCSVRows.push(cam);

    return this.addCSVRowList(childCSVRows);
  }
  async __addCSVFollowBlock(productData) {
    let sceneRecords = await this.dbFetchByLookup('block', 'blockFlag', 'scene');
    if (sceneRecords.records.length < 1) {
      console.log('scene (blockFlag) - block not found');
      return Promise.resolve();
    }
    let key = sceneRecords.recordIds[0];
    let sceneData = sceneRecords.records[0];

    let cameraRow = productData.cameraOrigRow;
    let frameRows = [];
    let frameOrder = 20;
    let frameTime = productData.introTime;
    let cpTime = cameraRow.cameramovetime ? 'cp' + cameraRow.cameramovetime : '';

    if (!productData.products)
      productData.products = [];
    for (let c = 0, l = productData.products.length; c <= l + 1; c++) {
      let cameraBlockFrame = this.defaultCSVRow();

      cameraBlockFrame.asset = 'blockchildframe';
      cameraBlockFrame.name = cameraRow.name + '_followblock';
      cameraBlockFrame.childtype = 'block';
      cameraBlockFrame.parent = sceneData.title;
      cameraBlockFrame.frameorder = frameOrder.toString();

      if (c < l) {
        let p = productData.productsRecords[c].origRow;
        let product = productData.products[c];
        cameraBlockFrame.x = p.x;
        if (product.itemId)
          cameraBlockFrame.y = (GLOBALUTIL.getNumberOrDefault(p.y, 0) + 2).toString();
        else
          cameraBlockFrame.y = p.y;

        cameraBlockFrame.z = p.z;
        cameraBlockFrame.rx = p.rx;
        cameraBlockFrame.ry = p.ry;
        cameraBlockFrame.rz = p.rz;
        cameraBlockFrame.sx = p.sx;
        cameraBlockFrame.sy = p.sy;
        cameraBlockFrame.sz = p.sz;
        cameraBlockFrame.frametime = (frameTime * 1000).toFixed(0) + cpTime;
      } else {
        cameraBlockFrame.x = cameraRow.x;
        cameraBlockFrame.y = cameraRow.y;
        cameraBlockFrame.z = cameraRow.z;
        cameraBlockFrame.rx = cameraRow.rx;
        cameraBlockFrame.ry = cameraRow.ry;
        cameraBlockFrame.rz = cameraRow.rz;
        cameraBlockFrame.sx = cameraRow.sx;
        cameraBlockFrame.sy = cameraRow.sy;
        cameraBlockFrame.sz = cameraRow.sz;
        if (c === l)
          cameraBlockFrame.frametime = (frameTime * 1000).toFixed(0) + cpTime;
        else
          cameraBlockFrame.frametime = (productData.runLength * 1000).toFixed(0);
      }

      frameOrder += 10;
      frameTime += productData.incLength;

      frameRows.push(cameraBlockFrame);
    }

    return this.addCSVRowList(frameRows);
  }
  defaultCSVRow() {
    return {
      ambient: "",
      asset: "",
      bmppath: "",
      childtype: "",
      color: "",
      depth: "",
      diffuse: "",
      emissive: "",
      frametime: "",
      height: "",
      count: "",
      text1: "",
      sku: "",
      index: "",
      price: "",
      text2: "",
      materialname: "",
      meshpath: "",
      name: "",
      parent: "",
      rx: "",
      ry: "",
      rz: "",
      scaleu: "",
      scalev: "",
      shapetype: "",
      sx: "",
      sy: "",
      sz: "",
      texturepath: "",
      image: '',
      visibility: "",
      width: "",
      x: "",
      y: "",
      z: "",
      textfontfamily: '',
      textfontcolor: '',
      startx: '',
      starty: '',
      startz: '',
      startrx: '',
      startry: '',
      startrz: '',
      textfontfamily: '',
      texttext: '',
      textdepth: '',
      textsize: ''
    };
  }
  basketPosition(index) {
    let z = index % 2 * 3 - 1.5;
    let x = Math.floor(index % 4 / 2) * 3 - 1.5;
    let y = Math.floor(index / 4) * 2 + 1;

    return {
      x,
      y,
      z
    };
  }
  async addCSVBasketProducts() {
    let baskets = await this.dbFetchByLookup('block', 'blockFlag', 'basket');
    if (baskets.records.length < 1) {
      console.log('basket - block not found');
      return Promise.resolve();
    }
    let basketInfo = baskets.records[0];
    let productInfo = await this.initProducts();

    let basketName = basketInfo.title;
    let promises = [];
    let productsBySKU = productInfo.productsBySKU;

    let positionIndex = 0;
    for (let i in productsBySKU) {

      if (!productsBySKU[i].itemId)
        continue;

      let pos = this.basketPosition(positionIndex);
      positionIndex++;
      let row = {
        asset: 'blockchild',
        materialname: '',
        parent: basketName,
        childtype: 'block',
        sku: productsBySKU[i].itemId,
        name: productsBySKU[i].block,
        inheritmaterial: false,
        x: pos.x.toString(),
        y: pos.y.toString(),
        z: pos.z.toString(),
        rx: '',
        ry: '',
        rz: '',
        sx: '.45',
        sy: '.45',
        sz: '.45',
        visibility: ''
      };

      promises.push(this.addCSVRow(row));
    }

    return Promise.all(promises);
  }
  async addCSVDisplayFinalize() {
    let pInfo = await this.initProducts();
    await this.__addCSVFollowBlock(pInfo);

    let promises = [];
    if (!pInfo.products)
      pInfo.products = [];
    for (let c = 0, l = pInfo.products.length; c < l; c++)
      if (pInfo.products[c].itemId)
        promises.push(this.__addSignPost(pInfo.products[c], pInfo));
      else {
        let origRow = pInfo.productsRecords[c].origRow;
        promises.push(this.__addTextShowHide(pInfo.products[c], pInfo, origRow));
      }

    if (!pInfo.sceneId)
      return Promise.resolve();

    let frameRecords = await this.dbFetchByLookup('frame', 'parentKey', pInfo.sceneId);

    if (frameRecords.records.length <= 0)
      return Promise.resolve();

    let frameId = frameRecords.recordIds[0];
    promises.push(
      this.dbSetRecordFields('frame', {
        frameTime: (pInfo.runLength * 1000).toString()
      }, frameId));

    promises.push(this.addCSVBasketProducts());

    return Promise.all(promises);
  }
  async initProducts(cameraData = null) {
    let result = await firebase.database().ref(this.path('blockchild'))
      .orderByChild('animationIndex')
      .startAt(-100000)
      .once('value');
    let recordsById = result.val();
    let recordIds = [];
    let records = [];
    for (let key in recordsById) {
      recordIds.push(key);
      records.push(recordsById[key]);
    }

    let productsRecords = records;
    let sceneRecords = await this.dbFetchByLookup('block', 'blockFlag', 'scene');
    if (sceneRecords.records.length < 1) {
      return Promise.resolve({
        productsRecords
      });
    }
    let sceneId = sceneRecords.recordIds[0];
    let sceneBlock = sceneRecords.records[0];
    let products = [];
    let productsBySKU = {};
    productsRecords = productsRecords.sort((a, b) => {
      let aIndex = GLOBALUTIL.getNumberOrDefault(a.animationIndex, 0);
      let bIndex = GLOBALUTIL.getNumberOrDefault(b.animationIndex, 0);
      if (aIndex > bIndex)
        return 1;
      if (aIndex < bIndex)
        return -1;
      return 0;
    });

    for (let c = 0, l = productsRecords.length; c < l; c++) {
      let pBC = productsRecords[c];
      let obj = await this.findMatchBlocks(pBC.childType, pBC.childName, sceneId);
      if (!obj[0]) {
        console.log(pBC.childType, pBC.childName, sceneId, 'not found');
        continue;
      }
      let blockData = obj[0].blockData;

      let origRow = pBC.origRow;
      if (origRow.realOrigRow)
        origRow = origRow.realOrigRow;

      let p = {
        itemId: blockData.itemId,
        title: blockData.itemTitle,
        itemCount: blockData.itemCount,
        itemImage: blockData.itemImage,
        desc: blockData.itemDesc,
        price: blockData.itemPrice,
        image: blockData.texturePath,
        animationIndex: pBC.animationIndex,
        block: origRow.block,
        childName: pBC.childName,
        childType: pBC.childType,
        origRow
      };
      products.push(p);
      if (p.itemId)
        productsBySKU[p.itemId] = p;
    }

    let cameraBC = await this.findMatchBlocks('camera', 'FollowCamera', sceneId);
    let cameraOrigRow = null;
    if (cameraBC[0])
      cameraOrigRow = cameraBC[0].BC.origRow.origCameraRow;

    if (!cameraData)
      cameraData = cameraOrigRow;

    let finishDelay = 0,
      introTime = 0,
      runLength = 60;
    if (cameraData) {
      finishDelay = GLOBALUTIL.getNumberOrDefault(cameraData.finishdelay, 0);
      introTime = GLOBALUTIL.getNumberOrDefault(cameraData.introtime, 0);
      runLength = GLOBALUTIL.getNumberOrDefault(cameraData.runlength, 60);
    }

    let blocksData = await this.dbFetchByLookup('block', 'blockFlag', 'displayblock');
    let displayBs = blocksData.recordsById;
    let displayBlocks = [];
    for (let blockKey in displayBs)
      displayBlocks.push(displayBs[blockKey].title);

    let productCount = products.length;
    let productsShownAtOnce = 3;
    let numberOfButtons = 4;
    let productRunTime = runLength - introTime - finishDelay;
    let incLength = productRunTime / productCount;
    for (let postC = 0, postL = products.length; postC < postL; postC++) {
      products[postC].colorIndex = postC % 4;
      products[postC].startShowTime = postC * incLength + introTime;
      products[postC].startEnlargeTime = products[postC].startShowTime;
      products[postC].endShowTime = productsShownAtOnce * incLength + products[postC].startShowTime;
      if (products[postC].endShowTime > runLength)
        products[postC].endShowTime = runLength;
      products[postC].endEnlargeTime = incLength + products[postC].startShowTime;
    }

    let pInfo = {
      products,
      productsBySKU,
      productsRecords,
      sceneId,
      productsShownAtOnce,
      numberOfButtons,
      runLength,
      incLength,
      productRunTime,
      introTime,
      finishDelay,
      cameraOrigRow,
      displayBlocks,
      sceneBlock
    };
    return pInfo;
  }
  async findMatchBlocks(childType, childName, parentId, filterKey, filterValue) {
    let bcData = await this.dbFetchByLookup('blockchild', 'parentKey', parentId);
    let children = bcData.recordsById;
    let blocks = [];
    let blockChildQueries = [];
    for (let i in children) {
      if (children[i].childType === childType && children[i].childName === childName) {
        if (filterKey)
          if (children[i][filterKey] !== filterValue)
            continue;

        let blockData = null;
        let blockKey = null;
        if (['mesh', 'block', 'blockchild', 'texture', 'shape', 'material', 'frame'].indexOf(childType) !== -1) {
          let childData = await this.dbFetchByLookup(childType, 'title', childName);
          blockData = childData.records[0];
          blockKey = childData.recordIds[0];
        }
        blocks.push({
          blockData,
          BC: children[i],
          blockKey,
          BCKey: i
        });
      }

      blockChildQueries.push(this.findMatchBlocks(childType, childName, i));
    }

    let childResults = await Promise.all(blockChildQueries);
    for (let c = 0, l = blockChildQueries.length; c < l; c++) {
      blocks.concat(childResults[c]);
    }

    return blocks;
  }
  async importRows(rows) {
    if (!rows)
      return Promise.resolve();

    let promises = [];
    for (let c = 0, l = rows.length; c < l; c++) {
      promises.push(this.addCSVRow(rows[c]));
    }

    return Promise.all(promises);
  }
}
