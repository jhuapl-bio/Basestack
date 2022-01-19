const express = require('express')
const app = express()
const port = 8098

app.get('/', (req, res) => {
  res.send('Hello World!')
})
// express.static(root, [options])

app.use(express.static('tutorials'))

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})