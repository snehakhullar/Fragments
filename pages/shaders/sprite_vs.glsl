uniform mat4 PVMatrix;
uniform mat4 VMatrix;

uniform vec3 uPos; //sprite centre position in world coordinates
uniform vec4 uDim; //Left,right, bottom, top

attribute vec2 aPosition;

varying vec2 vTexCoord; 

varying vec4 vposition2d;

void main() {
	vec2 p2d=vec2((1.0-aPosition.x)*uDim.x+aPosition.x*uDim.y, (1.0-aPosition.y)*uDim.w+aPosition.y*uDim.z);

	vec3 vposition=uPos+(vec4(p2d,0,0)*VMatrix).xyz;//p2d.x*VMatrix[0].xyz+p2d.y*VMatrix[1].xyz;
	vec4 pos=PVMatrix*vec4(vposition, 1.0);
	//pos=vec4(aPosition,0.5,1.0);
	gl_Position = pos;
	vposition2d=pos;
		
    vTexCoord = aPosition;
}
