const axios = require('axios');

async function test() {
  try {
    const login = await axios.post('http://localhost:8080/api/v1/auth/login', {
      email: 'admin@mail.com',
      password: 'admin'
    });
    const token = login.data.accessToken;

    const usersRes = await axios.get('http://localhost:8080/api/v1/user/search', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const rendi = usersRes.data.data.find(u => u.name === 'rendi');
    console.log('Rendi:', JSON.stringify(rendi, null, 2));

    if (!rendi) return;

    console.log('Sending patch to user...');
    await axios.patch(`http://localhost:8080/api/v1/user/${rendi.id}`, {
      name: 'rendi',
      phone: '1811995221'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Sending patch to intern-profile...');
    await axios.patch(`http://localhost:8080/api/v1/intern-profile/${rendi.internProfile.id}`, {
      internId: '151848961',
      university: 'UPN',
      major: 'SI',
      program: 'PKL',
      gender: 'PRIA',
      mentorProfileId: undefined,
      bankName: '',
      bankAccount: '',
      documentUrls: [],
      dateOfBirth: '2017-09-02T00:00:00.000Z',
      startDate: '2026-08-31T00:00:00.000Z',
      endDate: '2026-09-29T00:00:00.000Z'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Success!');
  } catch (err) {
    if (err.response) {
      console.error('API Error:', err.response.status, err.response.data);
    } else {
      console.error(err);
    }
  }
}
test();
