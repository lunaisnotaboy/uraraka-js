'use strict';

var rpUtilServices = angular.module('rpUtilServices', []);

rpUtilServices.factory('rpUserSortButtonUtilService', ['$rootScope', 
	function($rootScope) {
		var rpUserSortButtonUtilService = {};

		rpUserSortButtonUtilService.isVisible = false;

		rpUserSortButtonUtilService.show = function() {
			rpUserSortButtonUtilService.isVisible = true;
			$rootScope.$emit('user_sort_button_visibility');
		};

		rpUserSortButtonUtilService.hide = function() {
			rpUserSortButtonUtilService.isVisible = false;
			$rootScope.$emit('user_sort_button_visibility');

		};

		return rpUserSortButtonUtilService;
	}
]);

rpUtilServices.factory('rpUserFilterButtonUtilService', ['$rootScope', 
	function($rootScope) {
		var rpUserFilterButtonUtilService = {};

		rpUserFilterButtonUtilService.isVisible = false;

		rpUserFilterButtonUtilService.show = function() {
			rpUserFilterButtonUtilService.isVisible = true;
			$rootScope.$emit('user_filter_button_visibility');
		};

		rpUserFilterButtonUtilService.hide = function() {
			rpUserFilterButtonUtilService.isVisible = false;
			$rootScope.$emit('user_filter_button_visibility');

		};

		return rpUserFilterButtonUtilService;
	}
]);

rpUtilServices.factory('rpPostFilterButtonUtilService', ['$rootScope', 
	function($rootScope) {
		var rpPostFilterButtonUtilService = {};

		rpPostFilterButtonUtilService.isVisible = false;

		rpPostFilterButtonUtilService.show = function() {
			rpPostFilterButtonUtilService.isVisible = true;
			$rootScope.$emit('post_filter_button_visibility');
		};

		rpPostFilterButtonUtilService.hide = function() {
			rpPostFilterButtonUtilService.isVisible = false;
			$rootScope.$emit('post_filter_button_visibility');

		};

		return rpPostFilterButtonUtilService;
	}
]);

rpUtilServices.factory('rpUserTabUtilService', ['$rootScope', 
	function($rootScope){
	
		var rpUserTabUtilService = {};
		rpUserTabUtilService.tab = "";

		rpUserTabUtilService.setTab = function(tab) {

			rpUserTabUtilService.tab = tab;
			$rootScope.$emit('user_tab_change');
			
		};

		return rpUserTabUtilService;

	}
]);

rpUtilServices.factory('rpCommentsTabUtilService', ['$rootScope', 
	function($rootScope){
	
		var rpCommentsTabUtilService = {};
		rpCommentsTabUtilService.tab = "";

		rpCommentsTabUtilService.setTab = function(tab) {

			rpCommentsTabUtilService.tab = tab;
			$rootScope.$emit('comments_tab_change');
			
		};

		return rpCommentsTabUtilService;

	}
]);

rpUtilServices.factory('rpPostsTabUtilService', ['$rootScope', 
	function($rootScope){
	
		var rpPostsTabUtilService = {};
		rpPostsTabUtilService.tab = "";

		rpPostsTabUtilService.setTab = function(tab) {
			
			rpPostsTabUtilService.tab = tab;
			$rootScope.$emit('posts_tab_change');

		};

		return rpPostsTabUtilService;

	}
]);

rpUtilServices.factory('rpMessageTabUtilService', ['$rootScope', 
	function($rootScope){
	
		var rpMessageTabUtilService = {};
		rpMessageTabUtilService.tab = "";

		rpMessageTabUtilService.setTab = function(tab) {
			
			rpMessageTabUtilService.tab = tab;
			$rootScope.$emit('message_tab_change');
		};

		return rpMessageTabUtilService;

	}
]);


rpUtilServices.factory('rpIdentityUtilService', ['rpIdentityService', function(rpIdentityService) {

	var identity;

	return function(callback) {

		if (identity) {

			callback(identity);

		}

		else {


			rpIdentityService.query(function(data) {

				identity = data;
				callback(identity);

			});
		}
	};
}]);

rpUtilServices.factory('rpAuthUtilService', function() {

	var rpAuthUtilService = {};
	
	rpAuthUtilService.isAuthenticated = false;

	// rpAuthUtilService.identity = {};

	rpAuthUtilService.setIdentity = function(identity) {
		rpAuthUtilService.identity = identity;
	};
	
	rpAuthUtilService.setAuthenticated = function(authenticated) {
		rpAuthUtilService.isAuthenticated = authenticated;
	};

	return rpAuthUtilService;

});

rpUtilServices.factory('rpToastUtilService', ['$mdToast', 
	function($mdToast) {
		return function(message) {
			$mdToast.show({
				locals: {toastMessage: message},
				controller: 'rpToastCtrl',
				templateUrl: 'partials/rpToast',
				hideDelay: 2000,
				position: "top left",
			});
		};
	}
]);

rpUtilServices.factory('rpSaveUtilService', ['rpAuthUtilService', 'rpSaveService', 'rpUnsaveService', 'rpToastUtilService',
	function(rpAuthUtilService, rpSaveService, rpUnsaveService, rpToastUtilService) {
		
		return function(post) {

			if (rpAuthUtilService.isAuthenticated) {
				if (post.data.saved) {
					
					post.data.saved = false;
					rpUnsaveService.save({id: post.data.name}, function(data) { });
				} 
				else {
					post.data.saved = true;
					rpSaveService.save({id: post.data.name}, function(data) { });
				}
			} else {
				rpToastUtilService("You've got to log in to save posts");
			}			

		};

	}
]);

rpUtilServices.factory('rpUpvoteUtilService', ['rpAuthUtilService', 'rpVoteService', 'rpToastUtilService',
	function(rpAuthUtilService, rpVoteService, rpToastUtilService) {

		return function(post) {
			if (rpAuthUtilService.isAuthenticated) {
				var dir = post.data.likes ? 0 : 1;
				if (dir == 1)
						post.data.likes = true;
					else
						post.data.likes = null;
				rpVoteService.save({id: post.data.name, dir: dir}, function(data) { });
			} else {
				rpToastUtilService("You've got to log in to vote");
			}
		};

	}
]);

rpUtilServices.factory('rpDownvoteUtilService', ['rpAuthUtilService', 'rpVoteService', 'rpToastUtilService',
	function(rpAuthUtilService, rpVoteService, rpToastUtilService) {

		return function(post) {
			
			if (rpAuthUtilService.isAuthenticated) {
				
				var dir;

				if (post.data.likes === false) {
					dir = 0;
				} else {
					dir = -1;
				}

				if (dir == -1)
						post.data.likes = false;
					else
						post.data.likes = null;
				
				rpVoteService.save({id: post.data.name, dir: dir}, function(data) { });

			} else {

				rpToastUtilService("You've got to log in to vote");

			}
		};

	}
]);

rpUtilServices.factory('rpPostCommentUtilService', ['rpAuthUtilService', 'rpCommentService', 'rpToastUtilService', 
	function(rpAuthUtilService, rpCommentService, rpToastUtilService) {
		return function(name, comment, callback) {
			if (rpAuthUtilService.isAuthenticated) {

				if (comment) {
					
					rpCommentService.save({
						parent_id: name,
						text: comment

					}, function(data) {
						
						rpToastUtilService("Comment Posted :)");

						callback(data);

					});
				}

			} else {
				rpToastUtilService("You've got to log in to post comments");
			}			
		};
	}	
]);

rpUtilServices.factory('rpMessageComposeUtilService', ['rpAuthUtilService', 'rpMessageComposeService', 'rpToastUtilService', 
	function(rpAuthUtilService, rpMessageComposeService, rpToastUtilService) {
		return function(subject, text, to, callback) {
			if (rpAuthUtilService.isAuthenticated) {

				rpMessageComposeService.save({
					subject: subject,
					text: text,
					to: to
				}, function(data) {
					rpToastUtilService("Message Sent :)");
					callback(data);
				});

			}
		};
	}
]);