<html><head></head><body>/*!
* jQuery meanMenu v2.0.8
* @Copyright (C) 2012-2024 Chris Wharton @ MeanThemes (://github.com/meanthemes/meanMenu)
*
*/
/*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* THIS SOFTWARE AND DOCUMENTATION IS PROVIDED &#34;AS IS,&#34; AND COPYRIGHT
* HOLDERS MAKE NO REPRESENTATIONS OR WARRANTIES, EXPRESS OR IMPLIED,
* INCLUDING BUT NOT LIMITED TO, WARRANTIES OF MERCHANTABILITY OR
* FITNESS FOR ANY PARTICULAR PURPOSE OR THAT THE USE OF THE SOFTWARE
* OR DOCUMENTATION WILL NOT INFRINGE ANY THIRD PARTY PATENTS,
* COPYRIGHTS, TRADEMARKS OR OTHER RIGHTS.COPYRIGHT HOLDERS WILL NOT
* BE LIABLE FOR ANY DIRECT, INDIRECT, SPECIAL OR CONSEQUENTIAL
* DAMAGES ARISING OUT OF ANY USE OF THE SOFTWARE OR DOCUMENTATION.
*
* You should have received a copy of the GNU General Public License
* along with this program. If not, see <http: gnu.org="" licenses="">.
*
* Find more information at http://www.meanthemes.com/plugins/meanmenu/
*
*/
(function ($) {
	&#34;use strict&#34;;
		$.fn.meanmenu = function (options) {
				var defaults = {
						meanMenuTarget: jQuery(this), // Target the current HTML markup you wish to replace
						meanMenuContainer: &#39;.mobile-menu-area .container&#39;, // Choose where meanmenu will be placed within the HTML
						meanMenuClose: &#34;X&#34;, // single character you want to represent the close menu button
						meanMenuCloseSize: &#34;18px&#34;, // set font size of close button
						meanMenuOpen: &#34;<span></span><span></span><span></span>&#34;, // text/markup you want when menu is closed
						meanRevealPosition: &#34;right&#34;, // left right or center positions
						meanRevealPositionDistance: &#34;0&#34;, // Tweak the position of the menu
						meanRevealColour: &#34;&#34;, // override CSS colours for the reveal background
						meanScreenWidth: &#34;767&#34;, // set the screen width you want meanmenu to kick in at
						meanNavPush: &#34;&#34;, // set a height here in px, em or % if you want to budge your layout now the navigation is missing.
						meanShowChildren: true, // true to show children in the menu, false to hide them
						meanExpandableChildren: true, // true to allow expand/collapse children
						meanExpand: &#34;+&#34;, // single character you want to represent the expand for ULs
						meanContract: &#34;-&#34;, // single character you want to represent the contract for ULs
						meanRemoveAttrs: false, // true to remove classes and IDs, false to keep them
						onePage: false, // set to true for one page sites
						meanDisplay: &#34;block&#34;, // override display method for table cell based layouts e.g. table-cell
						removeElements: &#34;&#34; // set to hide page elements
				};
				options = $.extend(defaults, options);

				// get browser width
				var currentWidth = window.innerWidth || document.documentElement.clientWidth;

				return this.each(function () {
						var meanMenu = options.meanMenuTarget;
						var meanContainer = options.meanMenuContainer;
						var meanMenuClose = options.meanMenuClose;
						var meanMenuCloseSize = options.meanMenuCloseSize;
						var meanMenuOpen = options.meanMenuOpen;
						var meanRevealPosition = options.meanRevealPosition;
						var meanRevealPositionDistance = options.meanRevealPositionDistance;
						var meanRevealColour = options.meanRevealColour;
						var meanScreenWidth = options.meanScreenWidth;
						var meanNavPush = options.meanNavPush;
						var meanRevealClass = &#34;.meanmenu-reveal&#34;;
						var meanShowChildren = options.meanShowChildren;
						var meanExpandableChildren = options.meanExpandableChildren;
						var meanExpand = options.meanExpand;
						var meanContract = options.meanContract;
						var meanRemoveAttrs = options.meanRemoveAttrs;
						var onePage = options.onePage;
						var meanDisplay = options.meanDisplay;
						var removeElements = options.removeElements;

						//detect known mobile/tablet usage
						var isMobile = false;
						if ( (navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i)) || (navigator.userAgent.match(/iPad/i)) || (navigator.userAgent.match(/Android/i)) || (navigator.userAgent.match(/Blackberry/i)) || (navigator.userAgent.match(/Windows Phone/i)) ) {
								isMobile = true;
						}

						if ( (navigator.userAgent.match(/MSIE 8/i)) || (navigator.userAgent.match(/MSIE 7/i)) ) {
							// add scrollbar for IE7 &amp; 8 to stop breaking resize function on small content sites
								jQuery(&#39;html&#39;).css(&#34;overflow-y&#34; , &#34;scroll&#34;);
						}

						var meanRevealPos = &#34;&#34;;
						var meanCentered = function() {
							if (meanRevealPosition === &#34;center&#34;) {
								var newWidth = window.innerWidth || document.documentElement.clientWidth;
								var meanCenter = ( (newWidth/2)-22 )+&#34;px&#34;;
								meanRevealPos = &#34;left:&#34; + meanCenter + &#34;;right:auto;&#34;;

								if (!isMobile) {
									jQuery(&#39;.meanmenu-reveal&#39;).css(&#34;left&#34;,meanCenter);
								} else {
									jQuery(&#39;.meanmenu-reveal&#39;).animate({
											left: meanCenter
									});
								}
							}
						};

						var menuOn = false;
						var meanMenuExist = false;


						if (meanRevealPosition === &#34;right&#34;) {
								meanRevealPos = &#34;right:&#34; + meanRevealPositionDistance + &#34;;left:auto;&#34;;
						}
						if (meanRevealPosition === &#34;left&#34;) {
								meanRevealPos = &#34;left:&#34; + meanRevealPositionDistance + &#34;;right:auto;&#34;;
						}
						// run center function
						meanCentered();

						// set all styles for mean-reveal
						var $navreveal = &#34;&#34;;

						var meanInner = function() {
								// get last class name
								if (jQuery($navreveal).is(&#34;.meanmenu-reveal.meanclose&#34;)) {
										$navreveal.html(meanMenuClose);
								} else {
										$navreveal.html(meanMenuOpen);
								}
						};

						// re-instate original nav (and call this on window.width functions)
						var meanOriginal = function() {
							jQuery(&#39;.mean-bar,.mean-push&#39;).remove();
							jQuery(meanContainer).removeClass(&#34;mean-container&#34;);
							jQuery(meanMenu).css(&#39;display&#39;, meanDisplay);
							menuOn = false;
							meanMenuExist = false;
							jQuery(removeElements).removeClass(&#39;mean-remove&#39;);
						};

						// navigation reveal
						var showMeanMenu = function() {
								var meanStyles = &#34;background:&#34;+meanRevealColour+&#34;;color:&#34;+meanRevealColour+&#34;;&#34;+meanRevealPos;
								if (currentWidth &lt;= meanScreenWidth) {
								jQuery(removeElements).addClass(&#39;mean-remove&#39;);
									meanMenuExist = true;
									// add class to body so we don&#39;t need to worry about media queries here, all CSS is wrapped in &#39;.mean-container&#39;
									jQuery(meanContainer).addClass(&#34;mean-container&#34;);
									jQuery(&#39;.mean-container&#39;).prepend(&#39;<div class="mean-bar"><a href="#nav" class="meanmenu-reveal" style="&#39;+meanStyles+&#39;">Show Navigation</a><nav class="mean-nav"></nav></div>&#39;);

									//push meanMenu navigation into .mean-nav
									var meanMenuContents = jQuery(meanMenu).html();
									jQuery(&#39;.mean-nav&#39;).html(meanMenuContents);

									// remove all classes from EVERYTHING inside meanmenu nav
									if(meanRemoveAttrs) {
										jQuery(&#39;nav.mean-nav ul, nav.mean-nav ul *&#39;).each(function() {
											// First check if this has mean-remove class
											if (jQuery(this).is(&#39;.mean-remove&#39;)) {
												jQuery(this).attr(&#39;class&#39;, &#39;mean-remove&#39;);
											} else {
												jQuery(this).removeAttr(&#34;class&#34;);
											}
											jQuery(this).removeAttr(&#34;id&#34;);
										});
									}

									// push in a holder div (this can be used if removal of nav is causing layout issues)
									jQuery(meanMenu).before(&#39;<div class="mean-push">&#39;);
									jQuery(&#39;.mean-push&#39;).css(&#34;margin-top&#34;,meanNavPush);

									// hide current navigation and reveal mean nav link
									jQuery(meanMenu).hide();
									jQuery(&#34;.meanmenu-reveal&#34;).show();

									// turn &#39;X&#39; on or off
									jQuery(meanRevealClass).html(meanMenuOpen);
									$navreveal = jQuery(meanRevealClass);

									//hide mean-nav ul
									jQuery(&#39;.mean-nav ul&#39;).hide();

									// hide sub nav
									if(meanShowChildren) {
											// allow expandable sub nav(s)
											if(meanExpandableChildren){
												jQuery(&#39;.mean-nav ul ul&#39;).each(function() {
														if(jQuery(this).children().length){
																jQuery(this,&#39;li:first&#39;).parent().append(&#39;<a class="mean-expand" href="#" style="font-size: &#39;+ meanMenuCloseSize +&#39;">&#39;+ meanExpand +&#39;</a>&#39;);
														}
												});
												jQuery(&#39;.mean-expand&#39;).on(&#34;click&#34;,function(e){
														e.preventDefault();
															if (jQuery(this).hasClass(&#34;mean-clicked&#34;)) {
																	jQuery(this).text(meanExpand);
																jQuery(this).prev(&#39;ul&#39;).slideUp(300, function(){});
														} else {
																jQuery(this).text(meanContract);
																jQuery(this).prev(&#39;ul&#39;).slideDown(300, function(){});
														}
														jQuery(this).toggleClass(&#34;mean-clicked&#34;);
												});
											} else {
													jQuery(&#39;.mean-nav ul ul&#39;).show();
											}
									} else {
											jQuery(&#39;.mean-nav ul ul&#39;).hide();
									}

									// add last class to tidy up borders
									jQuery(&#39;.mean-nav ul li&#39;).last().addClass(&#39;mean-last&#39;);
									$navreveal.removeClass(&#34;meanclose&#34;);
									jQuery($navreveal).click(function(e){
										e.preventDefault();
								if( menuOn === false ) {
												$navreveal.css(&#34;text-align&#34;, &#34;center&#34;);
												$navreveal.css(&#34;text-indent&#34;, &#34;0&#34;);
												$navreveal.css(&#34;font-size&#34;, meanMenuCloseSize);
												jQuery(&#39;.mean-nav ul:first&#39;).slideDown();
												menuOn = true;
										} else {
											jQuery(&#39;.mean-nav ul:first&#39;).slideUp();
											menuOn = false;
										}
											$navreveal.toggleClass(&#34;meanclose&#34;);
											meanInner();
											jQuery(removeElements).addClass(&#39;mean-remove&#39;);
									});

									// for one page websites, reset all variables...
									if ( onePage ) {
										jQuery(&#39;.mean-nav ul &gt; li &gt; a:first-child&#39;).on( &#34;click&#34; , function () {
											jQuery(&#39;.mean-nav ul:first&#39;).slideUp();
											menuOn = false;
											jQuery($navreveal).toggleClass(&#34;meanclose&#34;).html(meanMenuOpen);
										});
									}
							} else {
								meanOriginal();
							}
						};

						if (!isMobile) {
								// reset menu on resize above meanScreenWidth
								jQuery(window).resize(function () {
										currentWidth = window.innerWidth || document.documentElement.clientWidth;
										if (currentWidth &gt; meanScreenWidth) {
												meanOriginal();
										} else {
											meanOriginal();
										}
										if (currentWidth &lt;= meanScreenWidth) {
												showMeanMenu();
												meanCentered();
										} else {
											meanOriginal();
										}
								});
						}

					jQuery(window).resize(function () {
								// get browser width
								currentWidth = window.innerWidth || document.documentElement.clientWidth;

								if (!isMobile) {
										meanOriginal();
										if (currentWidth &lt;= meanScreenWidth) {
												showMeanMenu();
												meanCentered();
										}
								} else {
										meanCentered();
										if (currentWidth &lt;= meanScreenWidth) {
												if (meanMenuExist === false) {
														showMeanMenu();
												}
										} else {
												meanOriginal();
										}
								}
						});

					// run main menuMenu function on load
					showMeanMenu();
				});
		};
})(jQuery);
</div></http:></body></html>