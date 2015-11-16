'use strict';

var rpReplyFormControllers = angular.module('rpReplyFormControllers', []);

rpReplyFormControllers.controller('rpReplyFormCtrl', ['$scope', 'rpCommentUtilService',
	function($scope, rpCommentUtilService) {
			
		$scope.submit = function() {
			console.log('[rpReplyFormCtrl] submit()');

			rpCommentUtilService($scope.id, $scope.reply, function(err, data) {
				
				if (err) {
					console.log('[rpReplyFormCtrl] err.');
					
				} else { //successful reply
				
					$scope.reply = "";
					$scope.replyForm.$setUntouched();
					$scope.replyForm.$setPristine();
				
					if ($scope.parentCtrl.addComment) {
						console.log('[rpReplyFormCtrl] data: ' + JSON.stringify(data));
						$scope.parentCtrl.addComment(data);
					}
					
				}
				
			});

		
		};
			
	}
	
]);