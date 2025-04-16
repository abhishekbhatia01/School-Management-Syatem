const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const { json } = require('stream/consumers');

const teacherDataFile = path.join(__dirname, 'data', "teacher.json")
app.use(express.json()); // middlware

const readteacherDataFile = () =>{
    if(!fs.existsSync(teacherDataFile)){
        fs.writeFileSync(teacherDataFile,JSON.stringify([]));
    }
    return JSON.parse(fs.readFileSync(teacherDataFile, 'utf-8'));
}

const writeteacherDataFile = (data)=>{
    fs.writeFileSync(teacherDataFile,JSON.stringify(data, null, 2));
}

module.exports = {readteacherDataFile, writeteacherDataFile};

