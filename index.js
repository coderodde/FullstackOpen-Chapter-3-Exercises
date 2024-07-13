require('dotenv').config()

const express = require('express')
const app = express();
const morgan = require('morgan')
const cors = require('cors');
const Person = require('./models/person');

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

morgan.token('body', req => {
    return JSON.stringify(req.body)
}) 

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let persons = []

app.get('/api/persons', (request, response) => {
    Person.find({}).then(result => {
        result.forEach(note => {
            console.log(note)
        })
    })
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(p => p.id === id)

    if (person) {
        response.send(`${person.name}, ${person.number}`)
    } else {
        response.status(404).json({
            error: "Content missing!"
        })
    }
})

app.get('/info', (request, response) => {
    response.send(`Phonebook has info for ${persons.length} people <br/>${new Date()}`)
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name) {
        return response.status(400).json({
            error: "Name not specified."
        })
    }

    if (!body.number) {
        return response.status(400).json({
            error: "Number not specified."
        })
    }

    if (persons.find(p => p.name === body.name)) {
        return response.status(400).json({
            error: `${body.name} is already in the phonebook.`
        })
    }

    const person = {
        name: body.name,
        number: body.number,
        id: Math.floor(Math.random() * 100000000).toString()
    }

    persons = persons.concat(person)
    response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(p => p.id !== id)
    response.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})