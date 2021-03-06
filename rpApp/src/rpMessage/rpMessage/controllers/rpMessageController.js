(function () {
  'use strict';

  function rpMessageCtrl(
    $scope,
    $rootScope,
    $routeParams,
    $timeout,
    rpMessageService,
    rpIdentityService,
    rpAppTitleService,
    rpMessageReadAllService,
    rpAppLocationService,
    rpSettingsService,
    rpMessageReadService,
    rpToolbarButtonVisibilityService,
    rpProgressService,
    rpRefreshButtonService
  ) {
    const LIMIT = 25;
    var loadingMore = false;
    var where;
    var deregisterMessageWhereClick;
    var deregisterRefresh;

    console.log('[rpMessageCtrl] load');

    rpToolbarButtonVisibilityService.hideAll();
    rpToolbarButtonVisibilityService.showButton('showMessageWhere');

    $scope.noMorePosts = false;
    rpAppTitleService.changeTitles('messages');
    where = $routeParams.where || 'inbox';
    console.log('[rpMessageCtrl] where: ' + where);
    rpProgressService.showProgress();

    function addMessages(messages) {
      var message = messages.shift();

      $scope.messages.push(message);

      $timeout(function () {
        if (messages.length > 0) {
          addMessages(messages);
        }
      }, 200);
    }

    function loadPosts() {
      console.log('[rpMessageCtrl] loadPosts()');

      $scope.messages = [];
      $scope.havePosts = false;
      $scope.hasMail = false;
      $scope.noMorePosts = false;
      rpProgressService.showProgress();

      rpMessageService(where, '', LIMIT, function (err, data) {
        rpProgressService.hideProgress();
        console.log('[rpMessageCtrl] received message data, data.get.data.children.length: ' +
            data.get.data.children.length);

        if (err) {
          console.log('[rpMessageService] err');
        } else {
          $scope.noMorePosts = data.get.data.children.length < LIMIT;
          if (data.get.data.children.length > 0) {
            // $scope.messages = data.get.data.children;
            // while addMessages works, adding all at once is faster.
            addMessages(data.get.data.children);
          }

          /*
          Not exactly sure why this is requred, but without it sometimes angular hangs
          and does not update the scope/view/ui with the new messages, until something like clicking
          a button or resizing the window jolts it back.
          the timeout below which I believe forces an apply to be called solves this problem.
          we also use it in the rpArticleCtrl when we add new comments.

           */
          // $timeout(angular.noop, 0);

          $scope.havePosts = true;
          rpToolbarButtonVisibilityService.showButton('showRefresh');
          rpRefreshButtonService.stopSpinning();

          // if viewing unread messages set them to read.
          if (where === 'unread') {
            console.log('[rpMessageControllers] unread messages, set to read');

            let messageIdArray = [];

            for (let i = 0; i < $scope.messages.length; i++) {
              console.log('[rpMessageCtrl] read_message, $scope.messages[i].data.name: ' +
                  $scope.messages[i].data.name);
              messageIdArray.push($scope.messages[i].data.name);
            }

            let message = messageIdArray.join(', ');
            console.log('[rpMessageCtrl] message: ' + message);

            rpMessageReadService(message, function (error) {
              if (error) {
                console.log('[rpMessageCtrl] err');
                // TODO: better error handling here
              } else {
                console.log('[rpMessageCtrl] all messages read.');
                $scope.hasMail = false;
                $rootScope.$emit('rp_messages_read');
              }
            });
          }
        }
      });
    }

    rpIdentityService.reloadIdentity(function (data) {
      $scope.identity = data;
      $scope.hasMail = $scope.identity.has_mail;

      // console.log('[rpMessageCtrl] $scope.identity: ' + JSON.stringify($scope.identity));
      console.log('[rpMessageCtrl] $scope.hasMail: ' + $scope.hasMail);

      if ($scope.hasMail && where !== 'unread') {
        where = 'unread';
        rpAppLocationService(null, '/message/' + where, '', true, true);
      } else {
        console.log('[rpMessageCtrl] where: ' + where);

        $rootScope.$emit('rp_init_select');

        loadPosts();
      }
    });

    /**
     * CONTROLLER API
     */

    $scope.thisController = this;

    /**
     * SCOPE FUNCTIONS
     * */

    $scope.morePosts = function () {
      console.log('[rpMessageCtrl] morePosts()');

      if ($scope.messages && $scope.messages.length > 0) {
        let lastMessageName =
          $scope.messages[$scope.messages.length - 1].data.name;

        if (lastMessageName && !loadingMore) {
          loadingMore = true;
          rpProgressService.showProgress();

          rpMessageService(where, lastMessageName, LIMIT, function (err, data) {
            rpProgressService.hideProgress();

            if (err) {
              console.log('[rpMessageService] err');
            } else {
              // console.log('[rpMessageCtrl] data: ' + JSON.stringify(data));
              $scope.noMorePosts = data.get.data.children.length < 25;

              Array.prototype.push.apply(
                $scope.messages,
                data.get.data.children
              );
              loadingMore = false;
            }
          });
        }
      }
    };

    /**
     * EVENT HANDLERS
     */
    deregisterMessageWhereClick = $rootScope.$on(
      'rp_message_where_click',
      function (e, tab) {
        console.log('[rpMessageCtrl] on rp_message_where_click, tab: ' + tab);

        where = tab;
        rpAppLocationService(null, '/message/' + where, '', false, false);
        loadPosts();
      }
    );

    deregisterRefresh = $rootScope.$on('rp_refresh', function () {
      console.log('[rpMessageCtrl] rp_refresh');
      rpRefreshButtonService.startSpinning();
      loadPosts();
    });

    $scope.$on('$destroy', function () {
      console.log('[rpMessageCtrl] $destroy()');
      deregisterMessageWhereClick();
      deregisterRefresh();
    });
  }

  angular
    .module('rpMessage')
    .controller('rpMessageCtrl', [
      '$scope',
      '$rootScope',
      '$routeParams',
      '$timeout',
      'rpMessageService',
      'rpIdentityService',
      'rpAppTitleService',
      'rpMessageReadAllService',
      'rpAppLocationService',
      'rpSettingsService',
      'rpMessageReadService',
      'rpToolbarButtonVisibilityService',
      'rpProgressService',
      'rpRefreshButtonService',
      rpMessageCtrl
    ]);
}());
