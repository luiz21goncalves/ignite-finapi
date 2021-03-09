const express = require('express')
const { v4: uuid } = require('uuid')

const app = express()

app.use(express.json())

const customers = []

app.post('/account', (request, response) => {
  const { name, cpf } = request.body

  const customerAlreadyExists = customers.some((customer) => customer.cpf === cpf)

  if (customerAlreadyExists) {
    return response.status(400).json({
      error: 'Customer already exists'
    })
  }

  customers.push({
    id: uuid(),
    name,
    cpf,
    statement: []
  })

  return response.status(201).send()
})

app.get('/statement/:cpf', (request, response) => {
  const { cpf } = request.params

  const customer = customers.find((findCustomer) => findCustomer.cpf === cpf)

  if (!customer) {
    return response.status(400).json({
      error: 'Customer not found!'
    })
  }

  return response.json(customer.statement)
})

app.listen(3333, () => console.log('Server started on port 3333!'))
