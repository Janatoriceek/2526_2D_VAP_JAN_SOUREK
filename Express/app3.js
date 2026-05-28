const path = require('path');
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const sql = require("mssql/msnodesqlv8");
const fileUpload = require('express-fileupload');

const config = {
    connectionString:
        "Driver={ODBC Driver 17 for SQL Server};" +
        "Server=(localdb)\\MSSQLLocalDB;" +
        "Database=Aplikace;" +
        "Trusted_Connection=Yes;" +
        "Encrypt=No;" +
        "TrustServerCertificate=Yes;"
};

const app = express();

let pool;

async function connect() {

    try {

        pool = await sql.connect(config);
        console.log("Connected to database :)");

    } catch (err) {

        console.log(err);
        process.exit(1);
    }
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public', 'views'));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'tajny_klic',
    resave: false,
    saveUninitialized: false
}));

app.use(fileUpload());

const uploadsDir = path.join(__dirname, "public/uploads");
const backgroundsDir = path.join(__dirname, "public/backgrounds");

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(backgroundsDir)) {
    fs.mkdirSync(backgroundsDir, { recursive: true });
}

app.get("/", async (req, resp) => {

    if (!req.session.user) {
        return resp.redirect("/login");
    }

    const result = await pool.query`
        SELECT * FROM dbo.Users
        WHERE id = ${req.session.user.id}
    `;

    req.session.user = result.recordset[0];

    resp.render("index", {
        user: req.session.user
    });
});

app.get("/register", (req, resp) => {
    resp.render("register");
});

app.post("/register", async (req, resp) => {

    try {

        const user = req.body;

        const existing = await pool.query`
            SELECT * FROM dbo.Users
            WHERE username = ${user.username}
        `;

        if (existing.recordset.length > 0) {

            return resp.render("register", {
                error: "User already exists"
            });
        }

        await pool.query`
            INSERT INTO dbo.Users(username, password)
            VALUES(${user.username}, ${user.password})
        `;

        resp.redirect("/login");

    } catch (err) {

        console.log(err);
        resp.send("Database error");
    }
});

app.get("/login", (req, resp) => {
    resp.render("login");
});

app.post("/login", async (req, resp) => {

    try {

        const { username, password } = req.body;

        const result = await pool.query`
            SELECT * FROM dbo.Users
            WHERE username = ${username}
        `;

        const user = result.recordset[0];

        if (user && user.password === password) {

            req.session.user = user;
            return resp.redirect("/");
        }

        resp.render("login", {
            error: "Špatné jméno nebo heslo"
        });

    } catch (err) {

        console.log(err);
        resp.send("Database error");
    }
});

app.get("/logout", (req, resp) => {

    req.session.destroy(() => {
        resp.redirect("/login");
    });
});

app.get("/reset_password", (req, resp) => {
    resp.render("reset_password");
});

app.post("/reset_password", async (req, resp) => {

    try {

        const { username, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return resp.send("<h1>Hesla se neshodují.</h1>");
        }

        const result = await pool.query`
            SELECT * FROM dbo.Users
            WHERE username = ${username}
        `;

        const user = result.recordset[0];

        if (!user) {
            return resp.send("<h1>Uživatel nebyl nalezen.</h1>");
        }

        await pool.query`
            UPDATE dbo.Users
            SET password = ${password}
            WHERE username = ${username}
        `;

        resp.send("<h1>Heslo bylo úspěšně změněno.</h1>");

    } catch (err) {

        console.log(err);
        resp.send("Database error");
    }
});

app.post('/upload-profile', async (req, res) => {

    const user = req.session.user;

    if (!user) {
        return res.redirect("/login");
    }

    if (!req.files || !req.files.image) {
        return res.redirect("/");
    }

    const image = req.files.image;

    const suffix = Date.now() + path.extname(image.name);
    const fileName = `profile-${user.id}-${suffix}`;

    await image.mv(path.join(uploadsDir, fileName));

    await pool.query`
        UPDATE dbo.Users
        SET image = ${fileName}
        WHERE id = ${user.id}
    `;

    req.session.user.image = fileName;

    return res.redirect("/");
});

app.post('/upload-background', async (req, res) => {

    const user = req.session.user;

    if (!user) {
        return res.redirect("/login");
    }

    if (!req.files || !req.files.background) {
        return res.redirect("/");
    }

    const background = req.files.background;

    const suffix = Date.now() + path.extname(background.name);
    const fileName = `background-${user.id}-${suffix}`;

    await background.mv(path.join(backgroundsDir, fileName));

    await pool.query`
        UPDATE dbo.Users
        SET background = ${fileName}
        WHERE id = ${user.id}
    `;

    req.session.user.background = fileName;

    return res.redirect("/");
});

connect().then(() => {

    app.listen(3000, () => {
        console.log("http://localhost:3000");
    });
});