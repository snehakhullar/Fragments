/*
* Copyright (c) 2012 Panagiotis Michalatos [www.sawapan.eu]
*
* This software is provided 'as-is', without any express or implied
* warranty. In no event will the authors be held liable for any damages
* arising from the use of this software.
*
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
*
*    1. The origin of this software must not be misrepresented; you must not
*    claim that you wrote the original software. If you use this software
*    in a product, an acknowledgment in the product documentation would be
*    appreciated but is not required.
*
*    2. Altered source versions must be plainly marked as such, and must not
*    be misrepresented as being the original software.
*
*    3. This notice may not be removed or altered from any source
*    distribution.
*/

uniform mat4 PVMatrix;
uniform mat4 MMatrix;

uniform vec4 color;
uniform vec3 p0;
uniform vec3 p1;

uniform vec3 vport;

uniform vec2 w;
uniform float ext;

attribute vec2 aPosition;

void main() {
	vec3 vz=vec3(PVMatrix[0][3], PVMatrix[1][3], PVMatrix[2][3]);
	vec3 vx=p1-p0;
	vec3 vy=normalize(cross(vx,vz)); 

	vec3 pp=p0+vx*aPosition.x+vy*aPosition.y*mix(w.x, w.y, aPosition.x);//(w.x*(1.0-aPosition.x)+w.y*aPosition.x);

	gl_Position = PVMatrix*MMatrix*vec4(pp,1.0);
}