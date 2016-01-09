/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var vertexShaderIBL = "varying vec2 vUv; \n\
   varying vec3 vecPos;\n\
   varying vec3 viewPos;\n\
   varying vec3 worldNormal;\n\
   varying vec3 Normal;\n\
   void main() {\n\
   vUv = uv;\n\
   vecPos = (modelMatrix * vec4(position, 1.0 )).xyz;\n\
   viewPos = (modelViewMatrix * vec4(position, 1.0 )).xyz;\n\
   worldNormal = (modelMatrix * vec4(normal,0.0)).xyz;\n\
   Normal = normalMatrix * normal;\n\
   gl_Position = projectionMatrix * viewMatrix * vec4(vecPos, 1.0);\n\
}";
var fragmentShaderIBL = "precision highp float;\n\
   #extension GL_OES_standard_derivatives : enable\n\
   #define PI 3.14\n\
   #define USE_HDR\n\
   varying vec2 vUv; \n\
   varying vec3 vecPos;\n\
   varying vec3 viewPos;\n\
   varying vec3 worldNormal;\n\
   varying vec3 Normal;\n\
   uniform vec4 SpecularColor;\n\
   uniform vec4 DiffuseColor;\n\
   uniform sampler2D IBLTexture;\n\
   uniform sampler2D NormalMap;\n\
   uniform sampler2D SpecularMap;\n\
   uniform sampler2D RoughnessMap;\n\
   uniform vec4 TextureCoordSetArray[8];\n\
   uniform float RoughnessArray[8];\n\
   uniform float Roughness;\n\
   uniform float uMetal;\n\
   uniform float metalRoughness;\n\
   \n\
    float MipLevel( vec2 uv ) {\n\
        vec2 dx = dFdx( uv * 1024.0 );\n\
        vec2 dy = dFdy( uv * 1024.0 );\n\
        float d = max( dot( dx, dx ), dot( dy, dy ) );\n\
        // Clamp the value to the max mip level counts\n\
        float rangeClamp = pow(2.0, (8.0 - 1.0) * 2.0);\n\
        d = clamp(d, 1.0, rangeClamp);\n\
        float mipLevel = 0.5 * log2(d);\n\
        mipLevel = floor(mipLevel);\n\
        return mipLevel;\n\
  }\n\
  vec3 convertRGBEToRGB(vec4 rgbe) {\n\
	float d = pow(2.0, rgbe.w*256.0 - 128.0);\n\
	return vec3(rgbe) * d;\n\
   }\n\
   \n\
   vec3 tonemap(vec3 RGB) {\n\
      float LogAvgLum = 0.2;//0.08\n\
      float key = 1.0;\n\
      float Ywhite = 1e1;\n\
      Ywhite *= Ywhite;\n\
      float sat = 0.5;\n\
      float Ylum = dot(RGB ,vec3(0.2126, 0.7152, 0.0722));\n\
      float Y = key/LogAvgLum * Ylum ;\n\
      float Yd = Y * ( 1.0 + Y/Ywhite)/( 1.0 + Y) ;\n\
      return Yd * pow(RGB/Ylum ,vec3(sat, sat, sat));\n\
   }\n\
   vec4 SampleDiffuseContribution(vec4 difCol,vec3 direction) {\n\
     vec4 texCoordSetSample = TextureCoordSetArray[7];\n\
     float phi = atan(direction.z, direction.x); \n\
     phi = phi < 0.0 ? 2.0*PI + phi : phi;\n\
     phi /= (2.0*PI);\n\
     float theta = (asin(direction.y) + PI * 0.5)/PI;\n\
     vec2 texCoord = vec2(texCoordSetSample.x + phi * texCoordSetSample.y, texCoordSetSample.z + theta * texCoordSetSample.w);\n\
     vec4 rgbe = texture2D(IBLTexture, texCoord);\n\
     vec3 rgb = tonemap(difCol.xyz*convertRGBEToRGB(rgbe));\n\
     #ifdef USE_HDR\n\
        return vec4(rgb, 1.0);\n\
     #else\n\
        return difCol * texture2D(IBLTexture, texCoord);\n\
     #endif\n\
   }\n\
   \n\
   \n\
   vec4 SampleSpecularContribution(vec4 specularColor, vec3 direction, float roughness) {\n\
      vec4 texCoordSetLowerSampler;\n\
      vec4 texCoordSetUpperSampler;\n\
      float dRoughness = 0.0;\n\
      bool bFound = false;\n\
      for(int i=8-2; i>=1; i--) {\n\
         if(roughness > RoughnessArray[i]) {\n\
            texCoordSetLowerSampler = TextureCoordSetArray[i];\n\
            texCoordSetUpperSampler = TextureCoordSetArray[i+1];\n\
            dRoughness = (roughness - RoughnessArray[i])/(RoughnessArray[i+1] - RoughnessArray[i]);\n\
            bFound = true;\n\
            break;\n\
         }\n\
      }\n\
      if(!bFound) {\n\
         texCoordSetLowerSampler = TextureCoordSetArray[0];\n\
         texCoordSetUpperSampler = TextureCoordSetArray[1];\n\
         dRoughness = (roughness - RoughnessArray[0])/(RoughnessArray[1] - RoughnessArray[0]);\n\
      }\n\
      \n\
      float phi_refl = atan(direction.z, direction.x); \n\
      phi_refl = phi_refl < 0.0 ? 2.0*PI + phi_refl : phi_refl;\n\
      phi_refl /= (2.0*PI);\n\
      float theta_refl = (asin(direction.y) + PI * 0.5)/PI;\n\
      theta_refl = theta_refl > 1.0 ? 1.0 : theta_refl;\n\
      vec2 texCoordLower = vec2(texCoordSetLowerSampler.x + phi_refl * texCoordSetLowerSampler.y, texCoordSetLowerSampler.z + theta_refl * texCoordSetLowerSampler.w);\n\
      vec2 texCoordUpper = vec2(texCoordSetUpperSampler.x + phi_refl * texCoordSetUpperSampler.y, texCoordSetUpperSampler.z + theta_refl * texCoordSetUpperSampler.w);\n\
      #ifdef USE_HDR\n\
        vec4 rgbeLower = texture2D(IBLTexture, texCoordLower);\n\
        vec4 rgbeUpper = texture2D(IBLTexture, texCoordUpper);\n\
        vec3 rgbLower = tonemap(specularColor.xyz*convertRGBEToRGB(rgbeLower));\n\
        vec3 rgbUpper = tonemap(specularColor.xyz*convertRGBEToRGB(rgbeUpper));\n\
        return  vec4(rgbLower, 1.0)*(1.0-dRoughness) +  vec4(rgbUpper, 1.0)*dRoughness;\n\
      #else\n\
      return specularColor*texture2D(IBLTexture, texCoordLower)*(1.0-dRoughness)\n\
       + specularColor*texture2D(IBLTexture, texCoordUpper)*dRoughness;\n\
      #endif\n\
   }\n\
   \n\
   mat3 getTBNMatrix( vec3 eye_pos, vec3 surf_norm ) {\n\
      vec3 q0 = dFdx( eye_pos.xyz );\n\
      vec3 q1 = dFdy( eye_pos.xyz );\n\
      vec2 st0 = dFdx( vUv.st );\n\
      vec2 st1 = dFdy( vUv.st );\n\
      vec3 S = normalize( q0 * st1.t - q1 * st0.t );\n\
      vec3 T = normalize( -q0 * st1.s + q1 * st0.s );\n\
      vec3 N = normalize( cross(S,T) );\n\
      return mat3( S, T, N );\n\
   }\n\
  \n\
   \n\
   vec3 EnvBRDFApprox( vec3 SpecularColor, float Roughness, float NoV ) {\n\
     vec4 c0 = vec4(-1.0, -0.0275, -0.572, 0.022);\n\
     vec4 c1 = vec4(1.0, 0.0425, 1.04, -0.04);\n\
     vec4 r = Roughness * c0 + c1;\n\
     float a004 = min( r.x * r.x, exp2( -9.28 * NoV ) ) * r.x + r.y;\n\
     vec2 AB = vec2( -1.04, 1.04 ) * a004 + r.zw;\n\
     return SpecularColor * AB.x + AB.y;\n\
   }\n\
   vec4 rgbToSrgb(vec4 rgbColor){\n\
     float a = 0.055;\n\
     return (1.0 + a) * pow(rgbColor, vec4(1.0/2.0)) - a;\n\
   }\n\
   \n\
   void main() {\n\
      vec2 uvRepeat = fract(vUv * 4.0);\n\
      vec3 viewVector = normalize(vecPos - cameraPosition);\n\
      vec3 normalizedWorldNormal = normalize(worldNormal);\n\
      float ndotv = dot(-normalizedWorldNormal, viewVector);\n\
      ndotv = ndotv < 0.0 ? 0.0 : ndotv;\n\
      vec3 reflectionVector = reflect( viewVector, normalizedWorldNormal );\n\
      vec3 specularColor = texture2D(SpecularMap, uvRepeat).xyz;//;\n\
      //specularColor = vec3(SpecularColor.xyz);//;\n\
      specularColor *= specularColor;\
      vec4 specularContribution = vec4(EnvBRDFApprox(specularColor, Roughness, ndotv),1.0);\n\
      float roughnessVal = (1.0 - texture2D(RoughnessMap, uvRepeat).r);\n\
      vec4 IblSpecularColor = SampleSpecularContribution(specularContribution, reflectionVector,roughnessVal);\n\
      vec4 finalColor =  IblSpecularColor + SampleDiffuseContribution(DiffuseColor, normalizedWorldNormal);\n\
      //vec3 dn = fwidth(normalizedWorldNormal);\n\
      //float dz = abs(dFdx(vecPos.z)) + abs(dFdy(vecPos.z));\n\
      #ifdef USE_HDR\n\
       gl_FragColor = (finalColor);\n\
      #else\n\
       gl_FragColor = 2.5*(finalColor);\n\
      #endif\n\
    }";

var shaderSource =
{
    uniforms: {
        IBLTexture: {type: 't', value: null},
        NormalMap: {type: 't', value: null},
        SpecularMap: {type: 't', value: null},
        RoughnessMap: {type: 't', value: null},
        TextureCoordSetArray: { type: 'v4v', value: null},
        RoughnessArray: { type: 'fv1', value: null},
        Roughness: {type: 'f', value: 0.0},
        SpecularColor: { type: 'v4', value: null},
        DiffuseColor: { type: 'v4', value: null},
        uMetal: { type: 'f', value: 0.0 },
        metalRoughness: { type: 'f', value: 0.6 }
    },
    vertexShader: vertexShaderIBL,
    fragmentShader: fragmentShaderIBL
};

function readIBL_Info(file, library)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status === 0)
            {
                var jsonArray = JSON.parse(rawFile.responseText);
                library.IBL_TextureWidth = Number(jsonArray.TextureWidth);
                library.IBL_TextureHeight = Number(jsonArray.TextureHeight);
                for( var data in jsonArray.TextureRectInfo) {
                    library.IBL_RoughnessArray.push(Number(jsonArray.TextureRectInfo[data].roughness)/255);
                    var texRect = new TextureCoordSet();
                    var x = Number(jsonArray.TextureRectInfo[data].x);
                    var y = Number(jsonArray.TextureRectInfo[data].y);
                    var w = Number(jsonArray.TextureRectInfo[data].w);
                    var h = Number(jsonArray.TextureRectInfo[data].h);
                    var offsetx = 0.5/library.IBL_TextureWidth;
                    var offsety = 0.5/library.IBL_TextureHeight;
                    
                    texRect.u1 = x/library.IBL_TextureWidth + offsetx;
                    var u2 = ( x + w)/library.IBL_TextureWidth - offsetx;
                    texRect.u2_u1 = u2 - texRect.u1;
                    texRect.v1 = y/library.IBL_TextureHeight + offsety;
                    var v2 = ( y + h)/library.IBL_TextureHeight - offsety;
                    texRect.v2_v1 = v2 - texRect.v1;
                    library.IBL_TextureRectInfoArray.push(texRect);
                }
                var uniformTexCoordSetArray = [];
                for( var i=0; i<library.IBL_TextureRectInfoArray.length; i++) {
                    var data = library.IBL_TextureRectInfoArray[i];
                    uniformTexCoordSetArray.push(new THREE.Vector4(data.u1, data.u2_u1, data.v1, data.v2_v1));
                }
                library.shaderSource.uniforms['TextureCoordSetArray'].value = uniformTexCoordSetArray;
                library.shaderSource.uniforms['RoughnessArray'].value = library.IBL_RoughnessArray; 
                library.shaderSource.uniforms['Roughness'].value = 0.0; 
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

MaterialLibrary = function() {
  this.shaderSource = shaderSource;   
  this.IBL_TextureWidth = 0;
  this.IBL_TextureHeight = 0;
  this.IBL_TextureRectInfoArray = [];
  this.IBL_RoughnessArray = new Array();
  readIBL_Info("../../img/IBL_Info.txt", this);
};


