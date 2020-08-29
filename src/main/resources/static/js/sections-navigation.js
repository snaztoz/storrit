// Namespace terkait navigasi ke bagian-bagian yang ada pada aplikasi.
let navigation = {};

// View yang digunakan untuk menghandle event-event terkait dengan
// sistem navigasi antar bagian dari aplikasi.
navigation.View = Backbone.View.extend({

	// View yang sedang ditampilkan untuk saat ini.
	//
	// Dapat diisi oleh instance dari item.View atau activity.View.
	currentView: null,

	el: '#sections-navigator',
	
	events: {
		'click #section-item': 'renderItemSection',
		'click #section-activity': 'renderActivitySection',
	},

	// Akan dijalankan ketika instance dari view ini pertama kali
	// dibuat.
	initialize: function() {
		// menampilkan bagian item ketika page pertama kali diload.
		this.renderItemSection();
	},

	// Membuat instance dari item.View yang kemudian akan merender page-
	// page dari item section melalui method initialize()-nya.
	renderItemSection: function() {
		if (this.currentView != null) {
			this.currentView.remove();
		}
		this.currentView = new item.View({collection: itemCollection});
	},

	// Membuat instance dari activity.View yang kemudian akan merender
	// page-page dari item section melalui method initialize()-nya.
	//
	// BELUM DIIMPLEMENTASIKAN
	renderActivitySection: function() {
		$('#main-section').html("TES GAN");
		return this;
	},

});

let navigationView = new navigation.View();