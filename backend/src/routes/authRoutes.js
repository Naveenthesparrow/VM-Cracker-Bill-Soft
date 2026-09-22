import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import Settings from '../models/settingsModel.js';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ message: 'Google credential missing' });
    }

    // Verify Google Token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Find or Create User
    let user = await User.findOne({ googleId });
    let isNewUser = false;
    
    if (!user) {
      user = await User.create({
        googleId,
        email,
        name,
        picture
      });
      isNewUser = true;

      // Create default settings for this new shop
      await Settings.create({
        shopId: user._id,
        shopName: `${name}'s Shop`,
        shopAddress: '',
        shopPhone: '',
        globalDiscountPercentage: 90,
        upiId: ''
      });
    }

    // Issue our own JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '30d' }
    );

    res.json({ token, user, isNewUser });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
});

export default router;
