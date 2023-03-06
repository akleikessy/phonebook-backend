const express = require("express");
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();
const app = express();
const Person = require('./models/person');
//const { response } = require("express");

//error handling middleware
const errorHandler = (error, req, res, next) => {
    console.log(error.message);

    if (error.name === 'CastError') {
        return res.status(400).send({ error: 'malformatted id' });
    } else if (error.name === 'ValidationError'){
        return res.status(400).json({ error: error.message });
    }
    next(error);
}

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method);
    console.log('Path:  ', request.path);
    console.log('Body:  ', request.body);
    console.log('---');
    next();
}

morgan.token('body', (req, res) => {
    return JSON.stringify(req.body);
});


app.use(express.static('build'));
app.use(cors());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));
//calling the express.jason() method for parsing - a middleware
app.use(express.json());
app.use(requestLogger);

let persons = [
];

app.get('/api/persons', (req, res) => {
    Person.find({}).then(people => {
        res.json(people);
       // console.log(people);
    });
});

app.get('/api/info', (req, res) => {
    const date = new Date();
   // console.log(date);
    Person.find({}).then(people => {
        res.send(`<p>Phonebook has ${people.length} people</p><p>${date}</p>`);
    });
});

app.get('/api/persons/:id', (req, res, next) => {
    
    Person.findById(req.params.id)
        .then(person => {
            if(person) {
                res.json(person);
            } else {
                res.status(404).end();
            }
        })
        .catch(error => next(error));
});

app.delete('/api/persons/:id', (req, res, next) => {

    Person.findByIdAndRemove(req.params.id)
        .then(result => {
            res.status(204).end();
        })
        .catch(error => next(error));
});


app.post('/api/persons', (req, res, next) => {
    const body = req.body;

    if (!body.name || !body.number) {
        return res.status(400).json({
            error: 'name or number missing'
        });
    }

    const person = new Person({
        name: body.name,
        number: body.number
    });

    person.save().then(savedPerson => {
        res.json(savedPerson);
    })
    .catch(error => next(error));
});

//below routine doesn't produce desired outcome. check.

app.put('/api/persons/:id', (req, res, next) => {
    
    const { name, number } = req.body;

    Person.findByIdAndUpdate(req.params.id,
        { name, number }, 
        { new: true, runValidators: true, context: 'query' })
        .then(updatedPerson => {
            res.json(updatedPerson);
        })
        .catch(error => next(error)); 
}); 


//this has to be the last loaded middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});