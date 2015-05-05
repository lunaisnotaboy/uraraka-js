'use strict';

/* Services */

var redditPlusServices = angular.module('redditPlusServices', ['ngResource']);


/*
	Get list of popular subreddits
 */
redditPlusServices.factory('subredditsService', ['$resource',
	function($resource) {
		return $resource('/api/subreddits', {}, {
			query: {method:'GET', params:{}, isArray:true}
		});
	}
]);

/*
	[auth] Get User information
 */
redditPlusServices.factory('identityService', ['$resource',
	function($resource) {
		return $resource('/api/user/me', {}, {
			query: {method: 'GET', params: {}, isArray:false}
		});
	}
]);

/*
	Gets posts for a given subreddit, defaults to r/all.
 */
redditPlusServices.factory('postsService', ['$resource',
  function($resource) {
	return $resource('/api/subreddit/:sub/:sort', {}, {
	  query: {method:'GET', params:{sub: '', sort:'hot', after: "none", t: "none"}, isArray:true}
	});
  }
]);

redditPlusServices.factory('commentsService', ['$resource',
	function($resource) {
		return $resource('/api/comments/:subreddit/:article', {}, {
			query: {method: 'GET', params: {sort: 'confidence'}, isArray: true}
		});
	}
]);

redditPlusServices.factory('moreChildrenService', ['$resource', 
	function($resource) {
		return $resource('/api/morechildren', {}, {
			query: {method: 'GET', params: {sort: 'confidence'}}
		});
	}
]);

redditPlusServices.factory('voteService', ['$resource',
  function($resource) {
	return $resource('/api/user/vote/');
  }
]);

redditPlusServices.factory('saveService', ['$resource',
  function($resource) {
	return $resource('/api/user/save/');
  }
]);

redditPlusServices.factory('unsaveService', ['$resource',
  function($resource) {
	return $resource('/api/user/unsave/');
  }
]);

redditPlusServices.factory('commentService', ['$resource', 
	function($resource) {
		return $resource('/api/user/comment');
	}
]);


/*
	Gets an imgur albums information.
 */
redditPlusServices.factory('imgurAlbumService', ['$resource',
  function($resource) {
	return $resource('https://api.imgur.com/3/album/:id', {}, {
	  query: {method:'GET', params: {}, isArray:false, headers: {'Authorization': 'Client-ID a912803498adcd4'}}
	});
  }
]);

redditPlusServices.factory('imgurGalleryService', ['$resource',
  function($resource) {
	return $resource(' https://api.imgur.com/3/gallery/:id', {}, {
	  query: {method:'GET', params: {}, isArray:false, headers: {'Authorization': 'Client-ID a912803498adcd4'}}
	});
  }
]);

redditPlusServices.factory('tweetService', ['$resource',
  function($resource) {

	return $resource('/twitter/status/:id', {}, {
		query: {method:'GET', params: {}, isArray:false }
	});

  }
]);

/*
	Facillitates communication between toolbarCtrl and indexCtrl to
	change the title on page load.
 */
redditPlusServices.factory('titleChangeService', ['$rootScope',
	function($rootScope) {
		var titleChangeService = {};
		titleChangeService.title = 'reddit: the frontpage of the internet';
		titleChangeService.prepTitleChange = function(_title){
			titleChangeService.title = _title;
			$rootScope.$broadcast('handleTitleChange');
		};

		return titleChangeService;
	}
]);

redditPlusServices.factory('subredditService', ['$rootScope',
	function($rootScope) {
		var subredditService = {};
		subredditService.subreddit = '';
		subredditService.prepSubredditChange = function(_subreddit){
			subredditService.subreddit = _subreddit;
			$rootScope.$broadcast('handleSubredditChange');
		};
		return subredditService;
	}
]);