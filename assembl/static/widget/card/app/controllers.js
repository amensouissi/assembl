"use strict";

appCards.controller('cardsCtl',
    ['$scope', '$http', '$sce', '$route', 'cardGameService', 'sendIdeaService', 'configService', 'AssemblToolsService', function ($scope, $http, $sce, $route, cardGameService, sendIdeaService, configService, AssemblToolsService) {

        // intialization code (constructor)

        $scope.init = function () {

            console.log("configService: ", configService);
            console.log("configService.data: ", configService.data);

            $scope.config = {};
            $scope.config.widget = configService.data.widget;
            $scope.config.idea = configService.data.idea;
            console.log("$scope.config: ", $scope.config);
            $scope.urlParameterConfig = $route.current.params.config; //$routeParams.config;
            console.log("$scope.urlParameterConfig: ", $scope.urlParameterConfig);
            if ( !$scope.config.widget && !$scope.config.idea )
            {
                console.log("Error: no config or idea given.");
            }

            $scope.sendMessageEndpointUrl = $scope.computeSendMessageEndpointUrl($scope.config, $scope.urlParameterConfig);
            console.log("$scope.sendMessageEndpointUrl: ", $scope.sendMessageEndpointUrl);
            if ( !$scope.sendMessageEndpointUrl ){
                $(".card-comment form p").first().after ( document.createTextNode("This idea is not linked to a video creativity widget, so you will not be able to post a message.") );
            }


            $scope.formData = {};

            // initialize empty stack (LIFO) of already displayed cards, so that the user can browse previously generated cards
            $scope.displayed_cards = [];
            $scope.displayed_card_index = 0;
            $scope.message_is_sent = false;

            cardGameService.getCards(1).success(function (data) {
                $scope.cards = data.game;
                $scope.shuffle();
            });

            // show previous and next card buttons when the mouse cursor is in the card zone
            $("#cards-container").hover(
                function () {
                    $("#previousCardButton").show();
                    $("#nextCardButton").show();
                },
                function () {
                    $("#previousCardButton").hide();
                    $("#nextCardButton").hide();
                }
            );
            $("#previousCardButton").hide();
            $("#nextCardButton").hide();
        };

        $scope.computeSendMessageEndpointUrl = function(config, widgetUri){
            console.log("config: ", config);
            console.log("config.idea.widget_add_post_endpoint: ", config.idea.widget_add_post_endpoint);
            var endpoints = null;
            var url = null;
            if ( "widget_add_post_endpoint" in config.idea)
                endpoints = config.idea.widget_add_post_endpoint;
            widgetUri = AssemblToolsService.urlToResource(widgetUri);
            console.log("widgetUri: ", widgetUri);
            if ( endpoints && Object.keys(endpoints).length > 0 )
            {
                if ( widgetUri in endpoints )
                {
                    url = AssemblToolsService.resourceToUrl(endpoints[widgetUri]);
                }
                else
                {
                    url = AssemblToolsService.resourceToUrl(endpoints[Object.keys(endpoints)[0]]);
                }
            }
            else
            {
                console.log("error: could not determine an endpoint URL to post message to");
            }
            return url;
        };

        $scope.resumeInspiration = function(){
            console.log("resumeInspiration()");
            $scope.message_is_sent = false;
        };

        $scope.exit = function(){
            console.log("exit()");
            window.parent.exitModal();
            console.log("called exitModal");
        };

        $scope.shuffle = function () {
            var n_cards = $scope.cards.length;
            if (n_cards > 0) {
                var random_index = Math.floor((Math.random() * n_cards));
                $scope.displayed_cards.push($scope.cards[random_index]);
                $scope.displayed_card_index = $scope.displayed_cards.length - 1;
                $scope.displayed_cards[$scope.displayed_card_index].body = $sce.trustAsHtml($scope.cards[random_index].body);
                $scope.cards.splice(random_index, 1);
            }
        }

        $scope.previousCard = function () {
            $scope.displayed_card_index = Math.max(0, $scope.displayed_card_index - 1);
        }

        $scope.nextCard = function () {
            $scope.displayed_card_index = Math.min($scope.displayed_cards.length - 1, $scope.displayed_card_index + 1);
        }

        /*
         * Comment an idea from inspire me
         * TODO:  add rest api
         */
        $scope.sendIdea = function () {
            var send = new sendIdeaService();
            //var url = $location.protocol()+'://'+$location.host()+':'+$location.port()

            send.subject = $scope.formData.title;
            send.message = $scope.formData.description;

            //TODO : {discussionId} need to be dynamic
            send.$save({discussionId: 3}, function success() {

            }, function error() {

            })
        };

        $scope.sendIdea = function () {
            console.log("sendIdea()");
            try {
                var messageSubject = $("#messageTitle").val();
                var messageContent = $("#messageContent").val();
                if ( !messageSubject || !messageContent ){
                    return;
                }
                var inspirationSourceUrl = "http://TODO";
                var inspirationSourceTitle = "TODO"; // TODO: use these last 2 pieces of info
                console.log("messageSubject: ", messageSubject);
                console.log("messageContent: ", messageContent);
                console.log("inspirationSourceUrl: ", inspirationSourceUrl);
                console.log("inspirationSourceTitle: ", inspirationSourceTitle);

                var message = {
                    "type": "PostWithMetadata",
                    "message_id": 0,
                    "subject": messageSubject,
                    "body": messageContent,
                    "metadata_raw": '{"inspiration_url": "'+inspirationSourceUrl+'"}'
                };
                
                console.log("message: ", message);
                var url = $scope.sendMessageEndpointUrl;
                if ( !url )
                {
                    throw "no endpoint";
                }
                // an example value for url is "/data/Discussion/1/widgets/56/base_idea_descendants/4/linkedposts";
                // FIXME: error when http://localhost:6543/widget/video/?config=/data/Widget/40#/?idea=local:Idea%2F4%3Fview%3Dcreativity_widget => $scope.config.idea.widget_add_post_endpoint is an empty object

                //var url = utils.urlApi($scope.config.widget.ideas_url);
                console.log("url: ", url);
                $http({
                    method: 'POST',
                    url: url,
                    data: $.param(message),
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(function (data, status, headers, config) {
                    console.log("Success: ", data, status, headers, config);
                    /* commented out because we don't post an idea anymore, now we post a message
                    // save the association between the video and the comment in the widget instance's memory
                    var created_idea = headers("Location"); // "local:Idea/66"
                    $scope.associateVideoToIdea(created_idea, videoUrl, videoTitle);
                    */
                    
                    // tell the user that the message has been successfully posted
                    //alert("Your message has been successfully posted.");
                    $scope.message_is_sent = true;
                    $("#messageTitle").val("");
                    $("#messageContent").val("");
                }).error(function (data) {
                    console.log("Error: ", data);
                });
                console.log("done");
            }
            catch(err)
            {
                console.log("Error:", err);
            }
        };

    }]);