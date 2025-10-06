import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import '../styles/allUsers.css'
import axios from 'axios';

const AllUsers = () => {

  const [customers, setCustomers] = useState([]);
  const [operators, setOperators] = useState([]);
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    // ✅ UPDATED: Fetch all users from a single endpoint
    await axios.get('http://localhost:6001/fetch-users').then(
      (response) => {
        // Filter the response data by user type
        const allUsers = response.data;
        setCustomers(allUsers.filter(user => user.usertype === 'customer'));
        setOperators(allUsers.filter(user => user.usertype === 'flight-operator'));
        setAdmins(allUsers.filter(user => user.usertype === 'admin'));
      }
    )
  }

  return (
    <>
      <Navbar />

      <div className="all-users-page">
        <h2>All Users</h2>
        <div className="all-users">

          {customers.length === 0 ? <p>No customers found.</p> : customers.map((user) => {
            return (
              <div className="user" key={user._id}>
                <p><b>UserId </b>{user._id}</p>
                <p><b>Username </b>{user.username}</p>
                <p><b>Email </b>{user.email}</p>
              </div>
            )
          })}

        </div>

        <h2>Flight Operators</h2>
        <div className="all-users">

          {operators.length === 0 ? <p>No operators found.</p> : operators.map((user) => {
            return (
              <div className="user" key={user._id}>
                <p><b>Id </b>{user._id}</p>
                <p><b>Flight Name </b>{user.username}</p>
                <p><b>Email </b>{user.email}</p>
                <p><b>Approval status: </b>{user.approval}</p>
              </div>
            )
          })}

        </div>

        {/* ✅ NEW: Display the admin user as well */}
        <h2>Admin Users</h2>
        <div className="all-users">

          {admins.length === 0 ? <p>No admin users found.</p> : admins.map((user) => {
            return (
              <div className="user" key={user._id}>
                <p><b>Id </b>{user._id}</p>
                <p><b>Name </b>{user.username}</p>
                <p><b>Email </b>{user.email}</p>
                <p><b>Approval status: </b>{user.approval}</p>
              </div>
            )
          })}

        </div>
      </div>
    </>
  )
}

export default AllUsers