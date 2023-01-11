export let DefaultShader ={
	vertexShader: /*glsl */`
	  
	uniform float time;
	uniform float progress;
	uniform float particleSize;
	varying vec2 vUv;
	varying vec3 vPosition;
	varying float vColorRandom;
	uniform sampler2D texture1;
	attribute float randoms;
	attribute float offset;
	attribute float colorRandoms;
	float PI = 3.141592653589793238;
	void main() {
	  vUv = uv;
	  vColorRandom = colorRandoms;
	
	  //animation
	  vec3 newpos = position;
	  newpos.y +=clamp(0., 1.,(progress-offset*0.9)/0.1);
	  vec4 mvPosition = modelViewMatrix * vec4( newpos, 1. );
	  //no animation
	  //vec4 mvPosition = modelViewMatrix * vec4( position, 1. );
	  //gl_PointSize = (10. * randoms+10. ) * ( 1. / - mvPosition.z );
	  
	  if(particleSize > 0.){
			gl_PointSize = (particleSize * randoms+particleSize ) * ( 1. / - mvPosition.z );
	  }else{
			gl_PointSize = (5. * randoms+5. ) * ( 1. / - mvPosition.z );
	  }
	  gl_Position = projectionMatrix * mvPosition;
	}`,
	fragmentShader: `
  
	uniform float time;
	uniform float progress;
	uniform sampler2D texture1;
	uniform vec4 resolution;
	varying vec2 vUv;
	varying vec3 vPosition;
	varying float vColorRandom;
	
	uniform vec3 uColor1;
	uniform vec3 uColor2;
	uniform vec3 uColor3;
	float PI = 3.141592653589793238;
	void main()	{
		float alpha = 1. - smoothstep(-0.2, 0.5, length(gl_PointCoord - vec2(0.5)));
		vec3 finalColor = uColor1;
		if(vColorRandom > 0.33 && vColorRandom <0.66){
			finalColor = uColor2;
		}
		if(vColorRandom > 0.66){
			finalColor = uColor3;
		}
	
		float gradient = smoothstep(0.38,0.7,vUv.y);
		// vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);
		//gl_FragColor = vec4(finalColor,1.);
		
		// Use below UV(gradient for existing model)
		//gl_FragColor = vec4(finalColor,alpha*gradient);
	
		//Use below for custom buffer geometry
		gl_FragColor = vec4(finalColor,alpha*0.8);
	}`
  }