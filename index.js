const express = require("express");
const morgan = require('morgan');
const cors = require('cors');
const app = express();

app.use(cors());

morgan.token('body', (req, res) => {
    return JSON.stringify(req.body);
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));
//calling the express.jason() method for parsing - a middleware
app.use(express.json());

let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "0754-232323"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "0713-454321"
    },
    {
        "id": 3,
        "name": "Dan Abromov",
        "number": "0689-988776"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "0671-675839"
    }
];

app.get('/api/persons', (req, res) => {
    res.json(persons);
});

app.get('/api/info', (req, res) => {
    const date = new Date();
    console.log(date);
    res.send(`<p>Phonebook has ${persons.length} people</p><p>${date}</p>`);
});

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id);
    const person = persons.find(n => n.id === id);
    if(person) {
        res.json(person);
    } else {
        res.status(404).end();  
    }   
});

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id);
    persons = persons.filter(n => n.id !== id);
    res.status(204).end();
});


// console.log(persons.map(n => n.id));

const generateID = (max) => {
    let haveId = persons.map(n => n.id);
    //console.log(haveId);
    //generate random number and check if it doesn't exist
    let found = true;
    while(found) {
        let random = Math.floor(Math.random() * max) + 1;
        if (!haveId.includes(random)) {
            found = false;
           // console.log(random);
            return random;    
        } 
    }
   
};

app.post('/api/persons', (req, res) => {
    const body = req.body;

    if (!body.name || !body.number) {
        return res.status(400).json({
            erro: 'name or number missing'
        });
    }

    if (persons.find(n => n.name === body.name)) {
        return res.status(400).json({
            erro: 'name must be unique'
        });
    }

    const person = {
        id: generateID(1000),
        name: body.name,
        number: body.number
    }
    persons = persons.concat(person);
    console.log(person);
    res.json(person);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});