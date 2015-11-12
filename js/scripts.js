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

		$.post('/admin/sort', {model: sortable.data('model'), items: data});
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
