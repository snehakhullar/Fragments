

//add one variable for each shader you are going to use here
var DefaultShader=null;
var IndexShader=null;
var DepthtShader=null;

var Editor1;
var Editor2;

var iconTextures={};

//use this function to load shaders
function SetUpShaders(gl) {
    DefaultShader=LoadShaderFromFiles(gl, "shaders/default_vs.glsl", "shaders/default_fs.glsl");
    IndexShader=LoadShaderFromFiles(gl, "shaders/default_vs.glsl", "shaders/selection_fs.glsl");
    DepthShader=LoadShaderFromFiles(gl, "shaders/default_vs.glsl", "shaders/depth_fs.glsl");

    //iconTextures["simple"]=new CTexture(gl, "images/iphonecopy.png");
    iconTextures["Object"]=new CTexture(gl, "images/Object1.png");
    iconTextures["PartWhole"]=new CTexture(gl, "images/PartWhole1.png");
    iconTextures["Reference"]=new CTexture(gl, "images/Reference1.png");
    iconTextures["Creative"]=new CTexture(gl, "images/Creative1.png");
}


//................................Set up the user interface elements
var textout1=null;
var textout2=null;
var relbutton1=null;
var relbutton2=null;
var relbutton3=null;
var relbutton4=null;
function SetUpUserInterface() {

Editor1=new EditWindow(30,30, 230, 230);
Editor2=new EditWindow(30,400, 230, 600);
relbutton1= new RelButton(30,235, "Object", "Object relation");
relbutton2= new RelButton(30,275, "PartWhole", "Part-whole relation");
relbutton3= new RelButton(30,315, "Reference", "Reference relation");
relbutton4= new RelButton(30,355, "Creative", "Creative relation");
//Scrollbar(  X ,   Y  , Width, Height, minValue, maxValue, CurrentValue,          Name,    OnValueChangedFunction                )
//new Scrollbar(20.0, 160.0, 150.0, 16.0,   1.0,      40.0,     camera.Distancetarget, "Dist", function(val){camera.SetDistance(val);});
textout1=new CTextBox(77, 238, 143, 145);
//textout2=new CTextBox(250, 30, 150, 150);
}

//create some matrices to be used for storing the model, view, projection matrices and their product.
var ModelMat=mat4.create();
var Projmat=mat4.create();
var ViewMat=mat4.create(); 
var PVMat=mat4.create(); 

//...............................Main rendering function
function Render(gl) {
    var UId;
//..................................Viewport set up
    //set the rendering viewport to the window size
    gl.viewport(0, 0, width, height);

    //enable alpha blending for transparent objects
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.SRC_ALPHA, gl.ONE);
    //disable face culling [show both front and back faces]
    gl.disable(gl.CULL_FACE);
    //enable depth test so that objects near the viewer are always drawn in front of objects further back
    gl.enable(gl.DEPTH_TEST);

    //clear the viewport using a white color
    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //center the camera to point towards the origin of the coordinates
    camera.SetTargetPointXYZ(0.0, 0.0, 0.0);
    //force the camera to recalculate its view point [it might have changed because of mouse rotation having changed the viewing angles]
    camera.Update();

//..................................Set up transformation matrices
    //make modelmatrix to be the identity matrix [i.e. no effect]
    mat4.identity(ModelMat);
    //the projection matrix is standard perspective with a 60 degrees fiedl of view
    mat4.perspective(60, width/height, 1.0, 100.0, Projmat);   
    //the view matrix looks from the camera view point to the camera target point
    mat4.lookAt(camera.VPoint, camera.TPoint, camera.Up, ViewMat);
    //multiply the view and projection matrix together to get their product as one matrix
    mat4.multiply(Projmat, ViewMat, PVMat);

    camera.viewX=vec3.create();
    camera.viewX[0]=ViewMat[0];
    camera.viewX[1]=ViewMat[4];
    camera.viewX[2]=ViewMat[8];

    camera.viewY=vec3.create();
    camera.viewY[0]=ViewMat[1];
    camera.viewY[1]=ViewMat[5];
    camera.viewY[2]=ViewMat[9];

    camera.viewZ=vec3.create();
    camera.viewZ[0]=ViewMat[2];
    camera.viewZ[1]=ViewMat[6];
    camera.viewZ[2]=ViewMat[10];


//...............................Render all 3d objects
    RenderGeometry(gl, sprite.program, DefaultShader);

//...........................Draw a dummy temporary cube that follows the mouse
    //set the model matrix translation components to the mouse location
    /*ModelMat[12]=mouse.Location[0];
    ModelMat[13]=mouse.Location[1];
    ModelMat[14]=mouse.Location[2];


    //upload the new model matrix to the shader
    var UId=gl.getUniformLocation(DefaultShader, "uMMatrix4");
    gl.uniformMatrix4fv(UId, false, ModelMat);
    //render a cube [this cube will be rendered at the mouse location because of the model matrix we just uploaded]
    cube.Render(gl);*/
    //....................

    line.BeginFlat(PVMat);

    //line.SetColor(0,0,0,0.5);
    line.SetWidth(4, 4);

    for(var i=0; i<relations.length; ++i) {
        if (relations[i].type=="Object") {line.SetColor(0.6784,0.6784,0.6784,1);}
        else if (relations[i].type=="PartWhole") {line.SetColor(0.6784,0.6784,0.6784,1);}
        else if (relations[i].type=="Reference") {line.SetColor(0.6784,0.6784,0.6784,1);}
        else {line.SetColor(0.6784,0.6784,0.6784,1);} 
        relations[i].Render(gl);
    }
    line.End();

    sprite.Begin(PVMat, ViewMat, sprite.program);
    for(var i=0; i<relations.length; ++i) {
        relations[i].RenderIcon(gl);
    }
    sprite.End();

//..........................Render in index mode to find the index of the object under the mouse cursor if any
    //begin rendering in index mode so that we can tell if the mouse is over a model
    glsel.BeginIndexRendering(gl, IndexShader, mouse.X, mouse.Y, PVMat);
    //render the geometry using the index shader
    RenderGeometry(gl, sprite.programSelection , IndexShader);
    //exit index rendering mode and get the index of the object that was under the mouse [if any]
    mouseoverid=glsel.EndIndexRendering(gl);


    if (mouseoverid!=0) {
        //console.log(mouseoverid);
        var mf=FindFragmentromId(mouseoverid);
        if (mf!=null) {
            //var p2=mf.GlobalToLocal(mouse.Location);

          textout1.SetText(mf.title);
          textout1.AddText(mf.date);
          textout1.AddText(mf.desc);
          //textout.SetText("x "+p2[0]+", y "+p2[1]);
        }
    }
    else {textout1.SetText("");}
    //set the text of the text window to the selected index [just for debugging]
    

//..........................Render in depth mode so that we can find the location of the mouse in space
    //begin rendering in depth mode
    glsel.BeginDepthRendering(gl, DepthShader, mouse.X, mouse.Y, PVMat);
    //render geometry using the depth shader
    RenderGeometry(gl, sprite.programDepth , DepthShader);
    //finish depth rendering and copy the mouse 2d and 3d location to the mouse.P2 and mouse.P3 propeties so that we can always refer to them if we need to know the location of the cursor
    glsel.EndDepthRendering(gl, mouse.P2, mouse.P3);

//...........................find mouse location on the global XY plane
    //project the point that passes through the cursos and lies on the near viewing plane and copy its coordinates to mouse.RAY0
    glsel.UnProjectPointXYZ(mouse.P2[0], mouse.P2[1], 0.0, mouse.RAY0);
    //project the point that passes through the cursos and lies on the far viewing plane and copy its coordinates to mouse.RAY1
    glsel.UnProjectPointXYZ(mouse.P2[0], mouse.P2[1], 1.0, mouse.RAY1);

    //the function GetPointonXYplane is defined at the end of this file and basically intersects the line that passes through mouse.RAY0 and mouse.RAY1 
    //with the horizontal plane at a specific elevation [in this case 0.0]
    mouse.XYPoint=mouse.GetPointOnXYPlane(0.0);

    //the depth rendering function returns a mouse depth of -0.5 if the mouse was on the background [not on any tangible object]
    //in that case we want to assume as mouselocation the projection of the cursor on the XY plane
    //otherwise the mouse location is assumed to be the point that the depth rendering step found
    if (mouse.P2[2]==-0.5) { //not on any object
        mouse.Location[0]=mouse.XYPoint[0];
        mouse.Location[1]=mouse.XYPoint[1];
        mouse.Location[2]=mouse.XYPoint[2];
    }
    else {
        mouse.Location[0]=mouse.P3[0];
        mouse.Location[1]=mouse.P3[1];
        mouse.Location[2]=mouse.P3[2];
    }

}

//..............................SetUp shader and render geometry using the provided shader
//we need to pass the shader as a parameter here because we are going to call this function
//3 times, once for viewport rendering, once for selection and once for depth rendering
function RenderGeometry(gl, SpriteShader, ObjectShader) {
    if (!SpriteShader.ready || !ObjectShader.ready) return;

    var Uid=0;
    gl.useProgram(ObjectShader);

    UId=gl.getUniformLocation(ObjectShader, "uPVMatrix4");
    gl.uniformMatrix4fv(UId, false, PVMat);

    UId=gl.getUniformLocation(ObjectShader, "uMMatrix4");
    gl.uniformMatrix4fv(UId, false, ModelMat);
    //................................SetUp uniforms for Fragment Shader 2
    UId=gl.getUniformLocation(ObjectShader, "uColor");
    gl.uniform4f(UId, 1.0, 1.0, 1.0, 1.0);

    UId=gl.getUniformLocation(ObjectShader, "uLightDirection");
    gl.uniform3f(UId, 1.0,4.0,2.0);

    //this renders all the cubes and is defined in CModel.js
    RenderFragments(gl, SpriteShader, ObjectShader);
}


//...........................Server interaction
//fragmentmap will be a named array of fragments stored by their database id. These ids are generated by the server and are unique 
//for each framgment. When we receive data from the server we need to check this array so that we can tell whether a fragment 
//already exists here so we will just update its relations or if it doesn't exist we will create one. 
//When another user creates a fragment we'll receive a new fragment [we won't have its id here] but if another user
//adds a relation to a fragment we already have then we will receive a fragment with an id we have encountered before
//which means that we will only modify the fragment with that id to match the new relation
var fragmentmap={};
//this is the time stamp of the latest fragment we have locally. Every now and then we'll ask the server
//to see if it has any newer fragments and update this variable accordingly
var lastTime=0;
//this is a flag that if true it means that we are waiting for an update from the server so we shouldn't send it another request
//so that we don't overwhelm the server with update requests
var waiting=false;

//This function sends a request for an update to the server in effect 
//asking if any new fragments have been added to the database or altered recently
function RequestUpdate() {
    //if we are already waiting for a response we shouldn't send another request
    if (waiting) return;
    //set the waiting flag to true we are going to send a new request for update
    waiting=true;
    socket.emit('Update', {lastTime:lastTime});
}

//This function will be called each time we add a relation and its role is to notify the server that
//a relation is added to the fragments
/*function RequestModifyRelation(fragments[]) {
    socket.emit('Modify', {_id:c._id, x:c.x, y:c.y, z:c.z});
}*/

/*//This function will be called each time we move a cube and its role is to notify the server that
//a cube has a new position
function RequestModifyCube(c) {
    socket.emit('Modify', {_id:c._id, x:c.x, y:c.y, z:c.z});
}*/

//this function asks the server to add a new cube to the model at location x,y,z
function RequestAddFragment() {
    socket.emit('AddFragment', {x:x, y:y, z:z});
}

/*//this function sends a request to the server to remove an element
function RequestRemoveCube(c) {
    socket.emit('RemoveCube', {_id:c._id});
}*/

//this is the utility function that processes a response from the server and adds or modifies one fragment for
//each element in the repsonse array. The server always sends an array of fragments even if it contains just
//a single fragment

function AddFragmentsFromServerData(data) {
    //console.log(data);
    //for each fragment data in the array do the following
    for(var i=0; i<data.length; ++i) {
        //if a cube already exist with the same id then just modify its coordinates
        //if (cubemap[data[i]._id]) {
        //   var c=cubemap[data[i]._id];
         //   c.SetTranslation(data[i].x, data[i].y, data[i].z);
        //}
        //else { //otherwise add a new fragment and register it with its unique id in the fragmentmap
            var newf=new CFragment(GL, data[i].ImageName, data[i].Title, data[i].Date, data[i].Text);
            //{Title:$("#input1").val(), Date:$("#input2").val(), Text: $("#textarea").val(), ImageName:LastImageFile
            //newf.x=fragments.length*5.0;
            //newf.y=fragments.length*5.0;

            if (fragments.length!=0 && fragments.length<8.0) {
                newf.y=(fragments.length*6.0)-15;
                newf.x=-40.0;
            }
            else if (fragments.length>7.0 && fragments.length<15.0) {
                newf.y=((fragments.length-7.0)*6.0)-15;
                newf.x=-30.0;
            }
            else if (fragments.length>14.0 && fragments.length<22.0) {
                newf.y=((fragments.length-14.0)*6.0)-15;
                newf.x=-20.0;
            }
            else if (fragments.length>21.0 && fragments.length<29.0) {
                newf.y=((fragments.length-21.0)*6.0)-15;
                newf.x=-10.0;
            }
            else if (fragments.length>28.0 && fragments.length<36.0) {
                newf.y=((fragments.length-28.0)*6.0)-15;
                newf.x=0.0;
            }
            else if (fragments.length>35.0 && fragments.length<43.0) {
                newf.y=((fragments.length-35.0)*6.0)-15;
                newf.x=10.0;
            }
            else if (fragments.length>42.0 && fragments.length<50.0) {
                newf.y=((fragments.length-42.0)*6.0)-15;
                newf.x=20.0;
            }
            else if (fragments.length>49.0 && fragments.length<57.0) {
                newf.y=((fragments.length-49.0)*6.0)-15;
                newf.x=30.0;
            }
            else if (fragments.length>56.0 && fragments.length<64.0) {
                newf.y=((fragments.length-56.0)*6.0)-15;
                newf.x=40.0;
            }

            newf._id=data[i]._id;
            fragmentmap[data[i]._id]=newf;
            //console.log(newf);
            //console.log(fragments);
            if (lastTime<data[i].timestamp) lastTime=data[i].timestamp;
        }
        //if the cube we just got has a timestamp greater [more recent] than our last update
        //then set the last known update time to the cube's time stamp
        
    }

var dataFragmentBegin=null;
var dataFragmentEnd=null;

function AddRelationsFromServerData(data) {
    for(var i=0; i<data.length; ++i) {
        dataFragmentBegin = fragmentmap[data[i].FragmentBeginId];
        dataFragmentEnd = fragmentmap[data[i].FragmentEndId];
        //var newr = new CRelation(GL, data[i].Type, dataFragmentBegin, data[i].FragmentBeginP2d, dataFragmentEnd, data[i].FragmentEndP2d);
        BuildRelation(dataFragmentBegin, data[i].FragmentBeginPoint, dataFragmentEnd, data[i].FragmentEndPoint, data[i].Type);
        //newr._id=data[i]._id;
    } 
}


 var socket = io.connect('http://127.0.0.1:8001');
 /*socket.on('RemoveCube', function (data) {
    console.log(data);
    if (cubemap[data._id]){
        DeleteModel(cubemap[data._id]);             //if succesful then delete the cube from the model list so that it does not render anymore 
        cubemap[data._id]=undefined;   //remove its id entry from the cubemap so the last traces of it are gone and it is up for garbage collection
    }
  });*/

 socket.on('AddFragment', function (data) {
    //console.log(data);
    //console.log("data received");
    AddFragmentsFromServerData(data);
  });

 socket.on('AddRelation', function (data) {
    //console.log(data);
    console.log("data received");
    AddRelationsFromServerData(data);
  });

  /*socket.on('Modify', function (data) {
    if (cubemap[data._id]) {
        cubemap[data._id].SetTranslation(data.x, data.y, data.z);
    }
  });*/

socket.on('Update', function (data) {
    AddFragmentsFromServerData(data);
    waiting=false;
  });

  /*socket.on('DataAdded', function (data) {
    console.log(data);
  });*/

//......................................................................................
//......................................................................................
//......................................................................................
//......................................................................................
//......................................................................................
//................................Utilitiy functions

//........................................................Mouse interactions


var moved=false;
var mousefragment=null;
var dragp0=vec3.create();
var dragz=0.0;
var dragmodel=null;
var linkdata=null;

function OnMouseDown(event) {
     mousefragment=FindFragmentromId(mouseoverid);

     if (event.which==3) { //right click
        if (mousefragment && mousefragment.Window) 
            mousefragment.Window.DetachFragment();
         //   RequestRemoveCube(mousemodel);  
    }
    else {
        mouse.Down = true;
        mouse.X0 = mouse.X;
        mouse.Y0 = mouse.Y;

        moved=false;

        if (mousefragment!=null && mousefragment.Window) {
            linkdata={};
            linkdata.start={fragment:mousefragment, p3d:mouse.Location, p2d:mousefragment.GlobalToLocal(mouse.Location)};
        }
       
        if (mousefragment!=null) {
            dragp0[0]=mouse.P3[0]-mousefragment.x;
            dragp0[1]=mouse.P3[1]-mousefragment.y;
            dragp0[2]=mouse.P3[2]-mousefragment.z;
            dragz=mouse.P3[2];
        }
        else if (camera.OnMouseDown()) return;
    }
}

var lastwindowused = 0.0;

function OnMouseUp(event) {

    if (!moved) {

       // RequestAddCube(mouse.Location[0], mouse.Location[1], mouse.Location[2]);
       /*if (mousefragment!=null) {
            if (mousefragment.Window) Editor.DetachFragment();
            else Editor.AttachFragment(mousefragment);
       }

       if (mousefragment!=null) {
            if (Editor1.fragment && Editor2.fragment) Editor1.AttachFragment(mousefragment);
            else if (Editor1.fragment) Editor2.AttachFragment(mousefragment);
            else Editor1.AttachFragment(mousefragment);
       }*/

        if (mousefragment!=null && !mousefragment.Window) {
            if (lastwindowused == 1.0) {
                //Editor2.DetachFragment(); 
                Editor1.AttachFragment(mousefragment);
                lastwindowused = 2.0;
             }
            else {
                Editor2.AttachFragment(mousefragment);
                lastwindowused = 1.0;
            }

        }
    
     }   

    if (linkdata!=null && moved && relbuttonclicked==true) {
        mousefragment=FindFragmentromId(mouseoverid);
        relbuttonclicked=false;

        $("#"+RelationType).button('enable')
                    .removeClass('ui-state-active ui-state-hover');
    
        if (mousefragment!=null) {
            linkdata.end={fragment:mousefragment, p3d:mouse.Location, p2d:mousefragment.GlobalToLocal(mouse.Location)};
            console.log(linkdata);


            /*var annotation = null;
            annotation = document.createElement("textarea");

            annotation.id = "annotation";
            annotation.placeholder = "Relation annotation";

            annotation.style.position= "absolute"; 
            annotation.style.left= "(linkdata.start.p3d[0]+linkdata.end.p3d[0])/2"+"px"; 
            annotation.style.top= "(linkdata.start.p3d[1]+linkdata.end.p3d[1])/2"+"px";

            $("#candiv").append(annotation);*/
        
            //BuildRelation(linkdata, "simple");
            socket.emit('AddRelation',{
                FragmentBeginId:linkdata.start.fragment._id, 
                FragmentBeginPoint:[linkdata.start.p2d[0],linkdata.start.p2d[1],linkdata.start.p2d[2]], 
                FragmentEndId:linkdata.end.fragment._id, 
                FragmentEndPoint:[linkdata.end.p2d[0],linkdata.end.p2d[1],linkdata.end.p2d[2]], 
                Type:RelationType
            });
            
        }

    }

    mouse.Down = false;

    mousefragment=null;
    dragmodel=null;
    mousemodel=null;
    moved=false;
    ControlCapture=null;
    linkdata=null;
    camera.OnMouseUp();
}

function OnMouseMove(event) {
    var offset = $(canvas1).offset();
    mouse.X = event.pageX - offset.left;
    mouse.Y = event.pageY - offset.top;

    mouse.Dx =  mouse.X-mouse.LastX;
    mouse.Dy =  mouse.Y-mouse.LastY;

    mouse.LastX=mouse.X;
    mouse.LastY=mouse.Y;

    if (!moved && (Math.abs(mouse.X-mouse.X0)>3 || Math.abs(mouse.Y-mouse.Y0)>3)) {
        moved=true;
        //if (mousefragment!=null) {
        //    dragmodel=mousefragment;
        //}

   
    }

    if (dragmodel!=null) {
        //var pxy=mouse.GetPointOnXYPlane(dragz);
        //dragmodel.SetTranslation(pxy[0]-dragp0[0], pxy[1]-dragp0[1], pxy[2]-dragp0[2]);

        //RequestModifyCube(dragmodel);
    }
    else if (camera.OnMouseMove()) return;
}



var canvas1 = null;
var GL=null;
var camera=null;
var line=null;
var sprite=null;
var glsel=null;


var width=0;
var height=0;



var mouse = {};
mouse.P2 = vec3.createXYZ(0, 0, 0);//normalized viewport coordinates
mouse.P3 = vec3.createXYZ(0, 0, 0);//3d coordinates
mouse.RAY0 = vec3.createXYZ(0, 0, 0);
mouse.RAY1 = vec3.createXYZ(0, 0, 0);
mouse.XYPoint = vec3.createXYZ(0, 0, 0);
mouse.Location=vec3.createXYZ(0, 0, 0);
mouse.X = 0;
mouse.Y = 0;
mouse.Down = false;
mouse.X0 = 0;
mouse.Y0 = 0;


mouse.GetPointOnXYPlane=function(z) {
    var t=(z-mouse.RAY0[2])/(mouse.RAY1[2]-mouse.RAY0[2]);
    var pp=vec3.create();

    pp[0]=mouse.RAY0[0]+t*(mouse.RAY1[0]-mouse.RAY0[0]);
    pp[1]=mouse.RAY0[1]+t*(mouse.RAY1[1]-mouse.RAY0[1]);
    pp[2]=z;

    return pp;
}

//..............................The main function. This is were program execution begins as soon as your
//..............................web page is loaded

function Main() {
    
//....................................Set up viewport
    canvas1 = document.getElementById("canvas1");

    //disable right click context menu on canvas
    canvas1.oncontextmenu=function() {return false;};

    GL = WebGLUtils.setupWebGL(canvas1, { depth: true, preserveDrawingBuffer: true });
    camera=new CCamera();

    line=new CLine(GL, canvas1);
    sprite=new CSprite(GL);
    glsel=new SelectionEngine(GL);
    
//.....................................Resizing mechanics
    width = $("#candiv").innerWidth();
    height = $("#candiv").innerHeight();    

    canvas1.width=width;
    canvas1.height=height;


    $(window).resize(function () {
        width = $("#candiv").innerWidth();
        height = $("#candiv").innerHeight();

        canvas1.width=width;
        canvas1.height=height;
    });

//........................................Mouse interactions
    $(canvas1).mousedown(OnMouseDown);
    $(canvas1).mouseup(OnMouseUp);
    $(canvas1).mousemove(OnMouseMove);


//.....................................Set Up Shaders
    SetUpShaders(GL);
    SetUpUserInterface(GL);
//..........................................Start rendering recurcion
    CreateUI();
    setInterval(function(){RequestUpdate();},500);
    OnFrameUpdate();

}


function OnFrameUpdate() {
    window.requestAnimFrame(OnFrameUpdate, canvas1);

    Render(GL);
}


var LastImageFile="";
var relbutton1clicked=false;

function CreateUI() {
    this.div = document.createElement("div");
        
        //div for title & add fragment button
        this.div.style.width=230+"px";
        this.div.style.height=200+"px";

        this.div.style.position='absolute';
        this.div.style.right=10+"px";
        this.div.style.top=10+"px";

        this.div.style.background = "rgba(255, 255, 255, 0)";//"#ffffff";
        this.div.style.border = "none"; 
        this.div.style.color="#000000";

        $("#candiv").append(this.div);

        //add relation button1
        /*var relbutton1=null;

        relbutton1 = document.createElement("input");

        relbutton1.type = "button";
        relbutton1.name = "relbutton1";
        relbutton1.id = "relbutton1";
        relbutton1.title = "Part-whole relation";
        //relbutton.value = "+";


        relbutton1.style.position='absolute';
        relbutton1.style.left=30+"px";
        relbutton1.style.top=240+"px";

        relbutton1.style.color="#ffffff";
        

        $("#candiv").append(relbutton1);
        $( "#relbutton1" ).button();
        $( "#relbutton1" ).tooltip({ tooltipClass: "custom-tooltip-styling" , position: { my: "left+15 center", at: "right center" }});
        $("#relbutton1").click(function() {
            relbutton1clicked=true;
            $(".custom-tooltip-styling").hide();
            $(this).button('disable').addClass('ui-state-active').removeClass('ui-state-disabled');
        });

          //add relation button2
        var relbutton2=null;

        relbutton2 = document.createElement("input");

        relbutton2.type = "button";
        relbutton2.name = "relbutton2";
        relbutton2.id = "relbutton2";
        //relbutton.value = "+";


        relbutton2.style.position='absolute';
        relbutton2.style.left=30+"px";
        relbutton2.style.top=280+"px";

        relbutton2.style.color="#ffffff";
        

        $("#candiv").append(relbutton2);
        $( "#relbutton2" ).button();*/

        //...................................check which button is clicked
        /*$("#PartWhole").click(function() {
            clickedbuttontype1=true;
        });
        $(relbutton2).click(function() {
            clickedbuttontype=relbutton2;
        });
        $(relbutton3).click(function() {
            clickedbuttontype=relbutton3;
        });
        $(relbutton4).click(function() {
            clickedbuttontype=relbutton4;
        });*/

        //application title
        $(this.div).append("<p>FRAGMENTS</p>");

        //add fragment button
        var fragbutton=null;

        fragbutton = document.createElement("input");

        fragbutton.type = "button";
        fragbutton.name = "FragmentAddButton";
        fragbutton.id = "FragmentAddButton";
        //fragbutton.value = "+";


        fragbutton.style.position='absolute';
        fragbutton.style.right=10+"px";
        fragbutton.style.top=10+"px";

        fragbutton.style.color="#ffffff";
        

        $(this.div).append(fragbutton);
        $( "#FragmentAddButton" ).button();
        /*$( "#FragmentAddButton" ).button({
            icons: { primary: "ui-icon-plusthick"},
            text: false
        });*/
        
        //click to open the form
        $("#FragmentAddButton").click(function() {
            $("#FragmentDetailBox").show(1000);
        });

        //Fragment upload form
        var FragmentDetailBox = document.createElement("div");

        FragmentDetailBox.id="FragmentDetailBox";
        $("#candiv").append(FragmentDetailBox);

        var input1 = null;
        var input2 = null;
        var textarea = null;

        input1 = document.createElement("input");

        input1.id="input1";
        input1.type = "text";
        input1.name = "title";
        input1.placeholder = "Title";

        $(FragmentDetailBox).append(input1); 

        input2 = document.createElement("input");

        input2.id = "input2";
        input2.type = "text";
        input2.name = "title";
        input2.placeholder = "Associated date";

        $(FragmentDetailBox).append(input2);

        textarea = document.createElement("textarea");

        textarea.id = "textarea";
        textarea.placeholder = "Description (50 words)";

        $(FragmentDetailBox).append(textarea);

        //save button
        submitbuttom = document.createElement("input");

        submitbuttom.type = "button";
        submitbuttom.value = "SAVE";
        submitbuttom.name = "Save";
        submitbuttom.id = "submitbutton";

        submitbuttom.style.width=117+"px";
        submitbuttom.style.height=28+"px";

        submitbuttom.style.position='absolute';
        submitbuttom.style.right=126+"px";
        submitbuttom.style.top=440+"px";

        submitbuttom.style.fontSize=".9em";
        submitbuttom.style.color="#ffffff";

        $(FragmentDetailBox).append(submitbuttom);
        $( "#submitbutton" ).button();

        $("#submitbutton").click(function() {
            $("#FragmentDetailBox").hide(500);
            socket.emit('AddFragment', {Title:$("#input1").val(), Date:$("#input2").val(), Text: $("#textarea").val(), ImageName:LastImageFile});
            //console.log($("#input1").val());
        });

        //discard button
        discardbutton = document.createElement("input");

        discardbutton.type = "button";
        discardbutton.value = "DISCARD";
        discardbutton.name = "Save";
        discardbutton.id = "discardbutton";

        discardbutton.style.width=117+"px";
        discardbutton.style.height=28+"px";

        discardbutton.style.position='absolute';
        discardbutton.style.right=4+"px";
        discardbutton.style.top=440+"px";

        discardbutton.style.fontSize=".9em";
        discardbutton.style.color="#ffffff";

        $(FragmentDetailBox).append(discardbutton);
        $( "#discardbutton" ).button();

        $("#discardbutton").click(function() {
            $("#FragmentDetailBox").hide(500);
        });

        var displayImg = document.createElement("img");

        displayImg.id = "thumb";
        displayImg.src = "images/noimage.png";
        displayImg.alt = "image uploaded missing";
        //displayImg.height ="200px";
        //displayImg.width ="auto";

        $(FragmentDetailBox).append(displayImg);

        fileupload = document.createElement("form");

        fileupload.id = "fileupload";
        fileupload.action = "upload/";
        fileupload.method = "POST";
        fileupload.enctype = "multipart/form-data";

        $(FragmentDetailBox).append(fileupload);

        uploadtoolbar = document.createElement("div");

        uploadtoolbar.class = "fileupload-buttonbar";

        $("#fileupload").append(uploadtoolbar);

        loadbutton = document.createElement("span");

        loadbutton.class = "btn btn-success fileinput-button";

        $(uploadtoolbar).append(loadbutton);

        fileinput = document.createElement("input");

        fileinput.id = "fileinput";
        fileinput.type = "file";
        fileinput.name = "uploadfile";
        fileinput.multiple = "multiple";

        $(loadbutton).append(fileinput);

         $('#fileinput').fileupload({
            //acceptFileTypes: /(\.|\/)(gif|jpe?g|png|pdf)$/i,
            dataType: 'json',
            done: function (e, data) {
                //console.log(data);
                var ext=data.result.imgfile.split('.').pop();// extention of serverfile
                if (ext!="json") {
                    document.getElementById("thumb").src = data.result.imgfile;
                }
                LastImageFile=data.result.imgfile;
                //$("#thumb").src=data.result.imgfile;
                /*$.each(data.result, function (index, file) {
                    $('<p/>').text(file.name).appendTo(document.body);
                });*/
            }


    });
}


