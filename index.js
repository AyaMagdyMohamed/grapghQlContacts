const algoliasearch = require('algoliasearch');

const client = algoliasearch('MZDK07CMHG', '95834b758ad6c0a4d93d0ab9a97ecd8a');
const index = client.initIndex('contacts');

const contactsJSON = require('./contacts.json');

const express = require("express");
var app=express();

var { buildSchema } = require('graphql');
var { graphqlHTTP } = require('express-graphql');
// ------- set settings ----------- 

index.setSettings({
    'customRanking': ['desc(followers)'],  // oder by number of followes desc
    'searchableAttributes': [  // set attributes to search with
        'lastname',
        'firstname',
        'company',
        'email',
        'city',
        'address'
      ]
  }).then(() => {
    // done
    console.log("done")
  })


// -----------put data ---------------


/*index.saveObjects(contactsJSON, {
  autoGenerateObjectIDIfNotExist: true
}).then(({ objectIDs }) => {
  console.log(objectIDs);
});*/

// search 
app.get("/search/:name", async function (req, resp) {

    const name = req.params.name;
    index.search(name).then(({ hits }) => {
        console.log(hits);
        resp.send(hits);
      });

})

// GraphQL schema
var schema = buildSchema(`
    type Query {
        contact(id: Int!): Contact
        contacts(firstname: String): [Contact]
    },
    type Contact {
        id: Int
        lastname: String
        firstname: String
        company: String
        email: String
        city: String
        address: String
    }
`);

var getContacts = async function(name) {

    const contacts = await index.search(name.firstname);
    console.log("contacts", contacts)
    return contacts.hits ;
}
var root = {
  
    contacts: getContacts
};
// Create an express server and a GraphQL endpoint
var app = express();
app.use('/contacts', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
}));




app.listen(9000, function() {

    console.log("connected");
});