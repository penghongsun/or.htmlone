#!/usr/bin/env node
// -*- js -*-

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
var fsutil = require('./fsutil');
var url = require('url');
var http = require('http');


module.exports = function(grunt) {

  var dealScripts = function (htmlFrag, options, cb) {
      //console.log(htmlFrag, options);
      var $ = cheerio.load(htmlFrag);
      
      // deal js
      var todoJs = 0;
      var doneJs = 0;
      var todownloadCss = 0;
      var downloadedCss = 0;
      var isJsDone = false;
      var isCssDone = false;

      var __minifyAndReplace = function ($js, jscon) {
          if (options.jsminify) {
            jscon = uglify.minify(jscon, {
              fromString: true,
              mangle: true
            }).code;
          }
          $js.removeAttr(options.keyattr)
              .removeAttr('src')
              .html(jscon);
      };
      var __checkJsDone = function () {
          if (doneJs === js.length) {
              isJsDone = true;
              __checkAllDone();
          }
      };

      var __checkAllDone = function () {
        if (isJsDone && isCssDone) {
          cb && cb($.html());
        }
      };

      var js = $('script['+options.keyattr+']');
      js.each(function (i, el) {
          var $js = $(this);
          var src = $(this).attr('src');

          var oldCon = $(this).html();
          var newCon = '\n';
          if (grunt.file.isFile(src)) {
            newCon += grunt.file.read(src);
            __minifyAndReplace($js, newCon);
            doneJs ++;
            __checkJsDone();
          } else if (/^http/.test(src)) {
            //download & replace
            var destPath = path.join('temp', url.parse(src).pathname);

            fsutil.download(src, destPath, function ($js, destPath) {
              return function () {
                console.log('"'+destPath+'" downloaded!');
                __minifyAndReplace($js, grunt.file.read(destPath));
                doneJs ++;
                __checkJsDone();
              }
            }($js, destPath));
          }
      });

      // deal css
      var css = $('link['+options.keyattr+']');
      var _i = 0;
      var _checkCssDone = function () {
        if (_i === css.length) {
          isCssDone = true;
          __checkAllDone();
        }
      };
      var __cssMinifyAndReplace = function ($css, cssCon) {
          if (options.cssminify) {
              less.render(cssCon, {compress:true}, function (e, output) {
                  var style = $('<style>'+output+'</style>');
                  $css.replaceWith(style);
                  _i ++;
                  _checkCssDone();
              });
          } else {
            var style = $('<style>'+cssCon+'</style>');
            $css.replaceWith(style);
            _i ++;
            _checkCssDone();
          }
      };

      css.each(function (i, el) {
          var href = $(this).attr('href'); 
          var newCon = '\n';
          var me = this;
          var $css = $(this);
          if (grunt.file.isFile(href)) {
              newCon += (grunt.file.read(href) + '\n');
              __cssMinifyAndReplace($css, newCon);
          } else if (/^http/i.test(href)) { 
              var tempDestFile = path.join('temp', url.parse(href).pathname); 
              fsutil.download(href, tempDestFile, function ($css, tempDestFile) {
                return function () {
                    console.log('"'+tempDestFile+'" downloaded!');
                    __cssMinifyAndReplace($css, grunt.file.read(tempDestFile));
                }
              }($css, tempDestFile));
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

    var done = this.async();

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
          grunt.log.ok('>> One-Request File "' + destPath + '" created.');
          fsutil.rmdirSync('./temp/');
          grunt.log.ok('>> cleanup::temp dir "temp/" is removed!');
          done();
        });

      });
    });

  });

};
