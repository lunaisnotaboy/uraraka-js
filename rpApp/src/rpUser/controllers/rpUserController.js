(function () {
  'use strict';

  function rpUserCtrl(
    $scope,
    $rootScope,
    $window,
    $routeParams,
    $timeout,
    rpUserService,
    rpAppTitleService,
    rpSettingsService,
    rpAppLocationService,
    rpIdentityService,
    rpAppAuthService,
    rpToolbarButtonVisibilityService,
    rpProgressService,
    rpRefreshButtonService
  ) {
    var deregisterWindowResize;
    var deregisterSlideshowGetPost;
    var deregisterSlideshowGetShowSub;
    var deregisterHidePost;
    var deregisterLayoutWatcher;
    var deregisterUserSortClick;
    var deregisterUserTimeClick;
    var deregisterUserWhereClick;
    var deregisterRefresh;
    var deregisterMorePosts;
    var addNextPost;

    const LOAD_LIMIT = 22;
    const MORE_LIMIT = 8;
    var currentLoad = 0;
    var loadingMore = false;

    var username = $routeParams.username;
    var where = $routeParams.where || 'overview';
    var sort = $routeParams.sort || 'new';
    var t = $routeParams.t || 'none';

    console.log('[rpUserCtrl] loaded.');
    console.log('[rpUserCtrl] $routeParams: ' + JSON.stringify($routeParams));

    rpToolbarButtonVisibilityService.hideAll();
    rpToolbarButtonVisibilityService.showButton('showUserWhere');
    rpToolbarButtonVisibilityService.showButton('showUserSort');
    rpToolbarButtonVisibilityService.showButton('showLayout');

    if (sort === 'top' || sort === 'controversial') {
      rpToolbarButtonVisibilityService.showButton('showUserFilter');
    }
    if (where === 'gilded') {
      rpToolbarButtonVisibilityService.showButton('showUserSort');
      rpToolbarButtonVisibilityService.showButton('showUserFilter');
    }

    rpAppTitleService.changeTitles('u/' + username);

    $scope.showSub = true;

    function getShortestColumn() {
      // console.time('getShortestColumn');

      // var columns = angular.element('.rp-posts-col');
      var columns = angular.element('.rp-col-wrapper');

      var shortestColumn;
      var shortestHeight;

      columns.each(function (i) {
        var thisHeight = jQuery(this).height();
        if (
          angular.isUndefined(shortestColumn) ||
          thisHeight < shortestHeight
        ) {
          shortestHeight = thisHeight;
          shortestColumn = i;
        }
      });

      return shortestColumn;
    }

    function addPosts(posts) {
      var duplicate = false;

      for (let i = 0; i < $scope.posts.length; i++) {
        if ($scope.posts[i].data.id === posts[0].data.id) {
          console.log('[rpPostCtrl] addPosts, duplicate post detected');
          console.log('[rpPostCtrl] $scope.posts[i].data.id: ' + $scope.posts[i].data.id);
          console.log('[rpPostCtrl] posts[0].data.id: ' + posts[0].data.id);
          duplicate = true;
          break;
        }
      }

      let post = posts.shift();

      if (!duplicate) {
        post.column = getShortestColumn();
        $scope.posts.push(post);
      }

      addNextPost = $timeout(function () {
        if (posts.length > 0) {
          addPosts(posts);
        }
      }, 50);
    }

    function loadPosts() {
      console.log('[rpUserCtrl] loadPosts()');
      // If posts are currently being added to scope, cancel adding additional posts
      if (angular.isDefined(addNextPost)) {
        $timeout.cancel(addNextPost);
      }

      if (angular.isDefined(addNextPost)) {
        $timeout.cancel(addNextPost);
      }

      let thisLoad = ++currentLoad;

      $scope.posts = [];
      $scope.havePosts = false;
      $scope.noMorePosts = false;

      rpProgressService.showProgress();

      rpUserService(username, where, sort, '', t, LOAD_LIMIT, function (
        err,
        data
      ) {
        console.log('[rpUserCtrl] load-tracking loadPosts(), thisLoad: ' +
            thisLoad +
            ', currentLoad: ' +
            currentLoad);

        if (thisLoad === currentLoad) {
          rpProgressService.hideProgress();

          if (err) {
            console.log('[rpUserCtrl] err');
          } else {
            console.log('[rpUserCtrl] data.length: ' + data.get.data.children.length);

            if (data.get.data.children.length < LOAD_LIMIT) {
              $scope.noMorePosts = true;
            }

            if (data.get.data.children.length > 0) {
              addPosts(data.get.data.children);
            }

            // Array.prototype.push.apply($scope.posts, data.get.data.children);
            // $scope.posts = data.get.data.children;
            $scope.havePosts = true;
            rpToolbarButtonVisibilityService.showButton('showRefresh');
            rpToolbarButtonVisibilityService.showButton('showSlideshow');

            rpRefreshButtonService.stopSpinning();

            if (angular.isUndefined(deregisterLayoutWatcher)) {
              deregisterLayoutWatcher = $scope.$watch(
                () => {
                  return rpSettingsService.getSetting('layout');
                },
                (newVal, oldVal) => {
                  if (newVal !== oldVal) {
                    loadPosts();
                  }
                }
              );
            }
          }
        }
      });
    }

    if (rpAppAuthService.isAuthenticated) {
      rpIdentityService.getIdentity(function (identity) {
        $scope.identity = identity;
        $scope.isMe = username === identity.name;

        if (!$scope.isMe) {
          // If User is not viewing their own User page
          // disallow them from accessing any tabs other than
          // the default.
          if (
            where === 'upvoted' ||
            where === 'downvoted' ||
            where === 'hidden' ||
            where === 'saved'
          ) {
            where = 'overview';
            rpAppLocationService(
              null,
              '/u/' + username + '/' + where,
              '',
              false,
              true
            );
          }
        }

        console.log('[rpUserCtrl] $scope.isMe: ' + $scope.isMe);
        console.log('[rpUserCtrl] where: ' + where);

        loadPosts();
      });
    } else {
      // not logged in

      console.log('[rpUserCtrl] where: ' + where);
      $scope.isMe = false;

      if (
        where === 'upvoted' ||
        where === 'downvoted' ||
        where === 'hidden' ||
        where === 'saved'
      ) {
        where = 'overview';
        rpAppLocationService(
          null,
          '/u/' + username + '/' + where,
          '',
          false,
          true
        );
      }

      loadPosts();
    }

    /**
     * EVENT HANDLERS
     * */

    deregisterHidePost = $scope.$on('rp_hide_post', function (e, id) {
      console.log('[rpPostCtrl] onHidePost(), id: ' + id);

      $scope.posts.forEach(function (postIterator, i) {
        if (postIterator.data.name === id) {
          $scope.posts.splice(i, 1);
          $timeout(angular.noop, 0);
        }
      });
    });

    deregisterUserSortClick = $rootScope.$on('rp_user_sort_click', function (
      e,
      s
    ) {
      console.log('[rpUserCtrl] user_sort_click');
      sort = s;

      rpAppLocationService(
        null,
        '/u/' + username + '/' + where,
        'sort=' + sort,
        false,
        false
      );

      if (sort === 'top' || sort === 'controversial') {
        rpToolbarButtonVisibilityService.showButton('showUserFilter');
      } else {
        rpToolbarButtonVisibilityService.hideButton('showUserFilter');
      }

      loadPosts();
    });

    deregisterUserTimeClick = $rootScope.$on('rp_user_time_click', function (
      e,
      time
    ) {
      console.log('[rpUserCtrl] user_t_click');
      t = time;

      rpAppLocationService(
        null,
        '/u/' + username + '/' + where,
        'sort=' + sort + '&t=' + t,
        false,
        false
      );

      loadPosts();
    });

    deregisterUserWhereClick = $rootScope.$on('rp_user_where_click', function (
      e,
      tab
    ) {
      console.log('[rpUserCtrl] this.tabClick(), tab: ' + tab);

      $scope.posts = [];
      $scope.noMorePosts = false;

      where = tab;

      rpAppLocationService(
        null,
        '/u/' + username + '/' + where,
        '',
        false,
        false
      );

      $scope.havePosts = false;
      rpProgressService.showProgress();

      let thisLoad = ++currentLoad;
      // If posts are currently being added to scope, cancel adding additional posts
      if (angular.isDefined(addNextPost)) {
        $timeout.cancel(addNextPost);
      }
      rpUserService(username, where, sort, '', t, LOAD_LIMIT, function (
        err,
        data
      ) {
        console.log('[rpUserCtrl] load-tracking loadPosts(), thisLoad: ' +
            thisLoad +
            ', currentLoad: ' +
            currentLoad);

        if (thisLoad === currentLoad) {
          rpProgressService.hideProgress();

          if (err) {
            console.log('[rpUserCtrl] err');
          } else {
            if (data.get.data.children.length < LOAD_LIMIT) {
              $scope.noMorePosts = true;
            }

            if (data.get.data.children.length > 0) {
              addPosts(data.get.data.children);
            }

            // Array.prototype.push.apply($scope.posts, data.get.data.children);
            // $scope.posts = data.get.data.children;

            $scope.havePosts = true;
          }
        }
      });

      if (tab === 'overview' || tab === 'submitted' || tab === 'comments') {
        rpToolbarButtonVisibilityService.showButton('showUserSort');
      } else {
        rpToolbarButtonVisibilityService.hideButton('showUserSort');
      }
    });

    deregisterRefresh = $rootScope.$on('rp_refresh', function () {
      console.log('[rpUserCtrl] rp_refresh');
      rpRefreshButtonService.startSpinning();
      loadPosts();
    });

    deregisterMorePosts = $rootScope.$on('rp_more_posts', function () {
      $scope.morePosts();
    });

    /**
     * CONTROLLER API
     * */

    $scope.thisController = this;

    this.completeDeleting = function (id) {
      console.log('[rpUserCtrl] completeDeleting()');

      $scope.posts.forEach(function (postIterator, i) {
        if (postIterator.data.name === id) {
          $scope.posts.splice(i, 1);
        }
      });
    };

    /**
     * SCOPE FUNCTIONS
     * */

    $scope.morePosts = function () {
      console.log('[rpUserCtrl] morePosts()');

      if ($scope.posts && $scope.posts.length > 0) {
        let lastPostName = $scope.posts[$scope.posts.length - 1].data.name;

        if (lastPostName && !loadingMore) {
          let thisLoad = ++currentLoad;

          loadingMore = true;

          rpProgressService.showProgress();

          rpUserService(
            username,
            where,
            sort,
            lastPostName,
            t,
            MORE_LIMIT,
            function (err, data) {
              console.log('[rpUserCtrl] load-tracking morePosts(), thisLoad: ' +
                  thisLoad +
                  ', currentLoad: ' +
                  currentLoad);

              if (thisLoad === currentLoad) {
                rpProgressService.hideProgress();

                if (err) {
                  console.log('[rpUserCtrl] err');
                } else {
                  if (data.get.data.children.length < MORE_LIMIT) {
                    $scope.noMorePosts = true;
                  }

                  // Array.prototype.push.apply($scope.posts, data.get.data.children);
                  loadingMore = false;

                  if (data.get.data.children.length > 0) {
                    addPosts(data.get.data.children);
                  }
                }
              }

              loadingMore = false;
            }
          );
        }
      }
    };

    deregisterWindowResize = $rootScope.$on('rp_window_resize', function (
      e,
      to
    ) {
      if (!angular.isUndefined($scope.posts)) {
        for (let i = 0; i < $scope.posts.length; i++) {
          $scope.posts[i].column = i % to;
        }
      }
    });

    deregisterSlideshowGetPost = $rootScope.$on(
      'rp_slideshow_get_post',
      function (e, i, callback) {
        if (i >= $scope.posts.length / 2) {
          $scope.morePosts();
        }
        callback($scope.posts[i]);
      }
    );

    deregisterSlideshowGetShowSub = $rootScope.$on(
      'rp_slideshow_get_show_sub',
      function (e, callback) {
        callback($scope.showSub);
      }
    );

    $scope.$on('$destroy', function () {
      deregisterUserTimeClick();
      deregisterUserSortClick();
      deregisterLayoutWatcher();
      deregisterUserWhereClick();
      deregisterWindowResize();
      deregisterRefresh();
      deregisterHidePost();
      deregisterSlideshowGetPost();
      deregisterSlideshowGetShowSub();
      deregisterMorePosts();
    });
  }

  angular
    .module('rpUser')
    .controller('rpUserCtrl', [
      '$scope',
      '$rootScope',
      '$window',
      '$routeParams',
      '$timeout',
      'rpUserService',
      'rpAppTitleService',
      'rpSettingsService',
      'rpAppLocationService',
      'rpIdentityService',
      'rpAppAuthService',
      'rpToolbarButtonVisibilityService',
      'rpProgressService',
      'rpRefreshButtonService',
      rpUserCtrl
    ]);
}());
