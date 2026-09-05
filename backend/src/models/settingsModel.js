import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  shopName: {
    type: String,
    default: 'VM Crackers'
  },
  shopAddress: {
    type: String,
    default: 'Sivakasi to Vembakottai Main Road, Vanamoorthilingapuram'
  },
  shopPhone: {
    type: String,
    default: '9876543210'
  },
  globalDiscountPercentage: {
    type: Number,
    default: 90,
    min: 0,
    max: 100
  },
  upiId: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
