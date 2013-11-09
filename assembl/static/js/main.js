define([
    "app",
    "jquery",
    "views/lateralMenu",
    "views/ideaList",
    "views/ideaPanel",
    "views/segmentList",
    "views/messageList",
    "views/synthesisPanel",
    "models/user",
    "models/segment"
], function(app, $, LateralMenu, IdeaList, IdeaPanel, SegmentList, MessageList, SynthesisPanel, User, Segment){
    'use strict';

    app.init();

    app.currentUser = new User.Model();
    app.currentUser.loadCurrentUser();

    // Lateral menu
    app.lateralMenu = new LateralMenu({el: '#lateralMenu'}).render();
    $('#assembl-mainbutton').on('click', app.lateralMenu.trigger.bind(app.lateralMenu, 'toggle'));
    app.currentUser.on('change', app.lateralMenu.render, app.lateralMenu);

    // Idea list
    app.ideaList = new IdeaList({el: '#idealist', button: '#button-ideaList'});
    app.openPanel(app.ideaList);

    // Segment List
    app.segmentList = new SegmentList({el: '#segmentlist', button: '#button-segmentList'});
    app.segmentList.segments.on('change reset', app.ideaList.render, app.ideaList);
    app.segmentList.segments.on('invalid', function(model, error){ alert(error); });
    //app.segmentList.segments.fetch({reset: true});

    // Idea panel
    app.ideaPanel = new IdeaPanel({el: '#ideaPanel', button: '#button-ideaPanel'}).render();
    app.segmentList.segments.on('change reset', app.ideaPanel.render, app.ideaPanel);

    // Message
    app.messageList = new MessageList({el: '#messagelist', button: '#button-messages'}).render();
    app.messageList.loadData();
    app.openPanel(app.messageList);

    // Synthesis
    app.synthesisPanel = new SynthesisPanel({el: '#synthesisPanel', button: '#button-synthesis', ideas: app.ideaList.ideas });
    app.synthesisPanel.model.fetch({reset: true});

    // Fetching the ideas
    app.ideaList.ideas.fetch({reset: true});


    /**
     * WARNING:
     * This is a workaround to update the segmentList using ajax
     * In a perfect world, this would be done using websockets
     * or something really cool.
     */
    function updateSegmentList(){
        var promisse = app.segmentList.segments.fetch({reset: true}),
            time = 60 * 1 * 1000; // 1 minute

        promisse.then(function(){
            setTimeout(function(){
                updateSegmentList();
            }, time);
        });
    }

    updateSegmentList();
});
