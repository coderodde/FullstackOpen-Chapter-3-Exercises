require('dotenv').config()

const express = require('express')
const app = express();
const morgan = require('morgan')
const cors = require('cors');

const Person = require('./models/person')

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

morgan.token('body', req => {
    return JSON.stringify(req.body)
}) 

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
        response.json(person)
    })
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

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
    .then(result => {
        response.status(204).end()
    })
    .catch(error => next(error))
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})