const MongoClient = require('mongodb').MongoClient;
const {DB_URL} = require('./secrets');

// Use connect method to connect to the Server
const client = MongoClient.connect(DB_URL, {useNewUrlParser: true});
module.exports =
    client.then((db) => {
        return db.db("techopoly").collection("techopoly");
    })
;