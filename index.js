const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000;


//Middleware----

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zkvef.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//console.log(uri);

async function run(){
    try{
        await client.connect();
        const database = client.db('watchesDetail')
        const watchesCollection = database.collection('watches');
        const adminsCollection = client.db('watchesDetail').collection("admins");
        const ordersCollection = client.db('watchesDetail').collection('orders');
        const reviewCollection = client.db('watchesDetail').collection("review");
        
        
        console.log('con to db');

        //  make admin
        app.put("/admins", async (req, res) => {
            const filter = { email: req.body.email };
            const result = await adminsCollection.find(filter).toArray();
            if (result) {
              const documents = await adminsCollection.updateOne(filter, {
                $set: { role: "admin" },
              });
              console.log(documents);
            }
            
          });

         //admin verification
        app.get("/admins/:email", async (req, res) => {
            const result = await adminsCollection.find({ email: req.params.email }).toArray();
            console.log(result);
            res.send(result);
        });

        //Get watches data
        app.get('/watches', async(req, res) => {
            const cursor = watchesCollection.find({});
            const watches = await cursor.toArray();
            res.send(watches);
        })

        //place order
         app.post("/orders", async (req, res) => {
            console.log(req.body);
            const result = await ordersCollection.insertOne(req.body);
            res.send(result);
          });

         //My order
         app.get('/orders/:email', async(req, res) => {
            
            const result = await ordersCollection.find({email : req.params.email}).toArray();
            res.send(result);
            // console.log(req.params.email);

        })
        

        //Get register order
        app.get('/orders', async(req, res) => {
            const result = await ordersCollection.find({}).toArray();
            res.send(result);
            console.log(result);
        })

        //Delete All order{admin}
           app.delete('/orders/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id : ObjectId(id)};
            const result = await ordersCollection.deleteOne(query);
            res.send(result);
        })

        //Delete My order
        app.delete('/orders/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id : ObjectId(id)};
            const result = await ordersCollection.deleteOne(query);
            res.send(result);
        })

        //Manage Services
        app.delete('/watches/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id : ObjectId(id)};
            const result = await watchesCollection.deleteOne(query);
            res.json(result);
        })

        
        //Get single watch cart
         app.get('/watches/:id', async(req, res) => {
            const id = req.params.id;
            console.log('hit the id', id);
            const query = {_id: ObjectId(id)};
            const watch = await watchesCollection.findOne(query);
            res.json(watch);
        })

        // review
        app.post("/review", async (req, res) => {
            const result = await reviewCollection.insertOne(req.body);
            res.send(result);
        });

        //Get review
        app.get("/review", async (req, res) => {
            const result = await reviewCollection.find({}).toArray();
            res.send(result);
        });

        app.post("/admins", async (req, res) => {
            console.log("req.body");
            const result = await adminsCollection.insertOne(req.body);
            res.send(result);
            console.log(result);
        });

        //Post watches data
        app.post('/watches', async(req, res) => {
            const watch = req.body;
            console.log('hit post api', watch);
            const result = await watchesCollection.insertOne(watch);
            console.log(result);
            res.json(result)
        });
    }
    finally{
        // await client.close();
    }
}

    





run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('running server')
})

app.listen(port, () => {
    console.log("running server port", port);
})