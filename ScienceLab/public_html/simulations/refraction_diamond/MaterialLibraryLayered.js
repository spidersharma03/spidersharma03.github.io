/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var vertexShaderIBL = "varying vec2 vUv; \n\
   attribute vec4 tangent;\n\
   varying vec3 vecPos;\n\
   varying vec3 viewPos;\n\
   varying vec3 worldNormal;\n\
   varying vec3 Normal;\n\
   varying mat3 tbn;\n\
   void main() {\n\
   vUv = uv;\n\
   vecPos = (modelMatrix * vec4(position, 1.0 )).xyz;\n\
   viewPos = (modelViewMatrix * vec4(position, 1.0 )).xyz;\n\
   worldNormal = (modelMatrix * vec4(normal,0.0)).xyz;\n\
   Normal = normalMatrix * normal;\n\
   vec3 vTangent = normalize( normalMatrix * tangent.xyz );\n\
   vec3 vBinormal = normalize(cross( Normal, vTangent ) * tangent.w);\n\
   tbn = mat3(vTangent, vBinormal, Normal);\n\
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
   varying mat3 tbn;\n\
   uniform vec4 SpecularColor;\n\
   uniform vec4 DiffuseColor;\n\
   uniform sampler2D IBLTexture;\n\
   uniform sampler2D RefractionTexture;\n\
   uniform sampler2D NormalMap;\n\
   uniform sampler2D SpecularMap;\n\
   uniform sampler2D RoughnessMap;\n\
   uniform vec4 TextureCoordSetArray[8];\n\
   uniform float RoughnessArray[8];\n\
   uniform float Roughness;\n\
   uniform float uMetal;\n\
   uniform float rIndexDelta;\n\
   uniform float repeatFactor;\n\
   uniform float repeatFactorNmap;\n\
   \n\
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
      float key = 0.38;\n\
      float Ywhite = 1e3;\n\
      Ywhite *= Ywhite;\n\
      float sat = 2.0;\n\
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
   vec3 SchlickApproxFresenel(vec3 SpecularColor, float NoV) {\n\
      float schlick = pow(1.0 - NoV, 5.0);\n\
      return SpecularColor * ( 1.0 - schlick) + schlick;\n\
   }\n\
   \n\
   float G_Vis(float NdotL, float NdotV, float roughness) {\n\
      float k = roughness * 0.5;\n\
      float gVis_view = NdotV/( NdotV*(1.0-k) + k);\n\
      float gVis_light = NdotL/( NdotL*(1.0-k) + k);\n\
      return gVis_view * gVis_light;\n\
   }\n\
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
      vec2 uvRepeat = fract(vUv * repeatFactorNmap);\n\
      vec3 viewVector = normalize(vecPos - cameraPosition);\n\
      vec3 normalizedWorldNormal = normalize(worldNormal);\n\
      vec3 tangentNormal = texture2D( NormalMap, uvRepeat ).xyz * 2.0 - 1.0;\n\
      tangentNormal.xy = tangentNormal.xy * 0.05;\n\
      tangentNormal.z = tangentNormal.z * 1.0;\n\
      mat3 normalizedTBN = mat3(normalize(tbn[0]), normalize(tbn[1]), normalize(tbn[2]));\n\
      normalizedWorldNormal = normalize( normalizedTBN * tangentNormal );\n\
      normalizedWorldNormal = (vec4(normalizedWorldNormal,1.0) * viewMatrix).xyz;\n\
      vec3 tViewVector = normalize(viewPos) * normalizedTBN;\n\
      tViewVector = normalize(tViewVector * vec3(1.0,1.0,1.0));\n\
      tViewVector = normalizedTBN * tViewVector;\n\
      viewVector = (vec4(tViewVector,1.0) * viewMatrix).xyz;\n\
      viewVector = normalize(viewVector);\n\
      float ndotv2 = dot(-normalizedWorldNormal, viewVector);\n\
      vec3 reflectionVector = reflect( viewVector, normalizedWorldNormal );// Light vector for first layer\n\
      const float n = 2.4;\n\
      float roughnessVal = 0.0;//(1.0 - texture2D(RoughnessMap, uvRepeat).r);\n\
      vec3 specularColorLayer1 = vec3(1.0);\n\
      const float n1 = 2.4;\n\
      float n2 = n1 + rIndexDelta;\n\
      float n3 = n2 + rIndexDelta;\n\
      vec3 lSecond = refract(-viewVector, normalizedWorldNormal, 1.0/n1);// refraction vector for n1\n\
      vec3 lSecondG = refract(-viewVector, normalizedWorldNormal, 1.0/n2);// refraction vector for n2\n\
      vec3 lSecondB = refract(-viewVector, normalizedWorldNormal, 1.0/n3);// refraction vector for n3\n\
      vec3 vSecond = refract(-viewVector, normalizedWorldNormal, 1.0/n);// View vector for second layer\n\
      vec2 uvRefract =  lSecond.xy + vec2(1.0);\n\
      uvRefract *= 0.5;\n\
      uvRefract = fract(uvRefract * repeatFactor);\n\
      vec4 colorRefract = texture2D(RefractionTexture,uvRefract);\n\
      vec2 uvRefractG =  lSecondG.xy + vec2(1.0);\n\
      uvRefractG *= 0.5;\n\
      uvRefractG = fract(uvRefractG * repeatFactor);\n\
      vec4 colorRefractG = texture2D(RefractionTexture,uvRefractG);\n\
      vec2 uvRefractB =  lSecondB.xy + vec2(1.0);\n\
      uvRefractB *= 0.5;\n\
      uvRefractB = fract(uvRefractB * repeatFactor);\n\
      vec4 colorRefractB = texture2D(RefractionTexture,uvRefractB);\n\
      colorRefract = vec4(colorRefract.r, colorRefractG.r, colorRefractB.r, 1.0);\n\
      float ndotv1 = dot(-normalizedWorldNormal, vSecond);\n\
      ndotv1 = ndotv1 < 0.0 ? 0.0 : ndotv1;\n\
      float ndotl1 = dot(-normalizedWorldNormal, viewVector);\n\
      float f0 = (1.0-n)/(1.0+n);\n\
      f0 *= f0;\n\
      f0 = 0.12;\n\
      specularColorLayer1 *= (1.0-f0) * colorRefract.rgb * vec3(2.0);\n\
      vec4 specularContributionReflection = vec4(EnvBRDFApprox(vec3(f0), roughnessVal, ndotl1),1.0)*colorRefract;\n\
      vec4 specularContributionLayer1 = vec4(EnvBRDFApprox(specularColorLayer1, roughnessVal, ndotv1),1.0);\n\
      vec4 IblSpecularColorR = SampleSpecularContribution(specularContributionLayer1, lSecond,roughnessVal);\n\
      vec4 IblSpecularColorG = SampleSpecularContribution(specularContributionLayer1, lSecondG,roughnessVal);\n\
      vec4 IblSpecularColorB = SampleSpecularContribution(specularContributionLayer1, lSecondB,roughnessVal);\n\
      vec4 finalColor = vec4(IblSpecularColorR.r, IblSpecularColorG.r, IblSpecularColorB.r, 1.0);// + ( diffuseContributionLayer2 + IblSpecularColorLayer2 ) * vec4(attenuation, 1.0);// + diffuseContributionLayer2;\n\
      vec4 IblSpecularReflectionColor = SampleSpecularContribution(specularContributionReflection, reflectionVector,roughnessVal);\n\
      #ifdef USE_HDR\n\
       vec4 temp = IblSpecularReflectionColor + finalColor;// + colorRefract;//colorRefract*0.5  + 0.2*finalColor ;// + finalColor * 0.5;\n\
       gl_FragColor = vec4(temp.xyz, 0.6);\n\
      #else\n\
       gl_FragColor = 2.5*(finalColor);\n\
      #endif\n\
    }";

var shaderSource =
{
    uniforms: {
        RefractionTexture: {type: 't', value: null},
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
        rIndexDelta: {type: 'f', value: 0.2},
        repeatFactor: {type: 'f', value: 1.0},
        repeatFactorNmap: {type: 'f', value: 0.75},
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

