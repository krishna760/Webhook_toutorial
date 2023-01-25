const express = require("express")
const mongoose = require("mongoose");
const bodyParser = require("body-parser")
const {schoolModel} = require('../webhook/models/schoolModel');
const {studentModel} = require('../webhook/models/studentModel');
const axios = require('axios');
const app = express()
const PORT = 3100;
app.use(bodyParser.json());

const dbUrl = 'mongodb+srv://krishna:krishnab@cluster0.tybm9vy.mongodb.net/usersdb?retryWrites=true&w=majority'
mongoose.connect(dbUrl,{useNewUrlParser: true, useUnifiedTopology: true}).then(()=>{console.log("Connection successful")}).catch((err)=>{console.log(err)})

app.get("/", (req, res)=>{
  res.send("Hello world from server")
});

app.post('/registerSchool', async (req, res) => {
  let data = req.body;
  const index = await  schoolModel.find().count();
  const schoolDetails = new schoolModel({
      schoolName: data.schoolName,
      schoolId: index+ 1,

  });
  let schoolData = await schoolDetails.save();

  res.send({
      result:schoolData
  });
});

app.post('/addWebhookEvent', async (req, res) => {
  let data = req.body;
  let schoolDetails = await  schoolModel.findOne({"schoolId": data.schoolId});
  if(schoolDetails){
      if(schoolDetails.webhookDetails == null){
          schoolDetails.webhookDetails =[];
      }
      schoolDetails.webhookDetails.push({
          eventName: data.eventName,
          endpointUrl: data.endpointUrl
      });

      schoolDetails = await schoolModel.findOneAndUpdate(
          {"schoolId": schoolDetails.schoolId}, schoolDetails,{
              returnOriginal: false
          })
  }else
  {
      console.log(" NO school")
  }


  res.send({
      result:schoolDetails
  });
});

app.post('/addStudent', async (req, res) => {
  let data = req.body;
  let studentData ={};
  let schoolDetails = await  schoolModel.findOne({"schoolId": data.schoolId});
  if(schoolDetails){
      const studentDetails = new studentModel({
          name: data.name,
          age:data.age,
          schoolId: data.schoolId

      });
      studentData = await studentDetails.save();
      let webhookUrl ="";
      for(let i=0; i<schoolDetails.webhookDetails.length; i++){
          if(schoolDetails.webhookDetails[i].eventName == "newStudentadded")
          webhookUrl = schoolDetails.webhookDetails[i].endpointUrl;
      }
      if(webhookUrl != null && webhookUrl.length>0){
          // webhook response
          let result = await axios.post(webhookUrl, studentData,{
              headers: {
                  'Content-Type': 'application/json',
              }
          })
          console.log(" webhook data send")
      }
  }else
  {
      console.log(" NO school")
  }

  res.send({
      result:"added succesfully: "+studentData.name
  });
});


app.listen(PORT, ()=>{
  console.log("App is running on port "+PORT);
})

mongoose.connection.on('connected', ()=>{
  console.log('Mongoose default connection open to ' + dbUrl );
});