const personRouter = require('express').Router()
const Person = require('../models/person')
const User = require('../models/user')

personRouter.get('/hw', async(request, response) => {
  await response.send('<h1>Hello World!</h1>')
})

//fetching all resources mongo db
personRouter.get('/', async(request, response) => {
  const person = await Person.find({}).populate('user')
  response.json(person)
})


//fetching a single resource
personRouter.get('/:id', async(request, response) => {
  const person = await Person.findById(request.params.id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

//fetching local host info
personRouter.get('/info', (request, response) => {
  const date = new Date()
  Person.find({}).then(persons => { response.send('<div>Phonebook has info for '+persons.length+' people</div>'+date)})
  console.log(response.send) })

//fetching delete resource
personRouter.delete('/:id', async(request, response) => {
  await Person.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

//receiving data adding new note
personRouter.post('/', async (request, response) => {
  const body = request.body
  
  const user = await User.findById(body.userId)
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
    user: user._id
  })

  const savePerson = await addperson.save()
  user.persons = user.persons.concat(savePerson._id)
  await user.save()
      response.json(savePerson)
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