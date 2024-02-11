const express = require('express');
const connection = require('./db');
const { logRequest,validateQueryParams } = require('./middleware')
const router = express.Router();

const getVideos = async (req, res, next) => {
    try {
        const { limit, offset } = req.query;

        const query = `Select id,title,descrption,language,duration,release_date,video_type_id,casts_id,is_active from videos limit ? offset ?`;

        const [queryData] = await connection
            .promise()
            .execute(query, [limit, offset])
        console.log(queryData)
        res.status(200).send(queryData[0])

    } catch (e) {
        console.error(e)
        res.status(500).send({ message: 'Internal server error' })
    }
}

const createVideos = async (req, res, next) => {
    try {
        const { id, title, descrption, language, duration, release_date } = req.body

        if (!id || !title || !descrption || !language || !duration || !release_date) {
            res.status(400).json({ message: "All parameter is required" })
        }

        const query = `insert into videos(id,title,descrption,language,duration,release_date) values(?,?,?,?,?,?);`

        const [result] = await connection
            .promise()
            .execute(query, [id, title, descrption, language, duration, release_date])

        res.status(201).send({ message: "Created Successfully", result: result })

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
        console.log(req.params)
        const { descrption, language, is_active } = req.body;
        if (!descrption && !language && !is_active) {
            // console.log(req.body)
            res.status(400).send({ message: "Atleast one param is required" })
        }

        const data = [];
        const valData = [];

        if (descrption !== undefined) { data.push('description = ?'); valData.push(descrption) };
        if (language !== undefined) { data.push('language = ?'); valData.push(language) };
        if (is_active !== undefined) {data.push('is_active = ?'); valData.push(is_active)};
        
        let query = `UPDATE videos SET ${data.join(', ')} WHERE id = ?`

        const [result] = await connection
            .promise()
            .execute(query, [...valData,id])
        console.log(result);
        if (result.affectedRows > 0) {
            res.status(201).send({ message: 'Video updated successfully', result: result });
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

router.get('/videos', logRequest,validateQueryParams,getVideos);
router.post('/videos', logRequest,createVideos);
router.put('/videos/:id', logRequest,updateVideos)
router.delete("/videos/delete/:id", logRequest,deleteVideos);

module.exports = router;