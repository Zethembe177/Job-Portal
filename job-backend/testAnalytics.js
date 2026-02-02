const axios = require("axios");

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NjY4ODAzYjFkOGI2MjhhMTg2NTM0OCIsInJvbGUiOiJlbXBsb3llciIsImlhdCI6MTc2OTQzMTAzOCwiZXhwIjoxNzY5NDM0NjM4fQ._f3qmueutdD30Y5uhQwszuo_SHWsomeZTgvtNJN3sd4"; // replace with your token

axios.get("http://localhost:5000/api/analytics/summary", {
  headers: { Authorization: `Bearer ${token}` },
})
.then(res => {
  console.log("API Response:", res.data);
})
.catch(err => {
  console.error("Error:", err.response?.data || err.message);
});
    
