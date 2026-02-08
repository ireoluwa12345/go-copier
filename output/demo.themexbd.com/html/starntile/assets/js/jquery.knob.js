<html><head></head><body>/*!jQuery Knob*/
/**
 * Downward compatible, touchable dial
 *
 * Version: 1.2.10
 * Requires: jQuery v1.7+
 *
 * Copyright (c) 2012 Anthony Terrien
 * Under MIT License (http://www.opensource.org/licenses/mit-license.php)
 *
 * Thanks to vor, eskimoblood, spiffistan, FabrizioC
 */
(function (factory) {
    if (typeof define === &#39;function&#39; &amp;&amp; define.amd) {
        // AMD. Register as an anonymous module.
        define([&#39;jquery&#39;], factory);
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

    /**
     * Kontrol library
     */
    &#34;use strict&#34;;

    /**
     * Definition of globals and core
     */
    var k = {}, // kontrol
        max = Math.max,
        min = Math.min;

    k.c = {};
    k.c.d = $(document);
    k.c.t = function (e) {
        return e.originalEvent.touches.length - 1;
    };

    /**
     * Kontrol Object
     *
     * Definition of an abstract UI control
     *
     * Each concrete component must call this one.
     * <code>
     * k.o.call(this);
     * </code>
     */
    k.o = function () {
        var s = this;

        this.o = null; // array of options
        this.$ = null; // jQuery wrapped element
        this.i = null; // mixed HTMLInputElement or array of HTMLInputElement
        this.g = null; // deprecated 2D graphics lowgo for &#39;pre-rendering&#39;
        this.v = null; // value ; mixed array or integer
        this.cv = null; // change value ; not commited value
        this.x = 0; // canvas x position
        this.y = 0; // canvas y position
        this.w = 0; // canvas width
        this.h = 0; // canvas height
        this.$c = null; // jQuery canvas element
        this.c = null; // rendered canvas lowgo
        this.t = 0; // touches index
        this.isInit = false;
        this.fgColor = null; // main color
        this.pColor = null; // previous color
        this.dH = null; // draw hook
        this.cH = null; // change hook
        this.eH = null; // cancel hook
        this.rH = null; // release hook
        this.scale = 1; // scale factor
        this.relative = false;
        this.relativeWidth = false;
        this.relativeHeight = false;
        this.$div = null; // component div

        this.run = function () {
            var cf = function (e, conf) {
                var k;
                for (k in conf) {
                    s.o[k] = conf[k];
                }
                s._carve().init();
                s._configure()
                 ._draw();
            };

            if (this.$.data(&#39;kontroled&#39;)) return;
            this.$.data(&#39;kontroled&#39;, true);

            this.extend();
            this.o = $.extend({
                    // Config
                    min: this.$.data(&#39;min&#39;) !== undefined ? this.$.data(&#39;min&#39;) : 0,
                    max: this.$.data(&#39;max&#39;) !== undefined ? this.$.data(&#39;max&#39;) : 100,
                    stopper: true,
                    readOnly: this.$.data(&#39;readonly&#39;) || (this.$.attr(&#39;readonly&#39;) === &#39;readonly&#39;),

                    // UI
                    cursor: this.$.data(&#39;cursor&#39;) === true &amp;&amp; 30
                            || this.$.data(&#39;cursor&#39;) || 0,
                    thickness: this.$.data(&#39;thickness&#39;)
                               &amp;&amp; Math.max(Math.min(this.$.data(&#39;thickness&#39;), 1), 0.01)
                               || 0.35,
                    lineCap: this.$.data(&#39;linecap&#39;) || &#39;butt&#39;,
                    width: this.$.data(&#39;width&#39;) || 200,
                    height: this.$.data(&#39;height&#39;) || 200,
                    displayInput: this.$.data(&#39;displayinput&#39;) == null || this.$.data(&#39;displayinput&#39;),
                    displayPrevious: this.$.data(&#39;displayprevious&#39;),
                    fgColor: this.$.data(&#39;fgcolor&#39;) || &#39;#87CEEB&#39;,
                    inputColor: this.$.data(&#39;inputcolor&#39;),
                    font: this.$.data(&#39;font&#39;) || &#39;Arial&#39;,
                    fontWeight: this.$.data(&#39;font-weight&#39;) || &#39;bold&#39;,
                    inline: false,
                    step: this.$.data(&#39;step&#39;) || 1,
                    rotation: this.$.data(&#39;rotation&#39;),

                    // Hooks
                    draw: null, // function () {}
                    change: null, // function (value) {}
                    cancel: null, // function () {}
                    release: null, // function (value) {}

                    // Output formatting, allows to add unit: %, ms ...
                    format: function(v) {
                        return v;
                    },
                    parse: function (v) {
                        return parseFloat(v);
                    }
                }, this.o
            );

            // finalize options
            this.o.flip = this.o.rotation === &#39;anticlockwise&#39; || this.o.rotation === &#39;acw&#39;;
            if (!this.o.inputColor) {
                this.o.inputColor = this.o.fgColor;
            }

            // routing value
            if (this.$.is(&#39;fieldset&#39;)) {

                // fieldset = array of integer
                this.v = {};
                this.i = this.$.find(&#39;input&#39;);
                this.i.each(function(k) {
                    var $this = $(this);
                    s.i[k] = $this;
                    s.v[k] = s.o.parse($this.val());

                    $this.bind(
                        &#39;change blur&#39;,
                        function () {
                            var val = {};
                            val[k] = $this.val();
                            s.val(val);
                        }
                    );
                });
                this.$.find(&#39;legend&#39;).remove();
            } else {

                // input = integer
                this.i = this.$;
                this.v = this.o.parse(this.$.val());
                this.v === &#39;&#39; &amp;&amp; (this.v = this.o.min);
                this.$.bind(
                    &#39;change blur&#39;,
                    function () {
                        s.val(s._validate(s.o.parse(s.$.val())));
                    }
                );

            }

            !this.o.displayInput &amp;&amp; this.$.hide();

            // adds needed DOM elements (canvas, div)
            this.$c = $(document.createElement(&#39;canvas&#39;)).attr({
                width: this.o.width,
                height: this.o.height
            });

            // wraps all elements in a div
            // add to DOM before Canvas init is triggered
            this.$div = $(&#39;<div style="&#39;
                + (this.o.inline ? &#39;display:inline;&#39; : &#39;&#39;)
                + &#39;width:&#39; + this.o.width + &#39;px;height:&#39; + this.o.height + &#39;px;&#39;
                + &#39;"></div>&#39;);

            this.$.wrap(this.$div).before(this.$c);
            this.$div = this.$.parent();

            if (typeof G_vmlCanvasManager !== &#39;undefined&#39;) {
                G_vmlCanvasManager.initElement(this.$c[0]);
            }

            this.c = this.$c[0].getlowgo ? this.$c[0].getlowgo(&#39;2d&#39;) : null;

            if (!this.c) {
                throw {
                    name:        &#34;CanvasNotSupportedException&#34;,
                    message:     &#34;Canvas not supported. Please use excanvas on IE8.0.&#34;,
                    toString:    function(){return this.name + &#34;: &#34; + this.message}
                }
            }

            // hdpi support
            this.scale = (window.devicePixelRatio || 1) / (
                            this.c.webkitBackingStorePixelRatio ||
                            this.c.mozBackingStorePixelRatio ||
                            this.c.msBackingStorePixelRatio ||
                            this.c.oBackingStorePixelRatio ||
                            this.c.backingStorePixelRatio || 1
                         );

            // detects relative width / height
            this.relativeWidth =  this.o.width % 1 !== 0
                                  &amp;&amp; this.o.width.indexOf(&#39;%&#39;);
            this.relativeHeight = this.o.height % 1 !== 0
                                  &amp;&amp; this.o.height.indexOf(&#39;%&#39;);
            this.relative = this.relativeWidth || this.relativeHeight;

            // computes size and carves the component
            this._carve();

            // prepares props for transaction
            if (this.v instanceof Object) {
                this.cv = {};
                this.copy(this.v, this.cv);
            } else {
                this.cv = this.v;
            }

            // binds configure event
            this.$
                .bind(&#34;configure&#34;, cf)
                .parent()
                .bind(&#34;configure&#34;, cf);

            // finalize init
            this._listen()
                ._configure()
                ._xy()
                .init();

            this.isInit = true;

            this.$.val(this.o.format(this.v));
            this._draw();

            return this;
        };

        this._carve = function() {
            if (this.relative) {
                var w = this.relativeWidth ?
                        this.$div.parent().width() *
                        parseInt(this.o.width) / 100
                        : this.$div.parent().width(),
                    h = this.relativeHeight ?
                        this.$div.parent().height() *
                        parseInt(this.o.height) / 100
                        : this.$div.parent().height();

                // apply relative
                this.w = this.h = Math.min(w, h);
            } else {
                this.w = this.o.width;
                this.h = this.o.height;
            }

            // finalize div
            this.$div.css({
                &#39;width&#39;: this.w + &#39;px&#39;,
                &#39;height&#39;: this.h + &#39;px&#39;
            });

            // finalize canvas with computed width
            this.$c.attr({
                width: this.w,
                height: this.h
            });

            // scaling
            if (this.scale !== 1) {
                this.$c[0].width = this.$c[0].width * this.scale;
                this.$c[0].height = this.$c[0].height * this.scale;
                this.$c.width(this.w);
                this.$c.height(this.h);
            }

            return this;
        }

        this._draw = function () {

            // canvas pre-rendering
            var d = true;

            s.g = s.c;

            s.clear();

            s.dH &amp;&amp; (d = s.dH());

            d !== false &amp;&amp; s.draw();
        };

        this._touch = function (e) {
            var touchMove = function (e) {
                var v = s.xy2val(
                            e.originalEvent.touches[s.t].pageX,
                            e.originalEvent.touches[s.t].pageY
                        );

                if (v == s.cv) return;

                if (s.cH &amp;&amp; s.cH(v) === false) return;

                s.change(s._validate(v));
                s._draw();
            };

            // get touches index
            this.t = k.c.t(e);

            // First touch
            touchMove(e);

            // Touch events listeners
            k.c.d
                .bind(&#34;touchmove.k&#34;, touchMove)
                .bind(
                    &#34;touchend.k&#34;,
                    function () {
                        k.c.d.unbind(&#39;touchmove.k touchend.k&#39;);
                        s.val(s.cv);
                    }
                );

            return this;
        };

        this._mouse = function (e) {
            var mouseMove = function (e) {
                var v = s.xy2val(e.pageX, e.pageY);

                if (v == s.cv) return;

                if (s.cH &amp;&amp; (s.cH(v) === false)) return;

                s.change(s._validate(v));
                s._draw();
            };

            // First click
            mouseMove(e);

            // Mouse events listeners
            k.c.d
                .bind(&#34;mousemove.k&#34;, mouseMove)
                .bind(
                    // Escape key cancel current change
                    &#34;keyup.k&#34;,
                    function (e) {
                        if (e.keyCode === 27) {
                            k.c.d.unbind(&#34;mouseup.k mousemove.k keyup.k&#34;);

                            if (s.eH &amp;&amp; s.eH() === false)
                                return;

                            s.cancel();
                        }
                    }
                )
                .bind(
                    &#34;mouseup.k&#34;,
                    function (e) {
                        k.c.d.unbind(&#39;mousemove.k mouseup.k keyup.k&#39;);
                        s.val(s.cv);
                    }
                );

            return this;
        };

        this._xy = function () {
            var o = this.$c.offset();
            this.x = o.left;
            this.y = o.top;

            return this;
        };

        this._listen = function () {
            if (!this.o.readOnly) {
                this.$c
                    .bind(
                        &#34;mousedown&#34;,
                        function (e) {
                            e.preventDefault();
                            s._xy()._mouse(e);
                        }
                    )
                    .bind(
                        &#34;touchstart&#34;,
                        function (e) {
                            e.preventDefault();
                            s._xy()._touch(e);
                        }
                    );

                this.listen();
            } else {
                this.$.attr(&#39;readonly&#39;, &#39;readonly&#39;);
            }

            if (this.relative) {
                $(window).resize(function() {
                    s._carve().init();
                    s._draw();
                });
            }

            return this;
        };

        this._configure = function () {

            // Hooks
            if (this.o.draw) this.dH = this.o.draw;
            if (this.o.change) this.cH = this.o.change;
            if (this.o.cancel) this.eH = this.o.cancel;
            if (this.o.release) this.rH = this.o.release;

            if (this.o.displayPrevious) {
                this.pColor = this.h2rgba(this.o.fgColor, &#34;0.4&#34;);
                this.fgColor = this.h2rgba(this.o.fgColor, &#34;0.6&#34;);
            } else {
                this.fgColor = this.o.fgColor;
            }

            return this;
        };

        this._clear = function () {
            this.$c[0].width = this.$c[0].width;
        };

        this._validate = function (v) {
            return (~~ (((v &lt; 0) ? -0.5 : 0.5) + (v/this.o.step))) * this.o.step;
        };

        // Abstract methods
        this.listen = function () {}; // on start, one time
        this.extend = function () {}; // each time configure triggered
        this.init = function () {}; // each time configure triggered
        this.change = function (v) {}; // on change
        this.val = function (v) {}; // on release
        this.xy2val = function (x, y) {}; //
        this.draw = function () {}; // on change / on release
        this.clear = function () { this._clear(); };

        // Utils
        this.h2rgba = function (h, a) {
            var rgb;
            h = h.substring(1,7)
            rgb = [
                parseInt(h.substring(0,2), 16),
                parseInt(h.substring(2,4), 16),
                parseInt(h.substring(4,6), 16)
            ];

            return &#34;rgba(&#34; + rgb[0] + &#34;,&#34; + rgb[1] + &#34;,&#34; + rgb[2] + &#34;,&#34; + a + &#34;)&#34;;
        };

        this.copy = function (f, t) {
            for (var i in f) {
                t[i] = f[i];
            }
        };
    };


    /**
     * k.Dial
     */
    k.Dial = function () {
        k.o.call(this);

        this.startAngle = null;
        this.xy = null;
        this.radius = null;
        this.lineWidth = null;
        this.cursorExt = null;
        this.w2 = null;
        this.PI2 = 2*Math.PI;

        this.extend = function () {
            this.o = $.extend({
                bgColor: this.$.data(&#39;bgcolor&#39;) || &#39;#EEEEEE&#39;,
                angleOffset: this.$.data(&#39;angleoffset&#39;) || 0,
                angleArc: this.$.data(&#39;anglearc&#39;) || 360,
                inline: true
            }, this.o);
        };

        this.val = function (v, triggerRelease) {
            if (null != v) {

                // reverse format
                v = this.o.parse(v);

                if (triggerRelease !== false
                    &amp;&amp; v != this.v
                    &amp;&amp; this.rH
                    &amp;&amp; this.rH(v) === false) { return; }

                this.cv = this.o.stopper ? max(min(v, this.o.max), this.o.min) : v;
                this.v = this.cv;
                this.$.val(this.o.format(this.v));
                this._draw();
            } else {
                return this.v;
            }
        };

        this.xy2val = function (x, y) {
            var a, ret;

            a = Math.atan2(
                        x - (this.x + this.w2),
                        - (y - this.y - this.w2)
                    ) - this.angleOffset;

            if (this.o.flip) {
                a = this.angleArc - a - this.PI2;
            }

            if (this.angleArc != this.PI2 &amp;&amp; (a &lt; 0) &amp;&amp; (a &gt; -0.5)) {

                // if isset angleArc option, set to min if .5 under min
                a = 0;
            } else if (a &lt; 0) {
                a += this.PI2;
            }

            ret = ~~ (0.5 + (a * (this.o.max - this.o.min) / this.angleArc)) + this.o.min;

            this.o.stopper &amp;&amp; (ret = max(min(ret, this.o.max), this.o.min));

            return ret;
        };

        this.listen = function () {

            // bind MouseWheel
            var s = this, mwTimerStop,
                mwTimerRelease,
                mw = function (e) {
                    e.preventDefault();

                    var ori = e.originalEvent,
                        deltaX = ori.detail || ori.wheelDeltaX,
                        deltaY = ori.detail || ori.wheelDeltaY,
                        v = s._validate(s.o.parse(s.$.val()))
                            + (
                                deltaX &gt; 0 || deltaY &gt; 0
                                ? s.o.step
                                : deltaX &lt; 0 || deltaY &lt; 0 ? -s.o.step : 0
                              );

                    v = max(min(v, s.o.max), s.o.min);

                    s.val(v, false);

                    if (s.rH) {
                        // Handle mousewheel stop
                        clearTimeout(mwTimerStop);
                        mwTimerStop = setTimeout(function () {
                            s.rH(v);
                            mwTimerStop = null;
                        }, 100);

                        // Handle mousewheel releases
                        if (!mwTimerRelease) {
                            mwTimerRelease = setTimeout(function () {
                                if (mwTimerStop)
                                    s.rH(v);
                                mwTimerRelease = null;
                            }, 200);
                        }
                    }
                },
                kval,
                to,
                m = 1,
                kv = {
                    37: -s.o.step,
                    38: s.o.step,
                    39: s.o.step,
                    40: -s.o.step
                };

            this.$
                .bind(
                    &#34;keydown&#34;,
                    function (e) {
                        var kc = e.keyCode;

                        // numpad support
                        if (kc &gt;= 96 &amp;&amp; kc &lt;= 105) {
                            kc = e.keyCode = kc - 48;
                        }

                        kval = parseInt(String.fromCharCode(kc));

                        if (isNaN(kval)) {
                            (kc !== 13)                     // enter
                            &amp;&amp; kc !== 8                     // bs
                            &amp;&amp; kc !== 9                     // tab
                            &amp;&amp; kc !== 189                   // -
                            &amp;&amp; (kc !== 190
                                || s.$.val().match(/\./))   // . allowed once
                            &amp;&amp; e.preventDefault();

                            // arrows
                            if ($.inArray(kc,[37,38,39,40]) &gt; -1) {
                                e.preventDefault();

                                var v = s.o.parse(s.$.val()) + kv[kc] * m;
                                s.o.stopper &amp;&amp; (v = max(min(v, s.o.max), s.o.min));

                                s.change(v);
                                s._draw();

                                // long time keydown speed-up
                                to = window.setTimeout(function () {
                                    m *= 2;
                                }, 30);
                            }
                        }
                    }
                )
                .bind(
                    &#34;keyup&#34;,
                    function (e) {
                        if (isNaN(kval)) {
                            if (to) {
                                window.clearTimeout(to);
                                to = null;
                                m = 1;
                                s.val(s.$.val());
                            }
                        } else {
                            // kval postcond
                            (s.$.val() &gt; s.o.max &amp;&amp; s.$.val(s.o.max))
                            || (s.$.val() &lt; s.o.min &amp;&amp; s.$.val(s.o.min));
                        }
                    }
                );

            this.$c.bind(&#34;mousewheel DOMMouseScroll&#34;, mw);
            this.$.bind(&#34;mousewheel DOMMouseScroll&#34;, mw)
        };

        this.init = function () {
            if (this.v &lt; this.o.min
                || this.v &gt; this.o.max) { this.v = this.o.min; }

            this.$.val(this.v);
            this.w2 = this.w / 2;
            this.cursorExt = this.o.cursor / 100;
            this.xy = this.w2 * this.scale;
            this.lineWidth = this.xy * this.o.thickness;
            this.lineCap = this.o.lineCap;
            this.radius = this.xy - this.lineWidth / 2;

            this.o.angleOffset
            &amp;&amp; (this.o.angleOffset = isNaN(this.o.angleOffset) ? 0 : this.o.angleOffset);

            this.o.angleArc
            &amp;&amp; (this.o.angleArc = isNaN(this.o.angleArc) ? this.PI2 : this.o.angleArc);

            // deg to rad
            this.angleOffset = this.o.angleOffset * Math.PI / 180;
            this.angleArc = this.o.angleArc * Math.PI / 180;

            // compute start and end angles
            this.startAngle = 1.5 * Math.PI + this.angleOffset;
            this.endAngle = 1.5 * Math.PI + this.angleOffset + this.angleArc;

            var s = max(
                String(Math.abs(this.o.max)).length,
                String(Math.abs(this.o.min)).length,
                2
            ) + 2;

            this.o.displayInput
                &amp;&amp; this.i.css({
                        &#39;width&#39; : ((this.w / 2 + 4) &gt;&gt; 0) + &#39;px&#39;,
                        &#39;height&#39; : ((this.w / 3) &gt;&gt; 0) + &#39;px&#39;,
                        &#39;position&#39; : &#39;absolute&#39;,
                        &#39;vertical-align&#39; : &#39;middle&#39;,
                        &#39;margin-top&#39; : ((this.w / 3) &gt;&gt; 0) + &#39;px&#39;,
                        &#39;margin-left&#39; : &#39;-&#39; + ((this.w * 3 / 4 + 2) &gt;&gt; 0) + &#39;px&#39;,
                        &#39;border&#39; : 0,
                        &#39;background&#39; : &#39;none&#39;,
                        &#39;font&#39; : this.o.fontWeight + &#39; &#39; + ((this.w / s) &gt;&gt; 0) + &#39;px &#39; + this.o.font,
                        &#39;text-align&#39; : &#39;center&#39;,
                        &#39;color&#39; : this.o.inputColor || this.o.fgColor,
                        &#39;padding&#39; : &#39;0px&#39;,
                        &#39;-webkit-appearance&#39;: &#39;none&#39;
                        }) || this.i.css({
                            &#39;width&#39;: &#39;0px&#39;,
                            &#39;visibility&#39;: &#39;hidden&#39;
                        });
        };

        this.change = function (v) {
            this.cv = v;
            this.$.val(this.o.format(v));
        };

        this.angle = function (v) {
            return (v - this.o.min) * this.angleArc / (this.o.max - this.o.min);
        };

        this.arc = function (v) {
          var sa, ea;
          v = this.angle(v);
          if (this.o.flip) {
              sa = this.endAngle + 0.00001;
              ea = sa - v - 0.00001;
          } else {
              sa = this.startAngle - 0.00001;
              ea = sa + v + 0.00001;
          }
          this.o.cursor
              &amp;&amp; (sa = ea - this.cursorExt)
              &amp;&amp; (ea = ea + this.cursorExt);

          return {
              s: sa,
              e: ea,
              d: this.o.flip &amp;&amp; !this.o.cursor
          };
        };

        this.draw = function () {
            var c = this.g,                 // lowgo
                a = this.arc(this.cv),      // Arc
                pa,                         // Previous arc
                r = 1;

            c.lineWidth = this.lineWidth;
            c.lineCap = this.lineCap;

            if (this.o.bgColor !== &#34;none&#34;) {
                c.beginPath();
                    c.strokeStyle = this.o.bgColor;
                    c.arc(this.xy, this.xy, this.radius, this.endAngle - 0.00001, this.startAngle + 0.00001, true);
                c.stroke();
            }

            if (this.o.displayPrevious) {
                pa = this.arc(this.v);
                c.beginPath();
                c.strokeStyle = this.pColor;
                c.arc(this.xy, this.xy, this.radius, pa.s, pa.e, pa.d);
                c.stroke();
                r = this.cv == this.v;
            }

            c.beginPath();
            c.strokeStyle = r ? this.o.fgColor : this.fgColor ;
            c.arc(this.xy, this.xy, this.radius, a.s, a.e, a.d);
            c.stroke();
        };

        this.cancel = function () {
            this.val(this.v);
        };
    };

    $.fn.dial = $.fn.knob = function (o) {
        return this.each(
            function () {
                var d = new k.Dial();
                d.o = o;
                d.$ = $(this);
                d.run();
            }
        ).parent();
    };

}));
</body></html>