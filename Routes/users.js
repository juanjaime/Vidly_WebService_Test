const express=require("express");
const bcrypt=require('bcrypt');
const mongoose=require("mongoose");
const _=require('lodash');
const {User,validate}=require("../models/user");
const router=express.Router();
const auth=require('../middleware/auth');
/*router.get('/',async(req,res)=>{
	const users=await User.find().sort('name');
	res.send(users);
});*/
router.post('/',async(req,res)=>{
	const {error}=validate(req.body);
	if(error)return res.status(400).send(error.details[0].message);
	let user=await User.findOne({email:req.body.email});
	if(user) return res.status(400).send("User allready registered.");
	user = new User (_.pick(req.body,['name','email','password']));
	const salt=await bcrypt.genSalt(10);
	user.password=await bcrypt.hash(user.password,salt);
	await user.save();
	const token=user.generateAuthToken();
	res.header('x-auth-token',token).send(_.pick(user,['name','email','_id']))
});/*
router.put('/:id', async(req,res)=>{
	const {error}=validate(req.body);
	if(error)return res.status(400).send(error.details[0].message);
	const user=User.findByIdAndUpdate(req.params.id,{name:req.body.name,email:req.body.email,password:req.body.password},{new:true});
	if(!user)return res.status(404).send("User does not exist");
	res.send(user);
});
router.delete('/:id', async(req,res)=>{
	const {error}=validate(req.body);
	if(error)return res.status(400).send(error.details[0].message);
	const user=User.findByIdAndRemove(req.params.id);
	if(!user)return res.status(404).send("User does not exists");
	res.send(user)
});*/
router.get('/me',auth,async(req,res)=>{
	const user=await User.findById(req.user._id).select('-password');
	res.send(user);
});
module.exports=router;