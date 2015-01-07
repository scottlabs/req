// Patch for require to allow for relative requiring of Modules
// in the Casper / Phantom environment.
//

var _paths;

function getDirs(path) {
    var dirs = [path];
    var list = fs.list(path);
    for(var x = 0; x < list.length; x++){
        var file = path + list[x]; 
        if(list[x] !== '.' && list[x] !== '..' && fs.isDirectory(file)){
            dirs = dirs.concat(getDirs(path + list[x] + '/'));
        }
    }
    return dirs;
};

function newRequire() {
    if ( ! _paths && casper.cli.options.paths ) { 
        _paths = casper.cli.options.paths.split(','); 
    } 
    var paths = _paths.slice();
    var args = Array.prototype.slice.apply(arguments);

    var found;
    if ( args[0].indexOf('./') === 0 ) {
        // its a relative path to the file. There's gotta be
        // a more intelligent way to do this. Future refactor.
        while ( !found && paths.length) {
            var dirs = getDirs(paths.shift());
            while ( dirs.length && !found ) {
                var dir = dirs.shift();
                var path = dir + '/' + args[0];
                if ( fs.exists(path + '.js') ) {
                    found = true;
                    args[0] = path;
                }
            }
        }
    } else {
        while ( !found && paths.length) {
            var path = paths.shift() + args[0];
            if ( fs.exists(path+'.js') ) {
                args[0] = path;
            }
        } 
    }
    return require.apply(require, args);
};

module.exports = newRequire;
