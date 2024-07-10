const express = require('express')
const app = express();

app.use(express.json())

let persons = [
    {
        id: "1",
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id: "2",
        name: "Ada Lovelace",
        number: "39-44-5323524"
    },
    {
        id: "3",
        name: "Dan Ambramov",
        number: "12-43-234345"
    },
    {
        id: "4",
        name: "Mary Poppendieck",
        number: "39-232-6423122"
    },
]

app.get('/api/persons', (request, response) => {
    response.json(persons)
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

const PORT = 3005
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})