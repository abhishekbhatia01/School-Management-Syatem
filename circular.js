const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const { json } = require('stream/consumers');

const circularDataFile = path.join(__dirname, 'data', "circular.json")
app.use(express.json()); // middlware

const readcircularDataFile = () =>{
    if(!fs.existsSync(circularDataFile)){
        fs.writeFileSync(circularDataFile,JSON.stringify([]));
    }
    return JSON.parse(fs.readFileSync(circularDataFile, 'utf-8'));
}

const writecircularDataFile = (data)=>{
    fs.writeFileSync(circularDataFile,JSON.stringify(data, null, 2));
}

module.exports = {readcircularDataFile, writecircularDataFile};

