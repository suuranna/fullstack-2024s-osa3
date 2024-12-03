require('dotenv').config()
const express = require('express')
const app = express()
var morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(cors())

app.use(express.json())

morgan.token('body', (request, response) => JSON.stringify(request.body))

app.use(morgan(function (tokens, request, response) {
  return [
    tokens.method(request, response),
    tokens.url(request, response),
    tokens.status(request, response),
    tokens.res(request, response, 'content-length'), '-',
    tokens['response-time'](request, response), 'ms',
    tokens.body(request, response)
  ].join(' ')
}))

app.use(express.static('dist'))

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

let persons = [
  {
    "name": "Arto Hellas",
    "number": "040-123456",
    "id": "1"
  },
  {
    "name": "Ada Lovelace",
    "number": "39-44-5323523",
    "id": "2"
  },
  {
    "name": "Dan Abramov",
    "number": "12-43-234345",
    "id": "3"
  },
  {
    "name": "Mary Poppendieck",
    "number": "39-23-6423122",
    "id": "4"
  }
]

app.get('/info', (request, response) => {
  Person.find({}).then(persons => {
    const info = '<div><p>Phonebook has info for ' + persons.length.toString() + ' people</p><p>' + new Date() + '</p></div>'
    response.send(info)
  })
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  //const person = persons.find(person => person.id === id)
  Person.findById(id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  //persons = persons.filter(person => person.id !== id)
  Person.findByIdAndDelete(id)
    .then(result => {
      response.status(204).end()
    })
      .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  //const id = Math.floor(Math.random() * 10000)
  console.log(request.body)
  const body = request.body

  //if (!body.name | !body.number) {
  //  return response.status(400).json({ error: 'name or number missing' })
  //}

  //if (persons.find(person => person.name === body.name)) {
  //  return response.status(400).json({ error: 'name must be unique' })
  //}

  const person = new Person({
    name: body.name,
    number: body.number
    //id: id.toString()
  })

  //persons = persons.concat(person)

  person.save().then(person => {
    response.json(person)
  })
  .catch(error => next(error))

})

app.put('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(id, person, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
