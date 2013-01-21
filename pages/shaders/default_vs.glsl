uniform mat4 uPVMatrix4;
uniform mat4 uMMatrix4;



attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexCoord;

varying vec3 vNormal;
varying vec4 vposition2d;
varying vec2 vTexCoord;

void main() {
    //..........................Regular Perspective            
    vec4 pos=uPVMatrix4*uMMatrix4*vec4(aPosition, 1.0);
    
    //.............................Pass data to fragment shader
    vposition2d=pos;//.xyz/pos.w;
    vNormal = aNormal;
    vTexCoord=aTexCoord;

    gl_Position = pos;
}