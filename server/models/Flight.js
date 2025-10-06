import mongoose from 'mongoose';

const FlightSchema = new mongoose.Schema({
  flightName: String,
  flightId: String,
  origin: String,
  destination: String,
  departureTime: Date, // Changed from String to Date
  arrivalTime: Date,   // Changed from String to Date
  basePrice: Number,
  totalSeats: Number,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const Flight = mongoose.model('Flight', FlightSchema);
export default Flight;