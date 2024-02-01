const express = require('express');
const mysql = require('mysql2');
// const bodyParser = require('body-parser')

const app = express()
app.use(express.json());

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Monterox@02',
    database: 'netflix'
});

connection.connect(function (err) {
    if (err) throw err
    console.log("Database connected")
})

const getUsers = async (req, res, next) => {
    try {
        const { limit, offset } = req.query
        // console.log(req)
        if (!limit || !offset || limit < 0 || offset < 0) {
            return res.status(400).send({ message: 'Invalid limit or offset values' });
        }

        const getMethod = `SELECT id,email,phone_no,is_active FROM users LIMIT ? OFFSET ?`;


        // Execute the query
        const [query] = await connection
            .promise()
            .execute(getMethod, [limit, offset]);

        res.status(200).send({ result: query })

    } catch (e) {
        console.error(e)
        res.status(500).send({ message: 'Internal Server Error' });
        next(e);
    }
}

const UserProfile = async (req, res, next) => {
    try {
        if (!id) {
            res.status(400).send('ID is required')
        }
        const userId = req.query.id;

        const userProfile = `SELECT profiles.user_id,profiles.name,profiles.type,profiles.image from users inner join profiles on users.id = profiles.user_id where users.id = ?`

        const [result] = await connection
            .promise()
            .execute(userProfile, [id])

        if (userProfile.length === 0) {
            return res.status(404).send('User not found');
        }

        res.status(200).send(result[0])

    } catch (e) {
        console.error(e);
        res.status(500).send({ message: ' Internal Server error' })
        next(e);
    }
}

const createUsers = async (req, res, next) => {
    try {

        if (!email) {
            return res.status(400).json({ message: 'email is required' })
        }

        if (!phone_no) {
            return res.status(400).json({ message: 'phone_no is required' })
        }

        if (!passward || passward <= 0) {
            res.status(400).send({ message: 'Password is required and cannot be empty' })
        }

        const { id, email, phone_no, passward, is_active } = req.body;

        const postMethod = "insert into users(id, email, phone_no, passward, is_active) values(?,?,?,?,?);";

        let [values] = await connection
            .promise()
            .execute(postMethod, [id, email, phone_no, passward, is_active]);

        res.status(201).json({ id, email, phone_no, passward, is_active })
    } catch (e) {
        console.error(e)
        res.status(500).send({ message: 'Internal Server Error' });
        next(e);
    }
}

const updateUsers = async (req, res, next) => {
    try {
        if (!id) {
            res.status(400).send('ID is incomplete')
        }

        const userId = req.params.id;

        const update = [];

        if (phone_no) {
            update.push("phone_no=?");
        }

        if (email) {
            update.push(`email=?`);
        }

        const substring = update.join(',')
        const updateUser = `Update users set  ${substring} where id=?`;

        const [result] = await connection
            .promise()
            .execute(updateUser, [userId, substring])

        res.status(200).send(result[0])

    } catch (e) {
        console.error(e);
        res.status(500).send({ message: 'Internal Server Error' });
        next(e);
    }
}

const userDelete = async (req, res, next) => {
    try {
        if (!id) {
            res.status(400).send('ID is required')
        }
        const userId = req.params.id;

        const softDelete = `update users SET is_active= 0 where id = ${userId};`;

        const [result] = await connection
            .promise()
            .execute(softDelete, [userId]);

    } catch (e) {
        console.error(e);
        res.status(500).send({ message: 'Internal server error' });
        next(e)
    }
}


app.get('/videos', (req, res, next) => {
    const getMethod = `select * from videos`;
    try {
        connection.query(getMethod, (err, rows) => {
            if (!err) {
                res.send(JSON.stringify(rows));
            } else {
                console.log("Error : ", err);
                next(err);
            }
        })
    } catch (e) {
        console.error(`Error in GET /users ${e}`);
        next(e);
    }
})

app.get('/users', getUsers);
app.get('/user/profiles/:id',UserProfile)
app.post('/users', createUsers);
app.put('users', updateUsers);
app.delete("/users/:id", userDelete);

app.listen(3001, () => { console.log('Server is running') })
