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

var sreadSSI;

var message= "hello";



//Create a DID Document using OpenDSU standard and return a SeedSSI
createKeyDid('default', (err, keyidentifier, seedSSI)=> {

    //Sign a message with SeedSSI private key
    signWithSeedSSI(seedSSI,message, (err, signature)=>{
        
        //Signer create a SReadSSI for the verifier
        //sreadSSI=seedSSI.derive();

        //Verifier can check/resolve DID Document with sReadSSI and find the public Key to verify the signature
        resolveKeyDid(keyidentifier, (err, didDoc )=> { 

            //Get public key from DID Document
            console.log("Read DID document:",didDoc);
            var publicKey=didDoc.authentication[0].publicKeyBase58;  
            
            //Verify the signature using DID document's public key
            verifySignatureWithDidPublicKey(sreadSSI, message, signature, publicKey, (err, status)=>{
                console.log("Signature was verified:",status);
            })           
            
        })
                          
    })

})



function createKeyDid(domain, callback){

    var seedSSI = keyssispace.buildSeedSSI(domain);

    seedSSI.initialize("default", undefined, undefined, "v0", "hint",   (err) => {});    

    resolver.createDSU(seedSSI, (err, dsuInstance) =>{
        var did="did:opendsu:"+seedSSI.getIdentifier();
        var didDocument= {
          "@context": "https://www.w3.org/ns/did/v1",
          "id": did,
          "authentication": [{

            "id": did+"#keys-1",
            "type": "Ed25519VerificationKey2018",
            "controller": did,
            "publicKeyBase58": seedSSI.getPublicKey()
          }]
        };

        dsuInstance.writeFile('/did', JSON.stringify(didDocument), (err) => {
             dsuInstance.getKeySSI('sread',(err, keyidentifier) => {
                callback(err, keyidentifier, seedSSI);
            });
        });
    });

    
}


function resolveKeyDid(keydid, callback){
    resolver.loadDSU(keydid, (err, dsuInstance) =>{
        dsuInstance.readFile('/did', (err, data) => {
            const dataObject = JSON.parse(data.toString());
            callback(err, dataObject);             
           
        });
    });
}



function signWithSeedSSI(seedSSI, message, callback){
    crypto.hash(seedSSI, message, (err, hash) => {
            crypto.sign(seedSSI, hash, (err, signature) => {
                callback(err, signature);
            });
        });
}

function verifySignatureWithDidPublicKey(keydid, signedMessage, signature, didPublicKey, callback){
    crypto.hash(keydid, signedMessage, (err, hash) => {
        crypto.verifySignature(keydid, hash, signature, didPublicKey, (err, status)=>{
            callback(err,status);
        })
    })

}


