const mongoose = require('mongoose')

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

setupMongoose = () => {
    const url = `mongodb+srv://coderodd3:${password}@fullstackopenmongodbclu.uw53f8u.mongodb.net/personApp?retryWrites=true&w=majority&appName=FullstackOpenMongoDBCluster`
    mongoose.set('strictQuery', false)
    mongoose.connect(url)
}

showAllPersons = () => {
    console.log("phonebook:")
    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
    })
}

addPerson = (name, number) => {
    const person = new Person({
        name: name,
        number: number,
    })

    person.save().then(result => {
        console.log(`added ${result.name} number ${result.number} to phonebook`)
        mongoose.connection.close()
    })
}

if (process.argv.length < 3) {
    console.log("Give password as argument")
    process.exit(1)
}

const password = process.argv[2]

setupMongoose()

if (process.argv.length === 3) {
    showAllPersons()
} else if (process.argv.length === 5) {
    addPerson(process.argv[3], process.argv[4])
} else {
    console.log("Unidentified invocation")
}