        precision highp float;


        uniform vec2 uMouse;
        uniform vec4 uColor;
        uniform vec3 uLightDirection;

        varying vec3 vNormal;
        varying vec4 vposition2d;
        varying vec3 vpos3d;


        void main() {

            //light calculation
            vec3 n=normalize(vNormal);
            vec3 light=normalize(uLightDirection);          
            float l=abs(dot(n, light));
            vec3 diffused=uColor.xyz*l;

            //ouput color
            gl_FragColor=vec4(diffused, 1.0);           
        }