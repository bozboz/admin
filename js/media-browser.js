function MediaViewModel(data, url)
{
	var self = this;

	this.selectedMedia = {
		mediaPath: data.mediaPath,
		media: ko.observableArray(data.media),
		getFilename: function(filename)
		{
			return self.selectedMedia.mediaPath + '/' + filename;
		},
		getPreviewImageUrl: function(filename, type, isPrivate)
		{
			if (isPrivate) {
				return '/assets/images/admin/private-document.png';
			} else if (type == 'image') {
				return self.selectedMedia.getFilename(filename);
			} else {
				return '/assets/images/admin/document.png';
			}
		},
		update: function()
		{
			self.selectedMedia.media(self.mediaLibrary.currentMedia());
			self.mediaLibrary.active(false);
		}
	};

	this.mediaLibrary = {
		active: ko.observable(false),
		loaded: ko.observable(false),
		mediaAccess: data.mediaAccess,
		media: ko.observableArray([]),
		currentMedia: ko.observableArray([]),
		links: ko.observable(''),
		pages: {},
		getFilename: function(filename)
		{
			return self.mediaLibrary.mediaPath + '/' + filename;
		},
		getPreviewImageUrl: function(filename, type, isPrivate)
		{
			if (isPrivate) {
				return '/packages/bozboz/admin/images/private-document.png';
			} else if (type == 'image') {
				return self.mediaLibrary.getFilename(filename);
			} else {
				return '/packages/bozboz/admin/images/document.png';
			}
		},
		browse: function()
		{
			if (!self.mediaLibrary.loaded()) {
				self.mediaLibrary.currentMedia(self.selectedMedia.media());
				self.mediaLibrary.query(url, function() {
					self.mediaLibrary.loaded(true);
					self.mediaLibrary.active(true);
				});
			} else {
				self.mediaLibrary.active(true);
			}
		},
		query: function(url, callback)
		{
			var update = function(data) {
				self.mediaLibrary.links(data.links);
				self.mediaLibrary.mediaPath = data.mediaPath;
				self.mediaLibrary.media(data.media);
				if (callback) callback();
			};

			url = url + '&access=' + self.mediaLibrary.mediaAccess;

			if (self.mediaLibrary.pages[url]) {
				update(self.mediaLibrary.pages[url]);
			} else {
				$.getJSON(url, function(data) {
					update(data);
					self.mediaLibrary.currentMedia(ko.utils.arrayMap(self.mediaLibrary.currentMedia(), function(currentMedia) {
						return ko.utils.arrayFirst(data.media, function(media) {
							return media.id == currentMedia.id;
						}) || currentMedia;
					}));
					self.mediaLibrary.pages[url] = data;
				});
			}
		}
	};
}

ko.bindingHandlers.modal = {
	init: function(element, valueAccessor) {
		var $element = $(element);

		$element.on('hidden.bs.modal', function (e) {
			var value = valueAccessor();
			value(false);
		});

		$element.on('shown.bs.modal', function(e) {
			var container = $element.find('.modal-body ul');
			container.imagesLoaded(function() {
				container.masonry({
					columnWidth: 187,
					itemSelector: ".masonry-item"
				});
			});
		});
	},
	update: function(element, valueAccessor, allBindings) {
		var active = ko.unwrap(valueAccessor());
		$(element).modal(active ? 'show' : 'hide');
	}
};

ko.bindingHandlers.masonry = {
	update: function(element, valueAccessor, allBindings) {
		var media = valueAccessor()();

		if (media.length) {
			var $element = $(element);
			if ($element.data('masonry')) {
				$element.masonry('destroy');
			}
			$element.imagesLoaded(function() {
				$element.masonry({
					columnWidth: 187,
					itemSelector: ".masonry-item"
				});
			});
		}
	}
};