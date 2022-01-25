'use strict';

window.isw = {};

(
	function( isw, $ ) {
		isw = isw || {};
		$.extend( isw, {
			ajax_url: isw_vars.ajax,
			product_selector: isw_vars.product_selector,
			price_selector: isw_vars.price_selector,
			localization: isw_vars.localization,
		} );
	}
).apply( this, [ window.isw, jQuery ] );

(
	function( isw, $ ) {
		isw = isw || {};
		$.extend( isw, {
			Swatches: {
				init: function() {

					this.$form = $( 'form.isw-swatches.variations_form' );
					this.$swatches = $( 'div.isw-swatches' );

					this.initSingle();
					this.initLoop();

					$( '.isw-term' ).each( function() {
						if ( $( this ).css( 'background-color' ) === 'rgb(255, 255, 255)' ) {
							$( this ).addClass( 'isw-white' );
						}
					} );

				},

				initSingle: function() {

					var self        = this,
					    $term       = self.$form.find( '.isw-term' ),
					    $activeTerm = self.$form.find(
						    '.isw-term:not(.isw-disabled)' );

					// load default value
					$term.each( function() {
						var $this      = $( this ),
						    term       = $this.attr( 'data-term' ),
						    attr       = $this.parent().attr( 'data-attribute' ),
						    $selectbox = self.$form.find( 'select#' + attr ),
						    val        = $selectbox.val();

						if ( val != '' && term == val ) {
							$( this ).addClass( 'isw-selected' );
						}
					} );

					$activeTerm.off( 'click' ).on( 'click', function( e ) {
						var $this      = $( this ),
						    term       = $this.attr( 'data-term' ),
						    title      = $this.attr( 'title' ),
						    attr       = $this.parent().attr( 'data-attribute' ),
						    $selectbox = self.$form.find( 'select#' + attr );

						if ( $this.hasClass( 'isw-disabled' ) ) {
							return false;
						}

						$selectbox.val( term ).trigger( 'change' );

						$this.parent( '.isw-swatch' ).find( '.isw-selected' ).removeClass( 'isw-selected' );
						$this.addClass( 'isw-selected' );

						$( 'body' ).trigger( 'isw_selected', [ attr, term, title ] );

						e.preventDefault();
					} );

					self.$form.on( 'woocommerce_update_variation_values',
						function() {
							self.$form.find( 'select' ).each( function() {
								var $this = $( this );
								var $swatch = $this.parent().find( '.isw-swatch' );

								$swatch.find( '.isw-term' ).removeClass( 'isw-enabled' ).addClass( 'isw-disabled' );

								$this.find( 'option.enabled' ).each( function() {
									var val = $( this ).val();
									$swatch.find(
										'.isw-term[data-term="' + val + '"]' ).removeClass( 'isw-disabled' ).addClass( 'isw-enabled' );
								} );
							} );
						} );

					self.$form.on( 'reset_data', function() {
						$( 'body' ).trigger( 'isw_reset' );
						$( this ).find( '.isw-selected' ).removeClass( 'isw-selected' );
						$( this ).find( 'select' ).each( function() {
							var attr = $( this ).attr( 'id' );
							var title = $( this ).find( 'option:selected' ).text();
							var term = $( this ).val();
							if ( term != '' ) {
								$( this ).parent().find( '.isw-term[data-term="' + term + '"]' ).addClass( 'isw-selected' );
								$( 'body' ).trigger( 'isw_reset_attr', [ attr, term, title ] );
							}
						} );

					} );

				},

				initLoop: function() {

					var self = this;

					self.$swatches.each( function() {

						var $swatches     = $( this ),
						    $term         = $swatches.find(
							    '.isw-term:not(.isw-disabled)' ),
						    $resetBtn     = $swatches.find(
							    '.reset_variations--loop' ),
						    $product      = $swatches.closest(
							    isw.product_selector ),
						    variationData = $.parseJSON(
							    $swatches.attr( 'data-product_variations' ) );

						// add class if empty
						if ( $swatches.find( '.isw-swatch' ).length == 0 ) {
							$swatches.addClass( 'isw-empty' );
						}

						$term.off( 'click' ).on( 'click', function( e ) {

							var $this = $( this );

							if ( $this.hasClass( 'isw-disabled' ) ) {
								return false;
							}

							var term = $this.attr( 'data-term' );

							$product.find( '.isw-term' ).removeClass( 'isw-disabled isw-enabled' );
							$this.parent().find( '.isw-term.isw-selected' ).removeClass( 'isw-selected' );

							if ( $this.hasClass( 'isw-selected' ) ) {
								$this.parent().removeClass( 'isw-activated' );
								$product.removeClass( 'isw-product-swatched' );

								if ( ! $product.find( '.isw-selected' ).length ) {
									$resetBtn.trigger( 'click' );
								}
							} else {
								$this.parent().addClass( 'isw-activated' );
								$this.addClass( 'isw-selected' );

								$product.addClass( 'isw-product-swatched' );
								$resetBtn.addClass( 'show' ).show();
							}

							var attributes        = self.getChosenAttributes(
								$swatches ),
							    currentAttributes = attributes.data;

							if ( attributes.count === attributes.chosenCount ) {
								self.updateAttributes( $swatches, variationData );

								var matching_variations = self.findMatchingVariations(
									variationData, currentAttributes ),
								    variation           = matching_variations.shift();

								if ( variation ) {
									// Found variation
									self.foundVariation( $swatches, variation );
								} else {
									$resetBtn.trigger( 'click' );
								}
							} else {
								self.updateAttributes( $swatches, variationData );
							}

							e.preventDefault()

						} );

						$resetBtn.off( 'click' ).on( 'click', function() {

							$product.removeClass( 'isw-product-swatched' );

							$swatches.removeAttr( 'data-variation_id' );
							$swatches.find( '.isw-swatch' ).removeClass( 'isw-activated' );
							$swatches.find( '.isw-term' ).removeClass(
								'isw-enabled isw-disabled isw-selected' );

							$( 'body' ).trigger( 'isw_reset_add_to_cart_button_text', [ $product ] );

							$product.find( '.add_to_cart_button' ).removeClass(
								'isw-ready isw-readmore isw-text-changed added loading' ).text( isw.localization.select_options_text );

							// reset price
							var $price        = $product.find(
								isw.price_selector ).not( '.price-cloned' ),
							    $price_cloned = $product.find( '.price-cloned' );

							if ( $price_cloned.length ) {
								$price.html( $price_cloned.html() );
								$price_cloned.remove();
							}

							// reset image
							self.variationsImageUpdate( false, $product );

							$( this ).removeClass( 'show' ).hide();

							return false;
						} );
					} );

					// Ajax add to cart
					$( document ).on( 'click',
						'.add_to_cart_button.product_type_variable.isw-ready',
						function() {

							var $this     = $( this ),
							    $swatches = $this.closest(
								    isw.product_selector ).find( '.isw-swatches' );

							var variation_id = $swatches.attr(
								'data-variation_id' );

							if ( typeof variation_id == 'undefined' || variation_id == '' ) {
								return true;
							}

							var product_id = $this.attr( 'data-product_id' ),
							    quantity   = $this.attr( 'data-quantity' ),
							    item       = {};

							$swatches.find( '.isw-swatch' ).each( function() {
								var attr = $( this ).attr( 'data-attribute' );
								var attr_value = $( this ).find( 'span.isw-selected' ).attr( 'aria-label' );

								item[ attr ] = attr_value;
							} );

							$this.removeClass( 'added' );

							var data = {
								action: 'isw_add_to_cart',
								product_id: product_id,
								quantity: quantity,
								variation_id: variation_id,
								variation: item,
							};

							$( 'body' ).trigger( 'adding_to_cart', [ $this, data ] );

							$.ajax( {
								type: 'POST',
								url: isw.ajax_url,
								data: data,
								success: function( response ) {

									if ( ! response ) {
										return false;
									}

									if ( response.error &&
									     response.product_url ) {
										window.location = response.product_url;
										return false;
									}

									// update cart fragment
									var fragments = response.fragments,
									    cart_hash = response.cart_hash;

									if ( fragments ) {
										$.each( fragments,
											function( key, value ) {
												$( key ).replaceWith( value );
											} );
									}

									$this.addClass( 'added' );
									$( 'body' ).trigger( 'added_to_cart', [ fragments, cart_hash ] );

								},
								error: function( error ) {
									console.log( error );
								}
							} );

							return false;
						} );

				},

				updateAttributes: function( $swatches, variationData ) {

					var self                    = this,
					    attributes              = self.getChosenAttributes( $swatches ),
					    currentAttributes       = attributes.data,
					    available_options_count = 0,
					    $swatch                 = $swatches.find( '.isw-swatch' );

					$swatch.each( function( idx, el ) {

						var current_attr_sw         = $( el ),
						    current_attr_name       = 'attribute_' +
						                              current_attr_sw.attr(
							                              'data-attribute' ),
						    selected_attr_val       = current_attr_sw.find(
							    '.isw-term.isw-selected' ).attr( 'data-term' ),
						    selected_attr_val_valid = true,
						    checkAttributes         = $.extend( true, {},
							    currentAttributes );

						checkAttributes[ current_attr_name ] = '';

						var variations = self.findMatchingVariations(
							variationData, checkAttributes );

						// Loop through variations.
						for ( var num in variations ) {
							if ( typeof variations[ num ] !== 'undefined' ) {
								var variationAttributes = variations[ num ].attributes;

								for ( var attr_name in variationAttributes ) {
									if ( variationAttributes.hasOwnProperty(
										attr_name ) ) {
										var attr_val         = variationAttributes[ attr_name ],
										    variation_active = '';

										if ( attr_name === current_attr_name ) {
											if ( variations[ num ].variation_is_active ) {
												variation_active = 'enabled';
											}

											if ( attr_val ) {
												// available
												current_attr_sw.find(
													'.isw-term[data-term="' + attr_val + '"]' ).addClass( 'isw-' + variation_active );
											} else {
												// apply for all swatches
												current_attr_sw.find( '.isw-term' ).addClass( 'isw-' + variation_active );
											}
										}
									}
								}
							}
						}

						available_options_count = current_attr_sw.find(
							'.isw-term.isw-enabled' ).length;

						if ( selected_attr_val && (
							available_options_count === 0 || current_attr_sw.find(
								'.isw-term.isw-enabled[data-term="' +
								self.addSlashes( selected_attr_val ) + '"]' ).length ===
							                                 0
						) ) {
							selected_attr_val_valid = false;
						}

						// Disable terms not available
						current_attr_sw.find( '.isw-term:not(.isw-enabled)' ).addClass( 'isw-disabled' );
					} );
				},

				addSlashes: function( string ) {
					string = string.replace( /'/g, '\\\'' );
					string = string.replace( /"/g, '\\\"' );
					return string;
				},

				getChosenAttributes: function( $swatches ) {

					var data    = {},
					    count   = 0,
					    chosen  = 0,
					    $swatch = $swatches.find( '.isw-swatch' );

					$swatch.each( function() {

						var attribute_name = 'attribute_' +
						                     $( this ).attr( 'data-attribute' ),
						    value          = $( this ).find( '.isw-term.isw-selected' ).attr( 'data-term' ) || '';

						if ( value.length > 0 ) {
							chosen ++;
						}

						count ++;
						data[ attribute_name ] = value;
					} );

					return {
						'count': count,
						'chosenCount': chosen,
						'data': data,
					};
				},

				findMatchingVariations: function( variationData, settings ) {
					var matching = [];
					for ( var i = 0; i < variationData.length; i ++ ) {
						var variation = variationData[ i ];

						if ( this.isMatch( variation.attributes, settings ) ) {
							matching.push( variation );
						}
					}
					return matching;
				},

				isMatch: function( variation_attributes, attributes ) {
					var match = true;
					for ( var attr_name in variation_attributes ) {
						if ( variation_attributes.hasOwnProperty( attr_name ) ) {
							var val1 = variation_attributes[ attr_name ];
							var val2 = attributes[ attr_name ];
							if ( val1 !== undefined && val2 !== undefined &&
							     val1.length !== 0 && val2.length !== 0 &&
							     val1 !== val2 ) {
								match = false;
							}
						}
					}
					return match;
				},

				foundVariation: function( $swatches, variation ) {

					var self         = this,
					    $product     = $swatches.closest( '.product' ),
					    $price       = $product.find( isw.price_selector ).not( '.price-cloned' ),
					    $price_clone = $price.clone().addClass( 'price-cloned' ).css( 'display', 'none' );

					if ( variation.price_html ) {

						if ( ! $product.find( '.price-cloned' ).length ) {
							$product.append( $price_clone );
						}

						$price.replaceWith( variation.price_html );
					} else {
						if ( $product.find( '.price-cloned' ).length ) {
							$price.replaceWith( $price_clone.html() );
							$price_clone.remove();
						}
					}

					// add variation id
					$swatches.attr( 'data-variation_id', variation.variation_id );

					// update image
					self.variationsImageUpdate( variation, $product );

					// change add to cart button text
					self.changeAddToCartBtnText( variation, $product );
				},

				setVariationAttr: function( $el, attr, value ) {
					if ( undefined === $el.attr( 'data-o_' + attr ) ) {
						$el.attr( 'data-o_' + attr, (
							! $el.attr( attr )
						) ? '' : $el.attr( attr ) );
					}
					if ( false === value ) {
						$el.removeAttr( attr );
					} else {
						$el.attr( attr, value );
					}
				},

				resetVariationAttr: function( $el, attr ) {
					if ( undefined !== $el.attr( 'data-o_' + attr ) ) {
						$el.attr( attr, $el.attr( 'data-o_' + attr ) );
					}
				},

				variationsImageUpdate: function( variation, $product ) {

					var self         = this,
					    $product_img = $product.find( '.wp-post-image' );

					if ( variation && variation.image.full_src ) {
						self.setVariationAttr( $product_img, 'src',
							variation.image.full_src );
						self.setVariationAttr( $product_img, 'srcset',
							variation.image.full_src );
						self.setVariationAttr( $product_img, 'sizes',
							variation.image.sizes );
					} else {
						self.resetVariationAttr( $product_img, 'src' );
						self.resetVariationAttr( $product_img, 'srcset' );
						self.resetVariationAttr( $product_img, 'sizes' );
					}

				},

				changeAddToCartBtnText: function( variation, $product ) {

					var $atcBtn = $product.find( '.add_to_cart_button' ),
					    text    = '';

					$atcBtn.removeClass( 'added' );

					if ( Object.keys( variation.attributes ).length == $product.find( '.isw-swatch' ).length ) {
						if ( variation.is_in_stock === true ) {
							text = isw.localization.add_to_cart_text;
							$atcBtn.addClass( 'isw-ready' ).removeClass( 'isw-readmore' );
						} else {
							// out of stock
							text = isw.localization.read_more_text;
							$atcBtn.addClass( 'isw-readmore' ).removeClass( 'isw-ready' );
						}
					} else {
						text = isw.localization.select_options_text;
						$atcBtn.removeClass( 'isw-ready isw-readmore' );
					}

					$atcBtn.addClass( 'isw-text-changed' ).text( text );

					$( 'body' ).trigger( 'isw_change_add_to_cart_button_text', [ $product ] );
				},
			},
		} )
	}
).apply( this, [ window.isw, jQuery ] );

(
	function( isw, $ ) {
		$( document ).ready( function() {
			if ( typeof isw.Swatches !== 'undefined' ) {
				isw.Swatches.init();
			}
		} );
	}
).apply( this, [ window.isw, jQuery ] );
