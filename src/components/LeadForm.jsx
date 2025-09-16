import React, { useState } from "react";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
} from "@mui/material";

function LeadForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // basic validation
    if (!formData.name || !formData.email) {
      setMessage("Name and Email are required.");
      setMessageType("error");
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(formData.email)) {
      setMessage("Invalid email format.");
      setMessageType("error");
      return;
    }

    // phone number validation 10 digits
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      setMessage("Phone number must be exactly 10 digits.");
      setMessageType("error");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const text = await res.text();
      setMessage(text);
      setFormData({ name: "", email: "", company: "", phone: "" });
      setMessageType("success");
    } catch (err) {
      setMessage("Something went wrong. Try again.");
      setMessageType("error");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Paper elevation={3} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 2 }}>
        <Typography
          variant="h5"
          align="center"
          gutterBottom
          sx={{ fontWeight: "bold" }}
        >
          Lead Capture Form
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            margin="normal"
            inputProps={{ maxLength: 10 }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 3,
              py: 1.5,
              fontSize: "1rem",
              borderRadius: "8px",
            }}
          >
            Submit
          </Button>
        </Box>

        {message && (
          <Typography
            variant="body1"
            color={messageType === "error" ? "error" : "success"}
            align="center"
            sx={{ mt: 2 }}
          >
            {message}
          </Typography>
        )}
      </Paper>
    </Container>
  );
}

export default LeadForm;
