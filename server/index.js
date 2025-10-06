import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";
import { User, Booking } from "./schemas.js";
import Flight from "./models/Flight.js";

const app = express();
const PORT = 6001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// MongoDB Connection
mongoose
  .connect("mongodb://localhost:27017/FlightBookingMERN", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected");

    // ===================== AUTH =====================

    app.post("/register", async (req, res) => {
      const { username, email, usertype, password } = req.body;
      let approval = "approved";

      try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ message: "User already exists" });
        }

        if (usertype === "flight-operator") {
          approval = "not-approved";
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
          username,
          email,
          usertype,
          password: hashedPassword,
          approval,
        });

        const userCreated = await newUser.save();
        return res.status(201).json(userCreated);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
      }
    });

    app.post("/login", async (req, res) => {
      const { email, password } = req.body;
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: "Invalid credentials" });
        }
        res.json(user);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
      }
    });

    // ===================== USER MANAGEMENT =====================

    app.get("/fetch-users", async (req, res) => {
      try {
        const users = await User.find({});
        res.json(users);
      } catch (error) {
        res.status(500).json({ message: "Error fetching users" });
      }
    });

    app.get("/fetch-user/:id", async (req, res) => {
      const { id } = req.params;
      try {
        const user = await User.findById(id);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
      } catch (error) {
        res.status(500).json({ message: "Error fetching user" });
      }
    });

    app.post("/approve-operator", async (req, res) => {
      const { id } = req.body;
      try {
        const user = await User.findByIdAndUpdate(
          id,
          { approval: "approved" },
          { new: true }
        );
        res.json(user);
      } catch (error) {
        res.status(500).json({ message: "Error approving operator" });
      }
    });

    app.post("/reject-operator", async (req, res) => {
      const { id } = req.body;
      try {
        const user = await User.findByIdAndUpdate(
          id,
          { approval: "rejected" },
          { new: true }
        );
        res.json(user);
      } catch (error) {
        res.status(500).json({ message: "Error rejecting operator" });
      }
    });

    // ===================== FLIGHTS =====================

    app.post("/add-Flight", async (req, res) => {
      try {
        const {
          flightName,
          flightId,
          origin,
          destination,
          departureTime,
          arrivalTime,
          basePrice,
          totalSeats,
          createdBy,
        } = req.body;
        
        const newFlight = new Flight({
          flightName,
          flightId,
          origin,
          destination,
          departureTime: new Date(departureTime),
          arrivalTime: new Date(arrivalTime),
          basePrice,
          totalSeats,
          createdBy,
        });
        await newFlight.save();
        res.status(201).json(newFlight);
      } catch (error) {
        console.error("Error adding flight:", error);
        res.status(500).json({ message: "Error adding flight" });
      }
    });

    app.get("/fetch-flights", async (req, res) => {
      try {
        const flights = await Flight.find({}).populate('createdBy');
        res.json(flights);
      } catch (error) {
        console.error("Error fetching flights:", error);
        res.status(500).json({ message: "Error fetching flights" });
      }
    });

    app.get("/fetch-flight/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const flight = await Flight.findById(id);
        if (!flight) {
          return res.status(404).json({ message: "Flight not found" });
        }
        res.json(flight);
      } catch (error) {
        console.error("Error fetching flight:", error);
        res.status(500).json({ message: "Error fetching flight" });
      }
    });

    app.put("/edit-flight/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const updateData = { ...req.body };
        
        if (req.body.departureTime) {
          updateData.departureTime = new Date(req.body.departureTime);
        }
        if (req.body.arrivalTime) {
          updateData.arrivalTime = new Date(req.body.arrivalTime);
        }
        
        const updatedFlight = await Flight.findByIdAndUpdate(id, updateData, {
          new: true,
        });
        if (!updatedFlight) {
          return res.status(404).json({ message: "Flight not found" });
        }
        res.json(updatedFlight);
      } catch (error) {
        console.error("Error updating flight:", error);
        res.status(500).json({ message: "Error updating flight" });
      }
    });

    app.delete("/delete-flight/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const deletedFlight = await Flight.findByIdAndDelete(id);
        if (!deletedFlight) {
          return res.status(404).json({ message: "Flight not found" });
        }
        res.json({ message: "Flight deleted successfully" });
      } catch (error) {
        console.error("Error deleting flight:", error);
        res.status(500).json({ message: "Error deleting flight" });
      }
    });

    app.get("/fetch-my-flights/:operatorId", async (req, res) => {
      try {
        const { operatorId } = req.params;
        const flights = await Flight.find({ createdBy: operatorId });
        res.json(flights);
      } catch (err) {
        console.error("Error fetching operator flights:", err);
        res.status(500).json({ message: "Error fetching flights" });
      }
    });

    // ===================== FLIGHT SEARCH =====================

    app.post("/search-flights", async (req, res) => {
      try {
        const { origin, destination, departureDate, returnDate } = req.body;
        
        console.log("Search request:", { origin, destination, departureDate, returnDate });

        // Validate required fields
        if (!origin || !destination || !departureDate) {
          return res.status(400).json({ message: "Origin, destination, and departure date are required" });
        }

        // Convert departureDate to start and end of day for query
        const startDate = new Date(departureDate);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(departureDate);
        endDate.setHours(23, 59, 59, 999);

        // Build query
        const query = {
          origin: { $regex: new RegExp(origin, 'i') },
          destination: { $regex: new RegExp(destination, 'i') },
          departureTime: {
            $gte: startDate,
            $lte: endDate
          }
        };

        console.log("Search query:", query);

        const flights = await Flight.find(query);
        console.log(`Found ${flights.length} flights`);

        res.json(flights);
      } catch (error) {
        console.error("Error searching flights:", error);
        res.status(500).json({ message: "Error searching flights" });
      }
    });

    // ===================== SAMPLE DATA =====================

    app.post("/seed-flights", async (req, res) => {
      try {
        // Get any admin user to associate with flights
        const adminUser = await User.findOne({ usertype: 'admin' });
        if (!adminUser) {
          return res.status(404).json({ message: "No admin user found to associate flights with" });
        }

        const sampleFlights = [
          {
            flightName: "Air India",
            flightId: "AI101",
            origin: "Mumbai",
            destination: "Delhi",
            departureTime: new Date("2025-10-21T08:00:00"),
            arrivalTime: new Date("2025-10-21T10:00:00"),
            basePrice: 4500,
            totalSeats: 150,
            createdBy: adminUser._id
          },
          {
            flightName: "IndiGo",
            flightId: "6E202",
            origin: "Delhi",
            destination: "Mumbai",
            departureTime: new Date("2025-10-21T14:00:00"),
            arrivalTime: new Date("2025-10-21T16:00:00"),
            basePrice: 4200,
            totalSeats: 180,
            createdBy: adminUser._id
          },
          {
            flightName: "SpiceJet",
            flightId: "SG303",
            origin: "Mumbai",
            destination: "Bangalore",
            departureTime: new Date("2025-10-21T09:00:00"),
            arrivalTime: new Date("2025-10-21T11:30:00"),
            basePrice: 5200,
            totalSeats: 120,
            createdBy: adminUser._id
          },
          {
            flightName: "Vistara",
            flightId: "UK404",
            origin: "Delhi",
            destination: "Chennai",
            departureTime: new Date("2025-10-21T11:00:00"),
            arrivalTime: new Date("2025-10-21T13:30:00"),
            basePrice: 5800,
            totalSeats: 140,
            createdBy: adminUser._id
          },
          {
            flightName: "Air India Express",
            flightId: "IX505",
            origin: "Mumbai",
            destination: "Hyderabad",
            departureTime: new Date("2025-10-21T07:00:00"),
            arrivalTime: new Date("2025-10-21T08:30:00"),
            basePrice: 3800,
            totalSeats: 160,
            createdBy: adminUser._id
          }
        ];

        await Flight.deleteMany({}); // Clear existing flights
        await Flight.insertMany(sampleFlights);
        
        res.json({ message: "Sample flights added successfully", flights: sampleFlights });
      } catch (error) {
        console.error("Error seeding flights:", error);
        res.status(500).json({ message: "Error seeding flights" });
      }
    });

    // ===================== BOOKINGS =====================

    app.get("/fetch-bookings", async (req, res) => {
      try {
        const bookings = await Booking.find({}).populate("user").populate("flight");
        res.json(bookings);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        res.status(500).json({ message: "Error fetching bookings" });
      }
    });

    app.get("/fetch-user-bookings/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const bookings = await Booking.find({ user: id }).populate("flight");
        res.json(bookings);
      } catch (err) {
        console.error("Error fetching user bookings:", err);
        res.status(500).json({ message: "Error fetching bookings" });
      }
    });

    app.get("/fetch-operator-bookings/:operatorId", async (req, res) => {
      try {
        const { operatorId } = req.params;

        const operator = await User.findById(operatorId);
        if (!operator || operator.usertype !== 'flight-operator') {
          return res.status(404).json({ message: "Flight operator not found" });
        }

        const flights = await Flight.find({ createdBy: operatorId });
        const flightIds = flights.map(flight => flight._id);

        const bookings = await Booking.find({ flight: { $in: flightIds } }).populate('user').populate('flight');

        res.json(bookings);
      } catch (err) {
        console.error("Error fetching operator bookings:", err);
        res.status(500).json({ message: "Error fetching operator bookings" });
      }
    });

    app.post("/add-booking", async (req, res) => {
      try {
        const {
          user,
          flight,
          email,
          mobile,
          seatClass,
          passengers,
          totalPrice,
          journeyDate,
          journeyTime
        } = req.body;

        const flightDetails = await Flight.findById(flight);
        if (!flightDetails) {
          return res.status(404).json({ message: "Flight not found" });
        }
        if (flightDetails.totalSeats < passengers.length) {
          return res.status(400).json({ message: "Not enough seats available" });
        }
        
        const bookingCount = await Booking.countDocuments({ flight: flight, bookingStatus: 'confirmed' });
        let seats = "";
        const seatCode = { economy: "E", business: "B" };
        const numBookedSeats = bookingCount;
        const coach = seatCode[seatClass];

        for (
          let i = numBookedSeats + 1;
          i < numBookedSeats + passengers.length + 1;
          i++
        ) {
          seats += seats ? `, ${coach}-${i}` : `${coach}-${i}`;
        }

        const booking = new Booking({
          user,
          flight,
          flightName: flightDetails.flightName,
          flightId: flightDetails.flightId,
          departure: flightDetails.origin,
          destination: flightDetails.destination,
          email,
          mobile,
          passengers,
          totalPrice,
          journeyDate: new Date(journeyDate),
          journeyTime,
          seatClass,
          seats,
        });

        await booking.save();
        
        // Update flight seats
        await Flight.findByIdAndUpdate(flight, {
          $inc: { totalSeats: -passengers.length }
        });
        
        res.json({ message: "Booking successful!" });
      } catch (err) {
        console.error("Booking error:", err);
        res.status(500).json({ message: "Booking failed" });
      }
    });

    app.put("/cancel-ticket/:id", async (req, res) => {
      try {
        const booking = await Booking.findById(req.params.id);
        if (!booking)
          return res.status(404).json({ message: "Booking not found" });

        booking.bookingStatus = "cancelled";
        await booking.save();
        
        // Restore flight seats when cancelled
        await Flight.findByIdAndUpdate(booking.flight, {
          $inc: { totalSeats: booking.passengers.length }
        });
        
        res.json({ message: "Booking cancelled" });
      } catch (err) {
        console.error("Error cancelling booking:", err);
        res.status(500).json({ message: "Error cancelling booking" });
      }
    });

    // ===================== SERVER =====================
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });