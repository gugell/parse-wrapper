# parse-wrapper

## Introduction

This is a wrapper for Parse to simplifying codes for data retrieving and modifying from Parse.

Please be aware that this plugin is only meant to implement a minimal subset of features of Parse, that are sufficient to implement a simple application with Parse backend. Basically, only data retrieving and updating are supported. If you need more features of Parse, please use the [official SDK](https://www.npmjs.com/package/parse) instead.

Parse server is now supported.

## Syntax

### Initializing

#### Loading module

To load the plugin:
```
var parse = require('parse-wrapper');
```

#### .initialize(keyObject)

To initialize Parse with your own keys:
```
var keys = {
    appKey: 'fakeAppKey',
    jsKey: 'fakeJSKey',
    username: 'username',
    password: 'password'
};
parse.initialize(keys); // return a promise
```

#### .login(loginInfo)

To login:
```
parse.login({username: 'username', password: 'password'})
    .then(token => {
        parse.getAll('Test', token)
            .then(console.log);
    });
```
This function returns a promise with the session token.

### Retrieving data

#### .getAll(class, token)
To get all objects belonging to class ```Test```:
```
parse.getAll('Test', token)
    .then(console.log)
    .catch(console.error);
```
The ```token``` parameter is optional.

#### .getSome(class, condition, token)
To get all the objects matching some conditions (e.g. has attribute ```testing``` equal to ```true```) in class ```Test```:
```
parse.getSome('Test', {testing: true})
    .then(console.log)
    .catch(console.error);
```
The objects will be returned as an array.

#### .getOne(class, condition, token)
This is similar to ```.getSome()```, but only the first match will be returned.
```
parse.getOne('Test', {testing: true}, token)
    .then(console.log)
    .catch(console.error);
```

#### .getOneByID(class, id, token)
To get the object with id of ```1234``` from class ```Test```:
```
parse.getOneByID('Test', '1234', token)
    .then(console.log)
    .catch(console.error);
```

### Deleting data

#### .deleteOneByID(class, id, token)
To delete the object with id of ```1234``` from class ```Test```:
```
parse.deleteOneByID('Test', '1234', token)
    .then(() => {
        console.log('success!');
    })
    .catch(console.error);
```

### Updating data

#### .updateOneByID(class, id, newObject, token)
To replace the object with id of ```1234``` from class ```Test``` with object ```newObject```:
```
parse.updateOneByID('Test', '1234', newObject, token)
    .then(() => {
        console.log('success!');
    })
    .catch(console.error);
```

### Counting Objects

#### .countSome(class, condition, token)
This is similar to ```.getSome()```, but only the number of match(es) found will be returned.
```
parse.countSome('Test', {testing: true}, token)
    .then((count) => {
        console.log('count:', count);
    })
    .catch(console.error);
```

#### .countAll(class, token)
```
parse.countAll('Test', token)
    .then((count) => {
        console.log('count:', count);
    })
    .catch(console.error);
```

### Saving objects

### .save(class, obj, token)
To save a new object ```obj``` into class `'Test'`:
```
parse.save('Test', obj, token)
    .then(() => {
        console.log('successfully deleted!');
    })
    .catch(console.error);
```
