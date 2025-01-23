const mongoose = require('mongoose');

const sellerRegister = new mongoose.Schema({
    name: {
        type: String,
       
      },
      displayName: {
        type: String,
       
      },
      email: {
        type: String,
      },
      password: {
        type: String,
       
      },
      confirmPassword: {
        type: String,
       
      },
      company: {
        type: String,
       
      },
      addressLine1: {
        type: String,
       
      },
      addressLine2: {
        type: String,
      },
      landmark: {
        type: String,
      },
      city: {
        type: String,
       
      },
      state: {
        type: String,
       
      },
      country: {
        type: String,
       
      },
      zip: {
        type: String,
       
      },
      mobileNumber: {
        type: String,
      },
      gstNumber: {
        type: String,
       
      },
      bankName: {
        type: String,
       
      },
      accountName: {
        type: String,
       
      },
      branchName: {
        type: String,
       
      },
      accountNumber: {
        type: String,
       
      },
      ifscCode: {
        type: String,
       
      },
      panFile: {
        type: String,
       
      },
      chequeFile: {
        type: String,
       
      },
},{timestamps:true}
)
const Registration = mongoose.model('sellRegistration',sellerRegister);

module.exports = Registration;