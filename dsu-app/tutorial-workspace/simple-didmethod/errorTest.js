
//Load openDSU enviroment
require("../privatesky/psknode/bundles/testsRuntime");
require("../privatesky/psknode/bundles/openDSU");

//Load openDSU SDK
const opendsu = require("opendsu");

//Load resolver library
const resolver = opendsu.loadApi("resolver");

//Load keyssi library
const keyssispace = opendsu.loadApi("keyssi");

const crypto = opendsu.loadApi("crypto");

var seedSSI = keyssispace.buildSeedSSI("default");

seedSSI.initialize("default", undefined, undefined, "v0", "hint",   (err) => {

	var sReadSSI=seedSSI.derive();

	resolver.createDSU(seedSSI, (err, dsuInstance) =>{

		dsuInstance.writeFile('/data.txt', "I write in DSU", (err) => {

			dsuInstance.getKeySSI('sread',(err,keyidentifier)=>{
				
				loadDSUwithIdentifier(keyidentifier,(err)=>{
					loadDSUwithSReadSSI(sReadSSI);
				});
				
			});
		});
	});

});
 

function loadDSUwithIdentifier(keyidentifier, callback){
	console.log("TEST 1 - LOAD DSU WITH IDENTIFIER RETURNED FROM GetKEYSSI")
	resolver.loadDSU(keyidentifier,(err, dsuSRead) =>{				
		dsuSRead.readFile('/data.txt', (err, data) => {
			console.log("Data.txt SREAD identifier",data.toString());  
			dsuSRead.listFiles('/', (err, files) => {
				console.log("Files in DSU Generated loaded with sReadSSI",files);  
				console.log("I can load DSU and read the file normally"); 
				console.log("-------------------------------"); 
				callback();        
	        });	           
		});
	});
}

function loadDSUwithSReadSSI(sreadSSI){
	console.log("TEST 2 - LOAD DSU WITH sReadSSI")
	resolver.loadDSU(sreadSSI,(err, dsuSRead) =>{				
		dsuSRead.readFile('/data.txt', (err, data) => {
			//console.log("Data.txt SREAD identifier",data.toString());  
			dsuSRead.listFiles('/', (err, files) => {
				console.log("Files in DSU Generated loaded with sReadSSI",files);        
				console.log("I can load a DSU but there is no file inside - I might not be the same DSU that is loaded");   
				console.log("-------------------------------");   
	        });	           
		});
	});
}
