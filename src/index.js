const express = require('express')
const { v4: uuid } = require('uuid')

const app = express()

app.use(express.json())

const customers = []

function verifyIfExistsAccont(request, response, next) {
  const { cpf } = request.headers

  const customer = customers.find((findCustomer) => findCustomer.cpf === cpf)

  if (!customer) {
    return response.status(400).json({
      error: 'Customer not found!'
    })
  }

  request.customer = customer

  return next()
}

function getBalance(statement) {
  const balance = statement.reduce((accumulator, operation) => {
    if(operation.type === 'credit') {
      return accumulator + operation.amount
    }

    if (operation.type === 'debit') {
      return accumulator - operation.amount
    }
  }, 0)

  return balance
}

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

app.get('/statement', verifyIfExistsAccont,(request, response) => {
  const { customer } = request

  return response.json(customer.statement)
})

app.post('/deposit', verifyIfExistsAccont, (request, response) => {
  const { description, amount } = request.body

  const { customer } = request

  const statementOperation = {
    id: uuid(),
    description,
    amount,
    created_at: new Date(),
    type: 'credit'
  }

  customer.statement.push(statementOperation)

  return response.status(201).send()
})

app.post('/withdraw', verifyIfExistsAccont, (request, response) => {
  const { amount } = request.body

  const { customer } = request

  const balance = getBalance(customer.statement)

  if (balance < amount) {
    return response.status(400).json({
      error: 'Insufficient funds!'
    })
  }

  const statementOperation = {
    id: uuid(),
    amount,
    created_at: new Date(),
    type: 'debit'
  }

  customer.statement.push(statementOperation)

  return response.status(201).send()
})

app.get('/statement/date', verifyIfExistsAccont,(request, response) => {
  const { customer } = request

  const { date } = request.query

  const dateFormat = new Date(date + ' 00:00')

  const statement = customer.statement.filter(
    (filterStatement) => 
    filterStatement.created_at.toDateString() === 
    new Date(dateFormat).toDateString()
  )

  return response.json(statement)
})

app.put('/account', verifyIfExistsAccont, (request, response) => {
  const { customer } = request

  const { name } = request.body

  Object.assign(customer, { name })

  return response.send()
})

app.get('/account', verifyIfExistsAccont, (request, response) => {
  const { customer } =  request

  return response.json(customer)
})

app.delete('/account', verifyIfExistsAccont, (request, response) => {
  const { customer } = request

  customers.splice(customer, 1)

  return response.status(200).json(customers)
})

app.listen(3333, () => console.log('Server started on port 3333!'))
