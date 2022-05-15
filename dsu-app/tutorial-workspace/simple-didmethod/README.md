## Simple-didmethod


In this example, we use the KeySSI concept from the OpenDSU standard to generate and resolve a DID Document and its associaciated DID (cf. W3C DID web
standard). We show how it can be used to verify provenance of signed message.

To **FIRST** run it simply **run the steps** found in the [Installation] section above then: 


```sh
# Step 1: Go inside [simple-didmethod]
cd simple-didmethod

# Step 2: Run the app
node main.js
```

You should get something like: 

```
....
resolve did with sread: {
  '@context': 'https://www.w3.org/ns/did/v1',
  id: 'did:opendsu:65FmT6jYpmQXgvgJoccUMxTdUA31WBkXh19ZQbdU6bdFANgeQSoGYHDtg3rzxkNvKN63N3Lz3Ha2k5HZAkTuAP1H6WVdMuoR',
  authentication: [
    {
      id: 'did:opendsu:65FmT6jYpmQXgvgJoccUMxTdUA31WBkXh19ZQbdU6bdFANgeQSoGYHDtg3rzxkNvKN63N3Lz3Ha2k5HZAkTuAP1H6WVdMuoR#keys-1',
      type: 'Ed25519VerificationKey2018',
      controller: 'did:opendsu:65FmT6jYpmQXgvgJoccUMxTdUA31WBkXh19ZQbdU6bdFANgeQSoGYHDtg3rzxkNvKN63N3Lz3Ha2k5HZAkTuAP1H6WVdMuoR',
      publicKeyBase58: '-----BEGIN PUBLIC KEY-----\n' +
        'MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEbX3vxBl3nHcFk3zCfV/Vom5dqbSfUb0+\n' +
        'pIgVoAWfEu+RHbKkko6/acbf7BPt5EL98Kb5LwswzMKRKPEfFPYOow==\n' +
        '-----END PUBLIC KEY-----'
    }
  ]
}
status of signature verification true
....
```


