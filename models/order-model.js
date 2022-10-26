const mongoose = require('mongoose');
const Scheme = mongoose.Schema //Objeto en que defines modelo de entidad

const Order_model = new Schema( //Solo aceptar entries que sigan esta estructura
    {
    id: {type: string, required: true},
    money: {type: double, required: true},
    collectables: {type: [String], required: true},
    },
    { timestamps: true } //Hora en que se editó por última vez una cosa

)
module.exports=mongoose.model('order_model', Order_model);


