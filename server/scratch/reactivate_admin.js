require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const mongoose = require('mongoose')
const User = require('../models/User')

async function reactivateAdmin() {
  await mongoose.connect(process.env.MONGO_URI)
  const result = await User.updateOne({ email: 'admin@khan.com' }, { isActive: true })
  console.log('Update result:', result)
  process.exit(0)
}

reactivateAdmin()
