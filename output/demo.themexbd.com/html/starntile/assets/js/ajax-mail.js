<html><head></head><body>$(function() {

	// Get the form.
	var form = $(&#39;#contact-form&#39;);

	// Get the messages div.
	var formMessages = $(&#39;.form-messege&#39;);

	// Set up an event listener for the contact form.
	$(form).submit(function(e) {
		// Stop the browser from submitting the form.
		e.preventDefault();

		// Serialize the form data.
		var formData = $(form).serialize();

		// Submit the form using AJAX.
		$.ajax({
			type: &#39;POST&#39;,
			url: $(form).attr(&#39;action&#39;),
			data: formData
		})
		.done(function(response) {
			// Make sure that the formMessages div has the &#39;success&#39; class.
			$(formMessages).removeClass(&#39;error&#39;);
			$(formMessages).addClass(&#39;success&#39;);

			// Set the message text.
			$(formMessages).text(response);

			// Clear the form.
			$(&#39;#contact-form input,#contact-form textarea&#39;).val(&#39;&#39;);
		})
		.fail(function(data) {
			// Make sure that the formMessages div has the &#39;error&#39; class.
			$(formMessages).removeClass(&#39;success&#39;);
			$(formMessages).addClass(&#39;error&#39;);

			// Set the message text.
			if (data.responseText !== &#39;&#39;) {
				$(formMessages).text(data.responseText);
			} else {
				$(formMessages).text(&#39;Oops! An error occured and your message could not be sent.&#39;);
			}
		});
	});

});
</body></html>