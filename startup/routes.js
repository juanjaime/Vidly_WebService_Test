const express= require("express");
const customers=require("../Routes/customers.js");
const genres=require("../Routes/genres.js");
const rentals=require("../Routes/rentals.js");
const movies=require("../Routes/movies.js");
const users=require("../Routes/users.js");
const auth=require("../Routes/auth.js");
const returns=require("../Routes/returns.js");
const error=require('../middleware/error');

module.exports=function(app){
app.use(express.json());
app.use('/api/genres',genres);
app.use('/api/customers',customers);
app.use('/api/rentals',rentals);
app.use('/api/movies',movies);
app.use('/api/users',users);
app.use('/api/auth',auth);
app.use('/api/returns',returns)
app.use(error);
}