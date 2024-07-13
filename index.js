const express = require('express')
const app = express();
require('dotenv').config()

const Person = require('./models/person')

const requestLogger = (request, response, next) => {
    console.log("Method:", request.method)
    console.log("Path: :", request.path)
    console.log("Body  :", request.body)
    console.log("---")
    next()
}

const errorHandler = (error, request, response, next) => {
    console.log(error.message)
    console.log("Error:", error)

    if (error.name === "CastError") {
        return response.status(400).send({ error: "Malformed ID." })
    }

    next(error)
}

const cors = require('cors');
//const morgan = require('morgan')

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(requestLogger)

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: "Unknown endpoint." })
}

// morgan.token('body', req => {
//     return JSON.stringify(req.body)
// }) 

// app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (request, response, next) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
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

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
    })
    .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
    Person.find({}).then(result => {
        response.send(`Phonebook has info for ${result.length} people <br/>${new Date()}`)
    })
    .catch(error => next(error))
})


app.delete('/api/persons/:id', (request, response, next ) => {
    Person.findByIdAndDelete(request.params.id)
    .then(result => {
        response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
    
    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
        response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}!`)
})