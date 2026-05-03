const path = require('path');
const express = require('express');
const { error } = require('console');

const app = express();

const users = [];

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public', 'views'));
 
app.use(express.static(path.join(__dirname, "public")));
 
app.use(express.urlencoded({extended: true}));
app.use(express.json());
 
app.get("/", (req, resp) => {
    resp.render("index")
});  
 
app.get("/register", (req, resp) => {
    resp.render("register")
});

app.post("/register", (req, resp) => {
    const user = req.body;
    const savedUser = users.find((v) => v.username === user.username);
    if(savedUser){
        resp.render("register", {error: "User already exists"});
    }else {
        users.push(user);
        resp.redirect("/login");    
    }
});

app.get("/login", (req, resp) => {
    resp.render("login")
});
 
app.post("/login", (req, resp) => {
    const {username, password} = req.body;
    const user = users.find((v) => v.username === username);

    if(user && user.password === password) {    
        return resp.render("index", {user});
    }
    resp.redirect("/login");
});
 
app.listen(3000, () => {
    console.log("http://localhost:3000")
});

app.get("/reset_password", (req, resp) => {
    resp.render("reset_password");
});

app.post("/reset_password", (req, resp) => {
    const { username, password, confirmPassword } = req.body;

    const user = users.find((v) => v.username === username);

    if (!user) {
        return resp.send("<h1>Uživatel nebyl nalezen.</h1>");
    }

    if (password !== confirmPassword) {
        return resp.send("<h1>Zadaná hesla se neshodují.</h1>");
    }

    user.password = password;

    return resp.send("<h1>Heslo bylo úspěšně změněno.</h1>");
});