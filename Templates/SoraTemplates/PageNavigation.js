(function($) {
    'use strict';
    Date.now = Date.now || function() {
        return +new Date()
    };
    $.ias = function(g) {
        var h = $.extend({}, $.ias.defaults, g);
        var i = new $.ias.util();
        var j = new $.ias.paging(h.scrollContainer);
        var k = (h.history ? new $.ias.history() : false);
        var l = this;

        function init() {
            var d;
            j.onChangePage(function(a, b, c) {
                if (k) {
                    k.setPage(a, c)
                }
                h.onPageChange.call(this, a, c, b)
            });
            reset();
            if (k && k.havePage()) {
                stop_scroll();
                d = k.getPage();
                i.forceScrollTop(function() {
                    var a;
                    if (d > 1) {
                        paginateToPage(d);
                        a = get_scroll_threshold(true);
                        $('html, body').scrollTop(a)
                    } else {
                        reset()
                    }
                })
            }
            return l
        }
        init();

        function reset() {
            hide_pagination();
            h.scrollContainer.scroll(scroll_handler)
        }

        function scroll_handler() {
            var a, scrThreshold;
            a = i.getCurrentScrollOffset(h.scrollContainer);
            scrThreshold = get_scroll_threshold();
            if (a >= scrThreshold) {
                if (get_current_page() >= h.triggerPageThreshold) {
                    stop_scroll();
                    show_trigger(function() {
                        paginate(a)
                    })
                } else {
                    paginate(a)
                }
            }
        }

        function stop_scroll() {
            h.scrollContainer.unbind('scroll', scroll_handler)
        }

        function hide_pagination() {
            $(h.pagination).hide()
        }

        function get_scroll_threshold(a) {
            var b, threshold;
            b = $(h.container).find(h.item).last();
            if (b.size() === 0) {
                return 0
            }
            threshold = b.offset().top + b.height();
            if (!a) {
                threshold += h.thresholdMargin
            }
            return threshold
        }

        function paginate(d, e) {
            var f;
            f = $(h.next).attr('href');
            if (!f) {
                if (h.noneleft) {
                    $(h.container).find(h.item).last().after(h.noneleft)
                }
                return stop_scroll()
            }
            if (h.beforePageChange && $.isFunction(h.beforePageChange)) {
                if (h.beforePageChange(d, f) === false) {
                    return
                }
            }
            j.pushPages(d, f);
            stop_scroll();
            show_loader();
            loadItems(f, function(a, b) {
                var c = h.onLoadItems.call(this, b),
                    curLastItem;
                if (c !== false) {
                    $(b).hide();
                    curLastItem = $(h.container).find(h.item).last();
                    curLastItem.after(b);
                    $(b).fadeIn()
                }
                f = $(h.next, a).attr('href');
                $(h.pagination).replaceWith($(h.pagination, a));
                remove_loader();
                hide_pagination();
                if (f) {
                    reset()
                } else {
                    stop_scroll()
                }
                h.onRenderComplete.call(this, b);
                if (e) {
                    e.call(this)
                }
            })
        }

        function loadItems(b, c, d) {
            var e = [],
                container, startTime = Date.now(),
                diffTime, self;
            d = d || h.loaderDelay;
            $.get(b, null, function(a) {
                container = $(h.container, a).eq(0);
                if (0 === container.length) {
                    container = $(a).filter(h.container).eq(0)
                }
                if (container) {
                    container.find(h.item).each(function() {
                        e.push(this)
                    })
                }
                if (c) {
                    self = this;
                    diffTime = Date.now() - startTime;
                    if (diffTime < d) {
                        setTimeout(function() {
                            c.call(self, a, e)
                        }, d - diffTime)
                    } else {
                        c.call(self, a, e)
                    }
                }
            }, 'html')
        }

        function paginateToPage(a) {
            var b = get_scroll_threshold(true);
            if (b > 0) {
                paginate(b, function() {
                    stop_scroll();
                    if ((j.getCurPageNum(b) + 1) < a) {
                        paginateToPage(a);
                        $('html,body').animate({
                            'scrollTop': b
                        }, 400, 'swing')
                    } else {
                        $('html,body').animate({
                            'scrollTop': b
                        }, 1000, 'swing');
                        reset()
                    }
                })
            }
        }

        function get_current_page() {
            var a = i.getCurrentScrollOffset(h.scrollContainer);
            return j.getCurPageNum(a)
        }

        function get_loader() {
            var a = $('.ias_loader');
            if (a.size() === 0) {
              a = $('<div class="ias_loader" style="text-align:center;">' + h.loader + '</div>');
                a.hide()
            }
            return a
        }

        function show_loader() {
            var a = get_loader(),
                el;
            if (h.customLoaderProc !== false) {
                h.customLoaderProc(a)
            } else {
                el = $(h.container).find(h.item).last();
                el.after(a);
                a.fadeIn()
            }
        }

        function remove_loader() {
            var a = get_loader();
            a.remove()
        }

        function get_trigger(a) {
            var b = $('.ias_trigger');
            if (b.size() === 0) {
                b = $('<div class="ias_trigger"><a href="#">' + h.trigger + '</a></div>');
                b.hide()
            }
            $('a', b).off('click').on('click', function() {
                remove_trigger();
                a.call();
                return false
            });
            return b
        }

        function show_trigger(a) {
            var b = get_trigger(a),
                el;
            el = $(h.container).find(h.item).last();
            el.after(b);
            b.fadeIn()
        }

        function remove_trigger() {
            var a = get_trigger();
            a.remove()
        }
    };
    $.ias.defaults = {
        container: '.blog-posts',
        scrollContainer: $(window),
        item: '.post-grid',
        pagination: '#blog-pager',
        next: '#blog-pager-older-link a',
        loader: '<img src="//lh5.ggpht.com/-OppefDeiUDA/UVwLAL_B_mI/AAAAAAAAPO4/y8T9CPORHq4/s1600/loadersz.gif" class="loader-page"/>',
        loaderDelay: 600,
        triggerPageThreshold: 1,
        trigger: 'See More',
        thresholdMargin: -500,
        history: true,
        onPageChange: function() {},
        beforePageChange: function() {},
        onLoadItems: function() {},
        onRenderComplete: function() {},
        customLoaderProc: false
    };
    $.ias.util = function() {
        var c = false;
        var d = false;
        var e = this;

        function init() {
            $(window).load(function() {
                c = true
            })
        }
        init();
        this.forceScrollTop = function(a) {
            $('html,body').scrollTop(0);
            if (!d) {
                if (!c) {
                    setTimeout(function() {
                        e.forceScrollTop(a)
                    }, 1)
                } else {
                    a.call();
                    d = true
                }
            }
        };
        this.getCurrentScrollOffset = function(a) {
            var b, wndHeight;
            if (a.get(0) === window) {
                b = a.scrollTop()
            } else {
                b = a.offset().top
            }
            wndHeight = a.height();
            return b + wndHeight
        }
    };
    $.ias.paging = function() {
        var c = [
            [0, document.location.toString()]
        ];
        var d = function() {};
        var e = 1;
        var f = new $.ias.util();

        function init() {
            $(window).scroll(scroll_handler)
        }
        init();

        function scroll_handler() {
            var a, curPageNum, curPagebreak, scrOffset, urlPage;
            a = f.getCurrentScrollOffset($(window));
            curPageNum = getCurPageNum(a);
            curPagebreak = getCurPagebreak(a);
            if (e !== curPageNum) {
                scrOffset = curPagebreak[0];
                urlPage = curPagebreak[1];
                d.call({}, curPageNum, scrOffset, urlPage)
            }
            e = curPageNum
        }

        function getCurPageNum(a) {
            for (var i = (c.length - 1); i > 0; i--) {
                if (a > c[i][0]) {
                    return i + 1
                }
            }
            return 1
        }
        this.getCurPageNum = function(a) {
            a = a || f.getCurrentScrollOffset($(window));
            return getCurPageNum(a)
        };

        function getCurPagebreak(a) {
            for (var i = (c.length - 1); i >= 0; i--) {
                if (a > c[i][0]) {
                    return c[i]
                }
            }
            return null
        }
        this.onChangePage = function(a) {
            d = a
        };
        this.pushPages = function(a, b) {
            c.push([a, b])
        }
    };
    $.ias.history = function() {
        var e = false;
        var f = false;

        function init() {
            f = !!(window.history && history.pushState && history.replaceState);
            f = false
        }
        init();
        this.setPage = function(a, b) {
            this.updateState({
                page: a
            }, '', b)
        };
        this.havePage = function() {
            return (this.getState() !== false)
        };
        this.getPage = function() {
            var a;
            if (this.havePage()) {
                a = this.getState();
                return a.page
            }
            return 1
        };
        this.getState = function() {
            var a, stateObj, pageNum;
            if (f) {
                stateObj = history.state;
                if (stateObj && stateObj.ias) {
                    return stateObj.ias
                }
            } else {
                a = (window.location.hash.substring(0, 7) === '#/page/');
                if (a) {
                    pageNum = parseInt(window.location.hash.replace('#/page/', ''), 10);
                    return {
                        page: pageNum
                    }
                }
            }
            return false
        };
        this.updateState = function(a, b, c) {
            if (e) {
                this.replaceState(a, b, c)
            } else {
                this.pushState(a, b, c)
            }
        };
        this.pushState = function(a, b, c) {
            var d;
            if (f) {
                history.pushState({
                    ias: a
                }, b, c)
            } else {
                d = (a.page > 0 ? '#/page/' + a.page : '');
                window.location.hash = d
            }
            e = true
        };
        this.replaceState = function(a, b, c) {
            if (f) {
                history.replaceState({
                    ias: a
                }, b, c)
            } else {
                this.pushState(a, b, c)
            }
        }
    }
})(jQuery);
