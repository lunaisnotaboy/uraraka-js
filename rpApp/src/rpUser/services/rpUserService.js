(function () {
  'use strict';

  function rpUserService(rpRedditRequestService, rpToastService) {
    return function (username, where, sort, after, t, limit, callback) {
      console.log('[rpUserService] request user');

      rpRedditRequestService.redditRequest('listing', '/user/$username/$where', {
        $username: username,
        $where: where,
        sort: sort,
        after: after,
        t: t,
        limit: limit
      }, function (data) {
        if (data.responseError) {
          rpToastService("something went wrong retrieving the user's posts", 'sentiment_dissatisfied');
          callback(data, null);
        } else {
          callback(null, data);
        }
      });
    };
  }

  angular.module('rpUser')
    .factory('rpUserService', [
      'rpRedditRequestService',
      'rpToastService',
      rpUserService
    ]);
}());
