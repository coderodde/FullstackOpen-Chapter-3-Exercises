require('dotenv').config()

const express = require('express')
const app = express();
const morgan = require('morgan')
const cors = require('cors');

const Person = require('./models/person')

//const url = "mongodb+srv://coderodd3:Exp10r1ngM0ng0D8@fullstackopenmongodbclu.uw53f8u.mongodb.net/people?retryWrites=true&w=majority&appName=FullstackOpenMongoDBCluster"
// const Person = require('./models/person');

// mongoose.set('strictQuery', false)
// mongoose.connect(url)

// const personSchema = new mongoose.Schema({
//     name: String,
//     number: String,
// })

// const Person = mongoose.model('Person', personSchema)

// personSchema.set('toJSON', {
//     transform: (document, returnedObject) => {
//         returnedObject.id = returnedObject._id.toString()
//         delete returnedObject._id
//         delete returnedObject.__v
//     }
// })

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

morgan.token('body', req => {
    return JSON.stringify(req.body)
}) 

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let persons = []

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
        response.json(person)
    })

    // const id = request.params.id
    // const person = persons.find(p => p.id === id)

    // if (person) {
    //     response.send(`${person.name}, ${person.number}`)
    // } else {
    //     response.status(404).json({
    //         error: "Content missing!"
    //     })
    // }
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

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(p => p.id !== id)
    response.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})