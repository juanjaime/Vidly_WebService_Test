const request = require('supertest');
const {Genre} = require('../../models/genre');
const {User}  = require('../../models/user');
const mongoose=require('mongoose');
let server
describe('/api/genres',()=>{
	beforeEach(()=>{
		server=require('../../index');
	});
	afterEach(async()=>{
		 server.close();
		await Genre.remove({});
			});
	describe('GET /',()=>{
		it('Sould return all genres',async()=>{
			await Genre.collection.insertMany([
			{
				name:'genre1'
			},
			{
				name:'genre2'
			}])
			const res= await request(server).get('/api/genres');
			expect(res.status).toBe(200);
			expect(res.body.length).toBe(2);
		})
	}),
	describe('GET /:id',()=>{
		it('Sould return the Genre with the id passed',async()=>{
			const genre=new Genre({name:'genre1'});
			await genre.save();
			const res= await request(server).get('/api/genres/'+genre._id);
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty('name',genre.name);
		}),
		it('Sould return 404 if invalid id is passed',async()=>{
			const res= await request(server).get('/api/genres/1');
			expect(res.status).toBe(404);
		}),
		it('Sould return 404 if no genera with the giben id exists',async()=>{
			const id=mongoose.Types.ObjectId();
			const res= await request(server).get('/api/genres/'+id);
			expect(res.status).toBe(404);
		})
	}),
	describe('Post /',()=>{

		// DEFINE THE HAPPY PATH
		let token;
		let name;
		const exec =async()=>{
			return await request(server)
			.post('/api/genres')
			.set('x-auth-token',token)
			.send({name});
		}
		beforeEach(()=>{
			token=new User().generateAuthToken();
			name='genre1';
		})
		it('Sould return a 401 if client is not logged in',async()=>{
			token='';
			const res = await exec();
			expect(res.status).toBe(401);
		}),
		it('Sould return a 400 if genre is less than 5 characters',async()=>{
			name='1234';
			const res = await exec()
			expect(res.status).toBe(400);
		}),
		it('Sould return a 400 if genre is more than 50 characters',async()=>{
			name=new Array(52).join('a');
			const res = await exec();
			expect(res.status).toBe(400);
		}),
		it('Sould save the genre if it is valid(notNull)',async()=>{		
			 await exec();
			const genre =await Genre.find({name:'genre1'});
			expect(genre).not.toBeNull();
		}),
		it('Sould save the genre if it is valid',async()=>{		
			const res=await exec();
			const genre =await Genre.find({name:'genre1'});
			expect(res.body).toHaveProperty('_id');
			expect(res.body).toHaveProperty('name','genre1');

		})
	}),
	describe('Put /:id',()=>{

		// DEFINE THE HAPPY PATH
		let token;
		let newname;
		let genre;
		let id;
		const exec =async()=>{
			return await request(server)
			.put('/api/genres/'+id)
			.set('x-auth-token',token)
			.send({name:newname});
		}
		beforeEach(async()=>{
			genre= new Genre({name: 'genre1'});
			await genre.save();
			token=new User().generateAuthToken();
			id=genre._id;
			newname='updatedName';
		})
		it('Should return a 401 if client is not logged in',async()=>{
			token='';
			const res = await exec();
			expect(res.status).toBe(401);
		}),
		it('Should return a 400 if genre is less than 5 characters',async()=>{
			newname='1234';
			const res = await exec()
			expect(res.status).toBe(400);
		}),
		it('Should return a 400 if genre is more than 50 characters',async()=>{
			newname=new Array(52).join('a');
			const res = await exec();
			expect(res.status).toBe(400);
		}),
		it('Should return 404 if id is invalid',async()=>{		
			id=1;
			const res= await exec();
			expect(res.status).toBe(404);
		}),
		it('Should return 404 if genre with the given id was not found',async()=>{		
			id=mongoose.Types.ObjectId();
			const res=await exec();
			expect(res.status).toBe(404);
		}),
		it('Should update the genre if the input is valid',async()=>{		
			const res= await exec();
			const updatedGenre=await Genre.findById(genre._id);
			expect(updatedGenre.name).toBe(newname);
		}),
		it('Should return the updated genre if it is valid',async()=>{		
			const res= await exec();
			expect(res.body).toHaveProperty('_id');
			expect(res.body).toHaveProperty('name',newname);
		})
	}),
	describe('Delete /',()=>{

		// DEFINE THE HAPPY PATH
		let token;
		let genre;
		let id;
		const exec =async()=>{
			return await request(server)
			.delete('/api/genres/'+id)
			.set('x-auth-token',token)
			.send();
		}
		beforeEach(async()=>{
			genre =new Genre({name:'genre1'});
			await genre.save();

			id=genre.id;
			token=new User({isAdmin:true}).generateAuthToken();
		})

		it('Sould return a 401 if client is not logged in',async()=>{
			token='';
			const res = await exec();
			expect(res.status).toBe(401);
		}),
		it('Should return a 403 if user is not admin',async()=>{
			token =new User({isAdmin:false}).generateAuthToken();
			const res = await exec();
			expect(res.status).toBe(403);
		}),
		it('Should return a 404 id is invalid',async()=>{
			id=1
			const res = await exec();
			expect(res.status).toBe(404);
		}),
		it('Should return a 404 if genre does not exists',async()=>{
			id=mongoose.Types.ObjectId();
			const res = await exec();
			expect(res.status).toBe(404);
		}),
		it('Sould delete the genre if it is valid',async()=>{		
			const res=await exec();
			const genre =await Genre.findById(id);
			expect(genre).toBeNull;
		}),
		it('Should return the removed genre',async()=>{
			const res = await exec();

			expect(res.body).toHaveProperty('_id', genre._id.toHexString());
      		expect(res.body).toHaveProperty('name', genre.name);
		})
		
	})
})