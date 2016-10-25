(function($){
    $.fn.extend({
        select2_sortable: function(options){
            var select = $(this);
            $(select).select2($.extend(options, {
                width: '100%',
                createTag: function(params) {
                    return undefined;
                }
            }));
            var ul = $(select).next('.select2-container').first('ul.select2-selection__rendered');
            ul.sortable({
                placeholder : false,
                forcePlaceholderSize: true,
                items       : 'li:not(.select2-search__field)',
                tolerance   : 'pointer',
                stop: function() {
                    $($(ul).find('.select2-selection__choice').get().reverse()).each(function() {
                        var id = $(this).data('data').id;
                        var option = select.find('option[value="' + id + '"]')[0];
                        $(select).prepend(option);
                    });
                }
            });
        }
    });
}(jQuery));

jQuery(function($){

	$('.select2').each(function() {
		var obj = $(this);
		var defaultParams = {
			theme: "bootstrap",
			minimumResultsForSearch: 15,
            templateSelection: function(item) {
                return item.text.trim();
            }
		};
		obj.select2_sortable($.extend(defaultParams, obj.data()));
	});

	$('[data-toggle="popover"]').popover({
		trigger: 'hover'
	});

	$('textarea.html-editor').summernote({
		height: 230,
		toolbar: [
			['style', ['style']],
			['font', ['bold', 'italic', 'underline', 'clear']],
			['para', ['ul', 'ol', 'paragraph']],
			['table', ['table']],
			['insert', ['link', 'picture', 'video']],
			['view', ['fullscreen', 'codeview']],
			['help', ['help']]
		],
		onImageUpload: function(files) {
			sendFile(files, $(this));
		}
	});

	//Convert a MySQL DateTime formatted string into a JS Date object
	var stringToDate = function(dateTimeString) {
		var dateTimeExploded = dateTimeString.split(' ');
		var dateInfo = dateTimeExploded[0].split('-');
		var timeInfo = dateTimeExploded[1] ? dateTimeExploded[1].split(':') : [0, 0, 0];

		return new Date(dateInfo[0], dateInfo[1] - 1, dateInfo[2], timeInfo[0], timeInfo[1], timeInfo[2]);
	};

	//Parse config and convert applicable strings to Date objects
	var parseDatepickerConfig = function(config) {
		for (var key = config.length - 1; key >= 0; key--) {
			switch(key){
				case 'minDateTime':
				case 'maxDateTime':
				case 'defaultDate':
				case 'defaultDateTime':
					if (config[key] !== undefined && config[key] !== null) {
						config[key] = new Date(config[key] * 1000);
					}
				break;
			}
		}
		return config;
	}

	var initDatepickerField = function($picker, method, defaults) {
		var config = window.datePicker[$picker.prop('id')];
		$picker.prop('type', 'hidden');

		var displayFieldId = $picker.prop('id')+'_alt';

		$('label[for="'+$picker.prop('id')+'"]').prop('for', displayFieldId);

		var $displayField = $('<input>').prop({
			type: 'text',
			id: displayFieldId,
			name: displayFieldId,
			class: $picker.prop('class'),
		});
		$displayField.insertAfter($picker);

		var date = $picker.val() === '' ? null : stringToDate($picker.val());

		config = parseDatepickerConfig(config);

		//Revert to some default if applicable
		if (date === null && config.defaultDateTime !== undefined) {
			date = config.defaultDateTime;
		}
		//Initialise picker
		$displayField[method]($.extend(defaults, config));
		if (date !== null) {
			$displayField[method]('setDate', date);
		}
	}

	$('.js-datepicker').each(function() {
		initDatepickerField($(this), 'datepicker', {
			showSecond: false,
			dateFormat: 'dd/mm/yy',
			altField: $(this),
			altFieldTimeOnly: false,
			altFormat: 'yy-mm-dd',
		});
	});


	$('.js-datetimepicker').each(function() {
		initDatepickerField($(this), 'datetimepicker', {
			showSecond: false,
			dateFormat: 'dd/mm/yy',
			altField: $(this),
			altFieldTimeOnly: false,
			altFormat: 'yy-mm-dd',
			altTimeFormat: 'HH:mm:ss',
		});
	});

	$('.js-datepicker-popup').click(function(e) {
		e.preventDefault();

		var dateField = $(this).find('.js-date');

		if (!dateField.length) {
			alert('Unable to find date input');
			return;
		}

		dateField.datetimepicker({
			dateFormat: 'yy-mm-dd',
			onClose: function() {
				if($(this).val()) {
					$(this).closest('form').submit();
				}
			}
		});
		dateField.datepicker('show');
	});

	function sendFile(files, editor) {
		var temp_form = $('<form></form>');
		$('body').append(temp_form);
		temp_form.fileupload().fileupload('send', {
			formData: {
				_token: $('[name=_token]').val()
			},
			files: files,
			url: '/admin/media'
		})
			.success(function(data) {
				editor.summernote('insertImage', data.files[0].fullsizeUrl);
				temp_form.remove();
			})
			.error(function(jqXHR, textStatus, errorThrown) {
				temp_form.remove();
				if (typeof console == "object") console.log(textStatus, errorThrown);
				alert('An error occurred while trying to upload the image. Please try again.');
			});
	}

	var masonryContainer = $('.js-mason').masonry({ "columnWidth": 187, "itemSelector": ".masonry-item" });
	masonryContainer.imagesLoaded( function() {
	  masonryContainer.masonry();
	});

	/*====================================
	=            New Sortable            =
	====================================*/

	$('.js-sortable').each(function(){

		var sort = $(this);

		var onSortingDrop = function(e, obj) {
			var before = obj.item.prev('[data-id]');
			var after = obj.item.next('[data-id]');
			var parent = obj.item.parent('ol').parent('li[data-id]');

			var data = {
				model: sort.sortable().data('model'),
				instance: obj.item.data('id'),
				_token: $('[name=_token]').val()
			};

			if (before.length) {
				data.before = before.data('id');
			} else if (after.length) {
				data.after = after.data('id');
			} else if (parent.length) {
				data.parent = parent.data('id');
			}

			sort.addClass('is-blocked');

			$.post('/admin/sort', data).always(function() {
				sort.removeClass('is-blocked');
			}).fail(function() {
				alert('An error occurred while trying to save the sort value. Please try again.');
			});
		};

		var options = {
			handle: '.js-sorting-handle',
			items: '.js-nested-item',
			toleranceElement: '> div',
			maxLevels: sort.hasClass('nested') ? 0 : 1,
			stop: onSortingDrop
		};

		if (sort.hasClass('nested')) {
			return sort.nestedSortable(options);
		} else {
			return sort.sortable(options);
		}
	});


	/*===========================================
	=            Deprecated Sortable            =
	===========================================*/

	$('[id=save-new-order]').on('click', function(e) {
		e.preventDefault();
		var sortable = $(this).data('sortable');
		if (sortable.hasClass('nested')) {
			var data = sortable.nestedSortable('toHierarchy');
		} else {
			var data = [];
			sortable.sortable().children().each(function() {
				if ($(this).data('id') !== undefined) {
					data.push({'id': $(this).data('id')});
				}
			});
		}

		$.post('/admin/sort', {
				model: sortable.data('model'),
				items: data,
				_token: $('[name=_token]').val()
			}).fail(function() {
				alert('An error occurred while trying to save the sort value. Please try again.');
			});
		$('.js-save-notification').hide();
	});

	$('[id=cancel-new-order]').on('click', function(e) {
		$('.js-save-notification').hide();
		e.preventDefault();
	});

	$('.sortable').each(function(){
		var options = {
			handle: '.sorting-handle',
			items: 'li',
			toleranceElement: '> div',
			revert: 200,
			// maxLevels: 0 = unlimited
			maxLevels: $(this).hasClass('nested') ? 0 : 1,
			stop: function (e, ui) {
				$('.js-save-notification').show();
				$('[id=save-new-order]').data('sortable', $(this));
			}
		};
		if ($(this).hasClass('nested'))
			return $(this).nestedSortable(options);
		else
			return $(this).sortable(options);
	});

	/*=====  End of Deprecated Sortable  ======*/



	$('.main').on('click', '.btn[data-warn]', function() {
		var msg = $(this).data('warn').length > 1
			? $(this).data('warn')
			: 'Are you sure you want to delete?';
		return confirm( msg );
	});

	function extractId(obj)
	{
		var newObj = {id: obj.id};

		if (obj.children) {
			newObj.children = [];
			for (var i in obj.children[0]) {
				newObj.children.push(extractId(obj.children[0][i]));
			}
		}
		return newObj;
	}

	var setTopPadding = function() {
		$('body').css('padding-top', ($('.navbar').height()+15)+'px');
	}
	$(window).resize(setTopPadding);
	setTopPadding();

	/*=================================
	=            Bulk Edit            =
	=================================*/
	$('.js-select-all-instances').change(function() {
		$(this).closest('.table-responsive').find('.js-select-instance').prop('checked', $(this).is(':checked'));
	});

	$('.js-bulk-update').submit(function(e) {
		var form = $(this);
		$('.js-select-instance:checked').each(function() {
			form.append($(this).prop('type', 'hidden'));
		});
	});

});
