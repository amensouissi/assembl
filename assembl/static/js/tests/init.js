requirejs.config({
  baseUrl: "/static/js/",
  urlArgs: urlArgs,
  waitSeconds: 20,
  packages: [
    'text',{
      name:'text',
      location:'lib/',
      main:'text'
    }
  ],
  paths: {
    'app': 'app/app',
    'router': 'app/router',
    'views':'app/views',
    'models':'app/models',
    'i18n': 'app/utils/i18n',
    'socket': 'app/utils/socket',
    'types': 'app/utils/types',
    'permissions': 'app/utils/permissions',

    'jquery': "bower/jquery/jquery",
    'tipsy': 'bower/tipsy/src/javascripts/jquery.tipsy',
    'jquery-highlight': 'lib/jquery-highlight/jquery.highlight',

    'backbone': 'bower/backbone/backbone',
    'underscore': 'bower/underscore/underscore-min',

    'annotator': 'lib/annotator/annotator-full.min',

    'jasmine': 'bower/jasmine/lib/jasmine-core/jasmine',
    'jasmine-html': 'bower/jasmine/lib/jasmine-core/jasmine-html',
    'jasmine-jquery': 'bower/jasmine-jquery/lib/jasmine-jquery',

    'ckeditor': 'bower/ckeditor/ckeditor',
    'ckeditor-sharedspace': 'lib/ckeditor-sharedcontainer/plugin',

    'moment': 'bower/momentjs/moment',
    'moment_lang': 'bower/momentjs/lang/'+((assembl_locale=='en')?'fr':assembl_locale),
    'zeroclipboard': 'bower/zeroclipboard/ZeroClipboard',
    'sockjs': 'bower/sockjs/sockjs',
    'cytoscape': 'bower/cytoscape/cytoscape',
    'jit': 'bower/jit/Jit/jit',
    'sprintf': 'bower/sprintf/src/sprintf',
    'backboneModal':'lib/backbone-modal/backbone.modal'
  },
  shim: {
    backbone: {
        deps: ['underscore', 'jquery'],
        exports: 'Backbone'
    },
    'underscore': {
        exports: '_'
    },
    'jquery': {
        exports: 'jQuery'
    },
    'jquery-highlight': {
        deps: ['jquery'],
        exports: 'jQuery'
    },
    'app': {
        deps: ['annotator', 'ckeditor', 'tipsy', 'i18n', 'jquery-highlight', 'zeroclipboard'],
        exports: 'app'
    },
    'i18n': {
        exports: 'i18n',
        init: function(i18n) {
            this.i18n(json);
            return this.i18n;
        }
    },
    'socket': {
        deps: ['sockjs']
    },
    'jasmine': {
        exports: 'jasmine'
    },
    'jasmine-html': {
        deps: ['jasmine'],
        exports: 'jasmine-html'
    },
    'ckeditor': {
        exports: 'CKEDITOR'
    },
    'ckeditor-sharedspace': {
        deps: ['ckeditor'],
        exports: 'CKEDITOR'
    },
    'tipsy': {
        deps: ['jquery']
    },
    'zeroclipboard' : {
        exports: 'ZeroClipboard'
    },
    'sockjs': {
        deps: ['jquery'],
        exports: 'SockJS'
    },
    'cytoscape': {
        deps: ['jquery'],
        exports: 'cytoscape'
    },
    'jit': {
        deps: [],
        exports: '$jit'
    },
    'annotator' : {
        deps: ['jquery'],
        exports: 'Annotator'
    },
    'sprintf' : {
        deps: [],
        exports: 'sprintf'
    },
    'moment_lang': {
        deps: ['moment'],
        exports: 'moment_lang'
    },
    'backboneModal': {
        deps:['backbone'],
        exports: 'BackboneModal'
    }
  }
});

require(['jquery'], function($){
    var jasmineEnv = jasmine.getEnv();
    jasmineEnv.updateInterval = 1000;

    // jasmineEnv.specFilter = function(spec) {
    //     return htmlReporter.specFilter(spec);
    // };

    var specs = [
        'tests/test_app',
        'tests/test_ideaView',
        'tests/test_ideaPanelView',
        'tests/test_ideaList',
        'tests/test_ideaModel',
        'tests/test_lateralMenu',
        'tests/test_segmentList'
    ];

    $(function(){
        requirejs(specs, function(){
            $('#wrapper').hide();

            jasmineEnv.execute();
        });
    });

});
