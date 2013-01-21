precision highp float;

varying vec4 vposition2d;

vec4 packFloatToVec4i(const float value)
{
  const vec4 bitSh = vec4(256.0*256.0*256.0, 256.0*256.0, 256.0, 1.0);
  const vec4 bitMsk = vec4(0.0, 1.0/256.0, 1.0/256.0, 1.0/256.0);
  vec4 res = fract(value * bitSh);

  /*vec4 res=mod(
  value * bitSh * vec4( 255 ),
    vec4( 256 ) ) / vec4( 255 );*/

  res -= res.xxyz * bitMsk;
  return res;
}
/*
vec4 pack(float depth)
{
    const vec4 bias = vec4(1.0 / 255.0,
                1.0 / 255.0,
                1.0 / 255.0,
                0.0);

    float r = depth;
    float g = fract(r * 255.0);
    float b = fract(g * 255.0);
    float a = fract(b * 255.0);
    vec4 colour = vec4(r, g, b, a);
    
    return colour - (colour.yzww * bias);
}*/

/*
float unpackFloatFromVec4i(const vec4 value)
{
  const vec4 bitSh = vec4(1.0/(256.0*256.0*256.0), 1.0/(256.0*256.0), 1.0/256.0, 1.0);
  return(dot(value, bitSh));
}*/

void main() {

    /*float near = 1.0;
	    float far = 100.0;
	    vec4 oViewSpaceVertexW = vposition2d / vposition2d.w;
	    float d = (-abs(oViewSpaceVertexW.z) + near) / (far - near);
	    gl_FragColor = packFloatToVec4i(d);*/
    gl_FragColor = packFloatToVec4i(1.0/(2.0*(vposition2d.z/vposition2d.w+1.0)));
   // gl_FragColor = pack(1.0/(2.0*(vposition2d.z/vposition2d.w+1.0)));
    //gl_FragColor = packFloatToVec4i(0.5*(vposition2d.z/vposition2d.w+1.0));
   //gl_FragColor = packFloatToVec4i(0.5*(1.0+(vposition2d.z/vposition2d.w)));
    
}


