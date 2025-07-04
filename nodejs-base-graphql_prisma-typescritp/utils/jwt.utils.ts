import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET || 'yourSecretKey';

export const generateToken = (user:any) => {
  const payload = {
    sub: user.id,
    username: user.username, 
    email: user.email,

  };
  const token = jwt.sign(payload, secretKey, { expiresIn: '1h' }); 
  return token;
};

 export function verifyToken(token: string) {
    try {
      return jwt.verify(token, secretKey);
    } catch (error) {
      return null;
    }
  }