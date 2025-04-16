const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const { json } = require('stream/consumers');

const taskDataFile = path.join(__dirname, 'data', "task.json")
app.use(express.json()); // middlware

const readtaskDataFile = () =>{
    if(!fs.existsSync(taskDataFile)){
        fs.writeFileSync(taskDataFile,JSON.stringify([]));
    }
    return JSON.parse(fs.readFileSync(taskDataFile, 'utf-8'));
}

const writetaskDataFile = (data)=>{
    fs.writeFileSync(taskDataFile,JSON.stringify(data, null, 2));
}

module.exports = {readtaskDataFile, writetaskDataFile};

