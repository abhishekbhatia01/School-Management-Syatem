const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const { stringify } = require('querystring');
const {readteacherDataFile, writeteacherDataFile} = require('./teacher')
const bcrypt = require('bcrypt');
const {readclassDataFile, writeclassDataFile} = require('./class')
const {readtaskDataFile, writetaskDataFile} = require('./taks')
const {readcircularDataFile, writecircularDataFile} = require('./circular')

app.set("view engine", 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(express.static(path.join(__dirname, 'public')));
const usersFilePath = path.join(__dirname, 'data', "students.json"); 
const usersFile = path.join(__dirname, 'data', "accounts.json"); 


let users = [];
if (fs.existsSync(usersFilePath)) {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    if (data) {
        users = JSON.parse(data);
    }
}

app.get('/',(req,res)=>{
    res.render("index")
});

app.get('/choose',(req,res)=>{
    res.render("choose");
});

// signup

let usersid = [];

if (fs.existsSync(usersFile)) {
    usersid = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
}

app.get("/signup", (req, res) => {
    res.render("signup",{ message: '' });
});

app.get("/signupac", (req, res) => {
    res.render("addacc");
})
app.post("/signup", (req, res) => {
    const { username, name, email, password, role } = req.body;


    if (usersid.find((user) => user.username === username)) {
        return res.render("signup", { message: "User already exists!" });
    }

    const hashPass = bcrypt.hashSync(password, 10);
   
    const newUser = {
        username: username,
        name: name,
        email: email,
        password: hashPass,
        role: role
    };

   
    usersid.push(newUser);
    fs.writeFileSync(usersFile, JSON.stringify(usersid, null, 2));

    if(role === 'teacher' || role === 'student'){
        return res.redirect('/dashome');
    }
    else{
        return res.redirect('/login');
    }
});


// login
app.get("/login", (req, res) => {
    res.render("login", { message: "" });
});

app.get('/login2', (req, res) => {
    res.render("stutealogin");
})
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = usersid.find((user) => user.username === username);

    if (user) {
        const result = bcrypt.compareSync(password, user.password);
        if (result) {
           
            if (user.role === "admin") {
                res.redirect("/dashome");
            } else if (user.role === "teacher") {
                res.redirect("/teacherd");
            } else if (user.role === "student") {
                res.redirect("/student/dashboard");
            } else {
                res.render("login", { message: "Role not recognized!" });
            }
        } else {
            res.render("login", { message: "Invalid credentials!" });
        }
    } else {
        res.render("login", { message: "Invalid credentials!" });
    }
});


app.get('/dashome', (req, res) => {
    res.render("dashhome", {
         studentCount: users.length,
         teacherCount: readteacherDataFile().length,
         classCount: readclassDataFile().length
    });
});


app.get('/admindash', (req, res)=>{
    res.render("dashboard");
});


// student add
app.get('/registeruser/:classId?', (req, res) => {
    const classId = req.params.classId || null;
    res.render("student", { classId: classId });
});

app.post('/registeruser/:classId',(req,res)=>{
    const{fname, lname, age, fathername, mobno, batch, dept} = req.body;
    const classId = parseInt(req.params.classId); 
    const classData = readclassDataFile();
    let user_id;

    if(users.length == 0){
        user_id = 1;
    }else{
        user_id = users[users.length-1].id+1;
    }

    const new_user = {
        id: user_id,
        classId: classId,
        fname:req.body.fname,
        lname:req.body.lname,
        age:req.body.age,
        fathername:req.body.fathername,
        mobno:req.body.mobno,
        batch:req.body.batch,
    }

    users.push(new_user);
        
    fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err)=>{
        if(err){
            console.log("Error",err);
            return res.status(500).json({message: "Internal server error"});
        }else{
            console.log("User register", new_user);
           res.redirect('/showClass'); 

        }
    });
});
    
app.get('/show', (req, res) => {
    res.render("show", { users });
})
app.get('/show/:classId', (req, res) => {
    const classId = parseInt(req.params.classId);
   
    const studentsInClass = users.filter(user => user.classId === classId);
    res.render("show", { users: studentsInClass });
});

app.get('/edit/:id', (req, res) => {
    const userId = Number(req.params.id);
    const user = users.find(user => user.id === userId);
    if (!user) {
        return res.status(404).send("User not found");
    }
    res.render('edit', { user });
});

app.post('/edit/:id', (req, res) => {
    const { fname, lname, age, fathername, mobno, batch} = req.body;
    const userId = Number(req.params.id);

    let userIndex = users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
        return res.status(404).send("User not found");
    }
    users[userIndex] = { 
        ...users[userIndex], 
        fname, lname, age, fathername, mobno, batch
    };
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

    res.redirect('/show');
});

app.get("/delete/:id", (req, res) => {
    users = users.filter(user => user.id != req.params.id); 

   
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

    res.redirect("/show"); 
});

// teacher add
app.get('/addteacher', (req,res)=>{
    res.render("addteacher");   
})
app.post('/addteacher', (req, res)=>{
    const teacher = readteacherDataFile();

    let teacher_id;

    if(teacher.length == 0){
        teacher_id = 1;
    }else{
        teacher_id = teacher[teacher.length-1].id+1;
    }
   
    const new_teacher = {
        id : teacher_id,
        fname : req.body.fname,
        lname : req.body.lname,
        age : req.body.age,
        mobno : req.body.mobno,
        jdate : req.body.jdate 
    }

    teacher.push(new_teacher);
    writeteacherDataFile(teacher);

    res.status(202).redirect('/teacher');
    
})

app.get('/teacher', (req, res) => {
    const teacherData = readteacherDataFile();
    res.render("teacher", { teachers: teacherData });
});
app.get('/showteacher', (req, res) => {
    const teacherData = readteacherDataFile();
    res.render("showteacher", { teachers: teacherData });
})

app.get("/teacherDel/:id", (req, res) => {
    teacher = readteacherDataFile();
    teacher = teacher.filter(user => user.id != req.params.id); 
   
    writeteacherDataFile(teacher);
    res.redirect("/showteacher");
});

app.get('/editTeacher/:id', (req, res) => {
    const teacherData = readteacherDataFile();
    const teacherId = Number(req.params.id);
    const teacher = teacherData.find(t => t.id === teacherId);

    if (!teacher) {
        return res.status(404).send("Teacher not found");
    }
    res.render("Teacher/editteacher", { teacher });
});
app.post('/editteacher/:id', (req, res) => {
    const teacherData = readteacherDataFile();
    const teacherId = Number(req.params.id);

    const index = teacherData.findIndex(t => t.id === teacherId);

    if (index === -1) {
        return res.status(404).send("Teacher not found");
    }

    teacherData[index] = {
        id: teacherId,
        fname: req.body.fname,
        lname: req.body.lname,
        age: req.body.age,
        mobno: req.body.mobno,
        jdate: req.body.jdate
    };

    writeteacherDataFile(teacherData);
    res.redirect('/teacher');
});

// class 
app.get('/class', (req, res) => {
    res.render("class");
})


app.get('/addclass', (req, res) => {
    res.render("addClasses");
})
app.post('/class', (req, res) => {
    const {standard, section} = req.body;
    const classData = readclassDataFile();
   

    const new_class = {
        id : classData.length + 1,
        standard : req.body.standard,
        section : req.body.section
    }
    classData.push(new_class);
    writeclassDataFile(classData);
    res.status(202).redirect('/showClass');
})

app.get('/showClass', (req, res) => {
    const classData = readclassDataFile();
    res.render("showClass", { classes: classData });
})

app.get("/classDel/:id", (req, res) => {
    classdata = readclassDataFile();
    classdata = classdata.filter(user => user.id != req.params.id); 
   
    writeclassDataFile(classdata);
    res.redirect("/showClass");
});

// teacher dashboard
app.get("/teacherd", (req, res) => {
    
    const classData = readclassDataFile();
    
    res.render("teacher/teacherdash", { 
        studentCount: users.length,
        classCount: classData.length
    });
});

app.get('/stud-teacher', (req, res)=>{
    res.render("teacher/student");
})

app.get('/class-teacher', (req, res)=>{
    const classData = readclassDataFile();
    res.render("teacher/class", { classes: classData });

})


// tasks
app.get('/tasks/:id', (req, res) => {
    const classId = parseInt(req.params.id);
    res.render("teacher/assign", { classId: classId });
});

app.post('/tasks/:id', (req, res) => {
    const { taskTitle, taskDescription, taskType, subject, dueDate } = req.body;

    const classId = parseInt(req.params.id);
    const taskData = readtaskDataFile();
    const classData = readclassDataFile();

    let task_id;

    if(taskData.length == 0){
        task_id = 1;
    }else{
        task_id = taskData[taskData.length-1].id+1;
    }

    const new_task = {
        id: task_id,
        classId: classId,
        taskTitle,
        taskDescription,
        taskType,
        subject,
        dueDate
    };
    

    taskData.push(new_task);
    writetaskDataFile(taskData);
    res.status(202).redirect('/class-teacher');
});

app.get('/circularBoard', (req,res)=>{
    res.render("circularBoard");
})
app.get('/circular', (req,res)=>{
    res.render("circular");
})

app.post('/circular', (req,res)=>{
    const { circularTitle, circularRef, IssueDate, priority, dueDate, category } = req.body;
    const circularData = readcircularDataFile();
    const classData = readclassDataFile();
   
    let circular_id;
    if(circularData.length == 0){
        circular_id = 1;
    }else{
        circular_id = circularData[circularData.length-1].id+1;
    }

    const new_circular = {
        id: circular_id,
        circularTitle,
        circularRef,
        IssueDate,
        priority,
        dueDate,
        category
    };

    circularData.push(new_circular);
    writecircularDataFile(circularData);
    res.status(202).redirect('/circularBoard');
});

app.get('/showCircular', (req, res) => {
    const circularData = readcircularDataFile();
    res.render("showCircular", { circulars: circularData });
})
app.get("/circularDel/:id", (req, res) => {
    const idToDelete = parseInt(req.params.id);
    let circularData = readcircularDataFile();

    circularData = circularData.filter(circular => circular.id !== idToDelete);

    writecircularDataFile(circularData);
    res.redirect("/showCircular");
});

// teacher show
app.get('/teacher-circular', (req, res) => {
    const circularData = readcircularDataFile();
    res.render("teacher/circularBoard", { circulars: circularData });
})

app.get('/guest', (req, res) => {
    res.render("page");
})
app.listen(3101);
