<html><head></head><body>(function($) {
    &#39;use strict&#39;;

			/*==== One Page Nav  ====*/
			var top_offset = $(&#39;.one_page&#39;).height() +0;
			$(&#39;.one_page .starntile_menu .nav_scroll&#39;).onePageNav({
				currentClass: &#39;current&#39;,
				changeHash: false,
				scrollSpeed: 1000,
				 scrollOffset: top_offset,
				scrollThreshold: 0.5,
				filter: &#39;&#39;,
				easing: &#39;swing&#39;,
			});
			
			$(&#34;.nav_scroll &gt; li:first-child&#34;).addClass(&#34;current&#34;);

			/*==== sticky nav 1  ====*/
			$(&#39;.one_page&#39;).scrollToFixed({
				preFixed: function() {
					$(this).find(&#39;.scroll_fixed&#39;).addClass(&#39;prefix&#39;);
				},
				postFixed: function() {
					$(this).find(&#39;.scroll_fixed&#39;).addClass(&#39;postfix&#39;).removeClass(&#39;prefix&#39;);
				}
			});	
		
			/*==== sticky nav 2  ====*/
			var headers1 = $(&#39;.trp_nav_area&#39;);
			$(window).on(&#39;scroll&#39;, function() {

				if ($(window).scrollTop() &gt; 200) {
					headers1.addClass(&#39;hbg2&#39;);
				} else {
					headers1.removeClass(&#39;hbg2&#39;);
				}		
			});	

			/*==== Mobile Menu  ====*/
			$(&#39;.mobile-menu nav&#39;).meanmenu({
				meanScreenWidth: &#34;990&#34;,
				meanMenuContainer: &#34;.mobile-menu&#34;,
				onePage: true,
			});
			
			/*==== Top quearys menu  ====*/
			var emsmenu = $(&#34;.em-quearys-menu i.t-quearys&#34;);
			var emscmenu = $(&#34;.em-quearys-menu i.t-close&#34;);
			var emsinner = $(&#34;.em-quearys-inner&#34;);
			emsmenu.on(&#39;click&#39;, function() {
				emsinner.addClass(&#39;em-s-open&#39;);
				$(this).addClass(&#39;em-s-hiddens&#39;);
				emscmenu.removeClass(&#39;em-s-hidden&#39;);
			});
			emscmenu.on(&#39;click&#39;, function() {
				emsinner.removeClass(&#39;em-s-open&#39;);
				$(this).addClass(&#39;em-s-hidden&#39;);
				emsmenu.removeClass(&#39;em-s-hidden&#39;);
			});

			/*==== popup mobile menu  ====*/
			
			var mrightma = $(&#34;.mobile_menu_o i.openclass&#34;);
			var mrightmi = $(&#34;.mobile_menu_o i.closeclass&#34;);
			var mrightmir = $(&#34;.mobile_menu_inner&#34;);
			var mobile_ov = $(&#34;.mobile_overlay&#34;);
			mrightma.on(&#39;click&#39;, function() {
				mrightmir.addClass(&#39;tx-s-open&#39;);
				mobile_ov.addClass(&#39;mactive&#39;);
			});
			mrightmi.on(&#39;click&#39;, function() {
				mrightmir.removeClass(&#39;tx-s-open&#39;);
				mobile_ov.removeClass(&#39;mactive&#39;);
			});
			
			/* popup sideber menu */
			var rightma = $(&#34;.right_sideber_menu i.openclass&#34;);
			var rightmi = $(&#34;.right_sideber_menu i.closeclass&#34;);
			var rightmir = $(&#34;.right_sideber_menu_inner&#34;);
			rightma.on(&#39;click&#39;, function() {
				rightmir.addClass(&#39;tx-s-open&#39;);
			});
			rightmi.on(&#39;click&#39;, function() {
				rightmir.removeClass(&#39;tx-s-open&#39;);
			});	
			
			/*==== WOW active js   ====*/
			new WOW().init();

			/*==== scrollUp  ====*/
			$.scrollUp({
				scrollText: &#39;<i class="icofont-thin-up"></i>&#39;,
				easingType: &#39;linear&#39;,
				scrollSpeed: 900,
				animation: &#39;fade&#39;
			});

			/*==== Venubox  ====*/
			$(&#39;.venobox&#39;).venobox({
				numeratio: true,
				infinigall: true
			});
			
			/*==== swiper js  ====*/
			new Swiper(&#39;.swiper_active&#39;, {
				effect: &#39;defult&#39;,
				grabCursor: false,
				speed: 2000,
				direction: &#39;horizontal&#39;,
				slidesPerView: 1,
				spaceBetween: 30,
				freeMode: false,
				mousewheel: false,
				keyboard: false,
				loop: true,
					autoplay: {
					delay: 8000,								  
					disableOnInteraction: false,
				},
				  pagination: {
					el: &#39;.swiper-pagination&#39;,
					clickable: true,
					type: &#39;progressbar&#39;,
				  },
				  navigation: {
					nextEl: &#39;.swiper-button-next&#39;,
					prevEl: &#39;.swiper-button-prev&#39;,
				  },
				  scrollbar: {
					el: &#39;.scrollbar_false&#39;,
					hide: true,
				  },					   
			});
				
			/*==== Brand active ====*/
			var witrbslick = $(&#39;.brand_act&#39;);
				if(witrbslick.length &gt; 0){
			 
				witrbslick.slick({
					infinite: true,
					autoplay: true,
					default: true,
					autoplaySpeed: 6000,
					speed: 1000,					
					slidesToShow: 5,
					slidesToScroll: 1,
					arrows: false,
					dots: false,
					responsive: [
						{
							breakpoint: 1200,
							settings: {
								slidesToShow: 4,
								slidesToScroll: 1,
							}
						},
						{
							breakpoint: 992,
							settings: {
								slidesToShow: 3,
								slidesToScroll: 1,
							}
						},
						{
							breakpoint: 767,
							settings: {
								slidesToShow: 1,
								slidesToScroll: 1,
							}
						}
						]
					});
				}
				
			/*==== team active ====*/
			
			var witrbslick = $(&#39;.team_act&#39;);				
				if(witrbslick.length &gt; 0){
				witrbslick.slick({
					infinite: true,
					autoplay: true,
					autoplaySpeed: 3000,
					speed: 700,					
					slidesToShow: 3,
					slidesToScroll: 1,
					arrows: false,
					centerMode: false,
					centerPadding: &#39;&#39;,
					dots: true,
					responsive: [
						{
							breakpoint: 1200,
							settings: {
								slidesToShow: 3,
								slidesToScroll: 1,
							}
						},
						{
							breakpoint: 992,
							settings: {
								slidesToShow: 2,
								slidesToScroll: 1,
							}
						},
						{
							breakpoint: 767,
							settings: {
								slidesToShow: 1,
								slidesToScroll: 1,
							}
						}
						]
					});
				}
			
			/*==== testimonial active ====*/
			
			var witrbtslick = $(&#39;.test_act&#39;);				
				if(witrbtslick.length &gt; 0){
				witrbtslick.slick({
					infinite: true,
					autoplay: true,
					autoplaySpeed: 3000,
					speed: 1000,					
					slidesToShow: 3,
					slidesToScroll: 1,
					arrows: false,
					dots: false,
					responsive: [
						{
							breakpoint: 1200,
							settings: {
								slidesToShow: 2,
								slidesToScroll: 1,
							}
						},
						{
							breakpoint: 992,
							settings: {
								slidesToShow: 2,
								slidesToScroll: 1,
							}
						},
						{
							breakpoint: 767,
							settings: {
								slidesToShow: 1,
								slidesToScroll: 1,
							}
						}
						]
					});
				}
			 
			/*==== testimonial active ====*/
			 
			var witrbtslick = $(&#39;.test2_act&#39;);				
				if(witrbtslick.length &gt; 0){
				witrbtslick.slick({
					infinite: true,
					autoplay: true,
					autoplaySpeed: 3000,
					speed: 1000,					
					slidesToShow: 3,
					slidesToScroll: 1,
					arrows: true,
					dots: false,
					responsive: [
						{
							breakpoint: 1200,
							settings: {
								slidesToShow: 3,
								slidesToScroll: 1,
							}
						},
						{
							breakpoint: 992,
							settings: {
								slidesToShow: 2,
								slidesToScroll: 1,
							}
						},
						{
							breakpoint: 767,
							settings: {
								slidesToShow: 1,
								slidesToScroll: 1,
							}
						}
						]
					});
				}
				
			/*==== blog active ====*/
			var witrbslick = $(&#39;.blog_act&#39;);				
				if(witrbslick.length &gt; 0){
				witrbslick.slick({
					infinite: true,
					autoplay: true,
					autoplaySpeed: 6000,
					speed: 1000,					
					slidesToShow: 3,
					slidesToScroll: 1,
					arrows: true,
					dots: false,
					responsive: [
						{
							breakpoint: 1200,
							settings: {
								slidesToShow: 3,
								slidesToScroll: 1,
							}
						},
						{
							breakpoint: 992,
							settings: {
								slidesToShow: 2,
								slidesToScroll: 1,
							}
						},
						{
							breakpoint: 767,
							settings: {
								slidesToShow: 1,
								slidesToScroll: 1,
							}
						}
						]
					});
				}

			/*==== blog sidebar active ====*/
			$(&#39;.blog_sidebar_image_act&#39;).slick({	
				infinite: true,
				autoplay: true,
				autoplaySpeed: 3000,
				speed: 1000,					
				slidesToShow: 1,
				slidesToScroll: 1,
				centerMode: true,
				centerPadding: &#39;&#39;,					
				arrows: false,
				dots: false,
				responsive: [
					{
						breakpoint: 1200,
						settings: {
							slidesToShow: 1,
							slidesToScroll: 1,
						}
					},
					{
						breakpoint: 992,
						settings: {
							slidesToShow: 1,
							slidesToScroll: 1,
						}
					},
					{
						breakpoint: 768,
						settings: {
							slidesToShow: 1,
							slidesToScroll: 1,
						}
					}
					]
				});
				
			/*==== blog sidebar active ====*/
			$(&#39;.footer_act&#39;).slick({	
				infinite: true,
				autoplay: true,
				autoplaySpeed: 3000,
				speed: 1000,					
				slidesToShow: 1,
				slidesToScroll: 1,
				centerMode: true,
				centerPadding: &#39;&#39;,					
				arrows: false,
				dots: true,
				responsive: [
					{
						breakpoint: 1200,
						settings: {
							slidesToShow: 1,
							slidesToScroll: 1,
						}
					},
					{
						breakpoint: 992,
						settings: {
							slidesToShow: 1,
							slidesToScroll: 1,
						}
					},
					{
						breakpoint: 768,
						settings: {
							slidesToShow: 1,
							slidesToScroll: 1,
						}
					}
					]
				});

			/*==== project active ====*/
			
			var witr_cp = $(&#39;.witr_cr1&#39;);
				witr_cp.circleProgress({
					startAngle: -Math.PI / 4 * 3,
					value: 0.83,
					size: 150,
					lineCap: &#39;round&#39;,
					fill: {  gradient: [&#34;#E53E29&#34;, &#34;#E53E29&#34;]}
				});
			 var witr_cp = $(&#39;.witr_cr2&#39;);
				witr_cp.circleProgress({
					startAngle: -Math.PI / 4 * 3,
					value: 0.93,
					size: 150,
					lineCap: &#39;round&#39;,
					fill: {  gradient: [&#34;#E53E29&#34;, &#34;#E53E29&#34;]}
				});
				var witr_cp = $(&#39;.witr_cr3&#39;);
					witr_cp.circleProgress({
					startAngle: -Math.PI / 4 * 3,
					value: 0.73,
					size: 150,
					lineCap: &#39;round&#39;,
					fill: {  gradient: [&#34;#E53E29&#34;, &#34;#E53E29&#34;]}
				});

			/*==== project active ====*/
			
			var witrbslick = $(&#39;.proj_act&#39;);				
				if(witrbslick.length &gt; 0){
				witrbslick.slick({
					infinite: true,
					autoplay: true,
					autoplaySpeed: 3000,
					speed: 1000,					
					slidesToShow: 4,
					slidesToScroll: 2,
					arrows: false,
					dots: true,
					responsive: [
						{
							breakpoint: 1200,
							settings: {
								slidesToShow: 3,
								slidesToScroll: 1,
							}
						},
						{
							breakpoint: 992,
							settings: {
								slidesToShow: 2,
								slidesToScroll: 1,
							}
						},
						{
							breakpoint: 767,
							settings: {
								slidesToShow: 1,
								slidesToScroll: 1,
							}
						}
						]
					});
				}
				
			/*==== portfolio isotop ====*/
			
			$(&#39;.portfolio_active&#39;).imagesLoaded( function() {
				if ($.fn.isotope) {

					var $portfolio = $(&#39;.portfolio_active&#39;);

					$portfolio.isotope({

						itemSelector: &#39;.grid-item&#39;,

						filter: &#39;*&#39;,

						resizesContainer: true,

						layoutMode: &#39;masonry&#39;,

						transitionDuration: &#39;0.8s&#39;

					});

					$(&#39;.filter_menu li&#39;).on(&#39;click&#39;, function() {

						$(&#39;.filter_menu li&#39;).removeClass(&#39;current_menu_item&#39;);

						$(this).addClass(&#39;current_menu_item&#39;);

						var selector = $(this).attr(&#39;data-filter&#39;);

						$portfolio.isotope({

							filter: selector,

						});

					});

				};
			});
				
			/*==== Mouse Direction Hover Iffect ====*/
			
			$(&#39;.single_protfolio&#39;).directionalHover();
			$(&#39;.single_protfolio&#39;).directionalHover({
				// CSS class for the overlay
				overlay: &#34;em_port_content&#34;,
				// Linear or swing
				easing: &#34;swing&#34;,
				speed: 50
			});	
			
			/*==== Bootstrap Accordion  ====*/
			$(&#39;.faq-part .card&#39;).each(function () {
				var $this = $(this);
				$this.on(&#39;click&#39;, function (e) {
					var has = $this.hasClass(&#39;active&#39;);
					$(&#39;.faq-part .card&#39;).removeClass(&#39;active show&#39;);
					if (has) {
						$this.removeClass(&#39;active show&#39;);
					} else {
						$this.addClass(&#39;active show&#39;);
					}
				});
			});
			
			/*==== footer js ====*/
			
			window.mc4wp = window.mc4wp || {
         	listeners: [],
         	forms: {
         		on: function(evt, cb) {
         			window.mc4wp.listeners.push(
         				{
         					event   : evt,
         					callback: cb
         				}
         			);
         		}
         	}
         }
			
			/*==== counter active ====*/
				
			$(&#39;.counter&#39;).counterUp({
				delay: 20,
				time: 3000
			});

})(jQuery);




</body></html>