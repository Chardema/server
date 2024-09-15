// models/Show.js
const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
    type: String,
    startTime: Date,
    endTime: Date
});

const showSchema = new mongoose.Schema({
    id: String,
    name: String,
    entityType: String,
    parkId: String,
    externalId: String,
    status: String,
    showtimes: [showtimeSchema],
    lastUpdated: Date,
    coordinates: [Number]
});

showSchema.statics.updateOrCreate = async function (showData) {
    const show = await this.findOne({ id: showData.id });
    if (show) {
        show.set({
            name: showData.name,
            status: showData.status,
            parkId: showData.parkId,
            externalId: showData.externalId,
            lastUpdated: new Date(showData.lastUpdated),
            showtimes: showData.showtimes,
            coordinates: showData.coordinates
        });
        await show.save();
    } else {
        await this.create({
            id: showData.id,
            name: showData.name,
            status: showData.status,
            parkId: showData.parkId,
            externalId: showData.externalId,
            lastUpdated: new Date(showData.lastUpdated),
            showtimes: showData.showtimes,
            coordinates: showData.coordinates
        });
    }
};

showSchema.statics.getAll = async function () {
    return await this.find({});
};

module.exports = mongoose.model('Show', showSchema);
