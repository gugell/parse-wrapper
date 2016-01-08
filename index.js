var Parse = require('parse/node');

// Error message
var ERR_GET = 'Error retrieving data.';
var ERR_EXIST = 'Object(s) do(es) not exist.';
var ERR_DEL = 'Error deleting object(s).';
var ERR_SAVE = 'Error saving object.';
var ERR_COUNT = 'Error counting object.';
var ERR_UPDATE = 'Error updating object.';

var processData = function(item) {
	var copy = {};
	for(var key in item.attributes)
		copy[key] = item.attributes[key];
	copy.id = item.id;
	return copy;
};

var getObject = function(query, getOne, callback) {
	var sendQuery = getOne ? query.first : query.find;
	sendQuery.call(query, {
		success: function(data) {
			if (data)
				callback(null, data);
			else
				callback(ERR_EXIST);
		},
		error: function(err) {
			callback(ERR_GET);
		}
	});
};

exports.initialize = function(settings) {
	Parse.initialize(settings.appKey, settings.jsKey);
};

exports.getAll = function(classToGet, callback) {
	var Target = Parse.Object.extend(classToGet);
	var query = new Parse.Query(Target);
	getObject(query, false, function(err, data) {
		if (err) callback(err);
		else {
			data = data.map(function(item) {
				return processData(item);
			});
			callback(null, data);
		}
	});
};

exports.getSome = function(classToGet, conditions, callback) {
	var Target = Parse.Object.extend(classToGet);
	var query = new Parse.Query(Target);
	for (var i in conditions)
		query.equalTo(i, conditions[i]);

	getObject(query, false, function(err, data) {
		if (err) callback(err);
		else {
			data = data.map(function(item) {
				return processData(item);
			});
			callback(null, data);
		}
	});
};

exports.getOne = function(classToGet, conditions, callback) {
	var Target = Parse.Object.extend(classToGet);
	var query = new Parse.Query(Target);
	for (var i in conditions)
		query.equalTo(i, conditions[i]);

	getObject(query, true, function(err, item) {
		if (err) callback(err);
		else
			callback(null, processData(item));
	});
};

exports.getOneByID = function(classToGet, id, callback) {
	var Target = Parse.Object.extend(classToGet);
	var query = new Parse.Query(Target);
	query.equalTo('objectId', id);

	getObject(query, true, function(err, item) {
		if (err) callback(err);
		else
			callback(null, processData(item));
	});
};

exports.deleteOneByID = function(classToDelete, id, callback) {
	var Target = Parse.Object.extend(classToDelete);
	var query = new Parse.Query(Target);
	query.equalTo('objectId', id);

	getObject(query, true, function(err, item) {
		if (err) callback(err);
		else
			item.destroy({
				success: function() {
					callback(null);
				},
				error: function() {
					callback(ERR_DEL);
				}
			});
	});
};

exports.updateOneByID = function(classToUpdate, id, obj, callback) {
	var Target = Parse.Object.extend(classToUpdate);
	var query = new Parse.Query(Target);
	query.equalTo('objectId', id);

	getObject(query, true, function(err, item) {
		if (err) callback(err);
		else
			item.save(obj, {
				success: function() {
					callback(null);
				},
				error: function() {
					callback(ERR_UPDATE);
				}
			});
	});
};

exports.save = function(classToSave, obj, callback) {
	var Target = Parse.Object.extend(classToSave);
	var target = new Target();

	target.save(obj, {
		success: function(Target) {
			callback(null, Target.id);
		},
		error: function(Target, err) {
			callback(ERR_SAVE);
		}
	});
};

exports.countSome = function(classToGet, conditions, callback) {
	var Target = Parse.Object.extend(classToGet);
	var query = new Parse.Query(Target);

	for (var i in conditions)
		query.equalTo(i, conditions[i]);

	query.count({
		success: function(count) {
			callback(null, count);
		},
		error: function(err) {
			callback('Parse error.');
		}
	});
};
