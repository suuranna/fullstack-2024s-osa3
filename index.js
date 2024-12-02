const express = require('express')
const app = express()
var morgan = require('morgan')
const cors = require('cors')

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

const info = '<div><p>Phonebook has info for ' + persons.length + ' people</p><p>' + new Date() + '</p></div>'

app.get('/info', (request, response) => {
  response.send(info)
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(person => person.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const id = Math.floor(Math.random() * 10000)
  console.log(request.body)
  const body = request.body

  if (!body.name | !body.number) {
    return response.status(400).json({ error: 'name or number missing' })
  }

  if (persons.find(person => person.name === body.name)) {
    return response.status(400).json({ error: 'name must be unique' })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: id.toString()
  }

  persons = persons.concat(person)

  response.json(person)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
