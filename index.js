//global variables
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 4000;
var request = require('request');
var dotenv = require('dotenv');

//options to create the capture
let data = fs.readFileSync(path.resolve(__dirname + '/uploads', './'+'sample.mp4'));
dotenv.config();
var bucket = '';
var slug = '';

//creating a new capture
app.post('/capture/create/:title',(req,res) => {
    var options = {
        'method': 'POST',
        'url': 'https://webapp.engineeringlumalabs.com/api/v2/capture',
        'headers': {
          'Authorization': `luma-api-key=${process.env.API_KEY}`
        },
        form: {
          'title': req.params.title
        }
      };

    request(options,(error,response) =>{
        if(error) throw new Error(error);
        console.log(response.body);
        bucket = JSON.parse(response.body).signedUrls.source;
        slug = JSON.parse(response.body).capture.slug;
        res.status(200).send(bucket);
    });
});

//uploading the capture
app.post('/capture/upload',(req,res) => {
    if(bucket !== ''){
        var options = {
            'method': 'PUT',
            'url': bucket,
            'headers': {
                'Content-Type': 'text/plain'
              },
            body: data
        };
    
        request(options,(error,response) =>{
            if(error) throw new Error(error);
            res.status(200).send('Successfully uploaded capture');
        });
    }
    else{
        res.send('Create a capture before attempting to upload');
    }
});

//triggering the capture
app.post('/capture/trigger',(req,res) => {
    var options = {
        'method': 'POST',
        'url': `https://webapp.engineeringlumalabs.com/api/v2/capture/${slug}`,
        'headers': {
            'Authorization': `luma-api-key=${process.env.API_KEY}`
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log(response.body);
        res.send(response.body);
    });
});

//starting the server
app.listen(port,() => {
    console.log('Luma API Metabees demo server has started..');
})