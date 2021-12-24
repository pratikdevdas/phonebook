const personRouter = require('express').Router()
const Person = require('../models/person')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

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

// helper function to extract token
const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if(authorization && authorization.toLowerCase().startsWith('bearer ')){
    return authorization.substring(7)
  }
  return null
}

/* I am not extracting token extraction and userextraction to
middle ware in this app whereas in bloglist backend i did */
//fetching delete resource
personRouter.delete('/:id', async(request, response) => {
  const token = getTokenFrom(request)
  const decodedToken = jwt.verify(token, process.env.SECRET)

  if(!token || !decodedToken.id) {
    return response.status(401).json({ error:'token missing or invalid' })
  }
  // fetching users
  const user = await User.findById(decodedToken.id)
  // fetching blog
  const person = await Person.findById(request.params.id)
  // checking if person belong to user; if true executes
  const checkId = person.user._id
  console.log(checkId)
  if(checkId.toString() === user._id.toString()){
    const res = await Person.findByIdAndRemove(person._id.toString())
    console.log(res)
    response.status(204).end()
  }
})

//receiving data adding new note
personRouter.post('/', async (request, response) => {
  const body = request.body
  const token = getTokenFrom(request)
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if(!token || !decodedToken.id) {
    return response.status(401).json({ error:'token missing or invalid' })
  }
  const user = await User.findById(decodedToken.id)
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

personRouter.put('/:id', async(request, response) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  const updateContact = await Person.findByIdAndUpdate(request.params.id,person)
  response.json(updateContact.toJSON())
})

module.exports = personRouter