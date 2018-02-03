function capture_data(){
	console.log('im here');
	jQuery("#tab8").click();
	setTimeout(function(){
		jQuery("#period").val('3months');
		setTimeout(function(){
			jQuery("#get").click();
			var company = {results:[]};
			setTimeout(function(){
				company.name = jQuery("#companyName").text();
				company.symbol = jQuery("#symbol").text();
				console.log(jQuery("#historicalData table tr"));
				jQuery("#historicalData table tr").each(function(i,v){
					if(i != 0){
						company.results.push({
							date: jQuery.trim(jQuery(this).find("td:eq(0)").text()),
							open: parseFloat(jQuery.trim(jQuery(this).find("td:eq(3)").text().replace(/,/, ''))),
							high: parseFloat(jQuery.trim(jQuery(this).find("td:eq(4)").text().replace(/,/, ''))),
							low: parseFloat(jQuery.trim(jQuery(this).find("td:eq(5)").text().replace(/,/, ''))),
							close: parseFloat(jQuery.trim(jQuery(this).find("td:eq(7)").text().replace(/,/, ''))),
							volume: parseFloat(jQuery.trim(jQuery(this).find("td:eq(8)").text().replace(/,/, '')))
						});
					}
				});
				chrome.runtime.sendMessage({stock: company, action: "record_captured"});
			}, 2000);
		}, 100);
	}, 100);
};

chrome.runtime.onMessage.addListener(function (msg, sender, response) {
  capture_data();
});

capture_data();