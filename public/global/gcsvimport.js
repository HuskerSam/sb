class gCSVImport {
  constructor(projectId = 'default') {
    this.projectId = projectId;
    this.node = false;
    if (typeof module !== 'undefined' && module.exports) {
      this.firebase = require("firebase-admin");
      this.node = true;
    } else {
      this.firebase = firebase;
    }
  }
  getNumberOrDefault(val, d) {
    if (this.node) {
      return this.globalUtil.getNumberOrDefault(val, d);
    } else {
      return GLOBALUTIL.getNumberOrDefault(val, d);
    }
  }
  path(eleType) {
    return '/project/' + this.projectId + '/' + eleType;
  }
  async dbFetchByLookup(type, field, value) {
    return this.firebase.database().ref(this.path(type))
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
    return this.firebase.database().ref().update(updates);
  }
  async dbSetRecord(type, data, id) {
    if (type === 'material') {
      if (data.title.substring(0, 8) === 'decolor:' ||
        data.title.substring(0, 7) === 'ecolor:' ||
        data.title.substring(0, 6) === 'color:' ||
        data.title === 'inherit')
        return {
          key: null
        };
    }
    if (type === 'texture') {
      if (data.title.substring(0, 3) === 'sb:')
        return {
          key: null
        };
    }

    if (!id)
      id = this.firebase.database().ref().child(this.path(type)).push().key;
    let updates = {};
    data.sortKey = new Date().getTime();
    updates['/' + this.path(type) + '/' + id] = data;

    if (data)
      for (let i in data)
        if (data[i] === undefined) delete data[i];

    await this.firebase.database().ref().update(updates);

    return Promise.resolve({
      key: id
    });
  }
  async dbSetRecordFields(type, data, id) {
    if (!id)
      id = this.firebase.database().ref().child(this.path(type)).push().key;
    let updates = {};
    for (let i in data)
      updates['/' + this.path(type) + '/' + id + '/' + i] = data[i];
    await this.firebase.database().ref().update(updates);

    return Promise.resolve({
      key: id
    });
  }
  async dbFetchListByLookup(type, field, value) {
    return this.firebase.database().ref(this.path(type))
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
    let storageRef = this.firebase.storage().ref();
    let ref = storageRef.child(this.referencePath + '/' + id + '/' + filename);
    return ref.putString(dataString)
  }
  async setBlob(id, blob, filename) {
    let storageRef = this.firebase.storage().ref();
    let ref = storageRef.child(this.referencePath + '/' + id + '/' + filename)
    return ref.put(blob);
  }
  getProductColors() {
    let colors = [
      'color: 1.25,0,0',
      'color: 0,2,0',
      'color: 0,0,2',
      'color: 6,6,0'
    ];
    let buttonColors = [
      'rgb(127,0,0)',
      'rgb(0,255,0)',
      'rgb(0,0,255)',
      'rgb(255,255,0)'
    ];
    let buttonForeColors = [
      'rgb(255,255,255)',
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

    if (row.materialname && row.texturepath) {
      let textureName = row.name + 'material';
      let hasAlpha = false;
      if (row.hasalpha === 'x')
        hasAlpha = true;
      let textureData = {
        title: textureName,
        url: row.texturepath,
        hasAlpha
      };
      this.dbSetRecord('texture', textureData);

      let diffuseColor = '';
      let diffuseTextureName = '';
      diffuseColor = row.color;
      diffuseTextureName = textureName;

      let ambientColor = '';
      let ambientTextureName = '';
      if (row.ambient === 'x') {
        ambientColor = row.color;
        ambientTextureName = textureName;
      }
      if (row.ambientpath) {
        ambientTextureName = row.ambientpath;
      }
      let emissiveColor = '';
      let emissiveTextureName = '';
      if (row.emissive === 'x') {
        emissiveColor = row.color;
        emissiveTextureName = textureName;
      }
      if (row.emissivepath) {
        emissiveTextureName = row.emissivepath;
      }
      let specularColor = '0,0,0';
      let specularTextureName = '';
      let specularPower = "";
      let useSpecularOverAlpha = false;
      if (row.specular === 'x') {
        specularColor = row.color;
        specularTextureName = textureName;
        useSpecularOverAlpha = true;
      }
      if (row.specularpath) {
        specularTextureName = row.specularpath;
        useSpecularOverAlpha = true;
        specularPower = "2";
      }
      if (row.specularpower)
        specularPower = row.specularpower;

      let materialData = {
        title: row.materialname,
        ambientColor,
        ambientTextureName,
        backFaceCulling: true,
        diffuseColor,
        diffuseTextureName,
        emissiveColor,
        emissiveTextureName,
        specularColor,
        specularTextureName,
        bumpTextureName: row.bmppath,
        useSpecularOverAlpha,
        specularColor,
        specularPower
      };
      promises.push(this.dbSetRecord('material', materialData));
    }

    let results = await Promise.all(promises);

    let childRow = Object.assign({}, row);
    row.asset = 'mesh';
    this.addParentBlockChild(row);

    return results[0];
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
      blockData.isPickable = true;
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

    this.addParentBlockChild(row);

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
    if (row.parent.substr(0, 9) === '::scene::') {
      let sb = await this.csvFetchSceneBlock();
      row.parent = sb.parent;
    }

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

    if (row.latitude)
      blockChildData.latitude = row.latitude;
    if (row.longitude)
      blockChildData.longitude = row.longitude;

    if (row.index) {
      blockChildData.animationIndex = this.getNumberOrDefault(row.index, 0);
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
    if (row.cameraaimtarget)
      blockChildData.cameraAimTarget = row.cameraaimtarget;
    if (row.blockflag) blockChildData.blockFlag = row.blockflag;

    let childResults = await this.dbSetRecord('blockchild', blockChildData);

    let frameTime = row.frametime;
    if (!frameTime)
      frameTime = '0';

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
      frameTime
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
      if (!row.uoffset) row.uoffset = '';
      if (!row.voffset) row.voffset = '';
      if (!row.scaleu) row.scaleu = '';
      if (!row.scalev) row.scalev = '';
      this.dbSetRecord('texture', {
        title: texturename,
        url: row.texturepath,
        uScale: row.scaleu,
        vScale: row.scalev,
        uOffset: row.uoffset,
        vOffset: row.voffset
      }).then(results => {});
    }
    if (row.bmppath) {
      bumptexturename = row.materialname + 'bmp';
      this.dbSetRecord('texture', {
        title: bumptexturename,
        url: row.bmppath,
        uScale: row.scaleu,
        vScale: row.scalev,
        uOffset: row.uoffset,
        vOffset: row.voffset
      }).then(results => {});
    }

    if (row.materialname && row.texturepath) {
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
    }

    this.addParentBlockChild(row);

    let shapeData = {
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
    };

    if (row.shapetype === 'torus') {
      shapeData.torusDiameter = row.width;
      shapeData.torusThickness = row.height;
      shapeData.torusTessellation = row.tessellation;
    }

    return this.dbSetRecord('shape', shapeData);
  }
  async addParentBlockChild(row) {
    if (!row.parent)
      return;

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
    sceneBC.materialname = row.materialname;

    return this.addCSVRow(sceneBC);
  }
  async _getBlockChildren(blockTitle, childType, childName) {
    if (blockTitle.substr(0, 9) === '::scene::') {
      let sb = await this.csvFetchSceneBlock();
      blockTitle = sb.parent;
    }

    let parentRecords = await this.dbFetchByLookup('block', 'title', blockTitle);
    if (parentRecords.records.length < 1) {
      console.log(row.parent, ' - block not found');
      return [];
    }
    let key = parentRecords.recordIds[0];
    let bcChildData = await this.dbFetchByLookup('blockchild', 'parentKey', key);
    let children = bcChildData.recordsById;
    let matchingChildren = {};
    for (let c in children) {
      let d = children[c];
      if (d.childType === childType && d.childName === childName)
        matchingChildren[c] = children[c];
    }
    return matchingChildren;
  }
  async addCSVBlockChildFrameRow(row) {
    let children = await this._getBlockChildren(row.parent, row.childtype, row.name);

    let promises = [];
    if (row.y === undefined)
      console.log(row);

    for (let parentKey in children) {
      let frameData = {
        parentKey,
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
      case 'connectorline':
        return this.addCSVConnectorLine(row);
      case 'animatedline':
        return this.addCSVAnimatedLine(row);
      case 'sceneblock':
        return this.addCSVSceneBlock(row);
      case 'material':
        return this.addCSVMaterial(row);
    }

    console.log('type not found', row.asset, row);
    return;
  }
  async addCSVMaterial(row) {
    let materialName = row.name;
    let textureName = '';
    if (row.texture) {
      textureName = row.name + '_texture';
      let textureData = {
        title: textureName,
        url: row.texture,
        vScale: row.scalev,
        uScale: row.scaleu
      };

      if (row.hasalpha.toString() === '1') {
        textureData.hasAlpha = true;
      }
      this.dbSetRecord('texture', textureData);
    }

    let bumpTextureName = '';
    if (row.bumptexture) {
      bumpTextureName = row.name + '_Ntexture';
      let textureData = {
        title: bumpTextureName,
        url: row.bumptexture,
        vScale: row.scalev,
        uScale: row.scaleu
      };
      this.dbSetRecord('texture', textureData);
    }

    let specularTextureName = '';
    if (row.speculartexture) {
      specularTextureName = row.name + '_Stexture';
      let textureData = {
        title: specularTextureName,
        url: row.speculartexture,
        vScale: row.scalev,
        uScale: row.scaleu
      };
      this.dbSetRecord('texture', textureData);
    }

    let ambientTextureName = row.ambient === 'x' ? textureName : '';
    let emissiveTextureName = row.emissive === 'x' ? textureName : '';
    let specularPower = '4';
    if (row.specularpower)
      specularPower = row.specularpower;
    if (row.ambienttexture)
      ambientTextureName = row.ambienttexture;
    if (row.emissivetexture)
      emissiveTextureName = row.emissivetexture;

    let materialData = {
      title: row.name,
      diffuseTextureName: textureName,
      ambientTextureName,
      emissiveTextureName,
      bumpTextureName,
      specularTextureName,
      specularPower,
      ambientColor: '',
      backFaceCulling: true,
      diffuseColor: '',
      emissiveColor: ''
    };
    return await this.dbSetRecord('material', materialData);
  }
  async addCSVAnimatedLine(row) {
    let dashes = this.getNumberOrDefault(row.dashes, 1);
    let runlength = this.getNumberOrDefault(row.runlength, 2000);
    let width = this.getNumberOrDefault(row.width, 1);
    let height = this.getNumberOrDefault(row.height, 1);
    let depth = this.getNumberOrDefault(row.depth, 10);
    let dashlength = this.getNumberOrDefault(row.dashlength, 1);

    if (width <= 0.0)
      width = 0.001;
    if (height <= 0.0)
      height = 0.001;
    if (depth <= 0.0)
      depth = 0.001;

    let blockrow = {
      name: row.name,
      height,
      width,
      depth,
      materialname: row.material,
      frametime: runlength
    };
    let blockResult = await this.addCSVBlockRow(blockrow);

    let shaperow = {
      width,
      dashlength,
      height,
      createshapetype: row.dotshape,
      shapematerial: '',
      tessellation: row.tessellation,
      name: row.name + 'linenode'
    };

    if (shaperow.createshapetype === 'cone' || shaperow.createshapetype === 'cylinder') {
      let h = shaperow.height;
      shaperow.height = dashlength;
      shaperow.depth = h;
    }

    let childType = 'shape';
    if (row.dotshape === 'arrow') {
      childType = 'block';
      this.addCSVConnectorLine({
        name: shaperow.name,
        asset: 'connectorline',
        length: dashlength,
        diameter: width / 3,
        pointshape: 'cone',
        pointlength: dashlength / 4,
        pointdiameter: width,
        pointtessellation: '',
        pointmaterial: '',
        tailshape: 'none'
      });
    } else
      this.addCSVShapeRow(this.__childShapeRow(shaperow));

    let timePerDash = runlength / dashes;
    let z = (depth / 2.0).toFixed(3);

    for (let i = 0; i < dashes; i++) {
      let childResults = await this.dbSetRecord('blockchild', {
        childType,
        childName: shaperow.name,
        parentKey: blockResult.key,
        inheritMaterial: true
      });

      let frameOrder = 10;
      let frame = {
        parentKey: childResults.key,
        visibility: ''
      };
      let zLen = z * 2;
      let minZTime = i * timePerDash;
      let startPos = (-0.5 * zLen) + (i * timePerDash / runlength * zLen);
      frame.positionZ = startPos;
      frame.frameOrder = frameOrder.toString();
      frame.frameTime = "0";
      if (shaperow.createshapetype === 'cone' || shaperow.createshapetype === 'cylinder') {
        frame.rotationX = '90deg';
        if (height !== width)
          frame.scalingZ = (height / width).toFixed(3);
      }
      if (shaperow.createshapetype === 'arrow') {
        frame.rotationY = '90deg';
      }
      this.dbSetRecord('frame', frame);
      frameOrder += 10;

      if (minZTime > .001) {
        let zh = zLen / 2.0;
        let iTime = runlength - minZTime;
        frame.frameTime = (iTime / runlength * 100.0).toFixed(2).toString() + '%';
        frame.frameOrder = frameOrder.toString();
        frame.positionZ = zh.toFixed(3);
        this.dbSetRecord('frame', frame);
        frameOrder += 10;

        frame.frameTime = ((iTime + 5) / runlength * 100.0).toFixed(2).toString() + '%';
        frame.frameOrder = frameOrder.toString();
        frame.positionZ = (-1.0 * zh).toFixed(3);
        this.dbSetRecord('frame', frame);
        frameOrder += 10;
      }

      frame.positionZ = startPos + zLen;
      if (frame.positionZ > (zLen / 2.0))
        frame.positionZ -= zLen;
      frame.frameOrder = frameOrder.toString();
      frame.frameTime = '100%';
      this.dbSetRecord('frame', frame);
    }

    return blockResult;
  }
  async addCSVConnectorLine(row) {
    row.length = this.getNumberOrDefault(row.length, 1);
    row.diameter = this.getNumberOrDefault(row.diameter, 1);
    row.pointlength = this.getNumberOrDefault(row.pointlength, 1);
    row.pointdiameter = this.getNumberOrDefault(row.pointdiameter, 1);
    row.taillength = this.getNumberOrDefault(row.taillength, 1);
    row.taildiameter = this.getNumberOrDefault(row.taildiameter, 1);

    let adjPointLength = row.pointlength;
    let adjPointDiameter = row.pointdiameter;
    if (row.pointshape === 'none') {
      adjPointLength = 0;
      adjPointDiameter = 0;
    }
    let adjTailLength = row.taillength;
    let adjTailDiameter = row.taildiameter;
    if (row.tailshape === 'none') {
      adjTailLength = 0;
      adjTailDiameter = 0;
    }

    let depth = Math.max(row.diameter, Math.max(adjTailDiameter, adjPointDiameter));
    let height = depth;
    let width = row.length + adjPointLength / 2.0 + adjTailLength / 2.0;

    let blockrow = {
      name: row.name,
      height,
      width,
      depth,
      materialname: ''
    };
    let blockResult = await this.addCSVBlockRow(blockrow);

    let lineRow = {
      width: row.diameter,
      tessellation: row.tessellation,
      height: row.length,
      depth: row.diameter,
      shapematerial: row.material,
      cylinderhorizontal: false,
      createshapetype: 'cylinder',
      name: row.name + '_lineshape',
      parent: row.name,
      rz: '90deg',
      rx: '90deg'
    };
    this.addCSVShapeRow(this.__childShapeRow(lineRow));

    let pointRow = {
      width: row.pointdiameter,
      tessellation: row.pointtessellation,
      height: row.pointlength,
      depth: row.pointdiameter,
      shapematerial: row.pointmaterial,
      createshapetype: row.pointshape,
      name: row.name + '_pointshape',
      parent: row.name,
      rz: '90deg',
      x: -1.0 * row.length / 2.0
    };
    if (row.pointshape === 'cone' || row.pointshape === 'cylinder')
      pointRow.rY = '90deg';
    if (row.pointshape !== 'none')
      this.addCSVShapeRow(this.__childShapeRow(pointRow));

    let tailrz = '90deg';
    if (row.tailshapeflip)
      tailrz = '-90deg';
    let tailRow = {
      width: row.taildiameter,
      tessellation: row.tailtessellation,
      height: row.taillength,
      depth: row.taildiameter,
      shapematerial: row.tailmaterial,
      createshapetype: row.tailshape,
      name: row.name + '_tailshape',
      parent: row.name,
      rz: tailrz,
      x: row.length / 2.0
    };
    if (row.tailshape === 'cone' || row.tailshape === 'cylinder')
      tailRow.rY = '90deg';

    if (row.tailshape !== 'none')
      this.addCSVShapeRow(this.__childShapeRow(tailRow));

    return blockResult;
  }
  async addCSVShapeAndText(row) {
    let height = this.getNumberOrDefault(row.height, 1).toFixed(3);
    let width = this.getNumberOrDefault(row.width, 1).toFixed(3);
    let depth = this.getNumberOrDefault(row.depth, 1).toFixed(3);
    let minDim = Math.min(Math.min(width, height), depth);

    let blockrow = {
      name: row.name,
      height,
      width,
      depth,
      materialname: ''
    };
    let blockResult = await this.addCSVBlockRow(blockrow);

    let textDepth = this.getNumberOrDefault(row.textdepth, .25);
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

    if (!row.texttextline2)
      textRow.y = 0;

    this.addCSVShapeRow(Object.assign(this.defaultCSVRow(), textRow));
    if (row.texttextline2)
      this.addCSVShapeRow(Object.assign(this.defaultCSVRow(), textRowLine2));

    row.parent = row.name;
    row.name = row.name + '_shape';

    if (row.createshapetype === 'cube' || row.createshapetype === 'sphere')
      row.z = (-1.0 * minDim / 2.0).toFixed(3);
    else
      row.z = (-1.0 * depth / 2.0).toFixed(3);
    this.addCSVShapeRow(this.__childShapeRow(row));

    return blockResult;
  }
  async addCSVSceneBlock(row) {
    if (row.groundimage) {
      let texture = {
        title: row.name + '_groundtexture',
        url: row.groundimage,
        vScale: row.skyboxgroundscalev,
        uScale: row.skyboxgroundscaleu
      };
      this.dbSetRecord('texture', texture);
      let material = {
        title: row.name + '_groundmaterial',
        diffuseTextureName: texture.title
      }
      row.groundmaterial = material.title;
      this.dbSetRecord('material', material);
    }

    let block = {
      title: row.name,
      width: row.width,
      height: row.height,
      depth: row.depth,
      groundMaterial: row.groundmaterial,
      skybox: row.skybox,
      skyboxSize: row.skyboxsize
    }

    if (row.audiourl)
      block.audioURL = row.audiourl;

    if (row.displaycamera)
      block.displayCamera = row.displaycamera;

    if (row.blockflag) block.blockFlag = row.blockflag;
    if (row.blockcode) block.blockCode = row.blockcode;
    if (row.musicparams) block.musicParams = row.musicparams;
    if (row.genericblockdata) block.genericBlockData = row.genericblockdata;
    if (row.displayui) block.displayUI = row.displayui;

    let blockresult = await this.dbSetRecord('block', block);
    let sceneParams = this._fetchSceneParams(block);
    let frameTime = row.frametime;
    this.dbSetRecord('frame', {
      parentKey: blockresult.key,
      frameOrder: 10,
      frameTime: 0,
      rotationY: '0deg'
    });
    this.dbSetRecord('frame', {
      parentKey: blockresult.key,
      frameOrder: 20,
      frameTime: 0,
      rotationY: sceneParams.rotateY + 'deg'
    });

    if (row.skyboxtype === 'building') {

      let panelrow = this.defaultCSVRow();
      if (row.floormaterial || row.floorimage) {
        panelrow.asset = 'shape';
        panelrow.name = row.name + '_floorpanel';
        if (row.floorimage) {
          panelrow.materialname = panelrow.name;
          panelrow.texturepath = row.floorimage;
          panelrow.scaleu = row.floorscaleu;
          panelrow.scalev = row.floorscalev;
        } else {
          panelrow.materialname = row.floormaterial;
        }
        panelrow.shapetype = 'plane';
        panelrow.width = row.width;
        panelrow.height = row.depth;
        panelrow.parent = row.name;
        panelrow.rx = '90deg';
        this.addCSVRow(panelrow);
      }

      if (row.ceilingmaterial || row.ceilingwallimage) {
        panelrow = this.defaultCSVRow();
        panelrow.asset = 'shape';
        panelrow.name = row.name + '_ceilingpanel';
        if (row.ceilingwallimage) {
          panelrow.materialname = panelrow.name;
          panelrow.texturepath = row.ceilingwallimage;
          panelrow.scaleu = row.ceilingwallscaleu;
          panelrow.scalev = row.ceilingwallscalev;
        } else {
          panelrow.materialname = row.ceilingmaterial;
        }
        panelrow.shapetype = 'plane';
        panelrow.width = row.width;
        panelrow.height = row.depth;
        panelrow.parent = row.name;
        panelrow.y = row.height;
        panelrow.rx = '-90deg';
        this.addCSVRow(panelrow);
      }

      if (row.backwallmaterial || row.backwallimage) {
        panelrow = this.defaultCSVRow();
        panelrow.asset = 'shape';

        panelrow.name = row.name + '_backwallpanel';
        if (row.backwallimage) {
          panelrow.materialname = panelrow.name;
          panelrow.texturepath = row.backwallimage;
          panelrow.scaleu = row.backwallscaleu;
          panelrow.scalev = row.backwallscalev;
        } else {
          panelrow.materialname = row.backwallmaterial;
        }
        panelrow.shapetype = 'plane';
        panelrow.width = row.depth;
        panelrow.height = row.height;
        panelrow.parent = row.name;
        panelrow.x = (this.getNumberOrDefault(row.width, 0.0) / -2.0).toString();
        panelrow.y = (this.getNumberOrDefault(row.height, 0.0) / 2).toString();
        panelrow.ry = '-90deg';
        this.addCSVRow(panelrow);
      }

      if (row.frontwallmaterial || row.frontwallimage) {
        panelrow = this.defaultCSVRow();
        panelrow.asset = 'shape';
        panelrow.name = row.name + '_frontwallpanel';
        if (row.frontwallimage) {
          panelrow.materialname = panelrow.name;
          panelrow.texturepath = row.frontwallimage;
          panelrow.scaleu = row.frontwallscaleu;
          panelrow.scalev = row.frontwallscalev;
        } else {
          panelrow.materialname = row.frontwallmaterial;
        }
        panelrow.shapetype = 'plane';
        panelrow.width = row.depth;
        panelrow.height = row.height;
        panelrow.parent = row.name;
        panelrow.x = (this.getNumberOrDefault(row.width, 0.0) / 2.0).toString();
        panelrow.y = (this.getNumberOrDefault(row.height, 0.0) / 2).toString();
        panelrow.ry = '90deg';
        this.addCSVRow(panelrow);
      }

      if (row.rightwallmaterial || row.rightwallimage) {
        panelrow = this.defaultCSVRow();
        panelrow.asset = 'shape';
        panelrow.name = row.name + '_rightwallpanel';
        if (row.rightwallimage) {
          panelrow.materialname = panelrow.name;
          panelrow.texturepath = row.rightwallimage;
          panelrow.scaleu = row.rightwallscaleu;
          panelrow.scalev = row.rightwallscalev;
        } else {
          panelrow.materialname = row.rightwallmaterial;
        }
        panelrow.shapetype = 'plane';
        panelrow.width = row.width;
        panelrow.height = row.height;
        panelrow.parent = row.name;
        panelrow.z = (this.getNumberOrDefault(row.depth, 0.0) / 2.0).toString();
        panelrow.y = (this.getNumberOrDefault(row.height, 0.0) / 2.0).toString();
        this.addCSVRow(panelrow);
      }

      if (row.leftwallmaterial || row.leftwallimage) {
        panelrow = this.defaultCSVRow();
        panelrow.asset = 'shape';
        panelrow.name = row.name + '_leftwallpanel';
        if (row.leftwallimage) {
          panelrow.materialname = panelrow.name;
          panelrow.texturepath = row.leftwallimage;
          panelrow.scaleu = row.leftwallscaleu;
          panelrow.scalev = row.leftwallscalev;
        } else {
          panelrow.materialname = row.leftwallmaterial;
        }
        panelrow.shapetype = 'plane';
        panelrow.width = row.width;
        panelrow.height = row.height;
        panelrow.parent = row.name;
        panelrow.z = (this.getNumberOrDefault(row.depth, 0.0) / -2.0).toString();
        panelrow.y = (this.getNumberOrDefault(row.height, 0.0) / 2.0).toString();
        panelrow.ry = '180deg';
        this.addCSVRow(panelrow);
      }
    }

    let displayBC = this.defaultCSVRow();
    displayBC.asset = 'block';
    displayBC.name = row.name + '_productsWrapper';
    displayBC.parent = row.name;
    displayBC.x = '0';
    this.addCSVRow(displayBC);

    let chatBC = this.defaultCSVRow();
    chatBC.asset = 'block';
    chatBC.name = row.name + '_chatWrapper';
    chatBC.parent = row.name;
    chatBC.x = '0';
    this.addCSVRow(chatBC);

    return blockresult;
  }
  __childShapeRow(row) {
    let shapeRow = {};
    let height = this.getNumberOrDefault(row.height, 1).toFixed(3);
    let width = this.getNumberOrDefault(row.width, 1).toFixed(3);
    let depth = this.getNumberOrDefault(row.depth, 1).toFixed(3);
    let minDim = Math.min(Math.min(width, height), depth);
    let maxDim = Math.max(Math.max(width, height), depth);

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

    let rz = row.rz;
    if (row.createshapetype === 'cone' || row.createshapetype === 'cylinder') {
      shapeRow = {
        shapetype: 'cylinder',
        tessellation: row.tessellation,
        width,
        height,
        depth
      }

      if (row.cylinderhorizontal) {
        rz = '90deg';
        shapeRow.height = width;
        shapeRow.width = height;
        if (height !== depth)
          shapeRow.sz = (depth / height).toFixed(3);
      } else {
        if (width !== depth)
          shapeRow.sz = (depth / width).toFixed(3);
      }

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
    shapeRow.parent = row.parent;
    shapeRow.name = row.name;
    shapeRow.asset = 'shape';
    shapeRow.x = row.x;
    shapeRow.y = row.y;
    shapeRow.z = row.z;
    shapeRow.rx = row.rx;
    shapeRow.ry = row.ry;
    shapeRow.rz = rz;

    return Object.assign(this.defaultCSVRow(), shapeRow);
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
    sceneBC.parent = sceneData.title + '_productsWrapper';
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
    textPlaneBlock.displaystyle = row.displaystyle;
    textPlaneBlock.materialname = row.materialname;

    let textPlaneBlockBC = this.defaultCSVRow();
    textPlaneBlockBC.asset = 'blockchild';
    textPlaneBlockBC.name = row.name;
    textPlaneBlockBC.childtype = 'block';
    textPlaneBlockBC.parent = sceneData.title + '_productsWrapper';
    textPlaneBlockBC.rx = row.rx;
    textPlaneBlockBC.ry = row.ry;
    textPlaneBlockBC.rz = row.rz;
    textPlaneBlockBC.x = row.x;
    textPlaneBlockBC.y = '-1';
    textPlaneBlockBC.z = row.z;
    textPlaneBlockBC.sx = '.001';
    textPlaneBlockBC.sy = '.001';
    textPlaneBlockBC.sz = '.001';
    textPlaneBlockBC.realOrigRow = row;
    textPlaneBlockBC.index = row.index;

    return Promise.all([
      this.addCSVRow(textPlaneBlock),
      this.addCSVRow(textPlaneBlockBC)
    ]);
  }
  async addCSVTextPlane(row) {
    let promises = [];

    let blockWrapper = {
      title: row.name,
      materialName: row.materialname,
      height: row.height,
      width: row.width,
      depth: row.depth
    };

    let blockResult = await this.dbSetRecord('block', blockWrapper);

    if (row.displaystyle === '3dbasic') {
      this.__add3dTextPlane(row);
    } else
      this.__add2dTextPlane(row);

    row.asset = 'block';
    this.addParentBlockChild(row);

    return blockResult;
  }
  async __add2dTextPlane(row) {
    let parent = row.name;
    let textPlaneName = parent + '_textplane';
    let textChildBC = this.defaultCSVRow();
    textChildBC.asset = 'blockchild';
    textChildBC.name = textPlaneName;
    textChildBC.childtype = 'shape';
    textChildBC.parent = parent;
    textChildBC.ry = '90deg';
    this.addCSVRow(textChildBC);

    let shapeData = {
      title: textPlaneName,
      materialName: textPlaneName,
      boxHeight: row.height,
      boxWidth: row.width,
      boxDepth: row.depth,
      shapeType: 'plane'
    };
    this.dbSetRecord('shape', shapeData);

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
    textureData.textFontSize = this.getNumberOrDefault(row.textfontsize, 100).toString();
    textureData.textureTextRenderSize = this.getNumberOrDefault(row.texturetextrendersize, 512).toString();
    textureData.textFontWeight = row.textfontweight ? row.textfontweight : '';
    textureData.isFittedText = true;

    this.dbSetRecord('texture', textureData);

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
    this.dbSetRecord('material', materialData);
  }
  async __add3dTextPlane(row) {
    let parent = row.name;
    let descText = this.defaultCSVRow();
    descText.asset = 'shape';
    descText.name = parent + '_3dtitle';
    descText.materialname = 'inherit';
    descText.shapetype = 'text';
    descText.textfontfamily = row.textfontfamily;
    descText.texttext = row.texturetext;
    descText.textdepth = '.08';
    descText.textsize = '100';
    descText.parent = parent;
    descText.y = "6";
    descText.x = '.5';
    descText.ry = '180deg';
    descText.rz = '-90deg';
    descText.sx = '2';
    descText.sy = '2';
    descText.sz = '2';
    this.addCSVRow(descText);

    if (row.texturetext2) {
      descText = this.defaultCSVRow();
      descText.asset = 'shape';
      descText.name = parent + '_3dtitle2';
      descText.materialname = 'inherit';
      descText.shapetype = 'text';
      descText.textfontfamily = row.textfontfamily;
      descText.texttext = row.texturetext2;
      descText.textdepth = '.08';
      descText.textsize = '100';
      descText.parent = parent;
      descText.y = "3";
      descText.x = '.5';
      descText.ry = '180deg';
      descText.rz = '-90deg';
      descText.sx = '2';
      descText.sy = '2';
      descText.sz = '2';
      this.addCSVRow(descText);
    }
  }
  async __addSignPost(product, productData) {
    let blockRow = this.defaultCSVRow();
    blockRow.asset = 'block';
    blockRow.height = '1';
    blockRow.width = '2';
    blockRow.depth = '2';
    blockRow.materialname = this.getProductColors().colors[product.colorIndex];
    blockRow.name = product.childName + '_signpost';
    blockRow.parent = product.childName;
    blockRow.x = '.1';
    blockRow.rz = '1deg';
    if (product.origRow.rz) {
      blockRow.rz = product.origRow.rz;
    }

    blockRow.ry = '180deg';
    blockRow.y = '-1';
    blockRow.sx = '.001';
    blockRow.sy = '.001';
    blockRow.sz = '.001';
    await this.addCSVRow(blockRow);

    if (product.origRow.displaystyle === '3dbasic')
      this._addSignPost3D(product, productData, blockRow.name);
    else if (product.origRow.displaystyle === '3dmin')
      this._addSignPost3DMin(product, productData, blockRow.name);
    else
      this._addSignPost2D(product, productData, blockRow.name);

    let showFrame = this.defaultCSVRow();
    showFrame.asset = 'blockchildframe';
    showFrame.name = blockRow.name;
    showFrame.childtype = 'block';
    showFrame.parent = product.childName;
    showFrame.frameorder = '20';
    showFrame.frametime = (product.startShowTime * 1000).toFixed(0) + 'cp700';
    showFrame.y = '2';
    showFrame.sx = '1';
    showFrame.sy = '1';
    showFrame.sz = '1';

    let hideFrame = this.defaultCSVRow();
    hideFrame.asset = 'blockchildframe';
    hideFrame.name = blockRow.name;
    hideFrame.childtype = 'block';
    hideFrame.parent = product.childName;
    hideFrame.frameorder = '30';
    hideFrame.frametime = (product.endShowTime * 1000).toFixed(0) + 'cp700';
    hideFrame.y = '-1';
    hideFrame.sx = '.001';
    hideFrame.sy = '.001';
    hideFrame.sz = '.001';

    let endFrame = this.defaultCSVRow();
    endFrame.asset = 'blockchildframe';
    endFrame.name = blockRow.name;
    endFrame.childtype = 'block';
    endFrame.parent = product.childName;
    endFrame.frameorder = '40';
    endFrame.frametime = (productData.runLength * 1000).toFixed(0);
    endFrame.y = '-1';
    endFrame.sx = '.001';
    endFrame.sy = '.001';
    endFrame.sz = '.001';

    return Promise.all([
      this.addCSVRow(showFrame),
      this.addCSVRow(hideFrame),
      this.addCSVRow(endFrame)
    ]);
  }
  async _addSignPost2D(product, productData, parent) {
    let newObjects = [];
    let textPlane = this.defaultCSVRow();
    textPlane.asset = 'textplane';
    textPlane.hasalpha = true;
    textPlane.istext = true;
    let colorIndex = product.colorIndex;
    if (colorIndex !== 2 && colorIndex !== 0) {
      textPlane.textfontcolor = '0,0,0';
    } else {
      textPlane.textfontcolor = '255,255,255';
    }
    textPlane.texturetext = product.title;
    textPlane.texturetext2 = product.desc;
    textPlane.width = '8';
    textPlane.height = '8';
    textPlane.depth = '8';
    textPlane.textfontfamily = product.origRow.textfontfamily;
    textPlane.name = product.childName + '_pricedesc';
    textPlane.parent = parent;
    textPlane.x = '0.06';
    textPlane.y = (productData.sceneParams.signYOffset - 2.75).toString();
    textPlane.sx = '.5';
    textPlane.sy = '.5';
    textPlane.sz = '.5';
    textPlane.ry = '180deg';
    newObjects.push(textPlane);

    if (product.itemImage) {
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
      blockImageShape.parent = parent;
      blockImageShape.x = '.06';
      blockImageShape.y = (productData.sceneParams.signYOffset + 1.0).toString();
      blockImageShape.ry = '-90deg';
      newObjects.push(blockImageShape);
    }

    let blockSPBC = this.defaultCSVRow();
    blockSPBC.asset = 'blockchild';
    blockSPBC.childtype = 'shape';
    blockSPBC.parent = parent;
    blockSPBC.name = 'signboard';
    blockSPBC.materialname = 'inherit';
    blockSPBC.y = productData.sceneParams.signYOffset.toString();
    newObjects.push(blockSPBC);
    /*
    let blockSP2BC = this.defaultCSVRow();
    blockSP2BC.asset = 'blockchild';
    blockSP2BC.childtype = 'shape';
    blockSP2BC.parent = parent;
    blockSP2BC.name = 'signpost';
    blockSP2BC.materialname = 'inherit';
    blockSP2BC.x = '-0.05';
    blockSP2BC.y = (productData.sceneParams.signYOffset - 3.5).toString();
    newObjects.push(blockSP2BC);
    */
    return this.addCSVRowList(newObjects);
  }
  async _addSignPost3D(product, productData, parent) {
    if (product.desc) {
      let priceText = this.defaultCSVRow();
      priceText.asset = 'shape';
      priceText.name = parent + '_3ddesc';

      if (product.colorIndex === 1 || product.colorIndex === 3) {
        priceText.materialname = 'color: 0,0,0';
      } else {
        priceText.materialname = 'color: 4,4,4';
      }
      priceText.shapetype = 'text';
      priceText.textfontfamily = product.origRow.textfontfamily;
      priceText.texttext = product.desc;
      priceText.textdepth = '.25';
      priceText.textsize = '100';
      priceText.parent = parent;
      priceText.y = (productData.sceneParams.signYOffset - 3.25).toString();
      priceText.x = '.5';
      priceText.ry = '0deg';
      priceText.rz = '-90deg';
      this.addCSVRow(priceText);
    }

    let descText = this.defaultCSVRow();
    descText.asset = 'shape';
    descText.name = parent + '_3dtitle';
    descText.materialname = 'inherit';
    descText.shapetype = 'text';
    descText.textfontfamily = product.origRow.textfontfamily;
    descText.texttext = product.title;
    descText.textdepth = '.5';
    descText.textsize = '100';
    descText.parent = parent;
    descText.y = (productData.sceneParams.signYOffset + 1.0).toString();
    descText.x = '.5';
    descText.ry = '0deg';
    descText.rz = '-90deg';
    this.addCSVRow(descText);

    if (product.itemImage) {
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
      blockImageShape.parent = parent;
      blockImageShape.x = '.06';
      blockImageShape.y = (productData.sceneParams.signYOffset - 1).toString();
      blockImageShape.ry = '-90deg';
      this.addCSVRow(blockImageShape);
    }

    return;
  }
  async _addSignPost3DMin(product, productData, parent) {

    let descText = this.defaultCSVRow();
    descText.asset = 'shape';
    descText.name = parent + '_3dtitle';
    descText.materialname = 'inherit';
    descText.shapetype = 'text';
    descText.textfontfamily = product.origRow.textfontfamily;
    descText.texttext = product.title;
    descText.textdepth = '.25';
    descText.textsize = '100';
    descText.parent = parent;
    descText.y = (productData.sceneParams.signYOffset - 2.0).toString();
    descText.x = '.5';
    descText.ry = '0deg';
    descText.rz = '-90deg';
    this.addCSVRow(descText);

    return;
  }
  async __addTextShowHide(product, productData) {
    let parent = product.childName;

    let showFrame = this.defaultCSVRow();
    showFrame.asset = 'blockchildframe';
    showFrame.name = parent;
    showFrame.childtype = 'block';
    showFrame.parent = productData.sceneBlock.title;
    showFrame.frameorder = '20';
    showFrame.frametime = (product.startShowTime * 1000).toFixed(0) + 'cp700';
    showFrame.y = product.origRow.y;
    showFrame.sx = '1';
    showFrame.sy = '1';
    showFrame.sz = '1';

    let hideFrame = this.defaultCSVRow();
    hideFrame.asset = 'blockchildframe';
    hideFrame.name = parent;
    hideFrame.childtype = 'block';
    hideFrame.parent = productData.sceneBlock.title;
    hideFrame.frameorder = '30';
    hideFrame.frametime = (product.endEnlargeTime * 1000).toFixed(0) + 'cp700';
    hideFrame.y = '-1';
    hideFrame.sx = '.001';
    hideFrame.sy = '.001';
    hideFrame.sz = '.001';

    let endFrame = this.defaultCSVRow();
    endFrame.asset = 'blockchildframe';
    endFrame.name = parent;
    endFrame.childtype = 'block';
    endFrame.parent = productData.sceneBlock.title;
    endFrame.frameorder = '40';
    endFrame.frametime = (productData.runLength * 1000).toFixed(0);
    endFrame.y = '-1';
    endFrame.sx = '.001';
    endFrame.sy = '.001';
    endFrame.sz = '.001';

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
          cameraBlockFrame.y = (this.getNumberOrDefault(p.y, 0) + 2).toString();
        else
          cameraBlockFrame.y = p.y;

        cameraBlockFrame.z = p.z;
        cameraBlockFrame.rx = p.rx;
        cameraBlockFrame.ry = ''; //p.ry;
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
        cameraBlockFrame.ry = ''; //cameraRow.ry;
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
      uoffset: "",
      voffset: "",
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
      await this.addCSVRow(row);

      let secFrame = {
        asset: 'blockchildframe',
        name: productsBySKU[i].block,
        childtype: 'block',
        frameorder: '20',
        frametime: '100',
        parent: basketName,
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

      let secsecFrame = {
        asset: 'blockchildframe',
        name: productsBySKU[i].block,
        childtype: 'block',
        frameorder: '25',
        frametime: '150',
        parent: basketName,
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

      let thirdFrame = {
        asset: 'blockchildframe',
        name: productsBySKU[i].block,
        childtype: 'block',
        frameorder: '30',
        frametime: '200',
        parent: basketName,
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

      let fourthFrame = {
        asset: 'blockchildframe',
        name: productsBySKU[i].block,
        childtype: 'block',
        frameorder: '40',
        frametime: '300',
        parent: basketName,
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

      promises.push(this.addCSVRow(secFrame));
      promises.push(this.addCSVRow(secsecFrame));
      promises.push(this.addCSVRow(thirdFrame));
      promises.push(this.addCSVRow(fourthFrame));
    }

    return Promise.all(promises);
  }
  _fetchSceneParams(sceneData) {
    let map = {};
    let rawData = sceneData.genericBlockData;
    if (!rawData)
      rawData = '';
    if (!sceneData.genericBlockData)
      sceneData.genericBlockData = '';
    let data = sceneData.genericBlockData.split('|');
    for (let c = 0; c < data.length; c += 2)
      map[data[c]] = data[c + 1];

    let scaleFactor = this.getNumberOrDefault(map.datascalefactor, 2.0);
    let signYOffset = this.getNumberOrDefault(map.signyoffset, 6.0);
    let rotateY = this.getNumberOrDefault(map.rotatey, 0);
    let dataFramesFilter = this.getNumberOrDefault(map.dataframefilter, .05);
    let animType = map.animtype;
    if (!animType)
      animType = 'product';

    return {
      scaleFactor,
      signYOffset,
      dataFramesFilter,
      rotateY,
      animType
    }
  }
  async _addProductFramesFromData(product, productData, productIndex, freqPrefix = '') {
    if (productData.sceneParams.animType !== 'product')
      return;

    let child = product.childName;
    let sb = await this.csvFetchSceneBlock();

    let freq_data = await this.dbFetchByLookup('block', 'blockFlag', freqPrefix + 'frequencyblock' + (productIndex + 1).toString());
    let frameRows = [];

    if (freq_data.records.length > 0) {
      let scaleFactor = productData.sceneParams.scaleFactor;
      let scaleminusone = scaleFactor - 1.0;

      let bandData = freq_data.records[0].genericBlockData;

      if (!bandData)
        bandData = '';
      bandData = bandData.split('|');
      bandData.forEach((v, i) => bandData[i] = Number(v));

      let frameCount = bandData.length;

      let sb = await this.csvFetchSceneBlock();

      let lastScale = -1;
      let count = 0,
        skip = 0;
      for (let index = 1; index < frameCount; index++) {
        let timeRatio = index / frameCount;
        let dataPoint = bandData[index] / 100.0;
        let skipFrame = false;
        let bandScaleFrame = this.defaultCSVRow();
        bandScaleFrame.asset = 'blockchildframe';
        bandScaleFrame.name = product.childName;
        bandScaleFrame.childtype = 'block';
        bandScaleFrame.parent = sb.parent + '_productsWrapper';
        bandScaleFrame.frameorder = (10 * (index + 1)).toFixed(0);
        bandScaleFrame.frametime = (timeRatio * 100).toFixed(3) + '%';
        bandScaleFrame.sx = (.5 + dataPoint * scaleminusone).toFixed(3);
        bandScaleFrame.sy = (.5 + dataPoint * scaleminusone).toFixed(3);
        bandScaleFrame.sz = (.5 + dataPoint * scaleminusone).toFixed(3);

        if (index === frameCount - 1) {
          bandScaleFrame.frametime = '100%';
        }
        if (productData.sceneParams.rotateY !== 0) {

          bandScaleFrame.ry = (-1.0 * productData.sceneParams.rotateY * timeRatio).toFixed(2) + 'deg';
        }

        if (Math.abs(lastScale - dataPoint) < productData.sceneParams.dataFramesFilter)
          skipFrame = true;

        if (skipFrame && index < frameCount - 1) {
          skip++;
        } else {
          count++;
          lastScale = dataPoint;
          frameRows.push(this.addCSVRowList([bandScaleFrame]));
        }

        if (frameRows.length > 20) {
          await Promise.all(frameRows);
          frameRows = [];
        }
      }
    }
    return Promise.all(frameRows);
  }
  async _generateProductAssets(pInfo) {
    let promises = [];
    let productIndex = 0;
    for (let c = 0, l = pInfo.products.length; c < l; c++) {
      if (pInfo.products[c].itemId) {
        promises.push(this._addProductFramesFromData(pInfo.products[c], pInfo, productIndex, pInfo.sceneBlock.musicParams));
        promises.push(this.__addSignPost(pInfo.products[c], pInfo));
        productIndex++;
      } else
        promises.push(this.__addTextShowHide(pInfo.products[c], pInfo));
    }

    return Promise.all(promises);
  }
  async addCSVDisplayFinalize() {
    let pInfo = await this.initProducts();
    await this.__addCSVFollowBlock(pInfo);

    if (!pInfo.products)
      pInfo.products = [];

    await this._generateProductAssets(pInfo);

    if (!pInfo.sceneId)
      return Promise.resolve();

    let promises = [];
    let frameRecords = await this.dbFetchByLookup('frame', 'parentKey', pInfo.sceneId);

    if (frameRecords.records.length <= 0)
      return Promise.resolve();

    let frameId = frameRecords.recordIds[frameRecords.recordIds.length - 1];
    promises.push(
      this.dbSetRecordFields('frame', {
        frameTime: (pInfo.runLength * 1000).toString()
      }, frameId));

    promises.push(this.addCSVBasketProducts());

    return Promise.all(promises);
  }
  async initProducts(cameraData = null) {
    let result = await this.firebase.database().ref(this.path('blockchild'))
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
      let aIndex = this.getNumberOrDefault(a.animationIndex, 0);
      let bIndex = this.getNumberOrDefault(b.animationIndex, 0);
      if (aIndex > bIndex)
        return 1;
      if (aIndex < bIndex)
        return -1;
      return 0;
    });
    let productParent = sceneBlock.title + '_productsWrapper';
    let prodRecords = await this.dbFetchByLookup('block', 'title', productParent);
    if (prodRecords.records.length < 1) {
      console.log('error', 'no prod wrapper found');
      return;
    }
    let prodWrapperId = prodRecords.recordIds[0];

    for (let c = 0, l = productsRecords.length; c < l; c++) {
      let pBC = productsRecords[c];
      let obj = await this.findMatchBlocks(pBC.childType, pBC.childName, prodWrapperId);
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
        image: blockData.itemImage,
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
      finishDelay = this.getNumberOrDefault(cameraData.finishdelay, 0);
      introTime = this.getNumberOrDefault(cameraData.introtime, 0);
      runLength = this.getNumberOrDefault(cameraData.runlength, 60);
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

    let sceneParams = this._fetchSceneParams(sceneBlock);

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
      sceneBlock,
      sceneParams
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
    /*
    let promises = [];
    for (let c = 0, l = rows.length; c < l; c++) {
      promises.push(this.addCSVRow(rows[c]));
    }

    return Promise.all(promises);
    */
    for (let c = 0, l = rows.length; c < l; c++)
      await this.addCSVRow(rows[c]);

    return Promise.resolve();

  }

  async clearProjectData() {
    let basePath = `/project/${this.projectId}/`;
    let fireUpdates = {
      [basePath + 'block']: null,
      [basePath + 'blockchild']: null,
      [basePath + 'frame']: null,
      [basePath + 'material']: null,
      [basePath + 'mesh']: null,
      [basePath + 'shape']: null,
      [basePath + 'texture']: null
    };

    return this.firebase.database().ref().update(fireUpdates);
  }
  async writeProjectRawData(rawName, data) {
    if (!rawName)
      return Promise.resolve();

    let fireUpdates = {
      [`/project/${this.projectId}/rawData${rawName}`]: data,
      [`/project/${this.projectId}/rawData${rawName}Date`]: new Date()
    };

    return this.firebase.database().ref().update(fireUpdates);
  }
  async readProjectRawData(rawName) {
    if (!rawName)
      return Promise.resolve();

    return this.firebase.database().ref(`/project/${this.projectId}/rawData${rawName}`).once('value')
      .then(r => r.val());
  }
  async readProjectRawDataDate(rawName) {
    if (!rawName)
      return Promise.resolve();

    return this.firebase.database().ref(`/project/${this.projectId}/rawData${rawName}Date`).once('value')
      .then(r => r.val());
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = gCSVImport;
}
