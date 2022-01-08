const express = require ('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const ObjectId =require('mongodb').ObjectId;
const cors =require('cors');
const app= express();

const port =process.env.PORT || 9000;

// using middle ware 
app.use(cors());
app.use(express.json());

// connecting to mongoDB 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6xsao.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri)

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){

    try{
        await client.connect();
        const database = client.db("Daily_Need_Team_Project");
        const bookedProductsCollection = database.collection("booked_products");
        const addNewProductsCollection = database.collection("added-new_products");
        const reviewCollection = database.collection("User_Review");
        const usersCollection =database.collection("Users");
        
        // GET ADDED NEW PRODUCTS ,5
            app.get('/getAddNewProduct', async (req,res)=>{
            const cursor = addNewProductsCollection.find({});
            const getNewProduct = await cursor.toArray();
            res.send(getNewProduct);
        })
        // POST ADD NEW PRODUCT API, 4 
        app.post('/postAddNewProduct', async (req,res)=>{
            const newProduct =req.body;
            const result =await addNewProductsCollection.insertOne(newProduct);
           
            res.json(result);
        })

        // POST ALL BOOKED PRODUCT API, 1
        app.post('/allBookedProducts',async (req,res)=>{
            const bookedProduct=req.body;
            const result = await bookedProductsCollection.insertOne(bookedProduct);
            // console.log('Booked Product', req.body)
            // console.log('Booked  new Product', result)
            res.json(result);
        })

        // GET ALL BOOKED PRODUCTS, 2
        app.get('/getBookedProduct', async (req,res)=>{
            const cursor = bookedProductsCollection.find({});
            const getProduct = await cursor.toArray();
            res.send(getProduct);
        })

        // GET MY BOOKED PRODUCTS, 3 
        app.get('/getBookedProduct/:email', async (req,res)=>{
            console.log(req.params.email)
            const result = await bookedProductsCollection.find({
                email:req.params.email}).toArray();
               
                res.send(result);
        })
        // POST USER REVIEW ,6
        app.post('/postReview', async (req,res)=>{
            const newReview = req.body;
            const result =await reviewCollection.insertOne(newReview);
            
            res.json(result)
        })
        // GET USERS REVIEW,7 
        app.get('/getReviews', async (req,res)=>{
            const cursor = reviewCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })
        // ADD  NEW REGISTRATION USER,8
        app.post('/addUsers', async (req,res)=>{
            const users = req.body;
            const result = await usersCollection.insertOne(users);
            res.json(result);
        })
        // ADD GOOGLE SIGN IN USERS TO DB,9 
        app.put('/addUsers', async (req,res)=>{
            const user = req.body;
            const query = {email: user.email};
            const options = {upsert:true};
            const updateDoc = { $set: user};
            const result = await usersCollection.updateOne(query,updateDoc,options);
            res.json(result);
          })
        //   MAKE AN ADMIN,10
        app.put('/addUsers/admin',async(req,res)=>{
            const user=req.body;
            const filter={email: user.email};
            const updateDoc={$set: {role:'Admin'}};
            const result=await usersCollection.updateOne(filter,updateDoc);
            res.json(result);
        })

        // ADMIN SET UP,11 
        app.get('/addUsers/:email', async(req,res)=>{
            const email=req.params.email;
            const query={email:email};
            const user= await usersCollection.findOne(query)
            let isAdmin=false;
            if(user?.role ==='Admin'){
                isAdmin=true;
            }
            res.json({Admin: isAdmin})
        })
        // DELETE ALL BOOKED PRODUCTS,12 
        app.delete('/getBookedProduct:id', async(req,res)=>{
            const id=req.params.id;
            const query={_id:ObjectId(id)};
            const result= await bookedProductsCollection.deleteOne(query);
            console.log('Deleting with id',id)
            res.send(result);
        })

        // DELETE PRODUCTS BY ID,13
        app.delete('/getAddNewProduct:id', async(req,res)=>{
            const id=req.params.id;
            const query={_id:ObjectId(id)};
            const result= await addNewProductsCollection.deleteOne(query);
            console.log('Deleting with id',id)
            res.send(result);
        })
        // ORDER STATUS UPDATE 
        app.put("/statusUpdate/:id", async (req, res) => {
            const filter = { _id: ObjectId(req.params.id) };
            console.log(req.params.id);
            const result = await bookedProductsCollection.updateOne(filter, {
              $set: {
                status: req.body.status,
              },
            });
            res.send(result);
            console.log(result);
          });
        

    }

    finally {
        // await client.close();
      }
      
}
run().catch(console.dir);

app.get('/',async (req,res)=>{
    res.send('Welcome to crazy bikers server')
});

app.listen(port, ()=>{
    console.log('listening to port',port)
});