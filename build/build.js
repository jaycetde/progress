

/**
 * hasOwnProperty.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);
  var index = path + '/index.js';

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (has.call(require.modules, path)) return path;
  }

  if (has.call(require.aliases, index)) {
    return require.aliases[index];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!has.call(require.modules, from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return has.call(require.modules, localRequire.resolve(path));
  };

  return localRequire;
};
require.register("jb55-has-class/index.js", Function("exports, require, module",
"/* credits to jQuery for this one */\n\nvar rclass = /[\\t\\r\\n]/g;\n\nfunction space(s) {\n  return \" \" + s + \" \";\n}\n\nmodule.exports = function hasClass(el, selector){\n  var className = space(selector);\n\n  if (el.nodeType === 1 && space(el.className).replace(rclass, \" \").indexOf(className) >= 0)\n    return true;\n\n  return false;\n};\n//@ sourceURL=jb55-has-class/index.js"
));
require.register("component-to-function/index.js", Function("exports, require, module",
"\n/**\n * Expose `toFunction()`.\n */\n\nmodule.exports = toFunction;\n\n/**\n * Convert `obj` to a `Function`.\n *\n * @param {Mixed} obj\n * @return {Function}\n * @api private\n */\n\nfunction toFunction(obj) {\n  switch ({}.toString.call(obj)) {\n    case '[object Object]':\n      return objectToFunction(obj);\n    case '[object Function]':\n      return obj;\n    case '[object String]':\n      return stringToFunction(obj);\n    case '[object RegExp]':\n      return regexpToFunction(obj);\n    default:\n      return defaultToFunction(obj);\n  }\n}\n\n/**\n * Default to strict equality.\n *\n * @param {Mixed} val\n * @return {Function}\n * @api private\n */\n\nfunction defaultToFunction(val) {\n  return function(obj){\n    return val === obj;\n  }\n}\n\n/**\n * Convert `re` to a function.\n *\n * @param {RegExp} re\n * @return {Function}\n * @api private\n */\n\nfunction regexpToFunction(re) {\n  return function(obj){\n    return re.test(obj);\n  }\n}\n\n/**\n * Convert property `str` to a function.\n *\n * @param {String} str\n * @return {Function}\n * @api private\n */\n\nfunction stringToFunction(str) {\n  // immediate such as \"> 20\"\n  if (/^ *\\W+/.test(str)) return new Function('_', 'return _ ' + str);\n\n  // properties such as \"name.first\" or \"age > 18\"\n  return new Function('_', 'return _.' + str);\n}\n\n/**\n * Convert `object` to a function.\n *\n * @param {Object} object\n * @return {Function}\n * @api private\n */\n\nfunction objectToFunction(obj) {\n  var match = {}\n  for (var key in obj) {\n    match[key] = typeof obj[key] === 'string'\n      ? defaultToFunction(obj[key])\n      : toFunction(obj[key])\n  }\n  return function(val){\n    if (typeof val !== 'object') return false;\n    for (var key in match) {\n      if (!(key in val)) return false;\n      if (!match[key](val[key])) return false;\n    }\n    return true;\n  }\n}\n//@ sourceURL=component-to-function/index.js"
));
require.register("component-map/index.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar toFunction = require('to-function');\n\n/**\n * Map the given `arr` with callback `fn(val, i)`.\n *\n * @param {Array} arr\n * @param {Function} fn\n * @return {Array}\n * @api public\n */\n\nmodule.exports = function(arr, fn){\n  var ret = [];\n  fn = toFunction(fn);\n  for (var i = 0; i < arr.length; ++i) {\n    ret.push(fn(arr[i], i));\n  }\n  return ret;\n};//@ sourceURL=component-map/index.js"
));
require.register("component-type/index.js", Function("exports, require, module",
"\n/**\n * toString ref.\n */\n\nvar toString = Object.prototype.toString;\n\n/**\n * Return the type of `val`.\n *\n * @param {Mixed} val\n * @return {String}\n * @api public\n */\n\nmodule.exports = function(val){\n  switch (toString.call(val)) {\n    case '[object Function]': return 'function';\n    case '[object Date]': return 'date';\n    case '[object RegExp]': return 'regexp';\n    case '[object Arguments]': return 'arguments';\n    case '[object Array]': return 'array';\n    case '[object String]': return 'string';\n  }\n\n  if (val === null) return 'null';\n  if (val === undefined) return 'undefined';\n  if (val && val.nodeType === 1) return 'element';\n  if (val === Object(val)) return 'object';\n\n  return typeof val;\n};\n//@ sourceURL=component-type/index.js"
));
require.register("component-each/index.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar type = require('type');\n\n/**\n * HOP reference.\n */\n\nvar has = Object.prototype.hasOwnProperty;\n\n/**\n * Iterate the given `obj` and invoke `fn(val, i)`.\n *\n * @param {String|Array|Object} obj\n * @param {Function} fn\n * @api public\n */\n\nmodule.exports = function(obj, fn){\n  switch (type(obj)) {\n    case 'array':\n      return array(obj, fn);\n    case 'object':\n      if ('number' == typeof obj.length) return array(obj, fn);\n      return object(obj, fn);\n    case 'string':\n      return string(obj, fn);\n  }\n};\n\n/**\n * Iterate string chars.\n *\n * @param {String} obj\n * @param {Function} fn\n * @api private\n */\n\nfunction string(obj, fn) {\n  for (var i = 0; i < obj.length; ++i) {\n    fn(obj.charAt(i), i);\n  }\n}\n\n/**\n * Iterate object keys.\n *\n * @param {Object} obj\n * @param {Function} fn\n * @api private\n */\n\nfunction object(obj, fn) {\n  for (var key in obj) {\n    if (has.call(obj, key)) {\n      fn(key, obj[key]);\n    }\n  }\n}\n\n/**\n * Iterate array-ish.\n *\n * @param {Array|Object} obj\n * @param {Function} fn\n * @api private\n */\n\nfunction array(obj, fn) {\n  for (var i = 0; i < obj.length; ++i) {\n    fn(obj[i], i);\n  }\n}//@ sourceURL=component-each/index.js"
));
require.register("progress/index.js", Function("exports, require, module",
"\nvar hasClass = require('has-class');\n\nmodule.exports = Progress;\n\nfunction Progress(el) {\n  if (!(this instanceof Progress)) return new Progress(el);\n\n  // we always want to adjust the width of the bar element...\n  this.el = hasClass(el, \"progress\")? el.querySelector(\"bar\") : el;\n}\n\nProgress.prototype.update = function(percent) {\n  this.el.style.width = percent + \"%\";\n};\n\n//@ sourceURL=progress/index.js"
));
require.alias("jb55-has-class/index.js", "progress/deps/has-class/index.js");
require.alias("jb55-has-class/index.js", "progress/deps/has-class/index.js");
require.alias("jb55-has-class/index.js", "jb55-has-class/index.js");

require.alias("component-map/index.js", "progress/deps/map/index.js");
require.alias("component-to-function/index.js", "component-map/deps/to-function/index.js");

require.alias("component-each/index.js", "progress/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("progress/index.js", "progress/index.js");

