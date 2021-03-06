(function () {
  'use strict';

  function rpSlideshowControls($rootScope) {
    return {
      restrict: 'E',
      controller: 'rpSlideshowControlsCtrl',
      link: function (scope, element, attrs) {
        console.log('[rpSlideshowControls] link');

        element.on('mouseenter', function () {
          // console.log('[rpSlideshowControls] link mouseenter');
          $rootScope.$emit('rp_slideshow_mouse_over_controls', true);
        });

        element.on('mouseleave', function () {
          // console.log('[rpSlideshowControls] link mouseleave');
          $rootScope.$emit('rp_slideshow_mouse_over_controls', false);
        });

        scope.$on('$destroy', function () {
          console.log('[rpSlideshowControls] link destroy');
          element.unbind('mouseenter mouseleave');
        });
      }
    };
  }

  angular.module('rpSlideshow')
    .directive('rpSlideshowControls', [
      '$rootScope',
      rpSlideshowControls
    ]);
}());
