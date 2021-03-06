(function () {
  'use strict';

  function rpDeleteButtonCtrl($scope, $timeout) {
    $scope.parentCtrl.isDeleting = false;

    $scope.toggleDeleting = function (e) {
      console.log('[rpDeleteButtonCtrl] toggleDeleting()');
      $scope.parentCtrl.isDeleting = !$scope.parentCtrl.isDeleting;
      // $timeout(angular.noop, 0);
    };
  }

  angular.module('rpDelete')
    .controller('rpDeleteButtonCtrl', [
      '$scope',
      '$timeout',
      rpDeleteButtonCtrl
    ]);
}());
