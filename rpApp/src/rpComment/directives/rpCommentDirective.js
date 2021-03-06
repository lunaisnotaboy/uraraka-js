(function () {
  'use strict';

  function rpComment($compile, $rootScope, RecursionHelper) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        comment: '=',
        cid: '=',
        depth: '=',
        post: '=',
        sort: '=',
        parent: '='
      },
      templateUrl: 'rpComment/views/rpComment.html',
      controller: 'rpCommentCtrl',
      compile: function (element) {
        return RecursionHelper.compile(element, function (
          scope,
          iElement,
          iAttrs,
          controller,
          transcludeFn
        ) {});
      }
    };
  }

  angular
    .module('rpComment')
    .directive('rpComment', [
      '$compile',
      '$rootScope',
      'RecursionHelper',
      rpComment
    ]);
}());
