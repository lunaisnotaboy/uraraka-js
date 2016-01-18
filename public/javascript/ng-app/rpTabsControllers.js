'use strict';

var rpTabsControllers = angular.module('rpTabsControllers', []);

rpTabsControllers.controller('rpTabsCtrl', ['$scope', '$timeout', '$rootScope',
	function($scope, $timeout, $rootScope) {
		console.log('[rpTabsCtrl]');

		$scope.tabs = [];
		$scope.selectedIndex = 0;

		$scope.tabClick = function(tab) {
			console.log('[rpTabsCtrl] tabClick(), tab: ' + tab);
			$timeout(function() {
				$rootScope.$emit('rp_tab_click', tab);

			}, 350);
		};

		var deregisterTabsChanged = $rootScope.$on('rp_tabs_changed', function(e, tabs) {
			console.log('[rpTabsControllers] onTabsChanged(), tabs: ' + tabs);
			console.log('[rpTabsControllers] onTabsChanged(), tabs.length: ' + tabs.length);
			$scope.selectedIndex = 0;
			$scope.tabs = tabs;
		});

		var deregisterSelectedIndexChanged = $rootScope.$on('rp_tabs_selected_index_changed', function(e, selectedIndex) {
			console.log('[rpTabsControllers] rpTabsSelectedIndexChanged, selectedIndex: ' + selectedIndex);
			$scope.selectedIndex = selectedIndex;
		});

		$scope.$on('$destroy', function() {
			deregisterSelectedIndexChanged();
			deregisterTabsChanged();
		});

	}

]);