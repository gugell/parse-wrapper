var Parse = require('parse/node');
var _ = require('lodash');

var processData = function(item) {
	var copy = {};
	for(var key in item.attributes)
		copy[key] = item.attributes[key];
	copy.id = item.id;
	return copy;
};

var getObject = function(query, getOne, token) {
	var sendQuery = getOne? query.first: query.find;
	return new Promise((resolve, reject) => {
		sendQuery.call(query, {
			sessionToken: token,
			success: (data, err) => {
				if (data)
					resolve(data);
				else
					reject(err);
			},
			error: err => {
				reject(err);
			}
		});
	});
};

exports.login = function(loginInfo) {
	return new Promise((resolve, reject) => {
		if (!loginInfo.username || !loginInfo.password)
			reject('Missing login information');
		else {
			Parse.User.logIn(loginInfo.username, loginInfo.password, {
				success: function(user, err) {
					resolve(user.getSessionToken());
				},
				error: function(user, err) {
					console.error(err);
					reject(err);
				}
			});
		}
	});
};

exports.initialize = function(settings) {
	Parse.initialize(settings.appKey, settings.jsKey);
};

exports.countSome = function(classToGet, conditions, token) {
	return new Promise((resolve, reject) => {
		var Target = Parse.Object.extend(classToGet);
		var query = new Parse.Query(Target);

		for (var i in conditions)
			query.equalTo(i, conditions[i]);

		query.count({
			sessionToken: token,
			success: count => {
				resolve(count);
			},
			error: err => {
				reject(err);
			}
		});
	});
};

exports.countAll = function(classToGet, token) {
	return exports.countSome(classToGet, {}, token);
};

exports.getSome = function(classToGet, conditions, token) {

	var helperGetAll = function(classToGet, conditions, skip, token) {
		return new Promise((resolve, reject) => {
			var Target = Parse.Object.extend(classToGet);
			var query = new Parse.Query(Target);

			for (var i in conditions)
				query.equalTo(i, conditions[i]);

			query.skip(skip);
			getObject(query, false, token)
				.then(data => {
					data = data.map(item => processData(item));
					resolve(data);
				})
				.catch(reject);
		});
	};

	return new Promise((resolve, reject) => {
		var currentCount = 0;
		var promises = [], results = [];
		exports.countAll(classToGet, token)
			.then(count => {
				var p = helperGetAll(classToGet, conditions, currentCount, token);
				for (var i = 0; i < count; i += 100)
					promises.push(helperGetAll(classToGet, conditions, i, token));
				Promise.all(promises)
					.then(results => {
						if (results.length === 0)
							resolve([]);
						results = results.reduce((sum, a) => _.union(sum, a));
						resolve(results);
					})
					.catch(reject);
			})
			.catch(reject);
	});
};

exports.getAll = function(classToGet, token) {
	return exports.getSome(classToGet, {}, token);
};

exports.getOne = function(classToGet, conditions, token) {
	return new Promise((resolve, reject) => {
		var Target = Parse.Object.extend(classToGet);
		var query = new Parse.Query(Target);
		for (var i in conditions)
			query.equalTo(i, conditions[i]);

		getObject(query, true, token)
			.then(data => {
				data = processData(data);
				resolve(data);
			})
			.catch(reject);
	});
};

exports.getOneByID = function(classToGet, id, token) {
	return new Promise((resolve, reject) => {
		var Target = Parse.Object.extend(classToGet);
		var query = new Parse.Query(Target);
		query.equalTo('objectId', id);

		getObject(query, true, token)
			.then(data => {
				data = processData(data);
				resolve(data);
			})
			.catch(reject);
	});
};

exports.deleteOneByID = function(classToDelete, id, token) {
	return new Promise((resolve, reject) => {
		var Target = Parse.Object.extend(classToDelete);
		var query = new Parse.Query(Target);
		query.equalTo('objectId', id);

		getObject(query, true, token)
			.then(data => {
				data.destroy({
					sessionToken: token,
					success: () => {
						resolve();
					},
					error: err => {
						reject(err);
					}
				});
			})
			.catch(reject);
	});
};

exports.save = function(classToSave, obj, token) {
	return new Promise((resolve, reject) => {
		var Target = Parse.Object.extend(classToSave);
		var target = new Target();

		target.save(obj, {
			sessionToken: token,
			success: target => {
				resolve(target.id);
			},
			error: (target, err) => {
				reject(err);
			}
		});
	});
};

exports.updateOneByID = function(classToUpdate, id, obj, token) {
	return new Promise((resolve, reject) => {
		var Target = Parse.Object.extend(classToUpdate);
		var query = new Parse.Query(Target);
		query.equalTo('objectId', id);

		getObject(query, true, token)
			.then(data => {
				for(var key in obj)
					data.set(key, obj[key]);
				data.save({
					success: () => { resolve(); },
					error: err => {
						reject(err);
					}
				});
			})
			.catch(reject);
	});
};
