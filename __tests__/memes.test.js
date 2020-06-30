const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');

const Meme = require('../lib/models/Meme');

describe('memer-be routes', () => {
  beforeAll(async() => {
    const uri = await mongod.getUri();
    return connect(uri);
  });

  beforeEach(() => {
    return mongoose.connection.dropDatabase();
  });

  let memes = [];
  beforeEach(async() => {
    memes = await Meme
      .create([
        {
          top: 'THIS',
          image: 'https://i.imgur.com/f1xrc22.jpg',
          bottom: 'seems okay'
        },
        {
          top: 'Am I',
          image: 'https://i.imgur.com/f1xrc22.jpg',
          bottom: 'ON FIRE?'
        }
      ]);
  });

  afterAll(async() => {
    await mongoose.connection.close();
    return mongod.stop();
  });

  it('creates a meme via POST', () => {
    return request(app)
      .post('/api/v1/memes')
      .send({
        top: 'THIS',
        image: 'https://i.imgur.com/f1xrc22.jpg',
        bottom: 'seems okay'
      })
      .then(res => expect(res.body).toEqual({
        top: 'THIS',
        image: 'https://i.imgur.com/f1xrc22.jpg',
        bottom: 'seems okay',
        _id: expect.anything(),
        __v: 0
      }));
  });
  it('gets all memes via find', async() => {
    return request(app)
      .get('/api/v1/memes')
      .then(res => expect(res.body).toEqual([
        {
          top: 'THIS',
          image: 'https://i.imgur.com/f1xrc22.jpg',
          bottom: 'seems okay',
          _id: expect.anything(),
          __v: 0
        },
        {
          top: 'Am I',
          image: 'https://i.imgur.com/f1xrc22.jpg',
          bottom: 'ON FIRE?',
          _id: expect.anything(),
          __v: 0
        }
      ]));
  });

  it('can get a meme by id via findById', async() => {
    return request(app)
      .get(`/api/v1/memes/${memes[1]._id}`)
      .then(res => expect(res.body).toEqual(
        {
          top: 'Am I',
          image: 'https://i.imgur.com/f1xrc22.jpg',
          bottom: 'ON FIRE?',
          _id: expect.anything(),
          __v: 0
        }
      ));
  });
});
