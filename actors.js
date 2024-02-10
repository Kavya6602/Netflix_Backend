const express = require('express');
const connection = require('./db');
const router = express.Router();

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

router.get("/actors", getActorDetails);
router.get("/actors/:id", getActorById);
router.post("/actors", createActor);
router.delete("/actors/:id", deleteActor);

module.exports = router;