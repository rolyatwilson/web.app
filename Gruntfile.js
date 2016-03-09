var webpack = require('webpack');
module.exports = function (grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),
        less: {
            main: {
                options: {
                    strictMath: false,
                    sourceMap: true,
                    outputSourceFiles: false,
                    sourceMapURL: 'app.css.map',
                    sourceMapFilename: 'app/assets/styles/app.css.map'
                },
                files: [{
                    'app/assets/styles/app.css': 'app/assets/styles/app.less'
                }]
            }
        },
        "webpack":{
            bundle: {
                entry: "./app.ts",
                progress:true,
                output: {
                    filename: 'bundle.js'
                },
                devtool: 'source-map',
                resolve: {
                    extensions: ['','webpack.js','.web.js','.js','.ts']
                },
                module: {
                    loaders: [
                        {test: /\.ts/, loader: 'ts-loader'}
                    ]
                }
            },
            prod: {
                entry: "./app.ts",
                progress:true,
                output: {
                    filename: 'bundle.js'
                },
                resolve: {
                    extensions: ['','webpack.js','.web.js','.js','.ts']
                },
                module: {
                    loaders: [
                        {test: /\.ts/, loader: 'ts-loader'}
                    ]
                }
            },
            test: {
                entry: "./test.ts",
                progress:true,
                output: {
                    filename: 'bundle-test.js'
                },
                devtool: 'source-map',
                resolve: {
                    extensions: ['','webpack.js','.web.js','.js','.ts']
                },
                module: {
                    loaders: [
                        {test: /\.ts/, loader: 'ts-loader'}
                    ]
                }
            }

        },
        copy: {
            build: {
                files: [
                    {
                      nonull: true,
                        src: 'bundle.js',
                        dest: 'build/bundle.js'
                    },
                    {
                        nonull: true,
                        src: 'index.html',
                        dest: 'build/index.html'
                    },
                    {
                      src: 'app/**/*.html',
                        dest: 'build/'
                    },
                    {
                        src: 'app/**/*.css',
                        dest: 'build/'
                    },
                    {
                        src: ['app/**/*.jpeg','app/**/*.jpg','app/**/*.png'],
                        dest: 'build/'
                    },
                    {
                        src: 'app/assets/clusters/leaflet.markercluster-src.js',
                        dest: 'build/'
                    },
                    {
                        nonull: true,
                        src: 'app/assets/styles/app.min.css',
                        dest: 'build/app.min.css'
                    },
                    {
                        nonull:true,
                        dest: 'build',
                        expand: true,
                        src: [
                            'node_modules/leaflet.heat/dist/*',
                            'node_modules/ui-leaflet/dist/*',
                            'node_modules/angular-simple-logger/dist/*',
                            'node_modules/angular-nvd3/dist/*'
                        ]
                    }
                ]
            }
        },
        concat:{
            less:{
                src: 'app/assets/styles/**/*.less',
                dest: 'app/assets/styles/app.less'            }
        },
        cssmin: {
            app: {
                src: 'app/assets/styles/app.css',
                dest: 'app/assets/styles/app.min.css'
            }
        },
        clean: {
            local: ['app/assets/styles/app.*css','app/assets/styles/app.less'],
            all: ['build/**/*', 'build/*', 'app/assets/styles/app.*css','app/assets/styles/app.less'],
            build: []
        },
        tslint: {
            options: {
                configuration: 'tslintrules.json'
            },
            files: {
                src: ['app/**/*.ts']
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-webpack');
    grunt.loadNpmTasks('grunt-tslint');

    grunt.registerTask('build:prod', ['tslint', 'clean:all', 'concat:less','less','cssmin:app', 'webpack:prod','copy:build', 'clean:build']);
    grunt.registerTask('build:dev', ['tslint', 'clean:all', 'concat:less','less','cssmin:app', 'webpack:bundle','copy:build', 'clean:build']);
    grunt.registerTask('build:test', ['tslint', 'clean:local','concat:less','less','cssmin:app','webpack:test']);
    // Default task
    grunt.registerTask('default', ['clean:local', 'concat:less','less', 'cssmin:app','webpack:bundle']);
};
