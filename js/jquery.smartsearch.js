// jQuery SmartSearch
// A kick-ass search plugin for your site
// by Adam Prager <adam.prager@netlife.hu>
;(function($) {
    $.smartSearch = function(el, options) {
        var defaults = {
            maxShownOptions: 2,
            onChange: function() {
            },
            onClear: function() {
                smartSearch.$form.submit();
            }
        }

        var smartSearch = this;

        smartSearch.settings = {}
        
        smartSearch.initialized = false;

        var init = function() {
            smartSearch.settings = $.extend({}, defaults, options);
            smartSearch.$form = $(el);
            smartSearch.$search = $(el).find('.search');
            
            smartSearch.$form.find("select, input").change(smartSearch.settings.onChange);

            smartSearch.decorateField();
            smartSearch.createFilters();
            
            smartSearch.initialized = true;
        }
        
        smartSearch.clearFilters = function() {
            smartSearch.$searchbar.find('li:not(.handle)').remove();
            
            smartSearch.$form.find('input:not(:checkbox), select').val('');
            smartSearch.$form.find('input:checkbox').removeAttr('checked');
            
            smartSearch.settings.onClear();
            
            return false;
        }

        smartSearch.decorateField = function() {
            var $ul = $('<ul></ul>').addClass('searchbar');
            
            var $li = $('<li></li>').addClass('handle');
            $li.append(smartSearch.$search);
            
            $ul.append($li);
            
            $li = $('<li></li>').addClass('handle');
            
            var $remove = $('<a></a>').attr({
                'href': '#'
            });
            
            $remove.bind('click', smartSearch.clearFilters);
            
            var $removeI = $('<i></i>').addClass('icon-remove');

            $remove.append($removeI);
            
            $li.append($remove);
            
            $ul.append($li);
            
            smartSearch.$form.prepend($ul);
            
            $ul.bind('click', function() {
                smartSearch.$search.focus();
            });
            
            smartSearch.$searchbar = $ul;
            
            smartSearch.$form.find('[type=submit]');
        }

        smartSearch.createFilters = function() {
            var toClick = [];
            
            var $filters = $('<div></div>').addClass('filters');

            $.each(smartSearch.$form.find("select"), function() {
                var $field = $(this);
                var $label = smartSearch.$form.find('label[for=' + $field.attr('id') + ']');

                var $filter = $('<div></div>').addClass('filter');
                $filter.append($('<h3></h3>').html($label.html()));
                
                var $ul = $('<ul></ul>');

                $.each($field.find("option"), function() {
                    var $option = $(this);
                    
                    if ($option.attr('value') != '') {
                        var $li = $('<li></li>');
                        var $a = $('<a></a>').attr({
                            'href': '#',
                            'data-input-id': $field.attr('id'),
                            'data-input-value': $option.attr('value')
                        }).html($option.html());

                        $a.bind('click', smartSearch.applyFilter);
                        
                        if ($field.attr('multiple') == 'multiple') {
                            var $checkI = $('<i></i>');
                            
                            if ($option.attr('selected') == 'selected') {
                                $checkI.addClass('icon-check');
                            }
                            else {
                                $checkI.addClass('icon-check-empty');
                            }
                        
                            $a.prepend($checkI);
                        }

                        if ($option.attr('selected') == 'selected') {
                            $a.css({
                                'font-weight': 'bold'
                            });
                            toClick.push($a);
                        }

                        $li.append($a);
                        $ul.append($li);
                    }
                });
                
                $filter.append($ul);
                
                $field.hide();
                $label.hide();
                
                $filters.append($filter);
            });
            
            $filters.append($("<hr />"));
            
            $.each(smartSearch.$form.find("input:visible:not(." + 'search' + ")"), function() {
                var $field = $(this);
                var $label = smartSearch.$form.find('label[for=' + $field.attr('id') + ']');

                var $filter = $('<div></div>').addClass('filter');
                $filter.append($('<h3></h3>').html($label.html()));
                $filter.append($field);
                
                $label.remove();
                
                if ($field.val() != '' && $field.is(':not(:checkbox)')) {
                    var $activeFilter = $('<li></li>').attr({
                        'data-input-id': $field.attr('id')
                    }).addClass('input');

                    var $remove = $('<a></a>').attr({
                        'href': '#'
                    });

                    $remove.bind('click', smartSearch.removeFilter);

                    var $removeI = $('<i></i>').addClass('icon-remove icon-white');

                    $remove.append($removeI);
                    $activeFilter.append($remove);
                    
                    $activeFilter.prepend($label.html() + ': ' + $field.val());
            
                    smartSearch.$searchbar.prepend($activeFilter);
                }
                else if ($field.is(':checkbox:checked')) {
                    var $activeFilter = $('<li></li>').attr({
                        'data-input-id': $field.attr('id')
                    }).addClass('checkbox');

                    var $remove = $('<a></a>').attr({
                        'href': '#'
                    });

                    $remove.bind('click', smartSearch.removeFilter);

                    var $removeI = $('<i></i>').addClass('icon-remove icon-white');

                    $remove.append($removeI);
                    $activeFilter.append($remove);
                    
                    $activeFilter.prepend($label.html());
            
                    smartSearch.$searchbar.prepend($activeFilter);
                }
                
                $filters.append($filter);
            });
            
            $filters.append('<div style="clear: both;"></div>');
            
            smartSearch.$filters = $filters;
            smartSearch.$form.append($filters);
            
            smartSearch.$search.bind('focus', function() {
                smartSearch.$filters.show();
            });
            
            $.each(toClick, function() {
                $(this).click();
            });
        }
        
        smartSearch.applyFilter = function() {
            var $a = $(this);
            
            var $filter = $a.parents('ul:first');
            var $field = $('#' + $a.data('input-id'));
            var $label = $('label[for=' + $a.data('input-id') + ']');
            
            if (smartSearch.initialized == true) {
                if ($field.attr('multiple') == 'multiple') {
                    var $option = $field.find('option[value=' + $a.data('input-value') + ']');
                    
                    if ($option.attr('selected') == 'selected') {
                        $option.attr('selected', false);
                        $a.removeClass('active');
                        $a.find('i').removeClass('icon-check').addClass('icon-check-empty');
                    }
                    else {
                        $option.attr('selected', true);
                        $a.addClass('active');
                        $a.find('i').removeClass('icon-check-empty').addClass('icon-check');
                    }
                }
                else {
                    $filter.find('a').removeClass('active');
                    $a.addClass('active');
                    
                    $field.val($a.data('input-value'));
                }
                
                $('#' + $a.data('input-id')).change();
            }
                        
            var $existing = smartSearch.$searchbar.find('li[data-input-id=' + $a.data('input-id') + ']');

            if ($existing.length > 0) {
                $existing.remove();
            }
            
            var $activeFilter = $('<li></li>').attr({
                'data-input-id': $a.data('input-id')
            });

            var $remove = $('<a></a>').attr({
                'href': '#'
            });

            $remove.bind('click', smartSearch.removeFilter);

            var $removeI = $('<i></i>').addClass('icon-remove icon-white');

            $remove.append($removeI);
            $activeFilter.append($remove);
            
            var selectedCount = 0;
            
            $.each($filter.find('li a'), function() {
                var $a = $(this);
            
                var $option = $field.find('option[value=' + $a.data('input-value') + ']');
                
                if ($option.attr('selected') == 'selected') {
                    selectedCount++;
                }
            });
            
            if (selectedCount > 0) {
                if (selectedCount <= smartSearch.settings.maxShownOptions) {
                    $.each($filter.find('li a'), function() {
                        var $a = $(this);

                        var $option = $field.find('option[value=' + $a.data('input-value') + ']');

                        if ($option.attr('selected') == 'selected') {
                            $activeFilter.prepend($a.html());
                        }
                    });
                }
                else {
                    $activeFilter.prepend($label.html() + ': ' + selectedCount + ' selected');
                }

                smartSearch.$searchbar.prepend($activeFilter);
            }
            
            $a.blur();
            
            return false;
        }
        
        smartSearch.removeFilter = function() {
            var $a = $(this);
            var $activeFilter = $a.parent('li');
            
            if ($('#' + $activeFilter.data('input-id')).is(':checkbox')) {
                $('#' + $activeFilter.data('input-id')).removeAttr('checked');
            }
            else {
                $('#' + $activeFilter.data('input-id')).val('');
            }
            
            if (smartSearch.initialized == true) {
                $('#' + $activeFilter.data('input-id')).change();
            }
            
            $activeFilter.remove();
            
            $.each(smartSearch.$filters.find('a[data-input-id=' + $activeFilter.data('input-id') + ']'), function(){  
                var $a = $(this);
                
                $a.removeClass('active');
                $a.find('i').removeClass('icon-check').addClass('icon-check-empty');
            });
            
            return false;
        }

        init();
    }
    
    $.fn.smartSearch = function(options) {
        return this.each(function() {
            if (undefined == $(this).data('smartSearch')) {
                var smartSearch = new $.smartSearch(this, options);
                $(this).data('smartSearch', smartSearch);
            }
        });
    }

})(jQuery);