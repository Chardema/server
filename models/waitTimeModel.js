const mongoose = require('mongoose');
const moment = require('moment-timezone');

const waitTimeSchema = new mongoose.Schema({
    attractionId: {
        type: String,
        ref: 'Ride',
        required: true
    },
    attractionName: {
        type: String,
        required: true
    },
    waitTime: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: () => moment().tz('Europe/Paris').toDate()
    }
});

waitTimeSchema.statics.updateWaitTime = async function(attractionId, attractionName, waitTime, status = 'UNKNOWN', forceUpdate = false) {
    try {
        const lastWaitTime = await this.findOne({ attractionId }).sort({ timestamp: -1 }).exec();

        if (waitTime === null) {
            if (status === 'CLOSED') {
                const Ride = require('./Ride');
                const ride = await Ride.findById(attractionId);
                if (ride) {
                    ride.previousWaitTime = ride.waitTime;
                    ride.waitTime = null;
                    await Ride.findOneAndUpdate({ _id: ride._id }, ride, { new: true, useFindAndModify: false });
                }
                return;
            }
            if (status === 'DOWN') {
                return;
            }
        }

        if (!forceUpdate && lastWaitTime && lastWaitTime.waitTime === waitTime) {
            console.log(`No change in wait time for ${attractionName}, not saving new wait time.`);
            return;
        }

        const newWaitTime = new this({
            attractionId,
            attractionName,
            waitTime,
            timestamp: moment().tz('Europe/Paris').toDate()
        });

        await newWaitTime.save();

        const Ride = require('./Ride');
        const ride = await Ride.findById(attractionId);
        if (ride) {
            ride.previousWaitTime = ride.waitTime;
            ride.waitTime = waitTime;
            ride.waitTimes.push(newWaitTime._id);
            await Ride.findOneAndUpdate({ _id: ride._id }, ride, { new: true, useFindAndModify: false });
        } else {
            console.error(`Ride not found for attractionId: ${attractionId}`);
        }
    } catch (error) {
        console.error(`Error updating wait time for ${attractionName}:`, error);
        throw error;
    }
};

waitTimeSchema.statics.calculateAverageWaitTimeByPeriod = async function(attractionId) {
    const result = await this.aggregate([
        { $match: { attractionId } },
        {
            $project: {
                period: {
                    $switch: {
                        branches: [
                            {
                                case: { $lt: [{ $hour: "$timestamp" }, 12] },
                                then: "morning"
                            },
                            {
                                case: { $lt: [{ $hour: "$timestamp" }, 18] },
                                then: "afternoon"
                            }
                        ],
                        default: "evening"
                    }
                },
                waitTime: 1
            }
        },
        {
            $group: {
                _id: "$period",
                averageWaitTime: { $avg: '$waitTime' }
            }
        }
    ]);

    const averages = { morning: null, afternoon: null, evening: null };

    result.forEach(r => {
        averages[r._id] = r.averageWaitTime;
    });

    return averages;
};

const WaitTime = mongoose.model('WaitTime', waitTimeSchema);

module.exports = WaitTime;
