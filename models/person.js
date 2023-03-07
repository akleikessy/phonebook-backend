const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const url = process.env.MONGODB_URL;
console.log('connecting to MONGODB');

mongoose.connect(url)
  .then((result) => {
    console.log('connected to MONGODB ');
  })
  .catch((err) => {
    console.log('error connecting to MongoDB ', err.message);
  });

const personSchema = mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    minLength: 8,
    required: [true, 'Phone number required!'],
    validate: {
      validator: function (v) {
        return /\d{4}-\d{6}/.test(v);
      },
      message: (props) => `${props.value} Not a valid phone number!`,
    },
  },
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Person', personSchema);
