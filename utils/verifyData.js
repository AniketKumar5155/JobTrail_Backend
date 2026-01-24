const bcrypt = require('bcryptjs')

const verifyData = async (data, hashedData) => {
  try {
    return await bcrypt.compare(data, hashedData);
  } catch (error) {
    throw new Error('Verification error');
  }
};

module.exports = verifyData;
