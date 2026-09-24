import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import Cracker from './src/models/crackerModel.js';

// Read localCrackers from frontend
const frontendPath = path.resolve(__dirname, '../frontend/src/context/localCrackers.js');
const frontendContent = fs.readFileSync(frontendPath, 'utf8');

// Extract the array using eval or Function
const arrayStrMatch = frontendContent.match(/export const localCrackers = (\[[\s\S]*?\]);/);
if (!arrayStrMatch) {
  console.error('Failed to extract crackers array');
  process.exit(1);
}

const crackersData = eval('(' + arrayStrMatch[1] + ')');

const updateDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for update...');

    await Cracker.deleteMany({});
    console.log('Cleared existing crackers...');
    
    await Cracker.insertMany(crackersData);
    console.log(`Successfully updated MongoDB with ${crackersData.length} crackers.`);

    process.exit(0);
  } catch (error) {
    console.error('Error updating DB:', error);
    process.exit(1);
  }
};

updateDB();
