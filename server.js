
//.............this loads particular modules we are going to use in this script.
//.............these modules are almost always needed, so these lines
//.............will almost always be at the begining of your server file
var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');
var util = require('util');
var qs = require('querystring');
var formidable = require('formidable');


//...................MongoDB initialization

//..................Get the mongoDB modules [always needed]
var mongo = require('mongodb'),
	Server = mongo.Server,
	Db = mongo.Db,
	ObjectID = mongo.ObjectID;

//.................open a connection to the mongodb server
var mdbserver = new Server('localhost', 27017, {auto_reconnect: true});
//.................ask the server for the database named "fragmentsDB" this databse will be created if it doesn't exist already
var db = new Db('fragmentsDB', mdbserver,{safe:true});

//.................get or create a collection in fragmentsDB to store fragments
//global variable that will be set to the fragment collection as soon as it is created or returned from the database
var fragmentCollection=null;
var relationCollection=null;
//.................open the database
db.open(function(err, db) {
  if(!err) {
  	//if all went well [that is mongoDB is alive and listening]
    console.log("We are connected");
    //create a cllection named fragmentCollection and if it succeeds set the global variable fragmentCollection to 
    //point to the newly created or opened collection
    db.createCollection(
    	'fragmentCollection', 				//name of collection to open
    	{safe:false}, 					//unsafe mode, if the collection already exists just give us the existing one
    	function(err, collection) {		//this function is called as soon as the databse has either found or created a collection with the requested name
    		fragmentCollection=collection;	//set the global variable fragmentCollection to the newly found collection
    	});
    db.createCollection(
    	'relationCollection', 				//name of collection to open
    	{safe:false}, 					//unsafe mode, if the collection already exists just give us the existing one
    	function(err, collection) {		//this function is called as soon as the databse has either found or created a collection with the requested name
    		relationCollection=collection;	//set the global variable relationCollection to the newly found collection
    	});

  }
});
 //db.collection.remove({});



//Add a cube to the cubeCollection and call the onadded function as soon as you are done
/*function AddCube(x,y,z, onadded) {
	//insert a new object to the collection
	cubeCollection.insert(
		{	time:(new Date()).getTime(), 	//set the time stamp of the object to the current time in milliseconds
			x:x, 							//set its coordinates to the requested values
			y:y, 
			z:z
		}, 
		{safe:true}, 						//safe mode
		function(err, result) {				//as soon as the new cube is added and if there are no errors
			if (err ==null) {				//
				onadded(result);			//call the onadded function with the newly added object "result"
											//result contians the data {time,x,y,z} we placed plus an extra property, the unique identifier _id that mongoDB assinged to it. From now on this will be the way to refer to this cube
			}
		}
	);
}

//modify the coordinates of the cube with identifier _id 
function ModifyCube(_id, x,y,z) {

	cubeCollection.update(		//ask mongoDB to modify an element
		{_id:_id}, 				//modify the element whose _id equals the given _id
		{
			$set:{								//the type of modification we want to do is a change of values. this is designated by the $set argument [we can also remove or add new properties]
				time:(new Date()).getTime(),  	//change the cube timestamp to the current time so that we know that this cube has fresh data when the clients ask for updates
				x:x, 							//modify the coordinates of the cube
				y:y, 
				z:z
			}
		}
	);
}

//remove cube with identifier id from the database
function RemoveCube(_id) {
	//remove the cube with _id equals _id form the database
	cubeCollection.remove({_id:_id});
}*/

//...........................main server intitialization
//create a new http server object. This server will be listening for requests and sending back repsonses
var httpserver = http.createServer(
	function(req, res) { 	//this is the heart of the server. This function determines the bahaviour of the server by 
							//generating a resposnse res for a requests req.

		console.log(req.url);
		if (req.url == '/pages/upload/' && req.method.toLowerCase() == 'post') {
		    // parse a file upload
		    var form = new formidable.IncomingForm();
		   // console.log("upload request");

		    form.parse(req, function(err, fields, files) {
		    	
		    	console.log(files.uploadfile.path);
		    	
		    	fs.rename(files.uploadfile.path, 'pages/images/'+files.uploadfile.name, function (err) { if (err) {console.log(err);} });

		    	res.writeHead(200, {"Content-Type": "application/json"});
        		//write a string version of the cube that was added to the database in the resposnse
        		res.write(JSON.stringify({imgfile:'images/'+files.uploadfile.name}));
        		//close the response and send it back
        		res.end();
		    });

		    return;
		  }

		//retrieve the pathanme that the client requested [this is the first argument in a $.put function]
		//the url is a string that contains the complete web address, the pathname is just the last part
		//of the url
		var pathname = url.parse(req.url).pathname;



//if we couldn't recognize the request message then the user might have requested a file [image, shader etc...]
//here we try to see if the file exists and if so send it back with the right header
//this is the default behaviour of a web server
		var fullpath = path.join(process.cwd(), pathname);
		path.exists(fullpath, 
			function(exists) {
			    if (!exists) {
			        res.writeHead(404, {'Content-Type': 'text/plain'});			        
			        res.write("pathname="+pathname);
			        res.write("fullpath="+fullpath);
			        res.end("<h1>Page not found</h1>");


				    util.puts("not found:"+fullpath);

			        return;
			    }
		 
		    	fs.readFile(fullpath, "binary", 
		    		function(err, data) {
				        if (err) {
				            res.writeHead(500, {'Content-Type': 'text/plain'});
				            res.end("<h1>Page cannot be read</h1>");
				            return;
				        }


    					var fnameext=path.extname(pathname||'').split('.');
				        var ext=fnameext[fnameext.length - 1];
				       // util.puts(ext);

				        if (ext=="js") {
				        	res.writeHead(200, {'Content-Type' : 'text/javascript'});
					        res.write(data, "binary");
					        res.end();

				        }
				        else if (ext=="json") {
				        	res.writeHead(200, {"Content-Type": "application/json"});
				        	res.write(data, "binary");
					        res.end();
				        }
				        else if (ext=="css") {
				        	res.writeHead(200, {'Content-Type' : 'text/css'});
					        res.write(data, "binary");
					        res.end();

				        }
				        else if (ext=="jpg" || ext=="jpeg") {
				        	res.writeHead(200, {'Content-Type' : 'image/jpeg'});
					        res.write(data, "binary");
					        res.end();

				        }
				        else if (ext=="png") {
				        	res.writeHead(200, {'Content-Type' : 'image/png'});
					        res.write(data, "binary");
					        res.end();

				        }
				         else if (ext=="glsl") {
				        	res.writeHead(200, {'Content-Type' : 'text/plain'});
					        res.write(data, "binary");
					        res.end();

				        }
				        else {
				        	res.writeHead(200, {'Content-Type' : 'text/html'});
					        res.write(data, "binary");
					        res.end();
				        }

				        
		    		}
		    	);
			}
		);
	}
);


//...................Socket.io
var io=require('socket.io').listen(httpserver);

io.set('log level', 0);

io.sockets.on('connection', function (socket) {

  /*socket.on('Save', function (data) {
  		AddFragment(data, function(dbdata) {
  			io.sockets.emit('DataAdded', dbdata);
  		}
  	);
  });*/

  /*socket.on('RemoveCube', function (data) {
  	RemoveCube(new ObjectID(data._id));
    io.sockets.emit('RemoveCube', data);
  });*/

//Add Fragment to the collection

function AddFragment(data, onadded) {
	data.timestamp=new Date();

	fragmentCollection.insert(
		//time:(new Date()).getTime(),
		data, 
		{safe:true}, 						//safe mode
		function(err, result) {				//as soon as the new fragment is added and if there are no errors
			if (err ==null) {				//
				onadded(result);			//call the onadded function with the newly added object "result"
											//result contians the data {time,x,y,z} we placed plus an extra property, the unique identifier _id that mongoDB assinged to it. From now on this will be the way to refer to this fragment
			}
		}
	);
}

//Add Relation to the collection

function AddRelation(data, onadded) {
	data.timestamp=new Date();
	data.FragmentBeginId=new ObjectID(data.FragmentBeginId);
	data.FragmentEndId=new ObjectID(data.FragmentEndId);

	relationCollection.insert(
		data, 
		{safe:true}, 						//safe mode
		function(err, result) {				//as soon as the new relation is added and if there are no errors
			if (err ==null) {				//
				onadded(result);			//call the onadded function with the newly added object "result"
											//result contians the data {time,type,anchor} we placed plus an extra property, the unique identifier _id that mongoDB assinged to it. From now on this will be the way to refer to this relation
			}
		}
	);
}

  socket.on('AddFragment', function (data) {
  	AddFragment(data, 
    	function (result) {
    		io.sockets.emit('AddFragment', result);
    	}
    );		
  });

  socket.on('AddRelation', function (data) {
  	AddRelation(data, 
    	function (result) {
    		io.sockets.emit('AddRelation', result);
    		console.log(result);
    	}
    );

  });

  /*socket.on('Modify', function (data) {
  	ModifyCube(new ObjectID(data._id), Number(data.x), Number(data.y), Number(data.z));
    socket.broadcast.emit('Modify', data);
  });*/

  socket.on('Update', function (data) {
  	fragmentCollection.find({ 						//begin a query in the fragmentcollection
    		"timestamp": {$gt:new Date(data.lastTime)}	//request all fragments whose timestamp is greater than the update request time stamp
    	},
    	{}
    ).toArray( 									//convert the query result into an array
    	function (err, docs) {
    		socket.emit('AddFragment', docs);
    		relationCollection.find({ 						//begin a query in the fragmentcollection
		    		"timestamp": {$gt:new Date(data.lastTime)}	//request all fragments whose timestamp is greater than the update request time stamp
		    	},
		    	{}
		    ).toArray (
    			function (err, docs) {
    			socket.emit('AddRelation', docs);
    			}
    			);
    		////nested toArray --- relationCollection
    	}
   	); 
  });


});

//place the server in listening mode on the 8001 port
httpserver.listen(process.env.VMC_APP_PORT || 8001);