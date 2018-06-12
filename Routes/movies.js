const {Movie,validate}=require('../models/movie');
const {Genre}=require('../models/genre')
const express=require("express");
const mongoose=require("mongoose");
const router=express.Router();
router.get("/",async(req,res)=>{
	const movies=await Movie.find().sort('name');
	res.send(movies);
});
router.post("/",async(req,res)=>{
	const {error}=validate(req.body);
	if(error)return res.status(400).send(error.details[0].mesage);
	const genre = await Genre.findById(req.body.genreId);
	if(!genre) return res.status(400).send('Invalid Genre.');
	let movie=new Movie({
		title:req.body.title,
		genre:{
			_id:genre._id,
			name:genre.name
		},
		numberInStock:req.body.numberInStock,
		dailyRentalRate:req.body.dailyRentalRate
	});
	movie=await movie.save();
	res.send(movie);
});
router.put("/:id",async(req,res)=>{
	const {error}=validate(req.body);
	if(error){
		return res.status(400).send(error.details[0].message);
	}
	const genre= Genre.findById(req.body.genreId);
	if(!genre)return res.status(400).send('Invalid Genre');
	const movie = await Movie.findbyIdAndUpdate(req.params.id,{
		title:req.body.title,
		genre:{
			_id:genre.id,
			name:genre.name
		},
		numberInStock:req.body.numberInStock,
		dailyRentalRate:req.body.dailyRentalRate
	},{new:true});
	if(!movie) return res.status(404).send('movie id does not exist');
	res.send(movie);

});
router.delete("/:id",async(req,res)=>{
	const movie = Movie.findByIdAndRemove(req.params.id);
	if(!movie) return res.status(404).send('movie id does not exist');
	res.send(movie);
});
router.get("/:id",async (req,res)=>{
	const movie= Movie.findById(req.params.id);
	if(!movie) return res.status(404).send('movie ide does not exist');
	res.send(movie);
});
module.exports=router