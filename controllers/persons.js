const personRouter = require('express').Router()
const Person = require('../models/person')

personRouter.get('/hw', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

//fetching all resources mongo db
personRouter.get('/', (request, response) => {
  Person.find({}).then(notes => {
    response.json(notes)
  })
})

//fetching a single resource
personRouter.get('/:id', (request, response) => {
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
personRouter.get('/info', (request, response) => {
  const date = new Date()
  Person.find({}).then(persons => { response.send('<div>Phonebook has info for '+persons.length+' people</div>'+date)})
  console.log(response.send) })

//fetching delete resource
personRouter.delete('/:id', (request, response,next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {response.status(204).end()})
    .catch(error => next(error))
})

//receiving data adding new note
personRouter.post('/', (request, response, next) => {
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

personRouter.put('/:id', (request, response, next) => {
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


module.exports = personRouter