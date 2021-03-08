const express = require('express')
const { v4: uuid } = require('uuid')

const app = express()

app.use(express.json())

const customers = []

app.post('/account', (request, response) => {
  const { name, cpf } = request.body

  customers.push({
    id: uuid(),
    name,
    cpf
  })

  return response.status(201).send()
})

app.listen(3333, () => console.log('Server started on port 3333!'))
