var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var _fs = require('fs-extra');

module.exports = yeoman.Base.extend({
    initializing: function () {
        this.pkg = require('../package.json');
    },

    constructor: function () {
        yeoman.Base.apply(this, arguments);
    },

    prompting: function () {
        var done = this.async();

        // Have Yeoman greet the user.
        this.log(yosay(
            'Welcome to the ' + chalk.red('Yeoman Timwe Angular') + ' generator!'
        ));

        var prompts = [{
            type: 'input',
            name: 'appName',
            message: 'What is your app\'s name ?',
            default: this.appname
        },{
            type: 'confirm',
            name: 'ionic',
            message: 'Would you like to use Ionic Framework?',
            default: true
        }, {
            type: 'confirm',
            name: 'proxy',
            message: 'Would you like to set a PHP script with a proxy for further connection with the API?',
            default: true
        },{
            when: function(props){
                return props.proxy;
            },
            type: 'input',
            name: 'apiUrl',
            message: 'What\'s the pretended API URL to configure with the proxy?'
        },{
            when: function(props){
                return props.proxy;
            },
            type: 'confirm',
            name: 'appSettings',
            message: 'Would you like to create a settings javascript file to preload required data from the API? ' +
            chalk.red('Note: This will bootstrap Angular manually.'),
            default: true
        },{
            type: 'input',
            name: 'hostName',
            message: 'Please fill in your localhost or virtualhost path for further usage with browsersync:',
            default: 'http://localhost/'
        }];

        this.prompt(prompts, function (props) {
            this.props = props;

            this.context = {
                appName: (this.props.appName).split(' ').join('-'),
                ionic: this.props.ionic,
                proxy: this.props.proxy,
                apiUrl: this.props.apiUrl || null,
                appSettings: this.props.appSettings,
                hostName: this.props.hostName
            };

            done();
        }.bind(this));
    },

    writing: {
        app: function () {
            /**
             * /src
             */
            this.fs.copyTpl(
                this.templatePath('_index.html'),
                this.destinationPath('src/index.html'),
                this.context
            );

            if (this.context.proxy) {
                this.fs.copyTpl(
                    this.templatePath('_proxy.php'),
                    this.destinationPath('src/proxy.php'),
                    this.context
                );
            }
            /**
             * /src/app
             */
            if (this.context.appSettings) {
                this.fs.copy(
                    this.templatePath('_app/_app.settings.js'),
                    this.destinationPath('src/app/app.settings.js')
                );
            }
            this.fs.copyTpl(
                this.templatePath('_app/_app.module.js'),
                this.destinationPath('src/app/app.module.js'),
                this.context
            );
            /**
             * /src/app/core
             */
            this.fs.copyTpl(
                this.templatePath('_app/_core/_config.js'),
                this.destinationPath('src/app/core/config.js'),
                this.context
            );
            this.fs.copyTpl(
                this.templatePath('_app/_core/_core.module.js'),
                this.destinationPath('src/app/core/core.module.js'),
                this.context
            );
            this.fs.copy(
                this.templatePath('_app/_core/_dataService.js'),
                this.destinationPath('src/app/core/dataService.js')
            );
            /**
             * /src/app/feature
             */
            this.fs.copy(
                this.templatePath('_app/_feature/_feature.module.js'),
                this.destinationPath('src/app/feature/feature.module.js')
            );
            this.fs.copy(
                this.templatePath('_app/_feature/_feature.controller.js'),
                this.destinationPath('src/app/feature/feature.controller.js')
            );
            this.fs.copy(
                this.templatePath('_app/_feature/_feature.route.js'),
                this.destinationPath('src/app/feature/feature.route.js')
            );
            this.fs.copy(
                this.templatePath('_app/_feature/_feature.html'),
                this.destinationPath('src/app/feature/feature.html')
            );
            /**
             * /src/app/layout
             */
            this.fs.copy(
                this.templatePath('_app/_layout/_layout.module.js'),
                this.destinationPath('src/app/layout/layout.module.js')
            );
            this.fs.copy(
                this.templatePath('_app/_layout/_shell.route.js'),
                this.destinationPath('src/app/layout/shell.route.js')
            );
            this.fs.copy(
                this.templatePath('_app/_layout/_shell.controller.js'),
                this.destinationPath('src/app/layout/shell.controller.js')
            );
            this.fs.copyTpl(
                this.templatePath('_app/_layout/_shell.html'),
                this.destinationPath('src/app/layout/shell.html'),
                this.context
            );

            /**
             * /src/app/widgets
             */
            this.fs.copy(
                this.templatePath('_app/_widgets/_widgets.module.js'),
                this.destinationPath('src/app/widgets/widgets.module.js')
            );
            this.fs.copy(
                this.templatePath('_app/_widgets/someWidget/_someWidget.js'),
                this.destinationPath('src/app/widgets/someWidget/someWidget.js')
            );
            this.fs.copy(
                this.templatePath('_app/_widgets/someWidget/_someWidget.html'),
                this.destinationPath('src/app/widgets/someWidget/someWidget.html')
            );
            /**
             * /src/vendors
             */
            _fs.mkdirs('src/vendor');
            /**
             * /src/assets/sass
             */
            this.fs.copyTpl(
                this.templatePath('_assets/_sass/_main.scss'),
                this.destinationPath('src/assets/sass/main.scss'),
                this.context
            );
            _fs.mkdirs('src/assets/sass/features');
            _fs.mkdirs('src/assets/sass/globals');
            _fs.mkdirs('src/assets/sass/widgets');
        },
        projectfiles: function () {
            this.fs.copyTpl(
                this.templatePath('_package.json'),
                this.destinationPath('package.json'),
                this.context
            );
            this.fs.copyTpl(
                this.templatePath('_bower.json'),
                this.destinationPath('bower.json'),
                this.context
            );
            this.fs.copy(
                this.templatePath('_.editorconfig'),
                this.destinationPath('.editorconfig')
            );
            this.fs.copy(
                this.templatePath('_.jshintrc'),
                this.destinationPath('.jshintrc')
            );
            this.fs.copy(
                this.templatePath('_gulpfile.js'),
                this.destinationPath('gulpfile.js')
            );
            this.fs.copy(
                this.templatePath('_.bowerrc'),
                this.destinationPath('.bowerrc')
            );
            if (this.context.appSettings) {
                this.fs.copy(
                    this.templatePath('_defaults.settings.json'),
                    this.destinationPath('src/defaults.settings.json')
                );
            }
            this.fs.copyTpl(
                this.templatePath('_gulp.config.json'),
                this.destinationPath('gulp.config.json'),
                this.context
            );
        }
    },

    install: function () {
        this.installDependencies();
    },

    end: function() {
        if (this.props.appSettings) {
            this.log(yosay('The application was ' + chalk.green('builded with success! \n')) +
                chalk.yellow(' Note: ') +
                'You should check defaults.settings.json and app.settings.js to match your backend configuration.'
            );
            return;
        }
        this.log(yosay(
            'The application was ' + chalk.green('builded with success!')
        ));

        this.spawnCommand('gulp');
    }
});
