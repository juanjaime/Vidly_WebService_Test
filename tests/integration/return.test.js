const {Rental}=require('../../models/rental');
const mongoose=require('mongoose');
const request=require('supertest');
const{User}=require('../../models/user');
const{Movie}=require('../../models/movie');
const moment=require('moment');
describe('/api/returns',()=>{
	let server;
	let customerId;
	let movieId;
	let rental;
	let token;
	let movie;
	const exec =()=>{
		return request(server)
		.post('/api/returns')
		.set('x-auth-token',token)
		.send({customerId,movieId});
	};
	
	beforeEach(async()=>{
		server=require('../../index');
		customerId=mongoose.Types.ObjectId();
		movieId=mongoose.Types.ObjectId();
		token= new User().generateAuthToken();
		movie = new Movie({
			_id:movieId,
			title:'12345',
			dailyRentalRate:2,
			genre:{ name:'12345'},
			numberInStock:10
		});
		await movie.save();
		rental=new Rental({
			customer:{
				_id: customerId,
				name:'12345',
				phone:'12345'
			},
			movie:{
				_id: movieId,
				title:'12345',
				dailyRentalRate:2
			}
		})
		await rental.save();
	});

	afterEach(async()=>{
		await server.close();
		await Rental.remove({});
		await Movie.remove({});
	});
	it('Should send 401 if it is not logged in',async()=>{
		token='';
		const res=await exec();
		expect(res.status).toBe(401);
	}),
	it('Should send 400 if customerId is not provided',async()=>{
		customerId='';
		const res=await exec();
		expect(res.status).toBe(400);
	}),
	it('Should send 400 if movieId is not provided',async()=>{
		movieId='';
		const res=await exec();
		expect(res.status).toBe(400);
	}),
	it('Should send 404 if no rentals are found for this customer/movie',async()=>{
		await Rental.remove({});
		const res=await exec();
		expect(res.status).toBe(404);
	}),
	it('Should send 400 if return is already processed',async()=>{
		rental.dateReturned=new Date();
		await rental.save();
		const res=await exec();
		expect(res.status).toBe(400);
	}),
	it("Should return 200 status if the request is valid",async()=>{
		const res=await exec();
		expect(res.status).toBe(200);
	}),
	it("Should set the return date on the rental object if input is valid",async()=>{
		const res=await exec();
		const rentalinDb = await Rental.findById(rental._id);
		const diff=new Date() - rentalinDb.dateReturned;
		expect(diff).toBeLessThan(10*1000);
	}),
	it("Should calculate the rental fee",async()=>{
		rental.dateOut=moment().add(-7,'days').toDate();
		await rental.save();
		const res=await exec();
		const rentalinDb = await Rental.findById(rental._id);
		expect(rentalinDb.rentalFee).toBe(14);
	}),
	it("Should increase the movie stock",async()=>{
		const res=await exec();
		const movieinDb = await Movie.findById(movie._id);
		expect(movieinDb.numberInStock).toBe(movie.numberInStock+1);
	})
	it("Should return the rental if input is valid",async()=>{
		const res=await exec();
		const rentalinDb=await Rental.findById(rental._id);
		expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['dateOut','dateReturned','rentalFee','customer','movie']))
	})

})