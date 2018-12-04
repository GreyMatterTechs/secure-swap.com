/**
 * App for SecureSwap ICO website.
 *
 * @requires	Include all of the following: Tools.js
 * @file		Kb.js
 * @version:	1.0.0
 * @author:		Philippe Aubessard
 * @link        http://secure-swap.com
 * @copyright:	Copyright (c) 2017, GreyMatterTechs.com. All rights reserved.
 * @namespace:	ssw
 */

'use strict';

/**
 */
(function(window, undefined) {

	window.ssw = window.ssw || {};	// NameSpace

	if (window.ssw.Tools === undefined) { throw new Error('Please load Tools.js'); }

	// ---------- class Kb

	// --- public static

	// constructeur public static
	window.ssw.Kb = function() {
		throw new Error('Please use getInstance');
	};

	// singleton factory public static
	window.ssw.Kb.getInstance = function() {
		if (instance) { return instance; }
		instance = new Kb();
		return instance;
	};

	// --- private static

	// membres private static

	var instance	= null;
	

	// Constructeur private static
	var Kb = function() {

		// --- private members

		var catIntervalDefault = 5000;
		var catInterval = catIntervalDefault;
		var catIntervalId = null;
		var ajaxDelay;
		var tools		= null;
		var accessToken		= null;
		var $addCategories = $('#add-categories');
		var $addTags = $('#add-tags');
		var $addTitle = $('#add-title');
		var $addText = $('#add-text');
		var updateTagsEnabled = false;
		var updateSearchEnabled = false;

		var itemRemoved = [];
		var itemAdded = [];
		var searchResults = null;

		// --- private methods

		function notify() {
			$.notify({
				icon:		'_extranet/assets/images/timeout.png',
				title:		'Session time out!',
				message:	'Your session period is now over.<br />' +
							'Please <span class="blue">Login</span> again.'
			}, {
				type:		'minimalist',
				placement:	{from: 'top', align: 'right'},
				delay:		5000,
				animate:	{enter: 'animated fadeInLeftBig', exit: 'animated fadeOutLeftBig'},
				icon_type:	'image',
				template:	'<div data-notify="container" class="alert alert-{0}" role="alert">' +
							'	<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
							'	<div id="image">' +
							'		<img data-notify="icon" class="rounded-circle float-left" />' +
							'	</div>' +
							'	<div id="text">' +
							'		<span data-notify="title">{1}</span>' +
							'		<span data-notify="message">{2}</span>' +
							'	</div>' +
							'</div>'
			});
		}

		function updateCats() {
			$.get('/api/Categories')
				.done(function(categories) {
					catInterval = catIntervalDefault;
					categories.forEach(function(category) {
						$addCategories.tagsinput('add', {value: category.name, checked: false});
					});
					$addCategories.tagsinput('refresh');
				})
				.fail(function(err) {
					if (catInterval < catIntervalDefault * 100) catInterval *= 2;
				});
		}
		function updateCatsTimer() {
			if (catIntervalId) clearInterval(catIntervalId);
			updateCats();
			catIntervalId = setInterval(updateCatsTimer, catInterval);
		}


		function sortObject(obj) {
			return Object.values(obj)
				.sort().reduce(function(a, v) {
			  		a[v] = obj[v];
					  return a;
				}, {});
		}

		function split(txt) {
			return XRegExp.match(txt, XRegExp('[\\pL\\pN]+', 'g'));
		}

		function uniqueCounts(arr) {
			return arr
					.reduce(function(acc, word) {
						if (word) acc[word] = (acc[word] || 0) + 1;
						return acc;
					}, {});
		}

		function includes(arr, value) {
			return arr.some(function(item) {
				return item.value === value;
			});
		}

		function updateTags() {
			if (updateTagsEnabled) {
				// on prends les mots du texte (sans les doublons)
				$addTags.tagsinput('removeAll');

				var txt = $('#add-text').val();
				if (txt) {
					var items = [];

					// on retire les mots au pluriel
					var words = split(txt);
					var singular = words.filter(function(elem, index, self) {
						if (elem.toLowerCase().endsWith('s')) {
							elem = elem.slice(0, -1);
							return self.indexOf(elem) < 0;
						}
						return true;
					});

					// on garde les 3 + grands accronymes
					var cap = uniqueCounts(singular);
					Object.keys(cap).forEach(function(key, index) {
						if (key.length < 3 || !(/^[A-Z0-9]+$/.test(key))) delete this[key];
					}, cap);
					var capSorted = Object.keys(cap).sort(function(a, b) { return cap[b] - cap[a]; });
					capSorted.slice(0, 3).forEach(function(item) {
						if (!includes(itemRemoved, item))
							$addTags.tagsinput('add', {'value': item, 'type': 'accro'});
					});

					// on garde les 3 + grands mots
					var uniquewords = new Set(singular);
					var uniquewordsArr = Array.from(uniquewords);
					var sortedByLength = uniquewordsArr.sort(function(a, b) { return b.length - a.length; });
					sortedByLength.slice(0, 3).forEach(function(item) {
						if (!includes(itemRemoved, item))
							$addTags.tagsinput('add', {'value': item, 'type': 'wider'});
					});

					// on garde les mots utilisés + d'1 fois et > à 5 lettres
					var uniquecount = uniqueCounts(singular);
					Object.keys(uniquecount).forEach(function(key, index) {
						if ((key.length <= 5) || this[key] < 2) delete this[key];
					}, uniquecount);
					var sortedByCount = Object.keys(uniquecount).sort(function(a, b) { 
						if (uniquecount[b] == uniquecount[a]) {
							return b.length - a.length;
						}
						return uniquecount[b] - uniquecount[a];
					});
					sortedByCount.slice(0, 3).forEach(function(item) {
						if (!includes(itemRemoved, item))
							$addTags.tagsinput('add', {'value': item, 'type': 'most'});
					});

				} else {
					itemRemoved = [];
					itemAdded = [];
				}
				itemAdded.forEach(function(item) {
					$addTags.tagsinput('add', item);
				});
				$addTags.tagsinput('refresh');
			}
		}

		String.prototype.insertTextAtIndices = function(injection) {
			return this.replace(/./g, function(character, index) {
				return injection[index] ? injection[index] + character : character;
			});
		};

		function template(data) {
			var html = '';
			var copy = JSON.parse(JSON.stringify(data));
			for (var i = 0; i < copy.length; i ++) {
				var obj = copy[i];
				var matches = obj.matches;
				for (var j = 0; j < matches.length; j ++) {
					var mobj = matches[j];
					if (mobj.key === 'title' || mobj.key === 'text') {
						var offset = 0;
						for (var k = 0; k < mobj.indices.length; k ++) {
							var indice = mobj.indices[k];
							var injection = {};
							injection[indice[0] + offset] = '<span class="hlt">';	// offset 18
							injection[indice[1] + offset + 1] = '</span>';			// offset 7
							obj.item[mobj.key] = obj.item[mobj.key].insertTextAtIndices(injection);
							offset += 18 + 7;
						}
					}
				}
				html +=	'<section class="card">' +
						'	<div class="card-content">' +
						'		<div class="card-body">' +
						'			<div class="d-flex mb-1">' +
						'				<div class="flex-grow-1"><b>' + obj.item.title + '</b></div>' +
						'				<div class="">[ ' + obj.item.categories.toString() + ' ]</div>' +
						'			</div>' +
						'			<div class="d-flex">' +
						'				<div class="kb-text">' + obj.item.text.replace(/\n/g, '<br />') + '</div>' +
						'			</div>' +
						'			<div class="kb-button align-items-end"><a href="#" data-toggle="modal" data-target="#kb-view" data-index="' + i + '" class="btn-sm btn btn-outline-warning round">More...</a></div>' +
						'		</div>' +
						'	</div>' +
						'</section>';
			}
			return html;
		}

		function updateSearch() {
			if (updateSearchEnabled) {
				var txt = $.trim($('#search').val());
				if (txt) {
					$.ajax({
						url: '/api/KBs/search',
						type: 'POST',
						data: {tokenId: accessToken, words: txt}
					}).done(function(res) {
						// on affiche les résultats de la recherche... à voir comment...
						$('#pagination-container').pagination({
							dataSource: res,
							pageSize: 3,
							callback: function(data, pagination) {
								searchResults = data;
								var html = template(data);
								$('#kb-container').html(html);
							}
						});
					}).fail(function(err) {
						// notify($.i18n('page.kb.err.searchFailed'), 'error');
						if (err.status === 401) {
							notify();
							$('#search').blur();
						} else {
							console.log(err);
						}
					});
				}
			}
		}


		// --- public methods

		return {

			init: function(_username, _ajaxDelay, _accessToken) {

				ajaxDelay = _ajaxDelay || 5000;
				accessToken = _accessToken;
				tools = window.ssw.Tools.getInstance();

				//--------------------------------------------------------------------------------------------------------------
				// Categories
				//--------------------------------------------------------------------------------------------------------------

				$addCategories.tagsinput({
					checkbox: true,
					itemValue: 'value'
				});
				updateCatsTimer();
				$addCategories.on('itemAdded', function(event) {
					if (event.item.type === 'manual') {
						$.ajax({
							url: '/api/Categories/add',
							type: 'POST',
							data: {tokenId: accessToken, category: event.item.value}
						}).done(function() {
						}).fail(function(msg) {
							// notify($.i18n('page.kb.err.addCatFailed'), 'error');
						});
					}
				});

				//--------------------------------------------------------------------------------------------------------------
				// Tags
				//--------------------------------------------------------------------------------------------------------------

				$addTags.tagsinput({
					tagClass: function(item) {
					  switch (item.type) {
						case 'wider'	: return 'badge-primary';
						case 'accro'	: return 'badge-secondary';
						case 'most'		: return 'badge-warning';
						case 'manual'	: return 'badge-success';
					  }
					},
					itemValue: 'value'
				});
				$addTags.on('itemAdded', function(event) {
					if (event.item.type === 'manual')
						if (!includes(itemAdded, event.item))
							itemAdded.push(event.item);
				});
				$addTags.on('itemRemoved', function(event) {
					if (event.item.type === 'manual') {
						itemAdded = itemAdded.filter(function(el) { return el.value != event.item.value; });
					} else {
						itemRemoved.push(event.item);
					}
				});
				setInterval(updateTags, 1000);
				$('#add-text').blur(function() { updateTagsEnabled = false; });
				$('#add-text').focus(function() { updateTagsEnabled = true; });
				var form = document.getElementById('form-add');
				$('#add-tags-submit').click(function(event) {
					event.preventDefault();
					event.stopPropagation();
					if (form.checkValidity()) {
						// get title, categories, text, tags
						var title = $addTitle.val();
						var text = $addText.val();
						var categories = $addCategories.tagsinput('items');
						var checkedCategories = categories.map(function(tag) { if (tag.checked) return tag.value; else return null; });
						checkedCategories = checkedCategories.filter(function(tag) { if (tag) return true; });
						var tags = $addTags.tagsinput('items');
						tags = tags.map(function(tag) { return tag.value; });
						var kb = {title: title, categories: checkedCategories, tags: tags, text: text, author: _username, date: new Date()};
						// and record KB to database
						$.ajax({
							url: '/api/KBs/add',
							type: 'POST',
							data: {tokenId: accessToken, kb: kb}
						}).done(function() {
							// clear inputs & textarea
							itemRemoved = [];
							itemAdded = [];
							$addTitle.val('');
							$addText.val('');
							$addTags.tagsinput('removeAll');
							$addCategories.tagsinput('uncheckAll');
							form.classList.remove('was-validated');
							$('#add-tags-submit').text('Thank you').removeClass('btn-gradient-primary').addClass('btn-gradient-secondary');
							setTimeout(function() {
								$('#add-tags-submit').text('Save this awesome information').removeClass('btn-gradient-secondary').addClass('btn-gradient-primary');
							}, 1000);
						}).fail(function(err) {
							if (err.status === 401) {
								notify();
								$addTags.blur();
								$addTitle.blur();
								$addText.blur();
							} else {
								console.log(err);
							}
							// notify($.i18n('page.kb.err.addKBFailed'), 'error');
							$('#add-tags-submit').text('Save this awesome information');
						});
					}
					form.classList.add('was-validated');
				});

				//--------------------------------------------------------------------------------------------------------------
				// Search
				//--------------------------------------------------------------------------------------------------------------
				setInterval(updateSearch, 1000);
				$('#search').blur(function() { updateSearchEnabled = false; });
				$('#search').focus(function() { updateSearchEnabled = true; });

				$('#kb-view').on('show.bs.modal', function(event) {
					var button = $(event.relatedTarget); // Button that triggered the modal
					var index = button.data('index'); // Extract info from data-* attributes
					var modal = $(this);
					if (searchResults) {
						$.each(searchResults, function(idx, obj) {
							if (idx === index) {
								modal.find('.kb-title').text(obj.item.title);
								modal.find('.kb-author').text('Posted by: ' + tools.ucfirst(obj.item.author) + ', on: ' + moment(obj.item.date).format('LL'));
								modal.find('.view-categories').text('Categories: ' + obj.item.categories.toString());
								modal.find('.kb-text').html(obj.item.text.replace(/\n/g, '<br />'));
							}
						});
					}
				});

			} // end of init:function

		}; // end of return

	}; // end of ssw.Kb = function() {

	// ---------- End class Kb

}(window));

// window.ssw.Tools.getInstance().addEventHandler(document, 'DOMContentLoaded', window.ssw.Kb.getInstance().init(), false);

// EOF
