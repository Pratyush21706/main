'use strict';

(function($) {
  var wooscpSearchTimer = 0;

  $(document).ready(function() {
    wooscpLoadColor();
    wooscpChangeCount('first');
    wooscpCheckButtons();

    if (wooscpVars.open_bar == 'yes') {
      wooscpLoadCompareBar('first');
    }

    $('.wooscp-settings-field-li').arrangeable({
      dragSelector: '.label',
      dragEndEvent: 'wooscpDragSettings',
    });
  });

  // quick view
  $(document).on('click touch', '.wooscp_table .woosq-btn', function(e) {
    wooscpCloseCompareTable();
    e.preventDefault();
  });

  // settings
  $(document).on('click touch', '.wooscp-bar-settings', function() {
    $('.wooscp-settings').toggleClass('open');
  });

  // search
  $(document).on('click touch', '.wooscp-bar-search', function() {
    $('.wooscp-search').toggleClass('open');
  });

  $(document).on('keyup', '#wooscp_search_input', function() {
    if ($('#wooscp_search_input').val() != '') {
      if (wooscpSearchTimer != null) {
        clearTimeout(wooscpSearchTimer);
      }

      wooscpSearchTimer = setTimeout(wooscpAjaxSearch, 300);
      return false;
    }
  });

  $(document).on('click touch', '.wooscp-item-add', function() {
    var product_id = $(this).attr('data-id');

    $('.wooscp-search').toggleClass('open');
    wooscpAddProduct(product_id);
    wooscpLoadCompareBar();
    wooscpLoadCompareTable();
    wooscpOpenCompareTable();
  });

  $(document).on('click touch', '.wooscp-popup-close', function() {
    var _this_popup = $(this).closest('.wooscp-popup');

    _this_popup.toggleClass('open');
  });

  // compare variation
  $(document).on('found_variation', function(e, t) {
    var variable_id = $(e['target']).attr('data-product_id');

    $('.wooscp-btn-' + variable_id).
        removeClass('wooscp-btn-added woosc-added').
        attr('data-id', t.variation_id);

    if (wooscpVars.button_text_change === 'yes') {
      $('.wooscp-btn-' + variable_id).html(wooscpVars.button_text);
    }
  });

  $(document).on('reset_data', function(e) {
    var variable_id = $(e['target']).attr('data-product_id');

    $('.wooscp-btn-' + variable_id).
        removeClass('wooscp-btn-added woosc-added').
        attr('data-id', variable_id);

    if (wooscpVars.button_text_change === 'yes') {
      $('.wooscp-btn-' + variable_id).html(wooscpVars.button_text);
    }
  });

  // remove all
  $(document).on('click touch', '.wooscp-bar-remove', function() {
    var r = confirm(wooscpVars.remove_all);

    if (r == true) {
      wooscpRemoveProduct('all');
      wooscpLoadCompareBar();
      wooscpLoadCompareTable();
    }
  });

  // rearrange
  $(document).on('wooscpDragEndEvent', function() {
    wooscpSaveProducts();
  });

  // add
  $(document).on('click touch', '.wooscp-btn', function(e) {
    var id = $(this).attr('data-id');
    var pid = $(this).attr('data-pid');
    var product_id = $(this).attr('data-product_id');

    if (typeof pid !== typeof undefined && pid !== false) {
      id = pid;
    }

    if (typeof product_id !== typeof undefined && product_id !== false) {
      id = product_id;
    }

    if ($(this).hasClass('wooscp-btn-added woosc-added')) {
      if (wooscpVars.click_again == 'yes') {
        // remove
        wooscpRemoveProduct(id);
        wooscpLoadCompareBar();
        wooscpLoadCompareTable();
      } else {
        if ($('.wooscp-bar-items').hasClass('wooscp-bar-items-loaded')) {
          wooscpOpenCompareBar();
        } else {
          wooscpLoadCompareBar();
        }

        if (!$('.wooscp-table-items').hasClass('wooscp-table-items-loaded')) {
          wooscpLoadCompareTable();
        }
      }
    } else {
      $(this).addClass('wooscp-btn-adding woosc-adding');
      wooscpAddProduct(id);
      wooscpLoadCompareBar();
      wooscpLoadCompareTable();
    }

    if (wooscpVars.open_table == 'yes') {
      wooscpToggleCompareTable();
    }

    e.preventDefault();
  });

  // remove
  $(document).
      on('click touch', '#wooscp-area .wooscp-bar-item-remove', function(e) {
        var product_id = $(this).attr('data-id');

        $(this).parent().addClass('removing');
        wooscpRemoveProduct(product_id);
        wooscpLoadCompareBar();
        wooscpLoadCompareTable();
        wooscpCheckButtons();
        e.preventDefault();
      });

  // compare bar button
  $(document).on('click touch', '.wooscp-bar-btn', function() {
    wooscpToggleCompareTable();
  });

  // close compare
  $(document).on('click touch', function(e) {
    if ((
        (wooscpVars.click_outside == 'yes') ||
        ((wooscpVars.click_outside == 'yes_empty') &&
            (parseInt($('.wooscp-bar').attr('data-count')) == 0))
    ) && (
        $(e.target).closest('.wpc_compare_count').length == 0
    ) && (
        $(e.target).closest('.wooscp-popup').length == 0
    ) && (
        $(e.target).closest('.wooscp-btn').length == 0
    ) && (
        $(e.target).closest('.wooscp-table').length == 0
    ) && (
        $(e.target).closest('.wooscp-bar').length == 0
    ) && (
        $(e.target).closest('.wooscp-menu-item a').length == 0
    ) && (
        (
            wooscpVars.open_button == ''
        ) || (
            $(e.target).closest(wooscpVars.open_button).length == 0
        )
    )) {
      wooscpCloseCompare();
    }
  });

  // close
  $(document).on('click touch', '#wooscp-table-close', function() {
    wooscpCloseCompareTable();
  });

  // open button
  if (wooscpVars.open_button != '') {
    $(document).on('click touch', wooscpVars.open_button, function(e) {
      if ((wooscpVars.open_button_action == 'open_page') &&
          (wooscpVars.page_url != '') && (wooscpVars.page_url != '#')) {
        // open compare page
        window.location.href = wooscpVars.page_url;
      } else {
        e.preventDefault();
        // open compare popup
        wooscpToggleCompare();
      }
    });
  }

  // change settings
  $(document).on('change', '.wooscp-settings-field', function() {
    wooscpSaveSettings();
  });

  $(document).on('wooscpDragSettings', function() {
    wooscpSaveSettings();
  });

  // menu item
  $(document).on('click touch', '.wooscp-menu-item a', function(e) {
    if (wooscpVars.menu_action == 'open_popup') {
      e.preventDefault();

      // open compare popup
      if ($('.wooscp-bar-items').hasClass('wooscp-bar-items-loaded')) {
        wooscpOpenCompareBar();
      } else {
        wooscpLoadCompareBar();
      }

      if (!$('.wooscp-table-items').hasClass('wooscp-table-items-loaded')) {
        wooscpLoadCompareTable();
      }

      wooscpOpenCompareTable();
    }
  });

  function wooscpAjaxSearch() {
    $('.wooscp-search-result').html('').addClass('wooscp-loading');
    // ajax search product
    wooscpSearchTimer = null;

    var data = {
      action: 'wooscp_search',
      keyword: $('#wooscp_search_input').val(),
      nonce: wooscpVars.nonce,
    };

    $.post(wooscpVars.ajaxurl, data, function(response) {
      $('.wooscp-search-result').
          html(response).
          removeClass('wooscp-loading');
    });
  }

  function wooscpSetCookie(cname, cvalue, exdays) {
    var d = new Date();

    d.setTime(d.getTime() + (
        exdays * 24 * 60 * 60 * 1000
    ));

    var expires = 'expires=' + d.toUTCString();

    document.cookie = cname + '=' + cvalue + '; ' + expires + '; path=/';
  }

  function wooscpGetCookie(cname) {
    var name = cname + '=';
    var ca = document.cookie.split(';');

    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];

      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }

      if (c.indexOf(name) == 0) {
        return decodeURIComponent(c.substring(name.length, c.length));
      }
    }

    return '';
  }

  function wooscpGetProducts() {
    var wooscpCookieProducts = 'wooscp_products';

    if (wooscpVars.user_id != '') {
      wooscpCookieProducts = 'wooscp_products_' + wooscpVars.user_id;
    }

    if (wooscpGetCookie(wooscpCookieProducts) != '') {
      return wooscpGetCookie(wooscpCookieProducts);
    } else {
      return '';
    }
  }

  function wooscpSaveProducts() {
    var wooscpCookieProducts = 'wooscp_products';

    if (wooscpVars.user_id != '') {
      wooscpCookieProducts = 'wooscp_products_' + wooscpVars.user_id;
    }

    var wooscpProducts = new Array();

    $('.wooscp-bar-item').each(function() {
      var eID = $(this).attr('data-id');

      if (eID != '') {
        wooscpProducts.push(eID);
      }
    });

    var wooscpProductsStr = wooscpProducts.join();

    wooscpSetCookie(wooscpCookieProducts, wooscpProductsStr, 7);
    wooscpLoadCompareTable();
  }

  function wooscpSaveSettings() {
    var wooscpFields = Array();
    var wooscpCookieFields = 'wooscp_fields';

    if (wooscpVars.user_id != '') {
      wooscpCookieFields = 'wooscp_fields_' + wooscpVars.user_id;
    }

    $('.wooscp-settings-field').each(function() {
      var _val = $(this).val();

      if ($(this).prop('checked')) {
        wooscpFields.push(_val);
        $('.wooscp_table .tr-' + _val).removeClass('tr-hide');
      } else {
        $('.wooscp_table .tr-' + _val).addClass('tr-hide');
      }
    });

    wooscpSetCookie(wooscpCookieFields, wooscpFields.join(','), 7);
    wooscpLoadCompareTable();
  }

  function wooscpAddProduct(product_id) {
    var wooscpLimit = false;
    var wooscpLimitNotice = wooscpVars.limit_notice;
    var wooscpCookieProducts = 'wooscp_products';
    var wooscpCount = 0;

    if (wooscpVars.user_id != '') {
      wooscpCookieProducts = 'wooscp_products_' + wooscpVars.user_id;
    }

    if (wooscpGetCookie(wooscpCookieProducts) != '') {
      var wooscpProducts = wooscpGetCookie(wooscpCookieProducts).split(',');

      if (wooscpProducts.length < wooscpVars.limit) {
        wooscpProducts = $.grep(wooscpProducts, function(value) {
          return value != product_id;
        });
        wooscpProducts.unshift(product_id);

        var wooscpProductsStr = wooscpProducts.join();

        wooscpSetCookie(wooscpCookieProducts, wooscpProductsStr, 7);
      } else {
        wooscpLimit = true;
        wooscpLimitNotice = wooscpLimitNotice.replace('{limit}',
            wooscpVars.limit);
      }

      wooscpCount = wooscpProducts.length;
    } else {
      wooscpSetCookie(wooscpCookieProducts, product_id, 7);
      wooscpCount = 1;
    }

    wooscpChangeCount(wooscpCount);
    $(document.body).trigger('wooscp_added', [wooscpCount]);

    if (wooscpLimit) {
      $('.wooscp-btn[data-id="' + product_id + '"]').
          removeClass('wooscp-btn-adding woosc-adding');
      alert(wooscpLimitNotice);
    } else {
      $('.wooscp-btn[data-id="' + product_id + '"]').
          removeClass('wooscp-btn-adding woosc-adding').
          addClass('wooscp-btn-added woosc-added');

      if (wooscpVars.button_text_change === 'yes') {
        $('.wooscp-btn[data-id="' + product_id + '"]').
            html(wooscpVars.button_text_added);

        $(document.body).
            trigger('wooscp_change_button_text',
                [product_id, wooscpVars.button_text_added]);
      }
    }
  }

  function wooscpRemoveProduct(product_id) {
    var wooscpCookieProducts = 'wooscp_products';
    var wooscpCount = 0;

    if (wooscpVars.user_id != '') {
      wooscpCookieProducts = 'wooscp_products_' + wooscpVars.user_id;
    }

    if (product_id != 'all') {
      // remove one
      if (wooscpGetCookie(wooscpCookieProducts) != '') {
        var wooscpProducts = wooscpGetCookie(wooscpCookieProducts).split(',');

        wooscpProducts = $.grep(wooscpProducts, function(value) {
          return value != product_id;
        });

        var wooscpProductsStr = wooscpProducts.join();

        wooscpSetCookie(wooscpCookieProducts, wooscpProductsStr, 7);
        wooscpCount = wooscpProducts.length;
      }

      $('.wooscp-btn[data-id="' + product_id + '"]').
          removeClass('wooscp-btn-added woosc-added');

      if (wooscpVars.button_text_change === 'yes') {
        $('.wooscp-btn[data-id="' + product_id + '"]').
            html(wooscpVars.button_text);

        $(document.body).
            trigger('wooscp_change_button_text',
                [product_id, wooscpVars.button_text]);
      }
    } else {
      // remove all
      if (wooscpGetCookie(wooscpCookieProducts) != '') {
        wooscpSetCookie(wooscpCookieProducts, '', 7);
        wooscpCount = 0;
      }

      $('.wooscp-btn').removeClass('wooscp-btn-added woosc-added');

      if (wooscpVars.button_text_change === 'yes') {
        $('.wooscp-btn').html(wooscpVars.button_text);

        $(document.body).
            trigger('wooscp_change_button_text',
                ['all', wooscpVars.button_text]);
      }
    }

    wooscpChangeCount(wooscpCount);
    $(document.body).trigger('wooscp_removed', [wooscpCount]);
  }

  function wooscpCheckButtons() {
    var wooscpCookieProducts = 'wooscp_products';

    if (wooscpVars.user_id != '') {
      wooscpCookieProducts = 'wooscp_products_' + wooscpVars.user_id;
    }

    if (wooscpGetCookie(wooscpCookieProducts) != '') {
      var wooscpProducts = wooscpGetCookie(wooscpCookieProducts).split(',');

      $('.wooscp-btn').removeClass('wooscp-btn-added woosc-added');

      if (wooscpVars.button_text_change === 'yes') {
        $('.wooscp-btn').html(wooscpVars.button_text);

        $(document.body).
            trigger('wooscp_change_button_text',
                ['all', wooscpVars.button_text]);
      }

      wooscpProducts.forEach(function(entry) {
        $('.wooscp-btn-' + entry).addClass('wooscp-btn-added woosc-added');

        if (wooscpVars.button_text_change === 'yes') {
          $('.wooscp-btn-' + entry).html(wooscpVars.button_text_added);

          $(document.body).
              trigger('wooscp_change_button_text',
                  [entry, wooscpVars.button_text_added]);
        }
      });
    }
  }

  function wooscpLoadCompareBar(open) {
    var data = {
      action: 'wooscp_load_compare_bar',
      products: wooscpGetProducts(),
      nonce: wooscpVars.nonce,
    };

    $.post(wooscpVars.ajaxurl, data, function(response) {
      if ((
          wooscpVars.hide_empty == 'yes'
      ) && (
          (
              response == ''
          ) || (
              response == 0
          )
      )) {
        $('.wooscp-bar-items').removeClass('wooscp-bar-items-loaded');
        wooscpCloseCompareBar();
        wooscpCloseCompareTable();
      } else {
        if ((
            typeof open == 'undefined'
        ) || (
            (
                open == 'first'
            ) && (
                wooscpVars.open_bar == 'yes'
            )
        )) {
          $('.wooscp-bar-items').
              html(response).
              addClass('wooscp-bar-items-loaded');
          wooscpOpenCompareBar();
        }
      }
    });
  }

  function wooscpOpenCompareBar() {
    $('#wooscp-area').addClass('wooscp-area-open-bar');
    $('.wooscp-bar').addClass('wooscp-bar-open');
    $('.wooscp-bar-item').arrangeable({
      dragSelector: 'img',
      dragEndEvent: 'wooscpDragEndEvent',
    });
    $(document.body).trigger('wooscp_bar_open');
  }

  function wooscpCloseCompareBar() {
    $('#wooscp-area').removeClass('wooscp-area-open-bar');
    $('.wooscp-bar').removeClass('wooscp-bar-open');
    $(document.body).trigger('wooscp_bar_close');
  }

  function wooscpLoadCompareTable() {
    $('.wooscp-table-inner').addClass('wooscp-loading');

    var data = {
      action: 'wooscp_load_compare_table',
      products: wooscpGetProducts(),
      nonce: wooscpVars.nonce,
    };

    $.post(wooscpVars.ajaxurl, data, function(response) {
      $('.wooscp-table-items').
          html(response).
          addClass('wooscp-table-items-loaded');
      if ($(window).width() >= 768) {
        if ((wooscpVars.freeze_column == 'yes') &&
            (wooscpVars.freeze_row == 'yes')) {
          // freeze row and column
          $('#wooscp_table').tableHeadFixer({'head': true, left: 1});
        } else if (wooscpVars.freeze_column == 'yes') {
          // freeze column
          $('#wooscp_table').tableHeadFixer({'head': false, left: 1});
        } else if (wooscpVars.freeze_row == 'yes') {
          // freeze row
          $('#wooscp_table').tableHeadFixer({'head': true});
        }
      } else {
        if (wooscpVars.freeze_row == 'yes') {
          // freeze row
          $('#wooscp_table').tableHeadFixer({'head': true});
        }
      }

      $('.wooscp-table-items').perfectScrollbar({theme: 'wpc'});
      $('.wooscp-table-inner').removeClass('wooscp-loading');
      wooscpHideEmptyRow();
    });
  }

  function wooscpOpenCompareTable() {
    $('#wooscp-area').addClass('wooscp-area-open-table');
    $('.wooscp-table').addClass('wooscp-table-open');
    $('.wooscp-bar-btn').addClass('wooscp-bar-btn-open');

    if (wooscpVars.bar_bubble === 'yes') {
      $('.wooscp-bar').removeClass('wooscp-bar-bubble');
    }

    if (!$.trim($('.wooscp-table-items').html()).length) {
      wooscpLoadCompareTable();
    }

    $(document.body).trigger('wooscp_table_open');
  }

  function wooscpCloseCompareTable() {
    $('#wooscp-area').removeClass('wooscp-area-open-table');
    $('#wooscp-area').removeClass('wooscp-area-open');
    $('.wooscp-table').removeClass('wooscp-table-open');
    $('.wooscp-bar-btn').removeClass('wooscp-bar-btn-open');

    if (wooscpVars.bar_bubble === 'yes') {
      $('.wooscp-bar').addClass('wooscp-bar-bubble');
    }

    $(document.body).trigger('wooscp_table_close');
  }

  function wooscpToggleCompareTable() {
    if ($('.wooscp-table').hasClass('wooscp-table-open')) {
      wooscpCloseCompareTable();
    } else {
      wooscpOpenCompareTable();
    }
  }

  function wooscpOpenCompare() {
    $('#wooscp-area').addClass('wooscp-area-open');
    wooscpLoadCompareBar();
    wooscpLoadCompareTable();
    wooscpOpenCompareBar();
    wooscpOpenCompareTable();
    $(document.body).trigger('wooscp_open');
  }

  function wooscpCloseCompare() {
    $('#wooscp-area').removeClass('wooscp-area-open');
    wooscpCloseCompareBar();
    wooscpCloseCompareTable();
    $(document.body).trigger('wooscp_close');
  }

  function wooscpToggleCompare() {
    if ($('#wooscp-area').hasClass('wooscp-area-open')) {
      wooscpCloseCompare();
    } else {
      wooscpOpenCompare();
    }

    $(document.body).trigger('wooscp_toggle');
  }

  function wooscpLoadColor() {
    var bg_color = $('#wooscp-area').attr('data-bg-color');
    var btn_color = $('#wooscp-area').attr('data-btn-color');

    $('.wooscp-table').css('background-color', bg_color);
    $('.wooscp-bar').css('background-color', bg_color);
    $('.wooscp-bar-btn').css('background-color', btn_color);
  }

  function wooscpChangeCount(count) {
    if (count == 'first') {
      var products = wooscpGetProducts();

      if (products != '') {
        var products_arr = products.split(',');

        count = products_arr.length;
      } else {
        count = 0;
      }
    }

    $('.wooscp-menu-item').each(function() {
      if ($(this).hasClass('menu-item-type-wooscp')) {
        $(this).find('.wooscp-menu-item-inner').attr('data-count', count);
      } else {
        $(this).
            addClass('menu-item-type-wooscp').
            find('a').
            wrapInner(
                '<span class="wooscp-menu-item-inner" data-count="' + count +
                '"></span>');
      }
    });

    $('#wooscp-area').attr('data-count', count);
    $('.wooscp-bar').attr('data-count', count);
    $(document.body).trigger('wooscp_change_count', [count]);
  }

  function wooscpHideEmptyRow() {
    $('#wooscp_table > tbody > tr').each(function() {
      var _td = 0;
      var _td_empty = 0;

      $(this).children('td').each(function() {
        if ((
            _td > 0
        ) && (
            $(this).html().length > 0
        )) {
          _td_empty = 1;
        }
        _td++;
      });

      if (_td_empty == 0) {
        $(this).hide();
      }
    });
  }
})(jQuery);