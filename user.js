const express = require('express');
const connection = require('./db');
const router = express.Router();

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

router.get('/users', getUsers);
router.get('/user/:id/profiles/', UserProfile) //userprofile by id
router.post('/users', createUsers);
router.put('/users/:id', updateUsers);
router.delete("/users/:id", userDelete);

module.exports = router;