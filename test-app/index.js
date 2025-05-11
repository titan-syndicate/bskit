const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello from our test app!');
});

app.listen(port, () => {
  console.log(`Test app listening on port ${port}`);
});