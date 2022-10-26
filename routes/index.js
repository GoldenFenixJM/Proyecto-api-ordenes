const express = require('express') //El objeto que manda la librería de express guárdalo en express

const {
    createAccount,
    fundAccount,
    Order
} = require('../controllers')

const router = express.Router()

router.post('/account', createAccount)
router.put('/account/:id', fundAccount)
router.post('/account/:id/order', Order)

//router.post('/account/:id/order', Order)

module.exports={
    router
}