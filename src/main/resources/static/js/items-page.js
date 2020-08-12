/* ===================== Memuat Data Barang =====================
 *
 * Untuk mengambil data-data barang dari server.
 */

var ITEMS_API_URL = '/items';

/* ====================== Pergantian Page =======================
 *
 * Perpindahan page di bagian Items menggunakan teknik carousel
 * dari Bootstrap untuk mengatur pergerakan slide-slidenya.
 */

/**
 * Untuk debug dan development, pasang nilai sesuai dengan nomor
 * page terkait.
 * Default: 0
 */
let ITEMS_INIT_PAGE = 0;

/** Menginisialisasikan ke page pertama ketika aplikasi di-load. */
$('#site-items-page').carousel(ITEMS_INIT_PAGE);

/**
 * Membuat page bergeser ke page detail ketika salah satu baris
 * dari table diklik.
 * Pada halaman detail tersebut dimuat data-data mengenai barang
 * barang terkait.
 */
$('#site-table-content tr').each(function () {
	$(this).click(function() {
		$('#site-items-page').carousel(1);
	})
});

/**
 * Pergerakan dari halaman tabel, menuju ke halaman tambah
 * barang baru.
 */
$('#site-table-page-create-item-btn').click(function() {
	// memutar langsung ke item carousel ketiga
	$('#site-items-page').carousel(2);
});

/**
 * Untuk pergerakan dari halaman detail atau create, kembali ke
 * halaman tabel.
 */
$('.site-table-page-back-btn').click(function() {
	$('#site-items-page').carousel(0);
});