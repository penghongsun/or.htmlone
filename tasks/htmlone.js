/*
 * htmlone
 * https://github.com/amfe/or.htmlone
 *
 * Copyright (c) 2014 岑安
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');
var cheerio = require('cheerio');
var uglify = require('uglify-js');
var less = require('less');

module.exports = function(grunt) {

  var dealScripts = function (htmlFrag, options, cb) {
      //console.log(htmlFrag, options);
      var $ = cheerio.load(htmlFrag);
      
      // deal js
      var js = $('script['+options.keyattr+']');
      js.each(function (i, el) {
          var src = $(this).attr('src');
          var oldCon = $(this).html();
          var newCon = '\n';
          if (grunt.file.isFile(src)) {
            newCon += grunt.file.read(src);
          }
          newCon += (oldCon + '\n');

          //mimify
          if (options.jsminify) {
              newCon = uglify.minify(newCon, {
                fromString: true,
                mangle: true
              }).code;
          }

          $(this).removeAttr(options.keyattr).html(newCon);
          if (!/^http/.test(src)) {
              $(this).removeAttr('src');
          }
      });

      // deal css
      var css = $('link['+options.keyattr+']');
      var _i = 0;
      var _checkAllDone = function () {
        if (_i === css.length) {
          // cb() write file to dest/
          cb && cb($.html());
        }
      };
      css.each(function (i, el) {
          var href = $(this).attr('href');
          var newCon = '\n';
          var me = this;
          if (grunt.file.isFile(href)) {
            newCon += (grunt.file.read(href) + '\n');
          }

          if (options.cssminify) {
              less.render(newCon, {compress:true}, function (e, output) {
                  var style = $('<style>'+output+'</style>');
                  $(me).replaceWith(style);
                  _i ++;
                  _checkAllDone();
              });
          } else {
            var style = $('<style>'+newCon+'</style>');
            $(this).replaceWith(style);
            _i ++;
            _checkAllDone();
          }
      });
  };

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('htmlone', 'Combo js|css to html', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      keyattr: 'data-htmlone',
      cssminify: true,
      jsminify: true
    });

    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
      // Concat specified files.
      f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function(filepath) {
        // Read file source.
        var basename = path.basename(filepath);
        var destPath = f.dest + basename;
        var srcContent = grunt.file.read(filepath);


        dealScripts(srcContent, options, function (html) {
          grunt.file.write(destPath, html);
          grunt.log.ok('One-Request File "' + destPath + '" created.');
        });

      });


    });
  });

};
