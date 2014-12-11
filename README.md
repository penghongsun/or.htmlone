# grunt-contrib-htmlone @0.0.9

> Combo js|css to html

if you use `gulp`, there is also a gulp-plugin [`gulp-htmlone`](https://www.npmjs.org/package/gulp-htmlone)

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-contrib-htmlone --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-contrib-htmlone');
```

## The "htmlone" task

### Overview
In your project's Gruntfile, add a section named `htmlone` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  htmlone: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
});
```

### Options

#### options.keyattr
Type: `String`
Default value: `'data-htmlone'`

A string value that is used to assign which script tag|css link tag to be replaced by real content.

#### options.cssminify
Type: `Bool`
Default value: `true`

A bool value that is used to assign minify css or not.

#### options.jsminify
Type: `Bool`
Default value: `true`

A bool value that is used to assign minify js or not.

### Usage Examples


```js
grunt.initConfig({
  htmlone: {
    options: {},
    files: {
      'dest/index.html': ['src/index.html'],
    },
  },
});
```

#### Custom Options


```js
grunt.initConfig({
  htmlone: {
    options: {
      keyattr: 'data-custom',
      jsminify: false,
      cssminify: false
    },
    files: [
        {
            cwd: './',
            src: ['*.html', '*.htm'],
            dest: 'dest/',
            ext: '.html'
        }
    ]
  },
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).


## MTB 特色

- 支持cdn combo 的url parse 和下载 比如 `http://xxx.tbcdn.cn/mtb/??a.js,b.js`
- 选择性配置是否需要combo到html
- dynamic 路径匹配
- 自动下载http连接的css 和 js
- 支持自动压缩所有css 和 js 然后再combo


## Release History

+ 0.0.5
+ 0.0.6
  - 修复jsstring自动encode导致js不能正常解析的问题
+ 0.0.7
  - 修复js和css必须都有文件引入才能正常执行的问题
  - 修复多个html同时执行只处理第一个的问题
+ 0.0.9
  - 修复 windows `mkdirp` 错误
