'use strict';

var rpDeleteControllers = angular.module('rpDeleteControllers', []);

rpDeleteControllers.controller('rpDeleteButtonCtrl', ['$scope', '$timeout',
    function ($scope, $timeout) {
        $scope.parentCtrl.isDeleting = false;

        $scope.toggleDeleting = function (e) {
            console.log('[rpDeleteButtonCtrl] toggleDeleting()');
            $scope.parentCtrl.isDeleting = !$scope.parentCtrl.isDeleting;
            //$timeout(angular.noop, 0);
        };

    }
]);

rpDeleteControllers.controller('rpDeleteFormCtrl', ['$scope', '$timeout', 'rpDeleteUtilService',
    function ($scope, $timeout, rpDeleteUtilService) {
        console.log('[rpDeleteFormCtrl] $scope.$id: ' + $scope.$id);
        console.log('[rpDeleteFormCtrl] $scope.isComment: ' + $scope.isComment);

        $scope.type = $scope.isComment ? 'comment' : 'post';

        $scope.isDeleteInProgress = false;

        $scope.submit = function () {
            console.log('[rpDeleteFormCtrl] confirmDelete(), $scope.redditId: ' + $scope.redditId);

            $scope.isDeleteInProgress = true;
            //$timeout(angular.noop, 0);

            rpDeleteUtilService($scope.redditId, $scope.type, function (err, data) {
                console.log('[rpDeleteFormCtrl] data: ' + JSON.stringify(data));
                $scope.isDeleteInProgress = false;
                //$timeout(angular.noop, 0);

                if (err) {
                    console.log('[rpDeleteCtrl] err');

                } else {
                    $scope.parentCtrl.completeDeleting($scope.redditId);

                }

            });


        };
        $scope.cancel = function () {
            console.log('[rpDeleteFormCtrl] cancel()');
            $scope.parentCtrl.isDeleting = !$scope.parentCtrl.isDeleting;

        };
    }
]);
