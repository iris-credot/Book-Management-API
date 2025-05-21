const express = require('express');

const YAML = require('yamljs');

const dotenv = require('dotenv');
const connectDB = require('./config/database');
const Book = require('./models/book');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware

app.use(express.json());



// Routes
const apiRouter = express.Router();

// GET all books
apiRouter.get('/books', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching books' });
  }
});

// POST new book
apiRouter.post('/books', async (req, res) => {
  try {
    const { title, author, publishedYear, isbn } = req.body;
    
    if (!title || !author) {
      return res.status(400).json({ error: 'Title and author are required' });
    }

    const book = new Book({
      title,
      author,
      publishedYear,
      isbn
    });

    const savedBook = await book.save();
    res.status(201).json(savedBook);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET book by ID
apiRouter.get('/books/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching book' });
  }
});

// PUT update book
apiRouter.put('/books/:id', async (req, res) => {
  try {
    const { title, author, publishedYear, isbn } = req.body;
    
    if (!title || !author) {
      return res.status(400).json({ error: 'Title and author are required' });
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { title, author, publishedYear, isbn },
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(book);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE book
apiRouter.delete('/books/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting book' });
  }
});

// Mount API router
app.use('/api/v1', apiRouter);

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`API documentation available at http://localhost:${port}/api-docs`);
}); 