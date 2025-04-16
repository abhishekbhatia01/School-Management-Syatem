const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const { json } = require('stream/consumers');

const classDataFile = path.join(__dirname, 'data', "class.json")
app.use(express.json()); // middlware

const readclassDataFile = () =>{
    if(!fs.existsSync(classDataFile)){
        fs.writeFileSync(classDataFile,JSON.stringify([]));
    }
    return JSON.parse(fs.readFileSync(classDataFile, 'utf-8'));
}

const writeclassDataFile = (data)=>{
    fs.writeFileSync(classDataFile,JSON.stringify(data, null, 2));
}

module.exports = {readclassDataFile, writeclassDataFile};

