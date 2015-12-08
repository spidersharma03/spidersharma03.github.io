/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function readIBLInfo(file, readyCallBack)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    var roughnessArray = [];
    var uniformTexCoordSetArray = [];
    rawFile.onreadystatechange = function ()
    {
        if (rawFile.readyState === 4)
        {
            if (rawFile.status === 200 || rawFile.status === 0)
            {
                var jsonArray = JSON.parse(rawFile.responseText);
                var texture_width = Number(jsonArray.TextureWidth);
                var texture_height = Number(jsonArray.TextureHeight);
                var textRectInfoArray = [];
                for (var data in jsonArray.TextureRectInfo) {
                    roughnessArray.push(Number(jsonArray.TextureRectInfo[data].roughness) / 255);
                    var texRect = new TextureCoordSet();
                    var x = Number(jsonArray.TextureRectInfo[data].x);
                    var y = Number(jsonArray.TextureRectInfo[data].y);
                    var w = Number(jsonArray.TextureRectInfo[data].w);
                    var h = Number(jsonArray.TextureRectInfo[data].h);
                    var offsetx = 0.5 / texture_width;
                    var offsety = 0.5 / texture_height;

                    texRect.u1 = x / texture_width + offsetx;
                    var u2 = (x + w) / texture_width - offsetx;
                    texRect.u2_u1 = u2 - texRect.u1;
                    texRect.v1 = y / texture_width + offsety;
                    var v2 = (y + h) / texture_height - offsety;
                    texRect.v2_v1 = v2 - texRect.v1;
                    textRectInfoArray.push(texRect);
                }
                for (var i = 0; i < textRectInfoArray.length; i++) {
                    var data = textRectInfoArray[i];
                    uniformTexCoordSetArray.push(new THREE.Vector4(data.u1, data.u2_u1, data.v1, data.v2_v1));
                }
                //diamondMaterial.uniforms['TextureCoordSetArray'].value = uniformTexCoordSetArray;
                //diamondMaterial.uniforms['RoughnessArray'].value = roughnessArray;
                readyCallBack(roughnessArray, uniformTexCoordSetArray);
                IsIBLDataRead = true;
            }
        }
    };
    rawFile.send(null);
}

function TextureCoordSet() {
    this.u1 = 0;
    this.u2_u1 = 0;
    this.v1 = 0;
    this.v2_v1 = 0;
}

function HDREnvTextureLoader() {
}

HDREnvTextureLoader.prototype = {
    constructor: HDREnvTextureLoader,
    
    load: function(textureName) {
        var reflTexture = THREE.ImageUtils.loadTexture(textureName);
        reflTexture.wrapS = THREE.ClampToEdgeWrapping;
        reflTexture.wrapT = THREE.ClampToEdgeWrapping;
        reflTexture.generateMipmaps = false;
        reflTexture.magFilter = THREE.LinearFilter;
        reflTexture.minFilter = THREE.LinearFilter;
        return reflTexture;
    },
    
    loadIBLInfo: function(fileName, callBack) {
        readIBLInfo(fileName, callBack);
    }
};
   