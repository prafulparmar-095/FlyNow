const flights = [
  {
    flightName: "Air India 101",
    flightId: "AI101",
    origin: "Mumbai",
    destination: "Delhi",
    departureTime: new Date("2025-10-21T09:00:00Z"),
    arrivalTime: new Date("2025-10-21T11:00:00Z"),
    basePrice: 5000,
    totalSeats: 100,
    createdBy: "65a1b2c3d4e5f6a7b8c9d0e1" // Replace with actual user ID
  },
  {
    flightName: "IndiGo 202",
    flightId: "IG202",
    origin: "Delhi",
    destination: "Mumbai",
    departureTime: new Date("2025-10-21T14:00:00Z"),
    arrivalTime: new Date("2025-10-21T16:00:00Z"),
    basePrice: 4500,
    totalSeats: 120,
    createdBy: "65a1b2c3d4e5f6a7b8c9d0e1"
  },
  {
    flightName: "SpiceJet 303",
    flightId: "SJ303",
    origin: "Bangalore",
    destination: "Delhi",
    departureTime: new Date("2025-10-21T10:00:00Z"),
    arrivalTime: new Date("2025-10-21T13:00:00Z"),
    basePrice: 5500,
    totalSeats: 110,
    createdBy: "65a1b2c3d4e5f6a7b8c9d0e1"
  }
];

export default flights;