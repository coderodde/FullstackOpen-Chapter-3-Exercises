require('dotenv').config()
const express = require('express')
const app = express()

const Person = require('./models/person')

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path: :', request.path)
  console.log('Body  :', request.body)
  console.log('---')
  next()
}

const errorHandler = (error, request, response, next) => {
  console.log(error.message)
  console.log('Error:', error)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'Malformed ID.' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

const cors = require('cors')
const morgan = require('morgan')

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(requestLogger)

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'Unknown endpoint.' })
}

morgan.token('body', req => {
  return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then(persons => {
      response.json(persons)
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  Person.find({ name: body.name })
    .then(result => {
      if (result.length === 0) {
        // No previous person, can post one:
        const person = new Person({
          name: body.name,
          number: body.number,
        })

        const error = person.validateSync()

        if (error === undefined) {
          response.json({ name: body.name, number: body.number })
        }

        person.save().then(savedPerson => {
          response.status(200).json(savedPerson)
        })
          .catch(error => next(error))
      } else {
        const body = request.body

        const person = {
          name: body.name,
          number: body.number,
        }

        // Get the person ID:
        const personId = result[0]['_id'].toString()

        Person.findByIdAndUpdate(
          personId,
          person,
          { new: true, runValidators: true, context: 'query' })
          .then(updatedPerson => {
            response.json(updatedPerson)
          })
          .catch(error => next(error))
      } 
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


app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(200).end(result)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  console.log('Body:', body)

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id,
    person,
    { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}!`)
})