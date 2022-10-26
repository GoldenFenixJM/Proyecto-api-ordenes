const FS = require('../firebase')
const {db}=FS

// Endpoint para crear una cuenta
const createAccount = async(req, res)=>{
    try {
        const {body:account}=req //Alias al body llamada account
        const AccountDb = db.collection('accounts')// Acceso a la colección
        const {_path: {segments}}= await AccountDb.add(account) //Agrega el objeto account a la colección
        const id=segments[1] //Obtiene el id del objeto que se acaba de agregar
        res.send({ //Manda el id del objeto que se acaba de agregar
            status:200, 
            id, 
            money:1000,
            collectables:[]
        }) 
    } catch(error){
        res.send(error) //Manda el error
    }
}

// Endpoint para agregar dinero a una cuenta
const fundAccount = async (req, res) => {
    try {
        const {params:{id}}=req 
        const {body: account} = req
        const {money: moneyToAdd} = account
        const AccountDb = db.collection('accounts').doc(id)
        const {_fieldsProto} = await AccountDb.get()
        const currentMoney= parseInt(_fieldsProto.money.integerValue)
        const newmoney = currentMoney + moneyToAdd
        const resp = await AccountDb.update({ //Reemplazando
            money: newmoney
        })
        res.send({
            current_balance: {
                money: newmoney,
                collectables: [{
                    "collection_name": "CARD_1",
                    "amount": 2,
                    "collection_price": 50
                }]
            },
            business_errors: []
        })
    } catch(error) {
        res.send(error)
    }
}

// Array donde se guardan los objetos
const collectables = []
// Endpoint para crear una orden de compra y venta
const Order = async (req, res) => {
    const {id} =req.params // Obtiene el id de la cuenta
    const {operation, collection_name, amount, collection_price} = req.body // Obtiene los datos de la orden
    const AccountDb = db.collection('accounts').doc(id) // Acceso a la colección
    const data = await AccountDb.get() // Obtiene los datos de la cuenta
    
    const {money} = data.data() // Obtiene el dinero de la cuenta
    
    if (operation === 'BUY'&&(money-(collection_price*amount))>=0) { // Si la operación es de compra y el dinero es suficiente
        
        const newMoney = money - (collection_price*amount) //Restamos el dinero
        await AccountDb.update({money: newMoney}) //Actualizamos el dinero
        const collectable = collectables.find(collectable => collectable.collection_name === collection_name) //Buscamos el objeto en la lista de objetos
        if (collectable) { //Si el objeto existe
            collectable.amount += amount
        } else { //Si el objeto no existe
            collectables.push({collection_name, amount, collection_price})
        }
//Mandamos la respuesta
        res.send({
            current_balance: {
                money: newMoney,
                collectables
            },
        })
    } else if (operation==='BUY' && (money-(collection_price*amount))<0) {// Si la operación es de compra y el dinero no es suficiente
        res.send({
            //Mandamos la respuesta
            current_balance: {
                money,
                collectables
            },
            business_errors: [
                {
                    //Mandamos el error
                    code: 'INSUFFICIENT_FUNDS',
                    message: 'No tienes suficiente dinero para comprar esta coleccion'
                }
            ]
        })
    }
    // Si la operación es de venta y se tiene el objeto y la cantidad suficiente
    if (operation === 'SELL') { 
        const collectable = collectables.find(collectable => collectable.collection_name === collection_name) //Buscamos el objeto en la lista de objetos
        if (collectable && collectable.amount>=amount) { //Si el objeto existe y la cantidad es suficiente
            const newMoney = money + (collection_price*amount) //Sumamos el dinero
            await AccountDb.update({money: newMoney}) //Actualizamos el dinero
            collectable.amount -= amount //Restamos la cantidad
            res.send({ //Mandamos la respuesta
                current_balance: {
                    money: newMoney,
                    collectables
                },
            })
        } else { // Si la operación es de venta y no se tiene el objeto o la cantidad suficiente
            res.send({
                current_balance: {//Mandamos la respuesta
                    money,
                    collectables
                },
                business_errors: [//Mandamos el error
                    {
                        code: 'INSUFFICIENT_COLLECTABLES',
                        message: 'No tienes suficientes coleccionables para vender'
                    }
                ]
            })
        }
    }
    //Subir a firebase
    await AccountDb.update({collectables})
    
}

module.exports = {
    createAccount,
    fundAccount,
    Order
}