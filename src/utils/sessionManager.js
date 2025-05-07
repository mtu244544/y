const jwt = require('jsonwebtoken');

class SessionManager {

  static generateToken(data) {
    const token = jwt.sign({
      id: data.id,
      firstname: data.firstname,
      lastname: data.lastname,
      roles: data.roles,
      email: data.email,
      status: data.status,
      clientId: data.clientId,
      profile: data.profile,
      emailVerified: data.emailVerified,
      expiryDate: data.expiryDate
    },
    data.secret || process.env.JWT_SECRET,
    { expiresIn: '24hr' });
    return token;
  }

  static async verifyToken(email) {
    const result = await getAsync(email);
    return result;
  }

  
  static decodeToken(data) {
    // eslint-disable-next-line no-useless-catch
    try {
      return jwt.verify(data.token, data.secret || process.env.JWT_SECRET);
    } catch (error) {
      throw error;
    }
  }

  static async destroyToken(user) {
    const result = await delAsync(user.email);
    return result;
  }

  static verifyTokenFromEmailVerification(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }
}

module.exports = SessionManager;
