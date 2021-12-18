require('dotenv').config()
// const { json } = require('express')
const Person = require('./models/person')
const morgan=require('morgan')
const express = require('express')
const cors = require('cors')
// const { findByIdAndRemove } = require('./models/person')
// const person = require('./models/person')
const app = express()

app.use(express.static('build'))
app.use(cors())

//stackoverflow
morgan.token('person', (req) => {
  if (req.method === 'POST') return JSON.stringify(req.body)
  return null
})

app.use(express.json())
// app.use(morgan('tiny'))
app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :person',
  ),
)

//fetching home resource
//each app.use something is a route
app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

//fetching all resources mongo db
app.get('/api/persons', (request, response) => {
  Person.find({}).then(notes => {
    response.json(notes)
  })
})

//fetching a single resource
app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => {
      console.log(error)
      response.status(400).send({ error:'malformed error' })
    })
})

//fetching local host info
app.get('/info', (request, response) => {
  const date = new Date()
  Person.find({}).then(persons => { response.send('<div>Phonebook has info for '+persons.length+' people</div>'+date)})
  console.log(response.send) })

//fetching delete resource
app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {response.status(204).end()})
    .catch(error => next(error))
})

//receiving data adding new note
app.post('/api/persons', (request, response, next) => {
  const body = request.body
  if (!body.name) {
    return response.status(400).json({
      error: 'content missing'
    })
  }
  if (!body.number) {
    return response.status(400).json({
      error: 'content missing'
    })
  }
  const addperson = new Person({
    name: body.name,
    number: body.number,

  })

  addperson.save().then(savePerson => {
    response.json(savePerson.toJSON())})
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  const person = {
    name: body.name,
    number: body.number,
  }
  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatePerson => {
      response.json(updatePerson)
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }
  next(error)
}
// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
// dskfc