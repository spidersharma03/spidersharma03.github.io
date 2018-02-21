/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.BloomPass = function ( strength, kernelSize, sigma, luminosityThreshold, smoothWidth, params ) {

	strength = ( strength !== undefined ) ? strength : 1.0;
	kernelSize = ( kernelSize !== undefined ) ? kernelSize : 25;
	luminosityThreshold = ( luminosityThreshold !== undefined ) ? luminosityThreshold : 0.5;
	smoothWidth = ( smoothWidth !== undefined ) ? smoothWidth : 0.1;

	// render targets

	this.params = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };

	// copy material

	if ( THREE.CopyShader === undefined )
		console.error( "THREE.BloomPass relies on THREE.CopyShader" );

	var copyShader = THREE.CopyShader;

	this.copyUniforms = THREE.UniformsUtils.clone( copyShader.uniforms );

	this.copyUniforms[ "opacity" ].value = strength;

	this.materialCopy = new THREE.ShaderMaterial( {
		shaderID: copyShader.shaderID,
		uniforms: this.copyUniforms,
		vertexShader: copyShader.vertexShader,
		fragmentShader: copyShader.fragmentShader,
		blending: THREE.CustomBlending,
		blendSrc: THREE.OneFactor,
		blendDst: THREE.OneFactor,
		blendEquation: THREE.AddEquation,
		depthTest: false,
		depthWrite: false,
		transparent: true

	} );

	// convolution material

	if ( THREE.ConvolutionShader === undefined )
		console.error( "THREE.BloomPass relies on THREE.ConvolutionShader" );

	var convolutionShader = THREE.ConvolutionShader;
	this.convolutionUniforms = THREE.UniformsUtils.clone( convolutionShader.uniforms );

	this.convolutionUniforms[ "cKernel" ].value = THREE.ConvolutionShader.buildKernel( kernelSize );

	this.materialConvolution = new THREE.ShaderMaterial( {
		shaderID: convolutionShader.shaderID,
		uniforms: this.convolutionUniforms,
		vertexShader:  convolutionShader.vertexShader,
		fragmentShader: convolutionShader.fragmentShader,
		defines: {
			"KERNEL_SIZE_FLOAT": kernelSize.toFixed( 1 ),
			"KERNEL_SIZE_INT": kernelSize.toFixed( 0 )
		}

	} );

	// luminosity high pass material

	if ( THREE.LuminosityHighPassShader === undefined )
		console.error( "THREE.BloomPass relies on THREE.LuminosityHighPassShader" );

	var highPassShader = THREE.LuminosityHighPassShader;
	this.highPassUniforms = THREE.UniformsUtils.clone( highPassShader.uniforms );

	this.highPassUniforms[ "luminosityThreshold" ].value = luminosityThreshold;
	this.highPassUniforms[ "smoothWidth" ].value = smoothWidth;

	this.materialHighPassFilter = new THREE.ShaderMaterial( {
		shaderID: highPassShader.shaderID,
		uniforms: this.highPassUniforms,
		vertexShader:  highPassShader.vertexShader,
		fragmentShader: highPassShader.fragmentShader,
		defines: {}

	} );

	this.enabled = true;
	this.needsSwap = false;
	this.clear = false;

  this.oldClearColor = new THREE.Color();
  this.oldClearAlpha = 1;

	this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

};

THREE.BloomPass.prototype = {

	dispose: function() {

	    if( this.renderTargetA ) {
	    	this.renderTargetA.dispose();
	    	this.renderTargetA = null;
	    }
	    if( this.renderTargetB ) {
	    	this.renderTargetB.dispose();
	    	this.renderTargetB = null;
	    }

	},

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		var blurResolution = new THREE.Vector2( readBuffer.width / 4.0, readBuffer.height / 4.0 );
	    if( ! this.renderTargetA ) {
	    	this.renderTargetA = new THREE.WebGLRenderTarget( blurResolution.x, blurResolution.y, this.params, "bloom.renderTargetA" );
	    }
	    if( ! this.renderTargetB ) {
	    	this.renderTargetB = new THREE.WebGLRenderTarget( blurResolution.x, blurResolution.y, this.params, "bloom.renderTargetB" );
	    }

	// Render quad with blured scene into texture (convolution pass 1)

	    this.oldClearColor.copy( renderer.getClearColor() );
	    this.oldClearAlpha = renderer.getClearAlpha();

	    renderer.setClearColor( new THREE.Color( 0, 0, 0 ), 0 );

	    if ( maskActive ) renderer.context.disable( renderer.context.STENCIL_TEST );

		this.highPassUniforms[ "tDiffuse" ].value = readBuffer;

		this.quad.material = this.materialHighPassFilter;

		renderer.render( this.scene, this.camera, this.renderTargetA, true );


		this.quad.material = this.materialConvolution;
                                for(var i=0; i<4; i++) {
		this.convolutionUniforms[ "tDiffuse" ].value = this.renderTargetA;
		this.convolutionUniforms[ "uImageIncrement" ].value = new THREE.Vector2( 1.0 / blurResolution.x, 0.0 );

		renderer.render( this.scene, this.camera, this.renderTargetB, true );


		// Render quad with blured scene into texture (convolution pass 2)

		this.convolutionUniforms[ "tDiffuse" ].value = this.renderTargetB;
		this.convolutionUniforms[ "uImageIncrement" ].value = new THREE.Vector2( 0.0, 1.0 / blurResolution.y );

		renderer.render( this.scene, this.camera, this.renderTargetA, true );
                                }
		// Render original scene with superimposed blur to texture

		this.quad.material = this.materialCopy;

		this.copyUniforms[ "tDiffuse" ].value = this.renderTargetA;

		if ( maskActive ) renderer.context.enable( renderer.context.STENCIL_TEST );

		renderer.render( this.scene, this.camera, readBuffer, false );

	    renderer.setClearColor( this.oldClearColor, this.oldClearAlpha );

	}

};

