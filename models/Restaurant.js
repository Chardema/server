const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  entityType: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    default: null
  },
  externalId: {
    type: String,
    required: true
  }
});

// Méthode pour mettre à jour ou créer un restaurant
RestaurantSchema.statics.updateOrCreate = async function(entity) {
    const existing = await this.findOne({ id: entity.id });
    if (existing) {
        return this.findByIdAndUpdate(existing._id, entity, { new: true });
    } else {
        return this.create(entity);
    }
};

// Méthode pour obtenir tous les restaurants
RestaurantSchema.statics.getAll = function() {
    return this.find({});
};

const Restaurant = mongoose.model('Restaurant', RestaurantSchema);

module.exports = Restaurant;
