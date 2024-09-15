const mongoose = require('mongoose');

const AggregatedWaitTimeSchema = new mongoose.Schema({
    attractionId: {
        type: String,
        required: true
    },
    attractionName: {
        type: String,
        required: true
    },
    matin: {
        type: Number,
        required: true
    },
    midi: {
        type: Number,
        required: true
    },
    soir: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    }
});

const AggregatedWaitTime = mongoose.model('AggregatedWaitTime', AggregatedWaitTimeSchema);

module.exports = AggregatedWaitTime;
