const express = require('express');
const {MongoClient, ObjectId} = require('mongodb');

const app = express();
app.use(express.json());

const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);
const dbName = "moviesDB";

let db, movies;

async function connectDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        db = client.db(dbName);
        movies = db.collection('movies');
    } catch (err) {
        console.error("Failed to connect to MongoDB", err);
    }
}
connectDB();

// Middleware 1: Logger
const loggerMiddleware = (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
};

// Middleware 2: Validate Movie
const validateMovieMiddleware = (req, res, next) => {
    const { title, category, releaseYear, rating } = req.body;
    
    if (!title || !category || !releaseYear || rating === undefined) {
        return res.status(400).json({ message: "Validation failed: Invalid rating or year." });
    }
    
    if (rating < 0 || rating > 10) {
        return res.status(400).json({ message: "Validation failed: Invalid rating or year." });
    }
    
    if (releaseYear < 1900) {
        return res.status(400).json({ message: "Validation failed: Invalid rating or year." });
    }
    
    next();
};

// Middleware 3: Error Handler
const errorHandlerMiddleware = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal server error" });
};

app.use(loggerMiddleware);

// Home route
app.get('/', (req, res) => {
    res.send("Welcome to movies API");
});

// GET all movies
app.get('/api/movies', async (req, res) => {
    const allMovies = await movies.find({}).toArray();
    res.status(200).json(allMovies);
});

// GET top-rated movies
app.get('/api/movies/top-rated', async (req, res) => {
    const topMovies = await movies.find({ rating: { $gte: 8.5 } }).toArray();
    res.status(200).json(topMovies);
});

// GET movies by category
app.get('/api/movies/category/:category', async (req, res) => {
    const categoryMovies = await movies.find({ 
        category: new RegExp(`^${req.params.category}$`, 'i') 
    }).toArray();
    res.status(200).json(categoryMovies);
});

// GET movie by ID
app.get('/api/movies/:id', async (req, res) => {
    try {
        const movie = await movies.findOne({ _id: new ObjectId(req.params.id) });
        if (!movie) return res.status(404).json({ message: "Movie not found" });
        res.status(200).json(movie);
    } catch (err) {
        res.status(400).json({ message: "Invalid ID format" });
    }
});

// POST - Add new movie
app.post('/api/movies', validateMovieMiddleware, async (req, res) => {
    const { title, category, releaseYear, rating, isFeatured } = req.body;
    
    // Check for duplicate title
    const existing = await movies.findOne({ 
        title: new RegExp(`^${title}$`, 'i') 
    });
    
    if (existing) {
        return res.status(400).json({ message: "Validation failed: Invalid rating or year." });
    }
    
    const result = await movies.insertOne({ 
        title, 
        category, 
        releaseYear, 
        rating, 
        isFeatured: isFeatured || false 
    });
    
    res.status(201).json({ message: "Movie added", id: result.insertedId });
});

// PUT - Update movie
app.put('/api/movies/:id', validateMovieMiddleware, async (req, res) => {
    const { title, category, releaseYear, rating, isFeatured } = req.body;
    
    try {
        const result = await movies.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { title, category, releaseYear, rating, isFeatured } }
        );
        
        if (result.matchedCount === 0)
            return res.status(404).json({ message: "Movie not found" });
            
        res.json({ message: "Movie updated" });
    } catch (err) {
        res.status(400).json({ message: "Invalid ID format" });
    }
});

// DELETE movie
app.delete('/api/movies/:id', async (req, res) => {
    try {
        const result = await movies.deleteOne({ _id: new ObjectId(req.params.id) });
        
        if (result.deletedCount === 0)
            return res.status(404).json({ message: "Movie not found" });
            
        res.json({ message: "Movie deleted" });
    } catch (err) {
        res.status(400).json({ message: "Invalid ID format" });
    }
});

app.use(errorHandlerMiddleware);

app.listen(3000, () => {
    console.log("moveis API server running on http://localhost:3000/api/movies");
});