/* ===================== Memuat Data Barang =====================
 *
 * Untuk mengambil data-data barang dari server.
 */

/**
 * Namespace untuk script page-page items. Keyword var digunakan agar
 * script lain dapat mengakses object ini.
 *
 * (contoh, lihat script sections-navigation.js).
 */
var item = {};

/* URL dari API yang digunakan untuk mengambil data barang. */
item.API_URL = '/items';

/**
 * Page-page yang ada pada bagian item. Angka-angka berikut merupakan
 * representasi dari urutan page pada frame carousel.
 *
 * Secara default yang akan ditampilkan ketika aplikasi pertama kali
 * dimuat adalah INDEX_PAGE.
 */
item.INDEX_PAGE = 0;
item.UPDATE_PAGE = 1;
item.CREATE_PAGE = 2;

/**
 * Model dasar untuk tiap Item.
 */
item.Model = Backbone.Model.extend({

	defaults: {
		name: '',
		code: '',
		amount: 0,
		amountUnit: ''
	}

});

/**
 * Kumpulan dari banyak model Item.
 */
item.Collection = Backbone.Collection.extend({

	model: item.Model,

	/**
	 * Data terbaru yang didapatkan dari respon permintaan Ajax yang
	 * dikirim oleh collection ini.
	 */
	responseData: {},

	url: item.API_URL,

	parse: function(data) {
		this.responseData = data;
		return data._embedded.items;
	},

});

/**
 * View yang dibuat khusus untuk menghandle event-event terkait
 * collection dari items.
 */
item.View = Backbone.View.extend({

	el: '#site-items-page',

	events: {
		'click .item-table-row': 	'showUpdatePage',
		'click #item-create-btn': 	'showCreatePage',

		'click .item-table-page-back-btn': 'showIndexPage',
	},

	/**
	 * Main template untuk view ini, yakni template utama yang memuat
	 * semua page untuk section item.
	 */
	template: _.template($('#item-page-template').html()),

	/** Template untuk baris yang menampilkan tulisan 'tidak ada data'. */
	templateEmptyTable: _.template($('#item-page-table-no-data-template').html()),

	/** Template spinner ketika data pada tabel masih dimuat. */
	templateLoadingTable: _.template($('#item-page-table-loading-template').html()),

	/** Template untuk tiap baris dari tabel. */
	templateRowTable: _.template($('#item-page-table-row-template').html()),

	/**
	 * Render item section sebelum event-event terkait section ini dikaitkan
	 * dengan para handlernya.
	 */
	preinitialize: function() {
		this.render();
	},

	/**
	 * Akan dijalankan ketika instance dari view ini pertama kali
	 * dibuat.
	 */
	initialize: function() {
		this.listenTo(this.collection, 'request', this.renderLoading);
		this.listenTo(this.collection, 'change sync', this.renderRows);
		this.collection.fetch();

		this.$el.carousel(item.INDEX_PAGE); // aktifkan carousel
	},

	/**
	 * Fungsi render utama yang akan memuat item section (selain index,
	 * termasuk juga page update dan juga create).
	 */
	render: function() {
		$('#main-section').html(this.template);
		return this;
	},

	/** Menampilkan ikon loading. */
	renderLoading: function() {
		this.$('#item-table-content').html(this.templateLoadingTable);
		return this;
	},

	/** Menampilkan tiap data yang ada di dalam collection. */
	renderRows: function() {
		if (this.collection.length === 0) {
			this.$('#item-table-content').html(this.templateEmptyTable);
			return this;
		}

		this.$('#item-table-content').html(this.template);
		return this;
	},

	/** Berganti ke page create new item. */
	showCreatePage: function() {
		this.$el.carousel(item.CREATE_PAGE);
	},

	/** Berganti ke page index dari item. */
	showIndexPage: function() {
		this.$el.carousel(item.INDEX_PAGE);
	},

	/** Berganti ke page update terkait item yang diklik. */
	showUpdatePage: function() {
		this.$el.carousel(item.UPDATE_PAGE);
	},

});

// Collection ini harus dapat diakses secara global agar ketika instance
// dari item.View dibuat di dalam script lain (misal sections-navigation.js),
// view tersebut dapat dipasangkan dengan collection ini.
var itemCollection = new item.Collection();