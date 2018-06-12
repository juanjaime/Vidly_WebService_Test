const mongoose=require('mongoose');
const Joi = require("joi");
const jwt=require("jsonwebtoken");
const config=require("config");

const userSchema= new mongoose.Schema({
	name:{
		type:String,
		required:true,
		minlenght:3,
		maxlength:50
	},
	email:{
		type:String,
		unique:true,
		required: true,
		minlength:5,
		maxlenght:255
	},
	password:{
		type:String,
		required:true,
		minlenght:6,
		maxlenght:1024
	},
	isAdmin:Boolean
});
userSchema.methods.generateAuthToken=function(){
	const token= jwt.sign({_id:this._id,isAdmin:this.isAdmin},config.get('jwtPrivateKey'));
	return token;
}
const User= mongoose.model('User', userSchema);
function validate(user){
	const Schema={
		name:Joi.string().min(3).max(50).required(),
		email:Joi.string().required().email(),
		password:Joi.string().min(6).max(255).required()
	};
	return Joi.validate(user,Schema);
}
exports.User=User;
exports.validate=validate