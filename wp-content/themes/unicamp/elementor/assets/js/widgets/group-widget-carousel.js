(
	function( $ ) {
		'use strict';

		var SwiperHandler = function( $scope, $ ) {
			var $element = $scope.find( '.tm-slider-widget' );

			$element.UnicampSwiper();
		};

		var SwiperLinkedHandler = function( $scope, $ ) {
			var $element = $scope.find( '.tm-slider-widget' );

			if ( $scope.hasClass( 'unicamp-swiper-linked-yes' ) ) {
				var thumbsSlider = $element.filter( '.unicamp-thumbs-swiper' ).UnicampSwiper();
				var mainSlider = $element.filter( '.unicamp-main-swiper' ).UnicampSwiper( {
					thumbs: {
						swiper: thumbsSlider
					}
				} );
			} else {
				$element.UnicampSwiper();
			}
		};

		$( window ).on( 'elementor/frontend/init', function() {
			elementorFrontend.hooks.addAction( 'frontend/element_ready/tm-image-carousel.default', SwiperHandler );
			elementorFrontend.hooks.addAction( 'frontend/element_ready/tm-rich-carousel.default', SwiperHandler );
			elementorFrontend.hooks.addAction( 'frontend/element_ready/tm-modern-carousel.default', SwiperHandler );
			elementorFrontend.hooks.addAction( 'frontend/element_ready/tm-modern-slider.default', SwiperHandler );
			elementorFrontend.hooks.addAction( 'frontend/element_ready/tm-slider-box.default', SwiperHandler );
			elementorFrontend.hooks.addAction( 'frontend/element_ready/tm-team-member-carousel.default', SwiperHandler );
			elementorFrontend.hooks.addAction( 'frontend/element_ready/tm-post-carousel.default', SwiperHandler );
			elementorFrontend.hooks.addAction( 'frontend/element_ready/tm-course-carousel.default', SwiperHandler );
			elementorFrontend.hooks.addAction( 'frontend/element_ready/tm-course-category-carousel.default', SwiperHandler );
			elementorFrontend.hooks.addAction( 'frontend/element_ready/tm-event-carousel.default', SwiperHandler );
			elementorFrontend.hooks.addAction( 'frontend/element_ready/tm-client-logo-carousel.default', SwiperHandler );

			elementorFrontend.hooks.addAction( 'frontend/element_ready/tm-testimonial.default', SwiperLinkedHandler );
		} );
	}
)( jQuery );
