const mongoose = require('mongoose');
const moment = require('moment-timezone');

const rideSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    parkId: {
        type: String,
        required: true
    },
    externalId: {
        type: String,
        required: true
    },
    lastUpdated: {
        type: Date,
        required: true
    },
    waitTime: {
        type: Number,
        default: null
    },
    previousWaitTime: {
        type: Number,
        default: null
    },
    type: {
        type: String,
        required: true
    },
    coordinates: {
        type: [Number],
        default: []
    },
    land: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    }
});

rideSchema.statics.updateOrCreate = async function (rideData) {
    const ride = await this.findOne({ _id: rideData.id });
    const newWaitTime = rideData.queue?.STANDBY?.waitTime || null;
    const lastUpdated = new Date(rideData.lastUpdated);

    if (ride) {
        console.log(`Existing ride found: ${ride.name}`);
        console.log(`Current wait time: ${ride.waitTime}, New wait time: ${newWaitTime}`);

        if (newWaitTime !== null && ride.waitTime !== newWaitTime) {
            ride.previousWaitTime = ride.waitTime;
            ride.waitTime = newWaitTime;
        }

        const updateData = {
            name: rideData.name,
            status: rideData.status,
            parkId: rideData.parkId,
            externalId: rideData.externalId,
            lastUpdated: lastUpdated,
            type: rideData.type,
            coordinates: rideData.coordinates,
            land: rideData.land,
            description: rideData.description,
            waitTime: ride.waitTime,
            previousWaitTime: ride.previousWaitTime
        };

        const updatedRide = await this.findOneAndUpdate({ _id: ride._id }, updateData, { new: true, useFindAndModify: false });
        console.log('Ride updated:', updatedRide);
        return updatedRide;
    } else {
        console.log('Creating new ride...');

        const newRide = await this.create({
            _id: rideData.id,
            name: rideData.name,
            status: rideData.status,
            parkId: rideData.parkId,
            externalId: rideData.externalId,
            lastUpdated: new Date(rideData.lastUpdated),
            waitTime: newWaitTime,
            previousWaitTime: null,
            type: rideData.type,
            coordinates: rideData.coordinates,
            land: rideData.land,
            description: rideData.description
        });

        console.log('New ride created:', newRide);
        return newRide;
    }
};

rideSchema.statics.getAll = async function () {
    return await this.find({});
};

const Ride = mongoose.model('Ride', rideSchema);

module.exports = Ride;
