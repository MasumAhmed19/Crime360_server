const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const port = process.env.PORT || 5050;
const app = express();
const cookieParser = require('cookie-parser');

const corsOptions = {
  origin: [
    "http://localhost:5173",
,
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f0l8v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});


async function run() {
  try {
    const db = client.db("crime360-db");
    const postsCollection = db.collection("crime-posts");

    // POST a query in db
    app.post("/api/add-crime", async (req, res) => {
      try {
        const crimeData = req.body;
        const result = await postsCollection.insertOne(crimeData);
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: "Failed to add crime post", details: err });
      }
    });

    // READ all query data from db
    app.get("/api/all-crime-post", async (req, res) => {
      const result = await postsCollection.find().toArray();
      res.send(result);
    });

    // READ all posted query by specific user (their email)
    app.get("/queries/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const query = { "queryer.email": email };
        const result = await postsCollection.find(query).toArray();
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: "Failed to fetch user queries", details: err });
      }
    });

    // READ all posted query by specific user (post id)
    app.get("/query/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await postsCollection.find(query).toArray();
      res.send(result);
    });

    // delete a query from db
    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await postsCollection.deleteOne(filter);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db('admin').command({ ping: 1 })
    // console.log(
    //   'Pinged your deployment. You successfully connected to MongoDB!'
    // )
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Hello from Crime360 Server....");
});

app.listen(port, () => console.log(`Server running on port ${port}`));
