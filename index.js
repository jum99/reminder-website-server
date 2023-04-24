const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.fodu2.mongodb.net:27017,cluster0-shard-00-01.fodu2.mongodb.net:27017,cluster0-shard-00-02.fodu2.mongodb.net:27017/?ssl=true&replicaSet=atlas-77ukfo-shard-0&authSource=admin&retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

    try {

        await client.connect();

        const database = client.db('reminder_website');
        const remindersCollection = database.collection('reminders');

        console.log('Connected');

        app.post('/reminders', async (req, res) => {
            const reminders = req.body;
            const result = await remindersCollection.insertOne(reminders);
            res.json(result);
            console.log(result)

        })


        // load specific user reminders
        app.get('/userReminders', async (req, res) => {
            const email = req.query.email;
            console.log(email);
            const query = { email: email }
            const cursor = remindersCollection.find(query);
            // console.log(cursor);
            const userReminders = await cursor.toArray();
            // console.log();
            res.json(userReminders);
        })

        // delete order api
        app.delete('/cancelItem/:id', async (req, res) => {
            const id = new ObjectId(req.params.id);
            console.log('delete this ', id);
            const result = await remindersCollection.findOneAndDelete({ _id: id });
            res.send(result);

        });

    } finally {
        // await client.close();
    }

}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Reminder Website Server')
});


app.listen(port, () => {
    console.log(`listening at ${port}`)
});

