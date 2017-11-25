# Express Api generator [![NPM Version](http://img.shields.io/npm/v/create-express-api-mvc.svg?style=flat)](https://www.npmjs.com/package/create-express-api-mvc)
[![NPM Downloads](https://img.shields.io/npm/dm/create-express-api-mvc.svg?style=flat)](https://www.npmjs.com/package/create-express-api-mvc)


## Installation

```sh
$ npm install -g create-express-api-mvc -g 
```

#### After installation you can then write your project by doing `express-api your-project-name` 😄


#### For example, the following creates an Express app named myapp in the current working directory:


### express-api myapp:

```bash
$ express-api myapp

   create : myapp
   create : myapp/package.json
   create : myapp/app.js
   create : myapp/controllers/
   create : myapp/controllers/home.js
   create : myapp/config/
   create : myapp/config/main.js
   create : myapp/models/
   create : myapp/models/main.js
   create : myapp/
   create : myapp/app.js
   create : myapp/
   create : myapp/router.js
   ```
## Install dependencies:  
```bash
$ cd myapp && npm install

```

#Important Settings
   1) Open your config/main.js , Please configure your mongo db.(if you don't there will be error)


###File Structure

```bash
$ express-api myapp


myapp
|
|
|____controller
|      |____home.js
|      
|     
|____config
|     |
|     |____main.js
|
|____node_modules
|
|
|____models
|    |__main.js
|
|
|
|    
|____router.js 
|
|
|
|_____app.js
|
|
|
|_____package.json

 ```
 
 
 ### Credits
 
 Inspired by https://github.com/expressjs/generator
 
 ### License 
 create-express-api-mvc is under MIT license - http://www.opensource.org/licenses/mit-license.php