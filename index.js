const express = require('express') //El objeto que manda la librería de express guárdalo en express
const bodyParser = require('body-parser') //Definir como vamos a mandar el cuerpo
const cors = require('cors'); 
const {router} = require('./routes')

const app = express(); //Crear aplicación express
const apiPort = process.env.API_PORT||3003;

app.use(bodyParser.urlencoded({extended: true})); //Mandar urlencoded, checa que único que esté leyendo es contentType que estamos mandando
app.use(cors()); //No nos explote aplicación si hay 2 hosts en diferentes puertos
app.use(bodyParser.json()) //Lo que mandamos en body se interpreta con json
app.use('/', router)

app.listen(apiPort, ()=> console.log(`Server running on port ${apiPort}`)); //Cuando acabe de levantarse la aplicación se quede dormida hasta request