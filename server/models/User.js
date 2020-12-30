const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { isEmail } = require('validator');
const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Please enter a name']
    },
    email:{
        type: String,
        required: [true, 'Please enter a email'],
        unique: true,
        lowercase: true,
        validate:[isEmail, 'Please enter a valid email']
    },
    password:{
        type: String,
        required: [true, 'Please enter a password'],
        minlength: [6, 'The password should be atleast 6 characters long']
    }
    
})
userSchema.pre('save', sync function(next){
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    console.log('before save', this);
    next()
})
userSchema.post('save',function(doc,next){
    console.log('after save', doc);
    next()
})
const User = mongoose.model('user', userSchema);
module.exports = User;