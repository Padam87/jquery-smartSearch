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
                smartSearch.submit();
            }
        }

        var smartSearch = this;

        smartSearch.settings = {}
        
        smartSearch.initialized = false;

        var init = function() {
            smartSearch.settings = $.extend({}, defaults, options);
            smartSearch.$form = $(el);
            smartSearch.$search = $(el).find('.search').bind('focus', function() {
                smartSearch.$filters.show();
            });
            
            smartSearch.$form.find("select, input").change(smartSearch.settings.onChange);

            smartSearch.createSearchbar();
            smartSearch.createFilters();
            
            smartSearch.initialized = true;
        }
        
        /* Clears filters */
        smartSearch.clearFilters = function() {
            smartSearch.$searchbar.find('li:not(.handle)').remove();
            
            smartSearch.$form.find('input:not(:checkbox), select').val('');
            smartSearch.$form.find('input:checkbox').removeAttr('checked');
            
            smartSearch.settings.onClear();
            
            return false;
        }
        
        /* Submits form */
        smartSearch.submit = function() {
            smartSearch.$form.submit();
            
            return false;
        }
        
        /* Creates the searchbar */
        smartSearch.createSearchbar = function() {
            smartSearch.$searchbar = $('<ul></ul>').addClass('searchbar').append(/* Search */
                $('<li></li>').addClass('handle').append(
                    smartSearch.$search
                )
            ).append(/* Submit, Clear */
                $('<li></li>').addClass('handle pull-right')
                .append(/* Submit */
                    $('<a></a>').attr('href', '#').bind('click', smartSearch.submit).append(
                        $('<i></i>').addClass('icon-search')
                    )
                ).append(/* Clear */
                    $('<a></a>').attr('href', '#').bind('click', smartSearch.clearFilters).append(
                        $('<i></i>').addClass('icon-remove')
                    )
                )
            ).bind('click', function() {
                smartSearch.$search.focus();
            });
            
            smartSearch.$form.prepend(smartSearch.$searchbar);
        }
        
        /* Creates the filters, adds active filters to the searchbar */
        smartSearch.createFilters = function() {
            var toClick = [];
            
            var $filters = $('<div></div>').addClass('filters').append(
                $("<hr />")
            );

            $.each(smartSearch.$form.find("select"), function() {
                var $select = $(this);
                var $label = smartSearch.$form.find('label[for=' + $select.attr('id') + ']');

                var $filter = $('<div></div>').addClass('filter').append(
                    $('<h3></h3>').html($label.html())
                );
                
                var $ul = $('<ul></ul>');

                $.each($select.find("option"), function() {
                    var $option = $(this);
                    
                    if ($option.attr('value') != '') {
                        var $li = $('<li></li>');
                        var $a = $('<a></a>').attr({
                            'href': '#',
                            'data-input-id': $select.attr('id'),
                            'data-input-value': $option.attr('value')
                        }).html($option.html()).bind('click', smartSearch.applyFilter);
                        
                        if ($select.attr('multiple') == 'multiple') {
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
                            $a.addClass('active');
                            toClick.push($a);
                        }

                        $li.append($a);
                        $ul.append($li);
                    }
                });
                
                $filter.append($ul);
                
                $select.hide();
                $label.hide();
                
                $filters.append($filter);
            });
            
            $filters.append($("<hr />"));
            
            $.each(smartSearch.$form.find("input:visible:not(." + 'search' + ")"), function() {
                var $field = $(this);
                var $label = smartSearch.$form.find('label[for=' + $field.attr('id') + ']');

                var $filter = $('<div></div>').addClass('filter').append(
                    $('<h3></h3>').html($label.html())
                ).append(
                    $field
                );
                    
                $filters.append($filter);
                
                $label.remove();
                                
                var $activeFilter = $('<li></li>').attr({
                    'data-input-id': $field.attr('id')
                }).append(
                    $('<a></a>').attr({
                        'href': '#'
                    }).bind('click', smartSearch.removeFilter).append(
                        $('<i></i>').addClass('icon-remove icon-white')
                    )
                );
                
                if ($field.val() != '' && $field.is(':not(:checkbox)')) {
                    $activeFilter.addClass('input');
                    $activeFilter.prepend($label.html() + ': ' + $field.val());
            
                    smartSearch.$searchbar.prepend($activeFilter);
                }
                else if ($field.is(':checkbox:checked')) {
                    $activeFilter.addClass('checkbox');
                    $activeFilter.prepend($label.html());
            
                    smartSearch.$searchbar.prepend($activeFilter);
                }
            });
            
            smartSearch.$form.find("[type=submit]").hide();
            
            $filters.append('<div style="clear: both;"></div>');
            
            smartSearch.$filters = $filters;
            smartSearch.$form.append($filters);
            
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
            }).append(
                $('<a></a>').attr({
                    'href': '#'
                }).bind('click', smartSearch.removeFilter).append(
                    $('<i></i>').addClass('icon-remove icon-white')
                )
            );
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