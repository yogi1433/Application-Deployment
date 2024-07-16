// src/components/Register.js
import React, { useState } from "react";
import axios from "axios";
import validator from "validator";
import "./signup.css";

const Signup = () => {
  const [data, setData] = useState({
    name: "",
    email: "",
    company: "",
    password: "",
  });
  const { name, email, password, company } = data;
  const handleRegister = async () => {
    if (!validator.isEmail(email)) {
      alert("Invalid email");
      return;
    }
    if (!validator.isStrongPassword(password)) {
      alert("Weak password");
      return;
    }
    try {
      console.log(data);
      await axios.post("http://localhost:5000/api/register", {
        email,
        password,
        name,
        company,
      });
      alert("Registration successful");
    } catch (error) {
      console.error("Registration error", error);
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <input
        name="email"
        type="email"
        value={email}
        onChange={handleChange}
        placeholder="Email"
      />
      <input
        name="password"
        type="password"
        value={password}
        onChange={handleChange}
        placeholder="Password"
      />
      <input
        name="name"
        type="text"
        value={name}
        onChange={handleChange}
        placeholder="Name"
      />
      <input
        name="company"
        type="text"
        value={company}
        onChange={handleChange}
        placeholder="Company (Optional)"
      />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
};

export default Signup;
