require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const mongoose = require('mongoose')
const User = require('../models/User')

async function checkUser() {
  await mongoose.connect(process.env.MONGO_URI)
  const user = await User.findOne({ email: 'admin@khan.com' })
  console.log('User found:', user)
  process.exit(0)
}

checkUser()
