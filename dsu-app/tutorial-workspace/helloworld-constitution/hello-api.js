//Load openDSU enviroment
require("../privatesky/psknode/bundles/testsRuntime");
require("../privatesky/psknode/bundles/openDSU");

//Load openDSU SDK
const opendsu = require("opendsu");

//Load resolver library
const resolver = opendsu.loadApi("resolver");

//Load keyssi library
const keyssispace = opendsu.loadApi("keyssi");

//Create a template keySSI (for default domain). See /conf/BDNS.hosts.json
const templateSSI = keyssispace.buildSeedSSI('default');

var apiCode = '';

fs = require('fs');
fs.readFile('./api-code.js', 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    
    apiCode = data;

    //Create a DSU
    resolver.createDSU(templateSSI, (err, dsuInstance) =>{
        //Reached when DSU created
        if (err){
        throw err;
        }

        //Methods found in: /modules/bar/lib/Archive.js
        dsuInstance.writeFile('/code/api.js', apiCode, (err) => {
            //Reached when data written to BrickStorage

            if(err){
                throw err;
            }
            console.log("Data written succesfully! :)");


            dsuInstance.call("echo", "Hello DSU world!", (err, message)=>{
                if(err){
                    return console.log("Caught error", error);
                }
                console.log("This is my message", message);
            });
        });
    });
  });

// let apiCode = "
// module.exports = {
//     echo: function(message, callback){
//         return callback(undefined, 'Echo: '+message);
//     }
// };
// ";


