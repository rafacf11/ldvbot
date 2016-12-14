//alumno.js
 mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var alumnoSchema = new Schema({
		num_lista: Number,
		nombre: String,
		apellido1: String,
		apellido2: String,
		ciclo: {
			type: String,
			enum: ['SMR', 'ASIR']
		},
		curso: Number,
		año: Number,
	});
	
	module.exports = mongoose.model('Alumno', alumnoSchema);