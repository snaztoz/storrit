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

		// memasang attribute id pada model, hal ini diperlukan agar
		// Backbone dapat mengakses tiap item di server sesuai dengan
		// id-nya
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
		err = {
			field: '',
			error: '',
		};

		for (let attr in attrs) {
			if (attr === 'amount') continue;

			if (attrs[attr] === '') {
				err.field = attr;
				err.error = 'empty-field';
				return err;
			}
		}

		// jumlah harus berupa angka (jika kosong dianggap sebagai NaN)
		if (Number.isNaN(attrs.amount)) {
			err.field = 'amount';
			err.error = 'not-a-number';
			return err;
		}

		// jumlah tidak dapat negatif
		if (attrs.amount < 0) {
			err.field = 'amount';
			err.error = 'negative';
			return err;
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
		'click .item-table-row': function() {
			this.errors.clear.call(this);
			this.pages.update.call(this);
		},

		'click #item-create-page-btn': function() {
			this.pages.clearCreateForm.call(this);
			this.errors.clear.call(this);
			this.pages.create.call(this);
		},

		'click .item-table-page-back-btn': function() {this.pages.index.call(this)},

		'click #item-create-btn':           'createItem',
		'click #item-update-btn':           'updateItem',
	},

	// Render item section sebelum event-event terkait section ini dikaitkan
	// dengan para handlernya.
	preinitialize: function() {
		this.errors = item.errors;
		this.pages = item.pages;
		this.templates = item.templates;
		this.render();
	},

	// Akan dijalankan ketika instance dari view ini pertama kali
	// dibuat.
	initialize: function() {
		this.listenTo(this.collection, 'request', this.renderLoading);
		this.listenTo(this.collection, 'change sync', this.renderRows);
		this.listenTo(this.collection, 'invalid', this.errors.invalidInput);
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

		// menghapus error yang mungkin terjadi pada event submit
		// sebelumnya
		this.errors.clear.call(this);

		this.collection.create({
			name: this.$('#item-create-name').val(),
			code: this.$('#item-create-code').val(),
			amount: parseInt(this.$('#item-create-amount').val()),
			amountUnit: this.$('#item-create-amount-unit').val()
		}, {
			validate: true,
			success: this.pages.index.bind(this),
			error: (model, err) => {
				this.errors.duplicateItem.call(this, err.responseJSON.errors);

				// mencegah item yang gagal melewati validasi server dimasukkan
				// ke dalam collection
				this.collection.fetch();
			},
		});
	},

	// Mengupdate data item di server.
	updateItem: function(event) {
		event.preventDefault(); // mencegah form disubmit oleh browser

		let newAmount = parseInt(this.$('#item-update-amount').val());

		// mencegah menyimpan data yang tidak berubah
		if (newAmount === this.collection.selectedModel.attributes.amount) {
			console.log("This is the same");
			return;
		}

		this.collection.selectedModel.save({amount: newAmount}, {
			patch: true,
			success: this.pages.index.bind(this),
			error: (resp) => {
				console.log("Update failed");
				console.log(resp);
			}
		});
	},

	// Menampilkan pesan ketika terjadi error pada validasi sisi server.
	//
	// BELUM DIIMPLEMENTASIKAN
	displayServerErrors: function(obj) {
		console.log("SERVER ERROR");
		console.log(obj);
	},

});

// Kasus error yang mungkin terjadi pada item section.
item.errors = {

	// Menangani error terkait input yang gagal melewati validasi
	// (validasi sisi klien, bukan server).
	invalidInput: function(model, err) {
		const page = this.$('div.active').index();

		if (page === item.CREATE_PAGE) {
			this.errors.invalidCreate.call(this, err);
		} else if (page === item.UPDATE_PAGE) {
			this.errors.invalidUpdate.call(this, err);
		}
	},

	// Menangani error pada validasi sisi klien ketika ingin membuat
	// barang baru di server.
	invalidCreate: function(err) {
		let errMsg;

		if (err.error === 'empty-field')        { errMsg = 'Tidak boleh kosong'; }
		else if (err.error === 'not-a-number')  { errMsg = 'Jumlah harus berupa angka'; }
		else if (err.error === 'negative')      { errMsg = 'Jumlah tidak dapat negatif'; }

		// karena field amountUnit menempel pada amount, sehingga error
		// yang terjadi di antara keduanya akan ditampilkan dalam satu
		// elemen yang sama.
		if (err.field === 'amountUnit') {
			err.field = 'amount';
		}

		this.$(`#item-create-${err.field}-error`).html(errMsg);
	},

	// Menangani error pada validasi sisi klien ketika ingin mengupdate
	// data barang di server.
	invalidUpdate: function(err) {
		let errMsg;

		if (err.error === 'not-a-number')   { errMsg = 'Jumlah harus berupa angka'; }
		else if (err.error === 'negative')  { errMsg = 'Jumlah tidak dapat negatif'; }

		this.$(`#item-update-${err.field}-error`).html(errMsg);
	},

	// Menangani error yang terjadi ketika ingin menyimpan item baru, namun
	// nama/kode dari item tersebut sudah ada di database (tidak boleh ada
	// item yang duplikat).
	duplicateItem: function(err) {
		let field;
		let fieldTranslate;

		if (err === 'the name is already taken') {
			field = 'name';
			fieldTranslate = 'Nama';
		} else if (err === 'the code is already taken') {
			field = 'code';
			fieldTranslate = 'Kode';
		}

		this.$(`#item-create-${field}-error`).html(
				`${fieldTranslate} barang tidak boleh sama dengan\
				yang sudah ada di penyimpanan`);
	},

	// Menghapus tampilan pesan error dari setiap form.
	clear: function() {
		// field create item
		const fields = ['name', 'code', 'amount'];
		fields.forEach(field => {
			this.$(`#item-create-${field}-error`).html('');
		});

		// field update item
		this.$(`#item-update-amount-error`).html('');
	}

};

// Halaman-halaman di dalam bagian item.
item.pages = {

	// Berganti ke page create new item.
	create: function() {
		this.$el.carousel(item.CREATE_PAGE);
	},

	// Berganti ke page index dari item.
	index: function() {
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