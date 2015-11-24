'use strict';

var rpPostControllers = angular.module('rpPostControllers', []);

rpPostControllers.controller('rpPostsCtrl', [
	'$scope',
	'$rootScope',
	'$routeParams',
	'$window',
	'$filter',
	'$timeout',
	'rpPostsUtilService',
	'rpTitleChangeService',
	// 'rpPostsTabsUtilService',
	'rpUserFilterButtonUtilService',
	'rpUserSortButtonUtilService',
	'rpSubscribeButtonUtilService',
	'rpSettingsUtilService',
	'rpSubredditsUtilService',
	'rpLocationUtilService',
	'rpSearchFormUtilService',
	'rpSearchFilterButtonUtilService',
	'rpSidebarButtonUtilService',
	'rpToolbarShadowUtilService',
	'rpAuthUtilService',
	'rpIdentityUtilService',
	'rpPostFilterButtonUtilService',


	function(
		$scope,
		$rootScope,
		$routeParams,
		$window,
		$filter,
		$timeout,
		rpPostsUtilService,
		rpTitleChangeService,
		// rpPostsTabsUtilService,
		rpUserFilterButtonUtilService,
		rpUserSortButtonUtilService,
		rpSubscribeButtonUtilService,
		rpSettingsUtilService,
		rpSubredditsUtilService,
		rpLocationUtilService,
		rpSearchFormUtilService,
		rpSearchFilterButtonUtilService,
		rpSidebarButtonUtilService,
		rpToolbarShadowUtilService,
		rpAuthUtilService,
		rpIdentityUtilService,
		rpPostFilterButtonUtilService

	) {

		console.log('[rpPostsCtrl] Loaded.');

		$scope.tabs = [{
			name: 'hot'
		}, {
			name: 'new'
		}, {
			name: 'rising'
		}, {
			name: 'controversial'
		}, {
			name: 'top'
		}, {
			name: 'gilded'
		}];

		rpUserFilterButtonUtilService.hide();
		rpUserSortButtonUtilService.hide();
		rpSearchFormUtilService.hide();
		rpSearchFilterButtonUtilService.hide();
		rpToolbarShadowUtilService.hide();

		var value = $window.innerWidth;

		if (value > 1550) {
			// $log.log("Changing to 3 columns, window size: " + value);
			$scope.columns = [1, 2, 3];
		} else if (value > 970) {
			// $log.log("Changing to 2 columns, window size: " + value);
			$scope.columns = [1, 2];
		} else {
			// $log.log("Changing to 1 column, window size: " + value);
			$scope.columns = [1];
		}

		var sub = $scope.subreddit = $routeParams.sub;
		console.log('[rpPostsCtrl] sub: ' + sub);

		$scope.sort = $routeParams.sort ? $routeParams.sort : 'hot';
		console.log('[rpPostsCtrl] $scope.sort: ' + $scope.sort);

		var t = $routeParams.t ? $routeParams.t : '';
		var loadingMore = false;
		$scope.showSub = true;
		var limit = 24;

		for (var i = 0; i < $scope.tabs.length; i++) {
			if ($scope.sort === $scope.tabs[i].name) {
				$scope.selectedTab = i;
				break;
			}
		}

		console.log('[rpPostsCtrl] $scope.selectedTab: ' + $scope.selectedTab);

		// rpPostsTabsUtilService.setTab($scope.sort);

		if (sub && sub !== 'all' && sub !== 'random') {
			$scope.showSub = false;
			rpTitleChangeService.prepTitleChange('r/' + sub);
			rpSubredditsUtilService.setSubreddit(sub);
			rpSubscribeButtonUtilService.show();
			rpSidebarButtonUtilService.show();
			console.log('[rpPostsCtrl] rpSubredditsUtilService.currentSub: ' + rpSubredditsUtilService.currentSub);
		} else {
			rpSubscribeButtonUtilService.hide();
			rpSidebarButtonUtilService.hide();
			$scope.showSub = true;
			rpTitleChangeService.prepTitleChange('the material frontpage of the internet');
			console.log('[rpPostsCtrl] (no sub)rpSubredditsUtilService.currentSub: ' + rpSubredditsUtilService.currentSub);
		}

		/*
			Manage setting to open comments in a dialog or window.
		 */
		$scope.commentsDialog = rpSettingsUtilService.settings.commentsDialog;

		if (rpAuthUtilService.isAuthenticated) {
			rpIdentityUtilService.getIdentity(function(identity) {
				$scope.identity = identity;
			});
		}

		/*
			Load Posts
		 */

		function loadPosts() {
			$scope.posts = {};
			$scope.havePosts = false;
			$scope.noMorePosts = false;
			$rootScope.$emit('progressLoading');

			rpPostsUtilService(sub, $scope.sort, '', t, limit, function(err, data) {
				$rootScope.$emit('progressComplete');

				if (err) {
					console.log('[rpPostsCtrl] err.status: ' + JSON.stringify(err.status));

				} else {

					$scope.posts = data.get.data.children;
					$scope.havePosts = true;

					console.log('[rpPostsCtrl] data.length: ' + data.get.data.children.length);


					/*
						detect end of subreddit.
					 */
					if (data.get.data.children.length < limit) {
						$scope.noMorePosts = true;
					}

				}
			});

		}

		/**
		 * EVENT HANDLERS
		 */
		var deregisterSettingsChanged = $rootScope.$on('settings_changed', function() {
			$scope.commentsDialog = rpSettingsUtilService.settings.commentsDialog;
		});

		var deregisterTClick = $rootScope.$on('t_click', function(e, time) {
			t = time;

			if (sub) {
				rpLocationUtilService(null, '/r/' + sub + '/' + $scope.sort, 't=' + t, false, false);

			} else {
				rpLocationUtilService(null, '/r/' + $scope.sort, 't=' + t, false, false);
			}

			loadPosts();

		});

		/**
		 * CONTROLLER API
		 * */

		$scope.thisController = this;

		this.completeDeleting = function(id) {
			console.log('[rpPostCtrl] this.completeDeleting()');

			$scope.posts.forEach(function(postIterator, i) {
				if (postIterator.data.name === id) {
					$scope.posts.splice(i, 1);
				}

			});

		};

		var ignoredFirstTabClick = false;

		this.tabClick = function(tab) {
			console.log('[rpPostsCtrl] this.tabClick(), tab: ' + tab);


			$scope.posts = {};
			$scope.noMorePosts = false;
			$scope.sort = tab;

			if (sub) {
				rpLocationUtilService(null, '/r/' + sub + '/' + $scope.sort, '', false, false);
			} else {
				rpLocationUtilService(null, $scope.sort, '', false, false);
			}

			if (tab === 'top' || tab === 'controversial') {
				rpPostFilterButtonUtilService.show();
			} else {
				rpPostFilterButtonUtilService.hide();
			}

			loadPosts();

		};

		/**
		 * SCOPE FUNCTIONS
		 * */

		/*
			Load more posts using the 'after' parameter.
		 */
		$scope.morePosts = function() {
			console.log('[rpPostsCtrl] morePosts() loadingMore: ' + loadingMore);

			if ($scope.posts && $scope.posts.length > 0) {
				var lastPostName = $scope.posts[$scope.posts.length - 1].data.name;
				if (lastPostName && !loadingMore) {
					loadingMore = true;
					$rootScope.$emit('progressLoading');

					rpPostsUtilService(sub, $scope.sort, lastPostName, t, limit, function(err, data) {
						$rootScope.$emit('progressComplete');

						if (err) {
							console.log('[rpPostsCtrl] err');
						} else {
							console.log('[rpPostsCtrl] morePosts(), data.length: ' + data.get.data.children.length);

							if (data.get.data.children.length < limit) {
								$scope.noMorePosts = true;
							}

							Array.prototype.push.apply($scope.posts, data.get.data.children);

							loadingMore = false;

						}
					});

				}
			}
		};

		$scope.showContext = function(e, post) {
			console.log('[rpPostsCtrl] showContext()');

			rpLocationUtilService(e, '/r/' + post.data.subreddit +
				'/comments/' +
				$filter('rp_name_to_id36')(post.data.link_id) +
				'/' + post.data.id + '/', 'context=8', true, false);
		};

		$scope.$on('$destroy', function() {
			console.log('[rpPostsCtrl] $destroy, $scope.subreddit: ' + $scope.subreddit);
			deregisterSettingsChanged();
			deregisterTClick();
		});

	}
]);

rpPostControllers.controller('rpPostsTimeFilterCtrl', ['$scope', '$rootScope', '$routeParams',
	function($scope, $rootScope, $routeParams) {

		var deregisterRouteChangeSuccess = $rootScope.$on('$routeChangeSuccess', function() {
			console.log('[rpPostsTimeFilterCtrl] onRouteChangeSuccess, $routeParams: ' + JSON.stringify($routeParams));
			$scope.postTime = $routeParams.t || 'week';

		});

		console.log('[rpPostsTimeFilterCtrl] $scope.postTime: ' + $scope.postTime);

		$scope.selectTime = function(value) {
			$rootScope.$emit('t_click', value);
		};

		$scope.$on('$destroy', function() {
			deregisterRouteChangeSuccess();
		});
	}
]);

rpPostControllers.controller('rpPostFabCtrl', ['$scope', '$rootScope', '$mdDialog', 'rpAuthUtilService',
	'rpToastUtilService', 'rpSettingsUtilService', 'rpLocationUtilService',
	function($scope, $rootScope, $mdDialog, rpAuthUtilService, rpToastUtilService, rpSettingsUtilService,
		rpLocationUtilService) {
		console.log('[rpPostFabCtrl] $scope.subreddit: ' + $scope.subreddit);

		$scope.fabState = 'closed';

		var submitDialog = rpSettingsUtilService.settings.submitDialog;

		var deregisterSettingsChanged = $rootScope.$on('settings_changed', function() {
			console.log('[rpPostFabCtrl] settings_changed');
			$scope.submitDialog = rpSettingsUtilService.settings.submitDialog;

		});

		$scope.newLink = function(e) {
			if (rpAuthUtilService.isAuthenticated) {

				if (submitDialog) {
					$mdDialog.show({
						controller: 'rpSubmitDialogCtrl',
						templateUrl: 'partials/rpSubmitLinkDialog',
						targetEvent: e,
						locals: {
							subreddit: $scope.subreddit
						},
						clickOutsideToClose: true,
						escapeToClose: false

					});

				} else {
					console.log('[rpPostFabCtrl] submit link page');
					rpLocationUtilService(null, '/submitLink', '', true, false);
				}


				$scope.fabState = 'closed';

			} else {
				$scope.fabState = 'closed';
				rpToastUtilService("You've got to log in to submit a link");
			}
		};

		$scope.newText = function(e) {

			if (rpAuthUtilService.isAuthenticated) {

				if (submitDialog) {
					$mdDialog.show({
						controller: 'rpSubmitDialogCtrl',
						templateUrl: 'partials/rpSubmitTextDialog',
						targetEvent: e,
						locals: {
							subreddit: $scope.subreddit
						},
						clickOutsideToClose: true,
						escapeToClose: false

					});

				} else {
					console.log('[rpPostFabCtrl] submit text page');
					rpLocationUtilService(null, '/submitText', '', true, false);

				}

				$scope.fabState = 'closed';

			} else {
				$scope.fabState = 'closed';
				rpToastUtilService("You've got to log in to submit a self post");
			}
		};

		$scope.$on('$destroy', function() {
			deregisterSettingsChanged();
		});

	}
]);