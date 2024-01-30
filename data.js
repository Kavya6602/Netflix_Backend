

app.use(express.json()); // Parse JSON requests

// POST API for creating a new user
app.post('/users', async (req, res, next) => {
    const { username, email } = req.body;

    try {
        // Ensure that username and email are provided in the request body
        if (!username || !email) {
            return res.status(400).json({ error: 'Username and email are required.' });
        }

        // Insert the new user into the database
        const [result] = await connection.execute('INSERT INTO users (username, email) VALUES (?, ?)', [username, email]);

        // Respond with the ID of the newly created user
        res.status(201).json({ id: result.insertId, username, email });
    } catch (error) {
        console.error(`Error in POST /users: ${error}`);
        next(error);
    }
});