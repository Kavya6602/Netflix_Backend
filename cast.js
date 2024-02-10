const express = require('express');
const connection = require('./db');
const router = express.Router();

const getCast = async (req, res, next) => {
    try {
        const {  limit, offset } = req.query

        if (!limit || !offset) {
            res.status(400).send({
                message: "Limit and offset must be specified"
            })
        }
        const sqlStr = `select  from casts limit = ? offset ?;`
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

const getCastById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            res.status(400).send({
                message: "Missing Parameter"
            })
        }

        const sql = `select actor_id, director_id, is_active from casts where id = ?;`
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

const  createNewCast = async (req, res) => {
    try {
        const { actor_id, director_id,is_active } = req.body;

        if(!actor_id || !director_id || !is_active) {
            return res.status(400).json({message:"missing fields"}) 
        }
        
        let query = `insert into casts (actor_id,director_id,is_active) values (?,?,?)`

        const [ result ] = await connection
        .promise()
        .execute(query,[actor_id,director_id,is_active]);

        if(result.length === 0){
            throw new Error("Failed to insert data in the database")
        }

        res.status(201).send({
            id : result[0],
            message : 'cast created'
        });

    } catch (e) {
        console.log(e);
        res.status(500).send({message:"Internal Server Error"})
    }
}

const updateCast = async (req,res) => {
    try {
        const { id } = req.params;

        if(!id){
            return res.status(400).json({message:'Missing ID'});
        }

        const { actor_id,director_id } = req.body;

        if(!actor_id || !director_id ){
            return res.status(400).json({message: "Invalid Data"});
        }

        const data = [];
        const valData = [];

        if(actor_id){
            data.push('actor_id = ?');
            valData.push(actor_id);
        }
        
        if(director_id){
            data.push('director_id = ?');
            valData.push(actor_id);
        }

        const query = `update casts set ${data.join(',')} where id=?`;

        const [result] = await connection
        .promise()
        .execute(query,[...valData, id])

        if(result.affectedRows === 0){
            return res.status(404).json({message:'No Cast Found with the given ID'});
        }       

        res.status(200).send({message:"Success",result:result});

    } catch (e) {
        console.log(e)
        res.status(500).send({message:"Internal Server Error"})
    }
}

const deleteCast = async(req,res) => {
    try {
        const { id } = req.params;

        if(!id){
            return res.status(400).json({message:'Missing ID'});
        }

        const query = `update casts set is_active = 0 where id = ?`
        const [ result ] = await connection
        .promise()
        .execute(query,[id])
       
        if(result.changedRows===0){
            return res.status(404).json({message:'No Cast Found With The Given Id'})
        }

        res.status(200).send({message:`Cast Deleted Successfully`,result: result});

    } catch (e) {
       console.log(e);
       res.status(500).send("Server error");
    }
}


router.get("/casts", getCast);
router.get("/casts/:id", getCastById);
router.post('/casts',createNewCast);
router.put('/casts/:id',updateCast);
router.delete('/casts/:id',deleteCast)

module.exports = router