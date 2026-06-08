const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    ticketName: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    soldQuantity: {
        type: Number,
        default: 0,
        min: 0
    }
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
