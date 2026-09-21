const axios = require('axios');

async function testProfile() {
  try {
    // We need a valid token. Let's login first.
    // Wait, I can just write a raw nestjs class-validator test script!
    const { validate } = require('class-validator');
    const { CreateEmployeeProfileDto } = require('./dist/employee-profile/dto/create-employee-profile.dto.js');
    
    const dto = new CreateEmployeeProfileDto();
    dto.userId = '123';
    dto.subFungsi = null; // simulate sending null
    
    const errors = await validate(dto);
    console.log("Validation errors:", errors.map(e => e.constraints));
  } catch (error) {
    console.error("Error:", error);
  }
}

testProfile();
