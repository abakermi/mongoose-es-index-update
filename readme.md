# mongoose-es-index-update [![Build Status](https://travis-ci.com/abakermi/mongoose-es-index-update.svg?branch=master)](https://travis-ci.com/abakermi/mongoose-es-index-update) [![npm version](https://badge.fury.io/js/mongoose-es-index-update.svg)](https://badge.fury.io/js/mongoose-es-index-update)

> update elastic search index after save , updateOne mongoose hooks


## Install

```
$ npm install mongoose-es-index-update
```


## Usage

```js


const mongooseEsUpdate = require('mongoose-es-index-update');

//..schema ,model
//plugin options required
const options={
   index:"myindex",
    host:"localhost:9200" //elastisearch 
}
someSchema.plugin(mongooseEsUpdate,{otions)

mymodel.save() // save your model


```


## Options


#### host

Type: `string`

elasticsearch node host url.

#### index

Type: `string`

elasticsearch index


## License

MIT © [Abdelhak Akermi](https://github.com/abakermi)