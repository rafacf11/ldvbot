module.exports = function(app) {

var Alumno = require('../model/alumno.js');

// GET
findAllAlumno = function(req, res) {
	Alumno.find(function(err, routes) {
		if(!err) {
			console.log('GET /routes')
			res.send(routes);

		} else {
		console.log('ERROR:' +err);
		}
	});
};

// GET
findByID = function(req, res) {
	Alumno.findByID(req.param.id, function(err, alumno) {
		if(!err) {
		console.log('GET /alumno/' + req.params.id);
		res.send(alumno);

		} else {
		console.log('ERROR:' +err);
	}
	});
};

// POST
addAlumno = function(req, res) {
	console.log('POST');
	console.log(req.body);

	var alumno = new Alumno({
		num_lista: 	req.body.num_lista,
		nombre: 	req.body.nombre,
		apellido1: 	req.body.apellido1,
		apellido2: 	req.body.apellido2,
		ciclo: 		req.body.ciclo,
		curso: 		req.body.curso,
		año: 		req.body.año
	});

	alumno.save(function(err) {
		if(!err) {
		console.log('Alumno save!');
		} else {
		console.log('ERROR:' +err);
	}
});

	res.send(alumno);
};

// PUT (Update)
updateAlumno = function(req, res) {
	Alumno.findByID(req.params.id, function(err, alumno) { 
		alumno.num_lista = req.body.num_lista;
		alumno.nombre 	= req.body.nombre;
		alumno.apellido1 = req.body.apellido1;
		alumno.apellido2 = req.body.apellido2;
		alumno.ciclo 	= req.body.ciclo;
		alumno.curso 	= req.body.curso;
		alumno.año 		= req.body.año;
		alumno.save(function(err) {
		if(!err) {
			console.log('Update alumno!');
		} else {
			console.log('ERROR:' +err);
		}
		res.send(alumno);
	});
});
}

// DELETE

deleteAlumno = function(req, res) {
	Alumno.findByID(req.params.id, function(err, alumno) {
		alumno.remove(function(err) {
			if(!err) {
				console.log('DElete alumno!');
			} else {
				console.log('ERROR:' +err);
			}
		})
	});
}

// API Routes
app.get('/alumno', findAllAlumno);
app.get('/alumno/:id', findByID);
app.post('/alumno', addAlumno);
app.put('/alumno/:id', updateAlumno);
app.delete('/alumno/:id', deleteAlumno);
}