const express = require('express');
const connection = require('./db');
const router = express.Router()

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

router.get("/directors", getDirectorDetails);
router.get("/directors/:id", getDirectorById);
router.post("/directors", createDirector);
router.delete("/directors/:id", deleteDirectorbyId);

module.exports = router;
