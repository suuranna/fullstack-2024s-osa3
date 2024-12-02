const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url =
  `mongodb+srv://annasuuronen:${password}@clusteranna.9gccn.mongodb.net/?retryWrites=true&w=majority&appName=ClusterAnna`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (name === undefined && number === undefined) {
  console.log("phonebook:")
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(person.name + " " + person.number)
    })
    mongoose.connection.close()
    setTimeout(() => {
      process.exit(0); 
    }, 1000);
  })
} else {
  const person = new Person({
    name: name,
    number: number
  })

  person.save().then(result => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
}

