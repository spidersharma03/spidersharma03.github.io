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
   Normal = normal;\n\
   gl_Position = projectionMatrix * viewMatrix * vec4(vecPos, 1.0);\n\
}";
var fragmentShaderIBL = "precision highp float;\n\
   #define PI 3.14\n\
   varying vec2 vUv; \n\
   varying vec3 vecPos;\n\
   varying vec3 viewPos;\n\
   varying vec3 worldNormal;\n\
   varying vec3 Normal;\n\
   uniform sampler2D IBLReflectionTexture;\n\
   uniform sampler2D IBLDiffuseTexture;\n\
   uniform vec4 TextureCoordSetArray[8];\n\
   uniform float RoughnessArray[8];\n\
   \n\
   vec4 SampleEnvMap(vec3 direction, float roughness) {\n\
      vec4 texCoordSetLowerSampler;\n\
      vec4 texCoordSetUpperSampler;\n\
      float dRoughness = 0.0;\n\
      bool bFound = false;\n\
      for(int i=8-2; i>=1; i--) {\n\
         if(roughness > RoughnessArray[i]) {\n\
            texCoordSetLowerSampler = TextureCoordSetArray[i];\n\
            texCoordSetUpperSampler = TextureCoordSetArray[i+1];\n\
            dRoughness = RoughnessArray[i+1] - RoughnessArray[i];\n\
            bFound = true;\n\
            break;\n\
         }\n\
      }\n\
      if(!bFound) {\n\
         texCoordSetLowerSampler = TextureCoordSetArray[0];\n\
         texCoordSetUpperSampler = TextureCoordSetArray[1];\n\
         dRoughness = RoughnessArray[1] - RoughnessArray[0];\n\
      }\n\
      \n\
      float phi_refl = atan(direction.z, direction.x); \n\
      phi_refl = phi_refl < 0.0 ? 2.0*PI + phi_refl : phi_refl;\n\
      phi_refl /= (2.0*PI);\n\
      float theta_refl = (asin(direction.y) + PI * 0.5)/PI;\n\
      vec2 texCoordLower = vec2(texCoordSetLowerSampler.x + phi_refl * texCoordSetLowerSampler.y, texCoordSetLowerSampler.z + phi_refl * texCoordSetLowerSampler.w);\n\
      vec2 texCoordUpper = vec2(texCoordSetUpperSampler.x + theta_refl * texCoordSetUpperSampler.y, texCoordSetUpperSampler.z + theta_refl * texCoordSetUpperSampler.w);\n\
      return texture2D(IBLReflectionTexture, texCoordLower)*(1.0-dRoughness) + texture2D(IBLReflectionTexture, texCoordUpper)*dRoughness;\n\
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
     bvec4 bRes = lessThan(rgbColor, vec4(0.003));\n\
     return (1.0 + a) * pow(rgbColor, vec4(1.0/2.4)) - a;\n\
   }\n\
   \n\
   void main() {\n\
      vec3 viewVector = normalize(vecPos - cameraPosition);\n\
      vec3 normalizedWorldNormal = normalize(worldNormal);\n\
      float ndotv = dot(-normalizedWorldNormal, viewVector);\n\
      ndotv = ndotv < 0.0 ? 0.0 : ndotv;\n\
      vec3 reflectionVector = reflect( viewVector, normalizedWorldNormal );\n\
      float phi_refl = atan(reflectionVector.z, reflectionVector.x); \n\
      phi_refl = phi_refl < 0.0 ? 2.0*PI + phi_refl : phi_refl;\n\
      phi_refl /= (2.0*PI);\n\
      float theta_refl = (asin(reflectionVector.y) + PI * 0.5)/PI;\n\
      vec2 uvLatLongRefl = vec2(phi_refl, theta_refl);\n\
      float phi_diffuse = atan(normalizedWorldNormal.z, normalizedWorldNormal.x); \n\
      phi_diffuse = phi_diffuse < 0.0 ? 2.0*PI + phi_diffuse : phi_diffuse;\n\
      phi_diffuse /= (2.0*PI);\n\
      float theta_diffuse = (asin(normalizedWorldNormal.y) + PI * 0.5)/PI;\n\
      vec2 uvLatLongDiffuse = vec2(phi_diffuse, theta_diffuse);\n\
      float roughness = 0.0;\n\
      vec3 specularColor = vec3(0.95,0.65,0.53);\n\
      vec4 diffuseColor = vec4(0.0,0.0,0.0,1.0);\n\
      //vec3 schlick = specularColor + (vec3(1.0) - specularColor ) * pow(1.0-ndotv,5.0);\n\
      vec4 specularContribution = vec4(EnvBRDFApprox(specularColor, roughness, ndotv),1.0);\n\
      //vec4 specularContribution = vec4(schlick,1.0);\n\
      vec4 finalColor = specularContribution * texture2D(IBLReflectionTexture, uvLatLongRefl) + diffuseColor * texture2D(IBLDiffuseTexture, uvLatLongDiffuse);\n\
      gl_FragColor = (finalColor);\n\
   }";

var shaderSource =
{
    uniforms: {
        IBLReflectionTexture: {type: 't', value: null},
        IBLDiffuseTexture: {type: 't', value: null}
    },
    vertexShader: vertexShaderIBL,
    fragmentShader: fragmentShaderIBL
};

function readIBL_Info(file, library)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status === 0)
            {
                var jsonArray = JSON.parse(rawFile.responseText);
                library.IBL_TextureWidth = Number(jsonArray.TextureWidth);
                library.IBL_TextureHeight = Number(jsonArray.TextureHeight);
                for( var data in jsonArray.TextureCoordInfo) {
                    library.IBL_RoughnessArray.push(Number(jsonArray.TextureCoordInfo[data].roughness));
                    var texRect = new TextureRect();
                    texRect.x = jsonArray.TextureCoordInfo[data].x;
                    texRect.y = jsonArray.TextureCoordInfo[data].y;
                    texRect.w = jsonArray.TextureCoordInfo[data].w;
                    texRect.h = jsonArray.TextureCoordInfo[data].h;
                    library.IBL_TextureRectInfoArray.push(texRect);
                }
            }
        }
  };
  rawFile.send(null);
}

function TextureRect() {
  this.x = 0;
  this.y = 0;
  this.w = 0;
  this.h = 0;
}

MaterialLibrary = function() {
  this.shaderSource = shaderSource;   
  this.IBL_TextureWidth = 0;
  this.IBL_TextureHeight = 0;
  this.IBL_TextureRectInfoArray = [];
  this.IBL_RoughnessArray = new Array();
  readIBL_Info("../../img/IBL_Info.txt", this);
};

