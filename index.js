const express = require('express');
const mysql = require('mysql');
// const bodyParser = require('body-parser')
const app = express()
app.use(express.json());
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Monterox@02',
    database: 'netflix'
});



app.get('/users', (req, res, next) => {
    const getMethod = `select * from users`;
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

app.post('/users', async (req, res, next) => {
    const { id, email, phone_no, passward, is_active, created_at, updated_at } = req.body;
    try {
        if (!email) {
            return res.status(400).json({ message: 'email is required' })
        }

        const postMethod = "insert into users(id, email, phone_no, passward, is_active, created_at, updated_at) values(?,?,?,?,?,?,?)";

        let [values] = await connection.query(postMethod, [id, email, phone_no, passward, is_active, created_at, updated_at]);
        res.status(201).json({ id, email, phone_no, passward, is_active, created_at, updated_at })
    } catch (err) {
        console.error(`Error in POST /users ${err}`)
        next(err)
    }
})

app.put('users', async(req,res,next) => {
    let userId = parseInt(req.params.id);
    const data = req.body;
    
    let query = `UPDATE users SET ? WHERE id=?;`;
    await connection.query(query,[data,userId],function(err,results){
      if(!err) {
          res.send(results);
      }else{
          console.log(err);
          next(err);
      }
  });
});
                          
app.delete("/users/:id", function(req, res) {
    var itemID = req.params.id;
    for (var i = 0; i < users.length; i++) {
        if (itemID == users[i].id) {
            users.splice(i, 1);
            break;
        }
    }
    res.send("User has been deleted!");
});  


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

app.listen(3000, () => { console.log('Server is running') })
