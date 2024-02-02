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

        const userId = req.query.id;
        if (!id) {
            res.status(400).send('ID is required')
        }

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
        const { id, email, phone_no, passward, is_active } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'email is required' })
        }

        if (!phone_no) {
            return res.status(400).json({ message: 'phone_no is required' })
        }

        if (!passward || passward <= 0) {
            res.status(400).send({ message: 'Password is required and cannot be empty' })
        }

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
        const { id } = req.params;
        const { phone_no, email } = req.body;
        if (!id) {
            res.status(400).send('ID is incomplete')
        }

        const update = [];
        const updateData = []

        if (phone_no) {
            update.push("phone_no=?");
            updateData.push(phone_no);
        }

        if (email) {
            update.push(`email=?`);
            updateData.push(email);
        }

        const setstring = update.join(',')
        const updateUser = `Update users set  ${setstring} where id=?`;

        const [result] = await connection
            .promise()
            .execute(updateUser, [...updateData, id])

        res.status(200).send({ test: 'pass' })

    } catch (e) {
        console.error(e);
        res.status(500).send({ message: 'Internal Server Error' });
        next(e);
    }
}

const userDelete = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).send('ID is required')
        }
        const softDelete = `update users SET is_active= 0 where id = ?;`;

        const [result] = await connection
            .promise()
            .execute(softDelete, [id]);

        res.status(200).send({ message: "Success" })

    } catch (e) {
        console.error(e);
        res.status(500).send({ message: 'Internal server error' });
        next(e)
    }
}


const getVideos = async (req, res, next) => {
    try {
        const { limit, offset } = req.query;

        if (!limit || !offset) {
            res.status(400).send({ message: 'Invalid limit or offset values' })
        }

        const query = `Select id,title,descrption,language,duration,release_date from videos  limit ? offset ?`;

        const [queryData] = await connection
            .promise()
            .execute(query, [limit, offset])

        res.status(200).send(queryData[0])

    } catch (e) {
        console.error(e)
        res.status(500).send({ message: 'Internal server error' })
    }
}

const createVideos = async (req, res, next) => {
    try {
        const { id, title, descrption, language, duration, release_date } = req.body

        if (!title) {
            res.status(400).json({ message: "Missing parameter: title" })
        }

        const query = `insert into videos(id,title,descrption,language,duration,release_date) values(?,?,?,?,?,?);`

        const [result] = await connection
            .promise()
            .execute(query, [id, title, descrption, language, duration, release_date])

        res.status(201).send({ message: "Created Successfully", result: result[0] })

    } catch (e) {
        console.error(e);
        res.status(500).send({ message: 'Internal Server Error' })
    }
}

const updateVideos = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id || id == 0) {
            // console.log(req.params.id);
            res.status(400).send({ message: 'Invalid parameters' })
        }

        const { descrption, language, is_active } = req.body;
        if (!descrption || !language) {
            // console.log(req.body)
            res.status(400).send({ message: "All params required" })
        }

        const query = `update videos set descrption = ?, language  = ?, is_active =  ? where id = ?`;

        const [result] = await connection
            .promise()
            .execute(query, [descrption, language, is_active, id])

        if (result.affectedRows > 0) {
            res.status(201).send({ message: 'Video updated successfully' });
        } else {
            res.status(404).send({ message: 'Video not found or no changes made' });
        }


    } catch (e) {
        console.error(e);
        res.status(500).send({ message: "Internal Server Error" })
    }
}


const deleteVideos = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).send('ID is required')
        }
        const softDelete = `update users SET is_active= 0 where id = ? ;`;

        const [result] = await connection
            .promise()
            .execute(softDelete, [id]);

        res.status(200).send({ message: "Success" })
    } catch (e) {
        console.error(e);
        res.status(500).send({ message: 'Internal server error' });
        next(e)
    }
}

const getActorDetails = async (req, res, next) => {
    try {
        console.log(req.headers);
        const { id, limit, offset } = req.query

        if (!req.query.id) {
            res.status(400).send({
                message: 'missing parameter'
            })
        }

        const sql = 'select name, born_date from actors';
        const [results] = await connection.promise().execute(sql, [id, limit, offset]);

        const countsql = 'select count(*) as count from actors'
        const [countResults] = await connection.promise().execute(countsql)

        res.send({
            message: "actor-list",
            response: results,
            totalcount: countResults[0].count
        })

        if (results.length === 0) {
            res.send({
                message: "Actor not found"
            })
        }

    } catch (error) {
        res.send({
            message: "internal error"
        })
    }
}

app.get("/actors", getActorDetails);

const getActorById = async (req, res, next) => {
    try {
        const { id } = req.params;

        console.log(req.headers);

        if (!req.params.id) {
            res.status(400).send({
                message: 'id is required'
            })
        }

        const sql = 'select name, born_date from actors where id = ?';
        const [results] = await connection.promise().execute(sql, [id]);
        console.log(res);

        res.status(200).send({
            message: "actor list",
            response: results
        })

        if (results.length === 0) {
            res.send({
                message: "actor not found"
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({
            message: "internal server error"
        })
    }
}

app.get("/actors/:id", getActorById);

const createActor = async (req, res, next) => {
    try {
        console.log(req.headers);
        const { name, born_date } = req.body

        if (!req.body.name) {
            res.send({
                message: "name is required"
            })
        }
        const sqlstr = `insert into actors (name, born_date) values (?,?)`
        const [results] = await connection.promise().query(sqlstr, [name, born_date]);

        if (!results.insertId) {
            res.send({
                message: "data not inserted"
            })
        }

        res.status(200).send({
            message: "actor created",
            response: results
        })


    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Internal Server Error"
        })
    }
}

app.post("/actors", createActor);

const deleteActor = async (req, res, next) => {
    try {
        console.log(req.headers);
        const { id } = req.params;

        if (!req.params.id) {
            res.status(400).send({
                message: "Id is required"
            })
        }
        const sqlStr = `delete from actors where id = ?`
        const [results] = await connection.promise().execute(sqlStr, [id]);

        if (!results.affectedRows === 1) {
            res.send({
                message: "data is not deleted"
            })
        }

        res.status(200).send({
            message: "delete successfully",
            response: results
        })


    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Internal server error"
        })
    }
}

app.delete("/actors/:id", deleteActor);


const getDirectorDetails = async (req, res, next) => {
    try {
        console.log(req.headers);
        const { id, limit, offset } = req.query

        if (!req.query.id) {
            res.status(400).send({
                message: 'missing parameter'
            })
        }

        const sql = 'select name, year, image from directors';
        const [results] = await connection.promise().execute(sql, [id, limit, offset]);

        const countsql = 'select count(*) as count from directors'
        const [countResults] = await connection.promise().execute(countsql)

        if (results.length === 0) {
            res.send({
                message: "director not found"
            })
        }

        res.send({
            message: "director-list",
            response: results,
            totalcount: countResults[0].count
        })

    } catch (error) {
        res.send({
            message: "internal server error"
        })
    }
}

app.get("/directors", getDirectorDetails);

const getDirectorById = async (req, res, next) => {
    try {
        const { id } = req.params;

        console.log(req.headers);

        if (!req.params.id) {
            res.status(400).send({
                message: 'id is required'
            })
        }

        const sql = 'select name, year, image from directors where id = ?';
        const [results] = await connection.promise().execute(sql, [id]);

        if (results.length === 0) {
            res.send({
                message: "Director not found"
            })
        }

        res.status(200).send({
            message: "Director list",
            response: results
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            message: "internal server error"
        })
    }
}

app.get("/directors/:id", getDirectorById);

const createDirector = async (req, res, next) => {
    try {
        console.log(req.headers);
        const { name, year, image } = req.body

        if (!name) {
            res.send({
                message: "name is required"
            })
        }
        if (!year) {
            res.send({
                message: "year is required"
            })
        }
        if (!image) {
            res.send({
                message: "image is required"
            })
        }
        const sqlstr = `insert into directors (name, year, image) values (?,?,?)`
        const [results] = await connection.promise().query(sqlstr, [name, year, image]);

        if (!results.insertId) {
            res.send({
                message: "data not inserted"
            })
        }

        res.status(200).send({
            message: "actor created",
            response: results
        })


    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Internal Server Error"
        })
    }
}

app.post("/directors", createDirector);

const deleteDirectorbyId = async (req, res, next) => {
    try {
        console.log(req.headers);
        const { id } = req.params;

        if (!id) {
            res.status(400).send({
                message: "Id is required"
            })
        }
        const sqlStr = `delete from directors where id = ?`
        const [results] = await connection.promise().execute(sqlStr, [id]);

        if (!results.affectedRows === 1) {
            res.send({
                message: "data is not deleted"
            })
        }

        res.status(200).send({
            message: "delete successfully",
            response: results
        })


    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Internal server error"
        })
    }
}

app.delete("/directors/:id", deleteDirectorbyId);


const getCast = async (req, res, next) => {
    try {
        console.log(req.headers);

        const { id, limit, offset } = req.query

        if (!id) {
            res.status(400).send({
                message: "missing parameter"
            })
        }
        const sqlStr = `select * from casts limit = ? offset ?;`
        const [results] = await connection.promise().execute(sqlStr, [id, limit, offset])

        const countsql = 'select count(*) as count from actors'
        const [countResults] = await connection.promise().execute(countsql)

        if (results.length === 0) {
            res.send({
                message: "cast not found"
            })
        }

        res.status(200).send({
            message: "cast list",
            response: results[0],
            totalcount: countResults[0].count
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "internal server error"
        })
    }
}

app.get("/casts", getCast);

const getCastById = async (req, res, next) => {
    try {
        console.log(req.headers);
        const { id } = req.params;

        if (!id) {
            res.status(400).send({
                message: "Missing Parameter"
            })
        }

        const sql = `select * from casts where id = ?;`
        const [results] = await connection.promise().execute(sql, [id])

        if (results.length === 0) {
            res.send({
                message: "no cast found"
            })
        }

        res.status(200).send({
            message: "Casts list",
            response: results
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "internal server error"
        })
    }
}

app.get("/casts/:id", getCastById);

const profileById = async (req, res, next) => {
    try {
        const { id } = req.query;

        if (!id){
            res.status(400).send({message: "ID required"})
        }

        const query = `SELECT id,name,type,`

    } catch (e) {
        console.error(e);
        res.status(500).send({ message: 'Internal server error' })
    }
}






//Users
app.get('/users', getUsers);
app.get('/user/:id/profiles/', UserProfile) //userprofile by id
app.post('/users', createUsers);
app.put('/users/:id', updateUsers);
app.delete("/users/:id", userDelete);
//Videos
app.get('/videos', getVideos);
app.post('/videos', createVideos);
app.put('/videos/:id', updateVideos)
app.delete("/videos/:id", deleteVideos);
app.listen(3001, () => { console.log('Server is running') })
//profile
app.get('/profile/:id', profileById)
