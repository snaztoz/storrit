// Namespace untuk script page-page items. Keyword var digunakan agar
// script lain dapat mengakses object ini.
//
// (contoh, lihat script sections-navigation.js).
//
var item = {};

// URL dari API yang digunakan untuk mengambil data barang.
item.API_URL = '/items';

// Page-page yang ada pada bagian item. Angka-angka berikut merupakan
// representasi dari urutan page pada frame carousel.
//
// Secara default yang akan ditampilkan ketika aplikasi pertama kali
// dimuat adalah INDEX_PAGE.
item.INDEX_PAGE = 0;
item.UPDATE_PAGE = 1;
item.CREATE_PAGE = 2;

// Model dasar untuk tiap Item.
item.Model = Backbone.Model.extend({

	defaults: {
		name: '',
		code: '',
		amount: 0,
		amountUnit: ''
	},

	parse: function(response, options) {
		link = response._links.self.href;
		id = parseInt(link.substring(link.lastIndexOf('/') + 1));

		// memasang attribute id pada model
		this.set('id', id);
		return ({
			name: response.name,
			code: response.code,
			amount: response.amount,
			amountUnit: response.amountUnit,
		});
	},

	// Memvalidasi data sebelum dikirimkan ke server.
	validate: function(attrs, option) {
		// semua field harus diisi
		if ([attrs.name, attrs.code, attrs.amountUnit].includes('')) {
			return 'empty-field';
		}

		// jumlah harus berupa angka (jika kosong dianggap sebagai NaN)
		if (Number.isNaN(attrs.amount)) {
			return 'amount-not-a-number';
		}

		// jumlah tidak dapat negatif
		if (attrs.amount < 0) {
			return 'negative-amount';
		}
	},

});

// Kumpulan dari banyak model Item.
item.Collection = Backbone.Collection.extend({

	model: item.Model,

	// Attribute ini menyimpan model sesuai dengan row yang diklik dari
	// table item.
	// Digunakan ketika ingin mengupdate/menghapus data barang.
	selectedModel: 0,

	// Data terbaru yang didapatkan dari respon permintaan Ajax yang
	// dikirim oleh collection ini.
	responseData: {},

	url: item.API_URL,

	parse: function(data) {
		this.responseData = data;
		return data._embedded.items;
	},

});

// View yang dibuat khusus untuk menghandle event-event terkait
// collection dari items.
item.View = Backbone.View.extend({

	el: '#site-items-page',

	events: {
		'click .item-table-row':            function() {this.pages.update.call(this)},
		'click #item-create-page-btn':      function() {this.pages.create.call(this)},
		'click .item-table-page-back-btn':  function() {this.pages.index.call(this)},

		'click #item-create-btn':           'createItem',
		'click #item-update-btn':           'updateItem',
	},

	// Render item section sebelum event-event terkait section ini dikaitkan
	// dengan para handlernya.
	preinitialize: function() {
		this.pages = item.pages;
		this.templates = item.templates; // memasukkan item.templates ke class ini
		this.render();
	},

	// Akan dijalankan ketika instance dari view ini pertama kali
	// dibuat.
	initialize: function() {
		this.listenTo(this.collection, 'request', this.renderLoading);
		this.listenTo(this.collection, 'change sync', this.renderRows);
		this.listenTo(this.collection, 'invalid', this.displayClientErrors);
		this.collection.fetch();

		this.pages.index.call(this); // aktifkan carousel
	},

	// Fungsi render utama yang akan memuat item section (selain index,
	// termasuk juga page update dan juga create).
	render: function() {
		$('#main-section').html(this.templates.main);
		return this;
	},

	// Menampilkan ikon loading.
	renderLoading: function() {
		this.$('#item-table-content').html(this.templates.tableLoading);
		return this;
	},

	// Menampilkan tiap data yang ada di dalam collection.
	renderRows: function() {
		if (this.collection.length === 0) {
			this.$('#item-table-content').html(this.templates.tableEmpty);
			return this;
		}
		this.$('#item-table-content').html(''); // hapus isi sebelumnya

		const page = this.collection.responseData.page.number;
		const pageSize = this.collection.responseData.page.size;

		let counter = 1;
		this.collection.each(model => {
			let name = model.attributes.name;
			let code = model.attributes.code;
			let amount = model.attributes.amount;
			let amountUnit = model.attributes.amountUnit;

			row = this.templates.tableRow({
				'no': (page * pageSize) + counter,
				'name': name,
				'code': code,
				'amount': amount,
				'amountUnit': amountUnit,
			});

			let rowObj = $(row).appendTo('#item-table-content');

			// setiap baris tabel langsung terikat dengan data yang dikandungnya,
			// sehingga data yang akan ditampilkan pada update page tidak akan
			// berubah meskipun data baris diganti melalui Inspect Element.
			rowObj.click(() => {
				// menandai model yang dipilih
				this.collection.selectedModel = model;
				this.$('#item-update-identifiers').html(`${name} [#${code}]`);
				this.$('#item-update-amount').val(`${amount}`);
				this.$('#item-update-amount-unit').html(amountUnit);
			});

			counter++;
		});

		return this;
	},

	// Menyimpan item baru di server.
	createItem: function(event) {
		event.preventDefault(); // mencegah form disubmit oleh browser

		this.collection.create({
			name: this.$('#item-create-name').val(),
			code: this.$('#item-create-code').val(),
			amount: parseInt(this.$('#item-create-amount').val()),
			amountUnit: this.$('#item-create-amount-unit').val()
		}, {
			validate: true,
			success: () => {
				this.pages.index.call(this);
				this.displayCreationSucceed;
			},
			error: this.displayServerErrors,
		});
	},

	// Mengupdate data item di server.
	updateItem: function(event) {
		event.preventDefault();

		let newAmount = parseInt(this.$('#item-update-amount').val());

		// mencegah menyimpan data yang tidak berubah
		if (newAmount === this.collection.selectedModel.attributes.amount) {
			console.log("This is the same");
			return;
		}

		this.collection.selectedModel.save({amount: newAmount}, {
			patch: true,
			success: () => {
				this.pages.index.call(this);
			},
			error: (resp) => {
				console.log("Update failed");
				console.log(resp);
			}
		});
	},

	// Menampilkan pesan ketika terjadi error pada validasi sisi klien.
	//
	// BELUM DIIMPLEMENTASIKAN
	displayClientErrors: function(model) {
		console.log("CLIENT ERROR");
		console.log(model);
	},

	// Menampilkan pesan ketika sebuah barang berhasil ditambahkan.
	//
	// BELUM DIIMPLEMENTASIKAN
	displayCreationSucceed: function(obj) {
		console.log(obj);
		console.log("BARANG SUKSES DITAMBAHKAN");
	},

	// Menampilkan pesan ketika terjadi error pada validasi sisi server.
	//
	// BELUM DIIMPLEMENTASIKAN
	displayServerErrors: function(obj) {
		console.log("SERVER ERROR");
		console.log(obj);
	},

});

// Halaman-halaman di dalam bagian item.
item.pages = {

	// Berganti ke page create new item.
	create: function() {
		this.$el.carousel(item.CREATE_PAGE);
	},

	// Berganti ke page index dari item.
	index: function(view) {
		// membersihkan form-form ketika berpindah ke page index.
		this.pages.clearCreateForm.call(this);

		this.$el.carousel(item.INDEX_PAGE);
	},

	// Berganti ke page update terkait item yang diklik.
	update: function() {
		this.$el.carousel(item.UPDATE_PAGE);
	},

	// Membersihkan isi-isi field dari create form.
	clearCreateForm: function() {
		this.$('#item-create-name').val('');
		this.$('#item-create-code').val('');
		this.$('#item-create-amount').val('0');
		this.$('#item-create-amount-unit').val('');
	},

};

// Template-template yang digunakan di dalam item view.
item.templates = {

	// Main template untuk view ini, yakni template utama yang memuat
	// semua page untuk section item.
	main: _.template($('#item-page-template').html()),

	// Template untuk baris yang menampilkan tulisan 'tidak ada data'.
	tableEmpty: _.template($('#item-page-table-no-data-template').html()),

	// Template spinner ketika data pada tabel masih dimuat.
	tableLoading: _.template($('#item-page-table-loading-template').html()),

	// Template untuk tiap baris dari tabel.
	tableRow: _.template($('#item-page-table-row-template').html()),

};

// Collection ini harus dapat diakses secara global agar ketika instance
// dari item.View dibuat di dalam script lain (misal sections-navigation.js),
// view tersebut dapat dipasangkan dengan collection ini.
var itemCollection = new item.Collection();