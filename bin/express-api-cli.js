/**
 *Created by mayomi.ayandiran on 11/14/17
 */
const program = require('commander');
const mkdirp = require('mkdirp');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const sortedObject = require('sorted-object');


const MODE_0666 = parseInt('0666', 8);
const MODE_0755 = parseInt('0755', 8);

const _exit = process.exit;
const pkg = require('../package.json');

const version = pkg.version;

// Re-assign process.exit because of commander
// TODO: Switch to a different command framework
process.exit = exit;

// CLI

around(program, 'optionMissingArgument', function (fn, args) {
    program.outputHelp();
    fn.apply(this, args);
    return { args: [], unknown: [] }
});

before(program, 'outputHelp', function () {
    // track if help was shown for unknown option
    this._helpShown = true
});

before(program, 'unknownOption', function () {
    // allow unknown options if help was shown, to prevent trailing error
    this._allowUnknownOption = this._helpShown;

    // show help if not yet shown
    if (!this._helpShown) {
        program.outputHelp()
    }
});

program
    .name('express')
    .version(version, '    --version')
    .usage('[options] [dir]')
    .option('-f, --force', 'force on non-empty directory')
    .parse(process.argv)

if (!exit.exited) {
    main()
}

/**
 * Install an around function; AOP.
 */

function around (obj, method, fn) {
    let old = obj[method];

    obj[method] = function () {
        let args = new Array(arguments.length)
        for (let i = 0; i < args.length; i++) args[i] = arguments[i]
        return fn.call(this, old, args)
    }
}

/**
 * Install a before function; AOP.
 */

function before (obj, method, fn) {
    let old = obj[method];

    obj[method] = function () {
        fn.call(this);
        old.apply(this, arguments)
    }
}

/**
 * Prompt for confirmation on STDOUT/STDIN
 */

function confirm (msg, callback) {
    let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question(msg, function (input) {
        rl.close();
        callback(/^y|yes|ok|true$/i.test(input))
    })
}

/**
 * Copy file from template directory.
 */

function copyTemplate (from, to) {
    from = path.join(__dirname, '..', 'templates', from);
    write(to, fs.readFileSync(from, 'utf-8'))
}

/**
 * Create application at the given directory `path`.
 *
 * @param {String} path
 */

function createApplication (name, path) {
    let wait = 5;

    console.log();
    function complete () {
        if (--wait) return
        let prompt = launchedFromCmd() ? '>' : '$';

        console.log();
        console.log('   install dependencies:');
        console.log('     %s cd %s && npm install', prompt, path);
        console.log();
        console.log('   run the app:');

        if (launchedFromCmd()) {
            console.log('     %s SET DEBUG=%s:* & npm start', prompt, name)
        } else {
            console.log('     %s DEBUG=%s:* npm start', prompt, name)
        }

        console.log()
    }

    // JavaScript
    let app = loadTemplate('js/app.js');
    let www = loadTemplate('js/www');

    // App name
    www.locals.name = name;

    // App modules
    app.locals.modules = Object.create(null);
    app.locals.uses = [];

    mkdir(path, function () {
        mkdir(path + '/controllers', function () {
            copyTemplate('js/controllers/home.js', path + '/controllers/home.js');
            complete()
        });

        mkdir(path + '/config', function () {
            copyTemplate('js/config/main.js', path + 'config/main.js');
            complete()
        });

        mkdir(path + '/models', function () {
            copyTemplate('js/models/home.js', path + 'models/home.js');
            complete()
        });


        // package.json
        let pkg = {
            name: name,
            version: '0.0.0',
            private: true,
            scripts: {
                start: 'node ./bin/www'
            },
            dependencies: {
                'body-parser': '~1.18.2',
                'cookie-parser': '~1.4.3',
                'debug': '~2.6.9',
                'express': '~4.15.5',
                'morgan': '~1.9.0',
                'serve-favicon': '~2.4.5'
            }
        };

        // sort dependencies like npm(1)
        pkg.dependencies = sortedObject(pkg.dependencies);

        // write files
        write(path + '/package.json', JSON.stringify(pkg, null, 2) + '\n')
        write(path + '/app.js', app.render())
        mkdir(path + '/bin', function () {
            write(path + '/bin/www', www.render(), MODE_0755);
            complete()
        });

        if (program.git) {
            copyTemplate('js/gitignore', path + '/.gitignore')
        }

        complete()
    });
}

/**
 * Create an app name from a directory path, fitting npm naming requirements.
 *
 * @param {String} pathName
 */

function createAppName (pathName) {
    return path.basename(pathName)
        .replace(/[^A-Za-z0-9.()!~*'-]+/g, '-')
        .replace(/^[-_.]+|-+$/g, '')
        .toLowerCase()
}

/**
 * Check if the given directory `path` is empty.
 *
 * @param {String} path
 * @param {Function} fn
 */

function emptyDirectory (path, fn) {
    fs.readdir(path, function (err, files) {
        if (err && err.code !== 'ENOENT') throw err
        fn(!files || !files.length)
    })
}

/**
 * Graceful exit for async STDIO
 */

function exit (code) {
    // flush output for Node.js Windows pipe bug
    // https://github.com/joyent/node/issues/6247 is just one bug example
    // https://github.com/visionmedia/mocha/issues/333 has a good discussion
    function done () {
        if (!(draining--)) _exit(code)
    }

    var draining = 0
    var streams = [process.stdout, process.stderr]

    exit.exited = true

    streams.forEach(function (stream) {
        // submit empty write request and wait for completion
        draining += 1;
        stream.write('', done)
    });

    done()
}

/**
 * Determine if launched from cmd.exe
 */
function launchedFromCmd () {
    return process.platform === 'win32' &&
        process.env._ === undefined
}

/**
 * Main program.
 */

function main () {
    // Path
    let destinationPath = program.args.shift() || '.';

    // App name
    let appName = createAppName(path.resolve(destinationPath)) || 'hello-world';

    // Default view engine
    if (program.view === undefined) {
        warning('the default view engine will not be jade in future releases\n' +
            "use `--view=jade' or `--help' for additional options")
        program.view = 'jade'
    }

    // Generate application
    emptyDirectory(destinationPath, function (empty) {
        if (empty || program.force) {
            createApplication(appName, destinationPath)
        } else {
            confirm('destination is not empty, continue? [y/N] ', function (ok) {
                if (ok) {
                    process.stdin.destroy()
                    createApplication(appName, destinationPath)
                } else {
                    console.error('aborting')
                    exit(1)
                }
            })
        }
    })
}

/**
 * Mkdir -p.
 *
 * @param {String} path
 * @param {Function} fn
 */

function mkdir (path, fn) {
    mkdirp(path, MODE_0755, function (err) {
        if (err) throw err
        console.log('   \x1b[36mcreate\x1b[0m : ' + path)
        fn && fn()
    })
}

/**
 * Display a warning similar to how errors are displayed by commander.
 *
 * @param {String} message
 */

function warning (message) {
    console.error()
    message.split('\n').forEach(function (line) {
        console.error('  warning: %s', line)
    })
    console.error()
}

/**
 * echo str > path.
 *
 * @param {String} path
 * @param {String} str
 */

function write (path, str, mode) {
    fs.writeFileSync(path, str, { mode: mode || MODE_0666 })
    console.log('   \x1b[36mcreate\x1b[0m : ' + path)
}




