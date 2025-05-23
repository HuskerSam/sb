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
  angleDeg(angle, d) {
    if (this.node) {
      return this.globalUtil.angleDeg(angle, d);
    } else {
      return GLOBALUTIL.angleDeg(angle, d);
    }
  }
  getVector(str, x, y, z) {
    if (this.node) {
      return this.globalUtil.getVector(str, x, y, z);
    } else {
      return GLOBALUTIL.getVector(str, x, y, z);
    }
  }
  path(eleType) {
    if (eleType === 'projectTitles')
      return '/projectTitles';
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
  async dbRemoveRecordsByTitle(type, title) {
    let count_removed = 0;

    let records = await this.dbFetchByLookup(type, 'title', title);
    let promises = [];
    for (let key in records.recordsById) {
      promises.push(this.dbRemove(type, key));
      count_removed++;
    }
    await Promise.all(promises);
    return count_removed;
  }
  async dbSetRecord(type, data, id) {
    if (type === 'material') {
      if (data.title.toString().substring(0, 8) === 'decolor:' ||
        data.title.toString().substring(0, 7) === 'ecolor:' ||
        data.title.toString().substring(0, 6) === 'color:' ||
        data.title === 'inherit')
        return {
          key: null
        };
    }
    if (type === 'texture') {
      if (data.title.toString().substring(0, 3) === 'sb:')
        return {
          key: null
        };

      let texturePrefix = data.title.toString().substring(0, 7);
      if (texturePrefix === 'https:/' || texturePrefix === 'http://')
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
    let count_removed = await this.dbRemoveRecordsByTitle('mesh', row.name);
    if (count_removed > 0) {
      console.log('dup mesh deleted', row.name, count_removed);
    }

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

    if (row.materialname && (row.texturepath || row.alpha)) {
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

      let ambientColor = row.ambientcolor;
      let ambientTextureName = '';
      if (row.ambient === 'x') {
        if (!ambientColor)
          ambientColor = row.color;
        ambientTextureName = textureName;
      }
      if (row.ambientpath) {
        ambientTextureName = row.ambientpath;
      }
      let emissiveColor = row.emissivecolor;
      let emissiveTextureName = '';
      if (row.emissive === 'x') {
        if (!emissiveColor)
          emissiveColor = row.color;
        emissiveTextureName = textureName;
      }
      if (row.emissivepath) {
        emissiveTextureName = row.emissivepath;
      }
      let specularColor = row.specularcolor;
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

      if (!emissiveColor) emissiveColor = '';
      if (!ambientColor) ambientColor = '';
      if (!specularColor) specularColor = '0,0,0';

      if (!row.alpha) row.alpha = '1';

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
        specularPower,
        alpha: row.alpha
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
    //TODO - the blockchildren and frames are orphaned - messy - need to delete more
    let count_removed = await this.dbRemoveRecordsByTitle('block', row.name);
    if (count_removed > 0) {
      console.log('dup block deleted', row.name, count_removed);
    }

    let blockData = {
      title: row.name,
      materialName: row.materialname,
      height: row.height,
      width: row.width,
      depth: row.depth
    };

    if (row.blockcode)
      blockData.blockCode = row.blockcode;

    if (row.clearcolor)
      blockData.clearColor = row.clearcolor;

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

    if (row.saveorig === 'x')
      blockData.origRow = row;

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
  async addCSVDisplayBlock(row) {
    if (!row.productdescription)
      row.productdescription = '';

    let blockRow = {
      asset: 'block',
      name: row.name,
      width: '5',
      height: '3',
      depth: '5',
      materialname: '',
      blockflag: 'displayblock',
      productname: row.productname,
      productdescription: row.productdescription,
      productprice: row.productprice,
      productpricetext: row.productpricetext,
      productimage: row.productimage,
      saveorig: 'x'
    };

    let childBlockCount = this.getNumberOrDefault(row.childcount, 1);
    let childScale = this.getNumberOrDefault(row.childscale, 1);
    let childName = row.childname;
    let childType = row.childtype;
    let childscale2 = this.getNumberOrDefault(row.childscale2, 1);
    let childname2 = row.childname2;
    let childType2 = row.childtype2;
    let childrenWide = this.getNumberOrDefault(row.childrenwide, 1);
    let childrenDeep = this.getNumberOrDefault(row.childrendeep, 1);
    let childrenHigh = this.getNumberOrDefault(row.childrenhigh, 2);
    let layerHeight = this.getNumberOrDefault(row.layerheight, 3);
    let layerRotation = this.angleDeg(row.layerrotation, '45deg');
    let childX = this.getNumberOrDefault(row.childx, 0);
    let childY = this.getNumberOrDefault(row.childy, 0);
    let childZ = this.getNumberOrDefault(row.childz, 0);
    let childrX = this.angleDeg(row.childrx, '0');
    let childrY = this.angleDeg(row.childry, '0');
    let childrZ = this.angleDeg(row.childrz, '0');
    let childdX = this.getNumberOrDefault(row.childdeltax, 0);
    let childdY = this.getNumberOrDefault(row.childdeltay, 0);
    let childdZ = this.getNumberOrDefault(row.childdeltaz, 0);

    let childdrX = this.getNumberOrDefault(row.childdeltarx, 0);
    let childdrY = this.getNumberOrDefault(row.childdeltary, 0);
    let childdrZ = this.getNumberOrDefault(row.childdeltarz, 0);

    let width = 5.0;
    let depth = 5.0;
    let localX = width / childrenWide;
    let localZ = depth / childrenDeep;

    let childBlockRows = [];
    let curPos = {
      x: 0,
      y: 0,
      z: 0,
      rx: childrX,
      ry: childrY,
      rz: childrZ,
      offsetx: childX,
      offsety: childY,
      offsetz: childZ
    };
    let currentLayerRotation = 0;
    let xIndex = 0;
    let yIndex = 0;
    let zIndex = 0;
    let startX = width / -2.0;
    let startZ = depth / -2.0;
    for (let ctr = 0; ctr < childBlockCount; ctr++) {

      curPos.y = yIndex * layerHeight;
      let x = startX + (xIndex * localX) + (localX / 2.0);
      let z = startZ + (zIndex * localZ) + (localZ / 2.0);

      if (currentLayerRotation !== 0.0) {
        let radius = Math.sqrt(x * x + z * z);
        let angle = Math.atan(z / x);
        angle += currentLayerRotation;
        let cos = Math.cos(angle);
        let sin = Math.sin(angle);

        curPos.x = (radius * cos);
        curPos.z = (radius * sin);
      } else {
        curPos.x = x;
        curPos.z = z;
      }

      let childRow = {
        asset: 'blockchild',
        parent: row.name,
        childtype: childType,
        name: childName,
        x: curPos.x + curPos.offsetx,
        y: curPos.y + curPos.offsety,
        z: curPos.z + curPos.offsetz,
        rx: curPos.rx,
        ry: curPos.ry,
        rz: curPos.rz,
        sx: childScale,
        sy: childScale,
        sz: childScale
      };
      childBlockRows.push(childRow);

      xIndex++;
      curPos.rx += childdrX;
      curPos.ry += childdrY;
      curPos.rz += childdrZ;
      curPos.offsetx += childdX;
      curPos.offsety += childdY;
      curPos.offsetz += childdZ;

      if (xIndex >= childrenWide) {
        xIndex = 0;
        zIndex++;
      }
      if (zIndex >= childrenDeep)
        zIndex = 0;

      if (ctr === ((yIndex + 1) * childrenWide * childrenDeep - 1)) {
        xIndex = 0;
        zIndex = 0;
        yIndex++;
        curPos.rx = 0.0;
        curPos.ry = 0.0;
        curPos.rz = 0.0;
        curPos.offsetx = 0.0;
        curPos.offsety = 0.0;
        curPos.offsetz = 0.0;
        currentLayerRotation += layerRotation;
      }

      if (yIndex >= childrenHigh)
        break;
    }

    await this.addCSVRow(blockRow);

    return this.addCSVRowList(childBlockRows);
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

    return {
      results,
      key: results.recordIds[0],
      data: results.records[0],
      parent: results.records[0].title
    };
  }
  async addCSVBlockChildRow(row) {
    if (row.parent.toString().substr(0, 9) === '::scene::') {
      let sb = await this.csvFetchSceneBlock();
      row.parent = sb.parent + row.parent.toString().substring(9);
    }

    let parentRecords = await this.dbFetchByLookup('block', 'title', row.parent);
    if (parentRecords.records.length < 1) {
      console.log(row.parent, ' - block not found');
      return Promise.resolve();
    }
    let key = parentRecords.recordIds[0];

    let inheritMaterial = false;
    if (row.materialname === 'inherit' || row.inheritmaterial === '1')
      inheritMaterial = true;

    let blockChildData = {
      parentKey: key,
      childType: row.childtype,
      childName: row.name,
      inheritMaterial
    };

    if (row.childname)
      blockChildData.childName = row.childname;

    if (blockChildData.childtype === 'camera') {
      blockChildData.cameraType = row.cameratype;
      blockChildData.childName = row.name;
    }
    if (row.childtype === 'light') {
      blockChildData.lightType = row.lighttype;
      blockChildData.childName = row.name;
    }

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
    if (row.origCameraRow)
      blockChildData.origRow = row;
    if (row.realOrigRow)
      blockChildData.origRow = row.realOrigRow;

    if (row.targetblock)
      blockChildData.cameraTargetBlock = row.targetblock;
    if (row.cameratype)
      blockChildData.cameraType = row.cameratype;
    if (row.blockflag) blockChildData.blockFlag = row.blockflag;

    if (row.framecommand) blockChildData.frameCommand = row.framecommand;
    if (row.framecommandfield) blockChildData.frameCommandField = row.framecommandfield;
    if (row.framecommandvalue) blockChildData.frameCommandValue = row.framecommandvalue;

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
    if (row.heightoffset)
      frameData.cameraHeightOffset = row.heightoffset;
    if (row.cameraacceleration)
      frameData.cameraAcceleration = row.cameraacceleration;
    if (row.maxcameraspeed)
      frameData.maxCameraSpeed = row.maxcameraspeed;
    if (row.camerafov)
      frameData.cameraFOV = row.camerafov;
    if (row.camerarotationoffset)
      frameData.cameraRotationOffset = row.camerarotationoffset;

    if (row.originx)
      frameData.cameraOriginX = row.originx;
    if (row.originy)
      frameData.cameraOriginY = row.originy;
    if (row.originz)
      frameData.cameraOriginZ = row.originz;

    if (row.aimtargetx)
      frameData.cameraAimTargetX = row.aimtargetx;
    if (row.aimtargety)
      frameData.cameraAimTargetY = row.aimtargety;
    if (row.aimtargetz)
      frameData.cameraAimTargetZ = row.aimtargetz;

    if (row.childtype === 'light') {
      let lightFields = [
        'lightOriginX',
        'lightOriginY',
        'lightOriginZ',
        'lightDirectionX',
        'lightDirectionY',
        'lightDirectionZ',
        'lightAngle',
        'lightDecay',
        'lightIntensity'
      ];
      let colorFields = [
        'Diffuse',
        'Specular',
        'Ground'
      ];
      lightFields.forEach(f => {
        let field = f.toLowerCase();
        if (row[field])
          frameData[f] = row[field];
      });
      colorFields.forEach(c => {
        let field = c.toLowerCase() + 'color';
        if (c === 'Ground')
          c += 'Color';
        if (row[field]) {
          let vector = this.getVector(row[field], 0, 0, 0);
          frameData['light' + c + 'R'] = vector.x;
          frameData['light' + c + 'G'] = vector.y;
          frameData['light' + c + 'B'] = vector.z;
        }
      });

    }

    let shapeMeshOnlyFields = [
      'diffuseColor',
      'emissiveColor',
      'ambientColor',
      'specularColor'
    ];
    if (row.childtype === 'shape' || row.childtype === 'mesh') {
      shapeMeshOnlyFields.forEach(v => {
        if (row[v.toLowerCase()]) {
          let vector = this.getVector(row[v.toLowerCase()], 0, 0, 0);
          frameData[v + 'R'] = vector.x;
          frameData[v + 'G'] = vector.y;
          frameData[v + 'B'] = vector.z;
        }
      });
    }

    if (row.nofirstframe === '1')
      return;
    return this.dbSetRecord('frame', frameData);
  }
  async addCSVShapeRow(row) {
    let count_removed = await this.dbRemoveRecordsByTitle('shape', row.name);
    if (count_removed > 0) {
      console.log('dup shape deleted', row.name, count_removed);
    }
    let texturename = row.texturepath;
    let bumptexturename = row.bmppath;
    if (!row.offsetu) row.offsetu = '';
    if (!row.offsetv) row.offsetv = '';
    if (!row.scaleu) row.scaleu = '';
    if (!row.scalev) row.scalev = '';

    if (row.texturepath) {
      texturename = row.materialname;
      this.dbSetRecord('texture', {
        title: texturename,
        url: row.texturepath,
        uScale: row.scaleu,
        vScale: row.scalev,
        uOffset: row.offsetu,
        vOffset: row.offsetv
      }).then(results => {});
    }
    if (row.bmppath) {
      bumptexturename = row.materialname + 'bmp';
      this.dbSetRecord('texture', {
        title: bumptexturename,
        url: row.bmppath,
        uScale: row.scaleu,
        vScale: row.scalev,
        uOffset: row.offsetu,
        vOffset: row.offsetv
      }).then(results => {});
    }

    if (row.materialname && row.texture) {
      let mat = this.defaultCSVRow();
      mat.asset = 'material';
      mat.name = row.materialname;
      mat.texture = row.texture;
      mat.speculartexture = row.texture;
      mat.bumptexture = row.texture;
      mat.scaleu = row.scaleu;
      mat.scalev = row.scalev;
      mat.hasalpha = '';
      this.addCSVRow(mat);
    } else if (row.materialname && row.texturepath) {
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
      textFontStyle: row.textfontstyle,
      textFontWeight: row.textfontweight,
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

    if (row.textstroke && row.textstroke.toString() === '1')
      shapeData.textStroke = true;

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

    if (row.parent.toString().substr(0, 9) === '::scene::') {
      let sb = await this.csvFetchSceneBlock();
      row.parent = sb.parent + row.parent.toString().substring(9);
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
    sceneBC.visibility = row.visibility;
    sceneBC.frametime = row.frametime;
    sceneBC.materialname = row.materialname;
    sceneBC.nofirstframe = row.nofirstframe;

    return this.addCSVRow(sceneBC);
  }
  async _getBlockChildren(blockTitle, childType, childName) {
    if (blockTitle.toString().substr(0, 9) === '::scene::') {
      let sb = await this.csvFetchSceneBlock();
      blockTitle = sb.parent + blockTitle.toString().substring(9);
    }

    let parentRecords = await this.dbFetchByLookup('block', 'title', blockTitle);
    if (parentRecords.records.length < 1) {
      console.log(blockTitle, ' - block not found');
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
    if (row.parent.toString().substr(0, 9) === '::scene::') {
      let sb = await this.csvFetchSceneBlock();
      row.parent = sb.parent + row.parent.toString().substring(9);
    }
    if (row.name.toString().substr(0, 9) === '::scene::') {
      let sb = await this.csvFetchSceneBlock();
      row.name = sb.parent + row.name.toString().substring(9);
    }

    let children = {};
    if (row.parent)
      children = await this._getBlockChildren(row.parent, row.childtype, row.name);
    else {
      children = await this.dbFetchByLookup('block', 'title', row.name);
      children = children.recordsById;
    }

    let shapeMeshOnlyFields = [
      'diffuseColor',
      'emissiveColor',
      'ambientColor',
      'specularColor'
    ];
    let cameraFields = [
      'cameraFOV',
      'cameraOriginX',
      'cameraOriginY',
      'cameraOriginZ',
      'cameraRotationX',
      'cameraRotationY',
      'cameraRotationZ',
      'cameraRadius',
      'cameraHeightOffset',
      'cameraRotationOffset',
      'cameraAcceleration',
      'maxCameraSpeed',
      'cameraAimTargetX',
      'cameraAimTargetY',
      'cameraAimTargetZ'
    ];
    let lightFields = [
      'lightOriginX',
      'lightOriginY',
      'lightOriginZ',
      'lightDirectionX',
      'lightDirectionY',
      'lightDirectionZ',
      'lightIntensity',
      'lightAngle',
      'lightDecay'
    ];
    let lightColors = [
      'lightDiffuse',
      'lightSpecular',
      'lightGroundColor'
    ];
    let blockFields = [
      'frameCommand',
      'frameCommandField',
      'frameCommandValue'
    ];

    if (row.y === undefined)
      console.log('row with no y value', row);

    let childIndex = this.getNumberOrDefault(row.childindex, -1);
    if (row.childindex === 'all')
      childIndex = -1;
    let frameData = {
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

    if (row.childtype === 'shape' || row.childtype === 'mesh') {
      shapeMeshOnlyFields.forEach(v => {
        if (row[v.toLowerCase()]) {
          let vector = this.getVector(row[v.toLowerCase()], 0, 0, 0);
          frameData[v + 'R'] = vector.x;
          frameData[v + 'G'] = vector.y;
          frameData[v + 'B'] = vector.z;
        }
      });
    }

    if (row.childtype === 'camera') {
      cameraFields.forEach(f => {
        if (row[f.toLowerCase()])
          frameData[f] = row[f.toLowerCase()];
      });
    }
    if (row.childtype === 'block') {
      blockFields.forEach(f => {
        if (row[f.toLowerCase()])
          frameData[f] = row[f.toLowerCase()];
      });
    }

    if (row.childtype === 'light') {
      lightFields.forEach(f => {
        if (row[f.toLowerCase()])
          frameData[f] = row[f.toLowerCase()];
      });
      lightColors.forEach(v => {
        if (row[v.toLowerCase()]) {
          let vector = this.getVector(row[v.toLowerCase()], 0, 0, 0);
          frameData[v + 'R'] = vector.x;
          frameData[v + 'G'] = vector.y;
          frameData[v + 'B'] = vector.z;
        }
      });
    }

    let frameOrder = frameData.frameOrder;
    let childIndexCounter = -1;
    for (let parentKey in children) {
      childIndexCounter++;
      if (childIndex !== -1 && childIndex !== childIndexCounter) {
        continue;
      }

      let frameRecords = await this.dbFetchByLookup('frame', 'parentKey', parentKey);
      for (let key in frameRecords.recordsById) {
        let rec = frameRecords.recordsById[key];

        if (!rec.frameOrder)
          rec.frameOrder = '';
        if (frameOrder.toString() === rec.frameOrder.toString())
          await this.dbRemove('frame', key);
      }

      frameData.parentKey = parentKey;
      await this.dbSetRecord('frame', Object.assign({}, frameData));
    }

    let promises = [];
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
      case 'buildingblock':
        return this.addBuildingBlock(row);
      case 'material':
        return this.addCSVMaterial(row);
      case 'displayblock':
        return this.addCSVDisplayBlock(row);
    }

    console.log('type not found', row.asset);
    return;
  }
  __testIfImageFile(textureName) {
    if (!textureName)
      return false;

    if (textureName.indexOf('.') !== -1 || textureName.indexOf('/') !== -1)
      return true;
    return false;
  }
  async addCSVMaterial(row) {
    let count_removed = await this.dbRemoveRecordsByTitle('material', row.name);
    let remove_textures = false;
    if (count_removed > 0) {
      remove_textures = true;
      console.log('dup material deleted', row.name, count_removed);
    }
    let materialName = row.name;
    let textureName = '';
    if (!row.hasalpha) row.hasalpha = '';
    if (!row.isvideo) row.isvideo = '';
    if (row.hasalpha === 'x') row.hasalpha = '1';
    if (row.isvideo === 'x') row.isvideo = '1';
    if (row.ambient === 'x') row.ambient = '1';
    if (row.emissive === 'x') row.emissive = '1';
    if (!row.offsetu) row.offsetu = '';
    if (!row.offsetv) row.offsetv = '';
    if (!row.scaleu) row.scaleu = '';
    if (!row.scalev) row.scalev = '';
    if (!row.alpha) row.alpha = '1';

    let hasAlpha = (row.hasalpha.toString() === '1');
    let isVideo = (row.isvideo.toString() === '1');
    if (row.texture.indexOf('.png') !== -1 || row.texture.indexOf('.svg') !== -1 || row.texture.indexOf('.gif') !== -1) {
      hasAlpha = true;
    }
    if (row.texture.indexOf('.mp4') !== -1 || row.texture.indexOf('.webm') !== -1) {
      isVideo = true;
    }

    if (this.__testIfImageFile(row.texture)) {
      textureName = row.name + '_texture';
      let textureData = {
        url: row.texture,
        vScale: row.scalev,
        uScale: row.scaleu,
        uOffset: row.offsetu,
        vOffset: row.offsetv,
        hasAlpha,
        isVideo
      };

      if (textureName.toString().substring(0, 8) === 'circuit_') {
        textureData.orig = Object.assign({}, textureData);
      }
      textureData.title = textureName;

      if (remove_textures) await this.dbRemoveRecordsByTitle('texture', textureData.title);
      this.dbSetRecord('texture', textureData);
    }

    let bumpTextureName = '';
    if (this.__testIfImageFile(row.bumptexture)) {
      bumpTextureName = row.name + '_Ntexture';
      let textureData = {
        title: bumpTextureName,
        url: row.bumptexture,
        vScale: row.scalev,
        uScale: row.scaleu,
        uOffset: row.offsetu,
        vOffset: row.offsetv
      };
      if (remove_textures) await this.dbRemoveRecordsByTitle('texture', textureData.title);
      this.dbSetRecord('texture', textureData);
    }

    let specularTextureName = '';
    if (this.__testIfImageFile(row.speculartexture)) {
      specularTextureName = row.name + '_Stexture';
      let textureData = {
        title: specularTextureName,
        url: row.speculartexture,
        vScale: row.scalev,
        uScale: row.scaleu,
        uOffset: row.offsetu,
        vOffset: row.offsetv,
        hasAlpha,
        isVideo
      };
      if (remove_textures) await this.dbRemoveRecordsByTitle('texture', textureData.title);
      this.dbSetRecord('texture', textureData);
    }

    let ambientTextureName = row.ambient === '1' ? textureName : '';
    let emissiveTextureName = row.emissive === '1' ? textureName : '';
    let reflectionTextureName = '';
    let specularPower = '4';
    let diffuseColor = '';
    let emissiveColor = '';
    let ambientColor = '';
    let specularColor = '';
    if (row.specularpower) specularPower = row.specularpower;

    if (this.__testIfImageFile(row.ambienttexture)) {
      ambientTextureName = row.name + '_Atexture';
      let textureData = {
        title: ambientTextureName,
        url: row.ambienttexture,
        vScale: row.scalev,
        uScale: row.scaleu,
        uOffset: row.offsetu,
        vOffset: row.offsetv,
        hasAlpha,
        isVideo
      };
      if (remove_textures) await this.dbRemoveRecordsByTitle('texture', textureData.title);
      this.dbSetRecord('texture', textureData);
    }

    if (this.__testIfImageFile(row.emissivetexture)) {
      emissiveTextureName = row.name + '_Etexture';
      let textureData = {
        title: emissiveTextureName,
        url: row.emissivetexture,
        vScale: row.scalev,
        uScale: row.scaleu,
        uOffset: row.offsetu,
        vOffset: row.offsetv,
        hasAlpha,
        isVideo
      };
      if (remove_textures) await this.dbRemoveRecordsByTitle('texture', textureData.title);
      this.dbSetRecord('texture', textureData);
    }

    if (this.__testIfImageFile(row.reflectiontexture)) {
      reflectionTextureName = row.name + '_Rtexture';
      let textureData = {
        title: reflectionTextureName,
        url: row.reflectiontexture,
        vScale: row.scalev,
        uScale: row.scaleu,
        uOffset: row.offsetu,
        vOffset: row.offsetv,
        hasAlpha,
        isVideo
      };
      if (remove_textures) await this.dbRemoveRecordsByTitle('texture', textureData.title);
      this.dbSetRecord('texture', textureData);
    }

    if (row.diffusecolor) diffuseColor = row.diffusecolor;
    if (row.ambientcolor) ambientColor = row.ambientcolor;
    if (row.emissivecolor) emissiveColor = row.emissivecolor;
    if (row.specularcolor) specularColor = row.specularcolor;

    let materialData = {
      title: row.name,
      diffuseTextureName: textureName,
      ambientTextureName,
      emissiveTextureName,
      bumpTextureName,
      specularTextureName,
      reflectionTextureName,
      specularPower,
      backFaceCulling: true,
      ambientColor,
      diffuseColor,
      emissiveColor,
      specularColor,
      alpha: row.alpha
    };
    return await this.dbSetRecord('material', materialData);
  }
  async addCSVAnimatedLine(row) {
    let dashes = this.getNumberOrDefault(row.dashes, 1);
    let runlength = this.getNumberOrDefault(row.runlength, 2000);
    if (row.runlength && row.runlength.toString().indexOf('s') !== -1) {
      let str = row.runlength.split('s').join('');
      let v = this.getNumberOrDefault(str, 0);
      runlength = v * 1000;
    }
    let width = this.getNumberOrDefault(row.width, 1);
    let height = this.getNumberOrDefault(row.height, 1);
    let depth = this.getNumberOrDefault(row.depth, 10);
    let dashlength = this.getNumberOrDefault(row.dashlength, 1);
    if (row.scalarframetimes === undefined)
      row.scalarframetimes = '';
    let scalarframetimes = (row.scalarframetimes.toString() === '1');

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
        if (scalarframetimes)
          frame.frameTime = iTime.toString();

        frame.frameOrder = frameOrder.toString();
        frame.positionZ = zh.toFixed(3);
        this.dbSetRecord('frame', frame);
        frameOrder += 10;

        frame.frameTime = ((iTime + 5) / runlength * 100.0).toFixed(2).toString() + '%';
        if (scalarframetimes)
          frame.frameTime = (iTime + 5).toString();
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
      if (scalarframetimes)
        frame.frameTime = runlength.toString();
      this.dbSetRecord('frame', frame);
    }

    row.asset = 'block';
    row.frametime = row.runlength;
    this.addParentBlockChild(row);
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

    row.asset = 'block';
    this.addParentBlockChild(row);
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
      shapetype: 'text',
      textstroke: row.textstroke
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

    let sRow = Object.assign({}, row);
    sRow.parent = row.name;
    sRow.name = row.name + '_shape';
    sRow.x = 0;
    sRow.y = 0;
    sRow.z = 0;
    sRow.rx = 0;
    sRow.ry = 0;
    sRow.rz = 0;
    sRow.sx = 1;
    sRow.sy = 1;
    sRow.sz = 1;
    if (sRow.createshapetype === 'cube' || sRow.createshapetype === 'sphere')
      sRow.z = (-1.0 * minDim / 2.0).toFixed(3);
    else
      sRow.z = (-1.0 * depth / 2.0).toFixed(3);
    this.addCSVShapeRow(this.__childShapeRow(sRow));

    row.asset = 'block';
    this.addParentBlockChild(row);
    return blockResult;
  }
  async addBuildingBlock(row) {
    if (!row.width)
      row.width = '100';
    if (!row.height)
      row.height = '60';
    if (!row.depth)
      row.depth = '45';

    let block = {
      title: row.name,
      width: row.width,
      height: row.height,
      depth: row.depth
    };
    let b_result = await this.dbSetRecord('block', block);

    let panelrow = this.defaultCSVRow();
    if (row.floormaterial || row.floorimage) {
      panelrow.asset = 'shape';
      panelrow.name = 'circuit_' + row.name + '_floorpanel';
      if (row.floorimage) {
        panelrow.materialname = panelrow.name;
        panelrow.texture = row.floorimage;
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
      panelrow.name = 'circuit_' + row.name + '_ceilingpanel';
      if (row.ceilingwallimage) {
        panelrow.materialname = panelrow.name;
        panelrow.texture = row.ceilingwallimage;
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

      panelrow.name = 'circuit_' + row.name + '_backwallpanel';
      if (row.backwallimage) {
        panelrow.materialname = panelrow.name;
        panelrow.texture = row.backwallimage;
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
      panelrow.name = 'circuit_' + row.name + '_frontwallpanel';
      if (row.frontwallimage) {
        panelrow.materialname = panelrow.name;
        panelrow.texture = row.frontwallimage;
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
      panelrow.name = 'circuit_' + row.name + '_rightwallpanel';
      if (row.rightwallimage) {
        panelrow.materialname = panelrow.name;
        panelrow.texture = row.rightwallimage;
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
      panelrow.name = 'circuit_' + row.name + '_leftwallpanel';
      if (row.leftwallimage) {
        panelrow.materialname = panelrow.name;
        panelrow.texture = row.leftwallimage;
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

    row.asset = 'block';
    this.addParentBlockChild(row);
    return b_result;
  }
  async addCSVSceneBlock(row) {
    if (row.groundimage) {
      let i = row.groundimage;
      if (i.indexOf('color:') === -1 && i.indexOf('decolor:') === -1 && i.indexOf('ecolor') === -1) {
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
      } else {
        row.groundmaterial = row.groundimage;
      }
    }

    let boxsize = this.getNumberOrDefault(row.skyboxsize, 800);
    if (!row.width)
      row.width = boxsize.toString();
    if (!row.height)
      row.height = boxsize.toString();
    if (!row.depth)
      row.depth = boxsize.toString();

    let block = {
      title: row.name,
      width: row.width,
      height: row.height,
      depth: row.depth,
      groundMaterial: row.groundmaterial,
      skybox: row.skybox,
      skyboxSize: row.skyboxsize,
      blockCode: 'demo',
      blockFlag: 'scene'
    }

    if (row.videourl) block.videoURL = row.videourl;
    if (row.videotype) block.videoType = row.videotype;
    if (row.videowidth) block.videoWidth = row.videowidth;
    if (row.videoheight) block.videoHeight = row.videoheight;
    if (row.videoalignbottom === "1") block.videoAlignBottom = true;
    if (row.videoalignright === "1") block.videoAlignRight = true;
    if (row.videoclearurl === "1") block.videoClearURL = true;

    if (row.audiourl) block.audioURL = row.audiourl;
    if (row.displaycamera) block.displayCamera = row.displaycamera;
    if (row.blockflag) block.blockFlag = row.blockflag;
    if (row.blockcode) block.blockCode = row.blockcode;
    if (row.genericblockdata) block.genericBlockData = row.genericblockdata;
    if (row.displayui) block.displayUI = row.displayui;
    if (row.supportvr) block.supportVR = row.supportvr;
    if (row.clearcolor) block.clearColor = row.clearcolor;
    if (row.ambientcolor) block.ambientColor = row.ambientcolor;

    if (row.fogtype) block.fogType = row.fogtype;
    if (row.fogdensity) block.fogDensity = row.fogdensity;
    if (row.fogcolor) block.fogColor = row.fogcolor;
    if (row.fogstart) block.fogStart = row.fogstart;
    if (row.fogend) block.fogEnd = row.fogend;

    let blockresult = await this.dbSetRecord('block', block);
    let frameTime = row.frametime;
    if (frameTime === '' || frameTime === undefined)
      frameTime = '60s';
    this.dbSetRecord('frame', {
      parentKey: blockresult.key,
      frameOrder: 10,
      frameTime: 0,
      rotationY: '0deg'
    });
    if (frameTime)
      this.dbSetRecord('frame', {
        parentKey: blockresult.key,
        frameOrder: 20,
        frameTime
      });

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
    chatBC.nofirstframe = '1';
    this.addCSVRow(chatBC);

    let fixturesBC = this.defaultCSVRow();
    fixturesBC.asset = 'block';
    fixturesBC.name = row.name + '_fixturesWrapper';
    fixturesBC.parent = row.name;
    fixturesBC.x = '0';
    this.addCSVRow(fixturesBC);

    let signBoardShape = this.defaultCSVRow();
    signBoardShape.asset = 'shape';
    signBoardShape.name = 'scene_product_signboard';
    signBoardShape.depth = '4';
    signBoardShape.height = '6';
    signBoardShape.width = '.1';
    signBoardShape.shapetype = 'box';
    this.addCSVRow(signBoardShape);

    let basketBC = this.defaultCSVRow();
    basketBC.asset = 'block';
    basketBC.name = row.name + '_basketcart';
    basketBC.parent = row.name;
    basketBC.blockflag = 'basket';
    basketBC.nofirstframe = '1';
    this.addCSVRow(basketBC);

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
    await this.addCSVRow(blockRow);

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
    textPlaneBlock.isfittedtext = '1';
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
    } else {
      this.__add2dTextPlane(row);
    }

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

    if (!row.texturetext) row.texturetext = '';
    if (!row.texturetext2) row.texturetext2 = '';
    if (!row.texturetext3) row.texturetext3 = '';
    if (!row.texturetext4) row.texturetext4 = '';

    let textureData = {
      textFontFamily: row.textfontfamily,
      hasAlpha: true,
      isText: true,
      textFontColor: row.textfontcolor,
      textureText: row.texturetext,
      textureText2: row.texturetext2,
      textureText3: row.texturetext3,
      textureText4: row.texturetext4,
      url: '',
      title: textPlaneName
    };
    textureData.textFontSize = this.getNumberOrDefault(row.textfontsize, 100).toString();
    textureData.textureTextRenderSize = this.getNumberOrDefault(row.texturetextrendersize, 512).toString();
    textureData.textFontWeight = row.textfontweight ? row.textfontweight : '';

    textureData.isFittedText = false;
    if (row.isfittedtext)
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
    textPlane.hasalpha = 'x';
    textPlane.isfittedtext = '1';
    textPlane.istext = true;
    let colorIndex = product.colorIndex;
    if (colorIndex !== 2 && colorIndex !== 0) {
      textPlane.textfontcolor = '0,0,0';
    } else {
      textPlane.textfontcolor = '255,255,255';
    }
    textPlane.texturetext = product.title;
    textPlane.texturetext2 = product.priceText;
    textPlane.width = '8';
    textPlane.height = '8';
    textPlane.depth = '8';
    textPlane.textfontfamily = product.origRow.textfontfamily;
    textPlane.name = product.childName + '_pricedesc';
    textPlane.parent = parent;
    textPlane.x = '0.06';
    textPlane.y = (productData.signYOffset - 2.75).toString();
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
      blockImageShape.y = (productData.signYOffset + 1.0).toString();
      blockImageShape.ry = '-90deg';
      newObjects.push(blockImageShape);
    }

    let blockSPBC = this.defaultCSVRow();
    blockSPBC.asset = 'blockchild';
    blockSPBC.childtype = 'shape';
    blockSPBC.parent = parent;
    blockSPBC.name = 'scene_product_signboard';
    blockSPBC.materialname = 'inherit';
    blockSPBC.y = productData.signYOffset.toString();
    newObjects.push(blockSPBC);

    return this.addCSVRowList(newObjects);
  }
  async _addSignPost3D(product, productData, parent) {
    if (product.priceText) {
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
      priceText.texttext = product.priceText;
      priceText.textdepth = '.25';
      priceText.textsize = '100';
      priceText.parent = parent;
      priceText.y = (productData.signYOffset - 3.25).toString();
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
    descText.y = (productData.signYOffset + 1.0).toString();
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
      blockImageShape.y = (productData.signYOffset - 1).toString();
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
    if (product.priceText)
      descText.texttext = product.priceText;
    else
      descText.texttext = product.title;
    descText.textdepth = '.25';
    descText.textsize = '100';
    descText.parent = parent;
    descText.y = (productData.signYOffset - 2.0).toString();
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
    showFrame.parent = productData.sceneBlock.title + '_productsWrapper';
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
    hideFrame.parent = productData.sceneBlock.title + '_productsWrapper';
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
    endFrame.parent = productData.sceneBlock.title + '_productsWrapper';
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
    cameraBlock.signyoffset = row.signyoffset;
    cameraBlock.musicparams = row.musicparams;
    cameraBlock.datascalefactor = row.datascalefactor;
    cameraBlock.productrotatey = row.productrotatey;
    cameraBlock.dataframesfilter = row.dataframesfilter;
    childCSVRows.push(cameraBlock);

    let cameraBlockBC = this.defaultCSVRow();
    cameraBlockBC.asset = 'blockchild';
    cameraBlockBC.name = cameraBlock.name;
    cameraBlockBC.childtype = 'block';
    cameraBlockBC.parent = sceneData.title;
    cameraBlockBC.rx = row.originrx;
    cameraBlockBC.ry = row.originry;
    cameraBlockBC.rz = row.originrz;
    cameraBlockBC.x = row.originy;
    cameraBlockBC.y = row.originy;
    cameraBlockBC.z = row.originz;
    childCSVRows.push(cameraBlockBC);

    let cam = this.defaultCSVRow();
    cam.asset = 'blockchild';
    cam.cameraacceleration = '.005';
    cam.camerafov = '0.8';
    cam.childname = "demo";
    if (row.cameraradius) cam.cameraradius = row.cameraradius;
    cam.cameratype = 'FollowCamera';
    if (row.heightoffset) cam.heightoffset = row.heightoffset;
    cam.camerarotationoffset = '0';
    cam.maxcameraspeed = '10';
    cam.targetblock = "block:" + cameraBlock.name;
    cam.childtype = 'camera';
    cam.name = row.name;
    cam.parent = sceneData.title;
    cam.rx = row.rx;
    cam.ry = row.ry;
    cam.rz = row.rz;
    cam.x = row.x;
    cam.y = row.y;
    cam.z = row.z;
    if (row.originx) cam.originx = row.originx;
    if (row.originy) cam.originy = row.originy;
    if (row.originz) cam.originz = row.originz;
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
    if (!cameraRow)
      cameraRow = {};
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
        cameraBlockFrame.ry = this.angleDeg(p.ry, '0deg') + this.angleDeg(cameraRow.originry, '0deg');
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
        ry: '-100',
        rz: '',
        sx: '.001',
        sy: '.001',
        sz: '.001',
        visibility: ''
      };
      await this.addCSVRow(row);
    }

    return Promise.all(promises);
  }
  async _addProductFramesFromData(product, productData, productIndex, freqPrefix = '') {
    if (!freqPrefix)
      return;

    let child = product.childName;
    let sb = await this.csvFetchSceneBlock();

    let freq_data = await this.dbFetchByLookup('block', 'blockFlag', freqPrefix + 'frequencyblock' + (productIndex + 1).toString());
    let frameRows = [];

    if (freq_data.records.length > 0) {
      let scaleFactor = productData.scaleFactor;
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
        if (productData.productRotateY !== 0) {

          bandScaleFrame.ry = (-1.0 * productData.productRotateY * timeRatio).toFixed(2) + 'deg';
        }

        if (Math.abs(lastScale - dataPoint) < productData.dataFramesFilter)
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
        promises.push(this._addProductFramesFromData(pInfo.products[c], pInfo, productIndex, pInfo.musicParams));
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
      return null;

    let promises = [];
    let frameRecords = await this.dbFetchByLookup('frame', 'parentKey', pInfo.sceneId);

    if (frameRecords.records.length <= 0)
      return null;

    let frameId = frameRecords.recordIds[frameRecords.recordIds.length - 1];
    if (pInfo.runLength !== 0)
      promises.push(
        this.dbSetRecordFields('frame', {
          frameTime: (pInfo.runLength * 1000).toString()
        }, frameId));

    promises.push(this.addCSVBasketProducts());

    await Promise.all(promises);

    return this.dbSetRecordFields('block', {
      generationState: 'ready'
    }, pInfo.sceneId);
  }
  async initProducts(cameraData = null, returnRawDisplayBlocks = false) {
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
        priceText: blockData.itemPriceText,
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

    let cameraBC = await this.findMatchBlocks('camera', 'demo', sceneId);
    let cameraOrigRow = null;
    if (cameraBC[0]) {
      cameraOrigRow = cameraBC[0].BC.origRow.origCameraRow;
    }

    if (!cameraData)
      cameraData = cameraOrigRow;

    let finishDelay = 0,
      introTime = 0,
      runLength = 0,
      scaleFactor = 0,
      productRotateY = 0,
      dataFramesFilter = 0,
      signYOffset = 0;
    if (cameraData) {
      finishDelay = this.getNumberOrDefault(cameraData.finishdelay, 0);
      introTime = this.getNumberOrDefault(cameraData.introtime, 0);
      runLength = this.getNumberOrDefault(cameraData.runlength, 0);
      signYOffset = this.getNumberOrDefault(cameraData.signyoffset, 6.0);
      scaleFactor = this.getNumberOrDefault(cameraData.datascalefactor, 2.0);
      productRotateY = this.getNumberOrDefault(cameraData.productrotatey, 0);
      dataFramesFilter = this.getNumberOrDefault(cameraData.dataframesfilter, .05);
    }

    let blocksData = await this.dbFetchByLookup('block', 'blockFlag', 'displayblock');
    let displayBs = blocksData.recordsById;
    let displayBlocks = [];
    let rawDisplayBlocksData = blocksData;
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

    let musicParams = '';
    if (cameraData && cameraData.musicparams)
      musicParams = cameraData.musicparams;
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
      signYOffset,
      productRotateY,
      musicParams,
      dataFramesFilter,
      scaleFactor
    };

    if (returnRawDisplayBlocks)
      pInfo.rawDisplayBlocksData = rawDisplayBlocksData;
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
  async clearProjectData(deleteProject = false) {
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
    if (deleteProject) {
      let updatePath = 'projectTitles/' + this.projectId;
      console.log('delete', updatePath);
      await this.firebase.database().ref(updatePath).remove();
    }

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
  async addProject(newTitle, key = false, tags) {
    if (!key)
      key = this.firebase.database().ref('projectTitles').push().key;
    if (!tags)
      tags = '';
    await this.firebase.database().ref('projectTitles/' + key).set({
      title: newTitle,
      tags
    });
    await this.firebase.database().ref('project/' + key).set({
      title: newTitle
    });

    return key;
  }
  async widForName(name) {
    let projects = await this.dbFetchByLookup('projectTitles', 'title', name);
    if (projects.recordIds.length > 1)
      this.multipleProjectsWithSameName = true;

    if (projects.recordIds.length > 0)
      return projects.recordIds[0];

    return null;
  }
  async deleteOldChat() {
    let sceneData = await this.csvFetchSceneBlock();

    if (!sceneData.parent)
      return {};
      //    key, data, parent

    let obj = await this.findMatchBlocks('block', sceneData.parent + '_chatWrapper', sceneData.key);
    let d = obj[0];
    if (!obj[0])
      return {};
    let bcChildData = await this.dbFetchByLookup('blockchild', 'parentKey', obj[0].blockKey);
    //let children = bcChildData.recordIds;

    //blockData,
    //BC: children[i],
    //blockKey,
    //BCKey: i
    //console.log('chats', children);

    let testDate = new Date();
    bcChildData.records.forEach((t, index) => {
      if (testDate - t.sortKey > 60000) {
        let updatePath = this.path('blockchild') + '/' + bcChildData.recordIds[index];
        this.firebase.database().ref(updatePath).remove();
      }
    });
    return {};
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = gCSVImport;
}
