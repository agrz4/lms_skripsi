const axios = require('axios');

async function main() {
  try {
    console.log("Attempting to login...");
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@lms.com',
      password: 'admin123'
    });
    
    const token = loginRes.data.token;
    console.log("Login successful! Token acquired.");

    console.log("Fetching courses from API...");
    const coursesRes = await axios.get('http://localhost:5000/api/matakuliah', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log("API Courses count:", coursesRes.data.length);
    console.log("API Courses list:", coursesRes.data.map(c => ({
      id: c.id,
      nama: c.nama,
      kode: c.kode,
      level: c.level,
      published: c.published
    })));
  } catch (error) {
    console.error("API check failed:", error.response ? error.response.data : error.message);
  }
}

main();
