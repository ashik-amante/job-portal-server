const express = require('express');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000;
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middlewire
app.use(cors())
app.use(express.json())






const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_password}@cluster0.pdx5h.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        // jobs related apis 
        const jobsCollection = client.db('jobPortal').collection('jobs')
        const jobApplicationCollection = client.db('jobPortal').collection('job_applications')

        app.get('/jobs', async(req,res)=>{
            const cursor = jobsCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        // specific job
        app.get('/jobs/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId (id)}
            const result = await jobsCollection.findOne(query)
            res.send(result)
        })

        //  job application apis 
        app.post('/job_applications', async(req,res)=>{
            const application = req.body;
            const result = await jobApplicationCollection.insertOne(application)
            res.send(result)
        })

        app.get('/job_application', async(req,res)=>{
            const email = req.query.email;
            const query = {application_email : email}
            const result = await jobApplicationCollection.find(query).toArray()

            // fokira way
            for(const application of result){
                console.log(application.jb_id);
                const query1 = {_id : new ObjectId(application.jb_id)}
                const job = await jobsCollection.findOne(query1)
                if(job){
                    application.title  = job.title;
                    application.company = job.company;
                    application.company_logo = job.company_logo;
                    application.location = job.location
                }
            }

            res.send(result)
        })

    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Job IS Ready')
})

app.listen(port, () => {
    console.log(`job is waiting at : ${port}`);
})