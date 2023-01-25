const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");

const app = express();
const PORT = 4100;
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Welcome to Ronaldo School');
});
app.post('/webhook/studentAdded', (req, res)=>{
    let data = req.body;
    console.log("name: "+ data.name)
    res.send('Webhook data received')
})

app.listen(PORT, () => {
    console.log(`Server running at: http://localhost:${PORT}/`);
});
