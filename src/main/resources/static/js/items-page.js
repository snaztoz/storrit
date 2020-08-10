$('#site-items-page').carousel();

$('#site-table-content tr').each(function () {
	$(this).click(function() {
		$('#site-items-page').carousel('next');
	})
});

$('#site-edit-page-back-btn').click(function() {
	$('#site-items-page').carousel('prev');
});