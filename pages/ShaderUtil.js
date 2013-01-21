
function LoadShaders(gl, vs, fs) {
    var strv = document.getElementById(vs).firstChild.textContent;
    var strf = document.getElementById(fs).firstChild.textContent;

    var program = gl.createProgram();
    CompileAndLinkShaders(gl, program, strv, strf);
    
    return program;
}


function LoadShaderFromFiles(gl, vs, fs, oncomplete) {

    var program = gl.createProgram();
    program.ready=false;
   
    $.get(vs, function (strv) {
        $.get(fs, function (strf) {
            program.ready=CompileAndLinkShaders(gl, program, strv, strf);
            if (oncomplete) oncomplete(program);
        });
    });
   
    
    return program;
}



function CompileAndLinkShaders(gl, prog, vs, fs) {

    var Vshader=gl.createShader(gl.VERTEX_SHADER);;
    var Fshader=gl.createShader(gl.FRAGMENT_SHADER);;

    gl.shaderSource(Vshader, vs);
    gl.compileShader(Vshader);

    gl.shaderSource(Fshader, fs);
    gl.compileShader(Fshader);

    if (!gl.getShaderParameter(Vshader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(Vshader));
        return false;
    }

    if (!gl.getShaderParameter(Fshader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(Fshader));
        return false;
    }

    gl.attachShader(prog, Vshader);
    gl.attachShader(prog, Fshader);
      
    gl.bindAttribLocation(prog, 0, "aPosition");
    gl.bindAttribLocation(prog, 1, "aNormal");
    gl.bindAttribLocation(prog, 2, "aTexCoord");

    // linking
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      this.Error = gl.getProgramInfoLog(prog);
      alert(this.Error);
      return false;
    }
    return true;
}