'use strict';

var rpResourceServices = angular.module('rpResourceServices', ['ngResource']);

/*
	[auth] Get User information
 */
rpResourceServices.factory('rpIdentityService', ['$resource',
	function($resource) {
		return $resource('/api/uauth/me', {}, {
			query: {method: 'GET', params: {}, isArray:false}
		});
	}
]);

/*
	Get list of popular subreddits
 */
rpResourceServices.factory('rpSubredditsService', ['$resource',
	function($resource) {
		return $resource('/api/subreddits', {}, {
			query: {method:'GET', params:{}, isArray:true}
		});
	}
]);

/*
	Gets posts for a given subreddit, defaults to r/all.
 */
rpResourceServices.factory('rpPostsService', ['$resource',
  function($resource) {
	return $resource('/api/subreddit/:sub/:sort', {}, {
	  query: {method:'GET', params:{sub: '', sort:'hot', after: "none", t: "none"}, isArray:true}
	});
  }
]);

rpResourceServices.factory('rpUserService', ['$resource', 
	function($resource) {
		return $resource('/api/user/:username/:where', {}, {
			query: {method: 'GET', params:{username: '', where: 'overview', sort:'new', after: 'none', t: 'none'}, isArray:true}
		});
	}
]);

rpResourceServices.factory('rpCommentsService', ['$resource',
	function($resource) {
		return $resource('/api/comments/:subreddit/:article', {}, {
			query: {method: 'GET', params: {sort: 'confidence'}, isArray: true}
		});
	}
]);

rpResourceServices.factory('rpMoreChildrenService', ['$resource', 
	function($resource) {
		return $resource('/api/morechildren', {}, {
			query: {method: 'GET', params: {sort: 'confidence'}}
		});
	}
]);

rpResourceServices.factory('rpVoteService', ['$resource',
  function($resource) {
	return $resource('/api/uauth/vote/');
  }
]);

rpResourceServices.factory('rpSaveService', ['$resource',
  function($resource) {
	return $resource('/api/uauth/save/');
  }
]);

rpResourceServices.factory('rpUnsaveService', ['$resource',
  function($resource) {
	return $resource('/api/uauth/unsave/');
  }
]);

rpResourceServices.factory('rpCommentService', ['$resource', 
	function($resource) {
		return $resource('/api/uauth/comment');
	}
]);


/*
	Gets an imgur albums information.
 */
rpResourceServices.factory('rpImgurAlbumService', ['$resource',
  function($resource) {
	return $resource('https://api.imgur.com/3/album/:id', {}, {
	  query: {method:'GET', params: {}, isArray:false, headers: {'Authorization': 'Client-ID a912803498adcd4'}}
	});
  }
]);

rpResourceServices.factory('rpImgurGalleryService', ['$resource',
  function($resource) {
	return $resource(' https://api.imgur.com/3/gallery/:id', {}, {
	  query: {method:'GET', params: {}, isArray:false, headers: {'Authorization': 'Client-ID a912803498adcd4'}}
	});
  }
]);

rpResourceServices.factory('rpTweetService', ['$resource',
  function($resource) {

	return $resource('/twitter/status/:id', {}, {
		query: {method:'GET', params: {}, isArray:false }
	});

  }
]);