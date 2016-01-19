var Parse = require('parse/node');

// Error message
var ERR_GET = 'Error retrieving data.';
var ERR_EXIST = 'Object(s) do(es) not exist.';
var ERR_DEL = 'Error deleting object(s).';
var ERR_SAVE = 'Error saving object.';
var ERR_COUNT = 'Error counting object.';
var ERR_UPDATE = 'Error updating object.';
var ERR_COUNT = 'Error counting object.';

var processData = function(item) {
	var copy = {};
	for(var key in item.attributes)
		copy[key] = item.attributes[key];
	copy.id = item.id;
	return copy;
};

var getObject = function(query, getOne) {
	var sendQuery = getOne? query.first: query.find;
	return new Promise((resolve, reject) => {
		sendQuery.call(query, {
			success: data => {
				if (data)
					resolve(data);
				else
					reject(ERR_EXIST);
			},
			error: err => {
				reject(ERR_GET);
			}
		});
	});
};

exports.initialize = function(settings) {
	Parse.initialize(settings.appKey, settings.jsKey);
};

exports.getAll = function(classToGet) {
	return new Promise((resolve, reject) => {
		var Target = Parse.Object.extend(classToGet);
		var query = new Parse.Query(Target);
		getObject(query, false)
			.then(data => {
				data = data.map(item => processData(item));
				resolve(data);
			})
			.catch(reject);
	});
};

exports.getSome = function(classToGet, conditions) {
	return new Promise((resolve, reject) => {
		var Target = Parse.Object.extend(classToGet);
		var query = new Parse.Query(Target);
		for (var i in conditions)
			query.equalTo(i, conditions[i]);

		getObject(query, false)
			.then(data => {
				data = data.map(item => processData(item));
				resolve(data);
			})
			.catch(reject);
	});
};

exports.getOne = function(classToGet, conditions) {
	return new Promise((resolve, reject) => {
		var Target = Parse.Object.extend(classToGet);
		var query = new Parse.Query(Target);
		for (var i in conditions)
			query.equalTo(i, conditions[i]);

		getObject(query, true)
			.then(data => {
				data = processData(data);
				resolve(data);
			})
			.catch(reject);
	});
};

exports.getOneByID = function(classToGet, id) {
	return new Promise((resolve, reject) => {
		var Target = Parse.Object.extend(classToGet);
		var query = new Parse.Query(Target);
		query.equalTo('objectId', id);

		getObject(query, true)
			.then(data => {
				data = processData(data);
				resolve(data);
			})
			.catch(reject);
	});
};

exports.deleteOneByID = function(classToDelete, id) {
	return new Promise((resolve, reject) => {
		var Target = Parse.Object.extend(classToDelete);
		var query = new Parse.Query(Target);
		query.equalTo('objectId', id);

		getObject(query, true)
			.then(data => {
				data.destroy({
					success: () => {
						resolve();
					},
					error: () => {
						reject(ERR_DEL);
					}
				});
			})
			.catch(reject);
	});
};

exports.save = function(classToSave, obj) {
	return new Promise((resolve, reject) => {
		var Target = Parse.Object.extend(classToSave);
		var target = new Target();

		target.save(obj, {
			success: target => {
				resolve(target.id);
			},
			error: (target, err) => {
				reject(ERR_SAVE);
			}
		});
	});
};

exports.updateOneByID = function(classToUpdate, id, obj) {
	return new Promise((resolve, reject) => {
		var Target = Parse.Object.extend(classToUpdate);
		var query = new Parse.Query(Target);
		query.equalTo('objectId', id);

		getObject(query, true)
			.then(data => {
				for(var key in obj)
					data.set(key, obj[key]);
				data.save({
					success: () => { resolve(); },
					error: err => {
						reject(ERR_EXIST);
					}
				});
			})
			.catch(reject);
	});
};

exports.countSome = function(classToGet, conditions) {
	return new Promise((resolve, reject) => {
		var Target = Parse.Object.extend(classToGet);
		var query = new Parse.Query(Target);

		for (var i in conditions)
			query.equalTo(i, conditions[i]);

		query.count({
			success: count => {
				resolve(count);
			},
			error: err => {
				reject(ERR_COUNT);
			}
		});
	});
};
