precision highp float;

uniform vec4 color;

uniform sampler2D uTexture0;

varying vec2 vTexCoord;

void main() {
	//gl_FragColor= vec4(1.0, 0.0, 0.0, 1.0);
	vec4 col=texture2D(uTexture0, vTexCoord);
	if (col.w<0.5) discard;
	gl_FragColor= col * color;
}
