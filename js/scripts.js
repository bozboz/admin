jQuery(function($){

	$('.select2').each(function() {
		var obj = $(this);
		var defaultParams = {
			minimumResultsForSearch: 15
		};
		obj.select2($.extend(defaultParams, obj.data()));
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
		var timeInfo = dateTimeExploded[1].split(':');

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

		$('label[for='+$picker.prop('name')+']').prop('for', displayFieldId);

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
console.log($.extend(defaults, config)); // do not commit
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

	function sendFile(files, editor) {
		var temp_form = $('<form></form>');
		$('body').append(temp_form);
		temp_form.fileupload().fileupload('send', {files: files, url: '/admin/media'})
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

	$('.main').on('click', '.btn[data-warn]', function() {
		var msg = $(this).data('warn').length > 1
			? $(this).data('warn')
			: 'Are you sure you want to delete?';
		return confirm( msg );
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

});
