/**
 * Created by tom on 11/21/15.
 */
(function($){
	var services = [
			'taxi',
			'lyft',
			'sidecar',
			'uberx',
			'uberxl',
			'uberblack',
			'ubersuv',
			'uberselect',
			'ubertaxi'
	];
	var Services = {
		taxi: {
			name: 'taxi',
			require: ['Taxi'],
			standard: 'Drivers providing taxi services in the City of Chicago are required to have an active City of Chicago Taxi Chauffeur License.',
			meets: 'This driver appears to have an active Chicago Taxi Chauffeur License.',
			violation: 'This driver appears to not have the required active Chicago Taxi Chauffeur License.'
		},
		lyft: {
			name: 'lyft',
			require: null,
			standard: 'Drivers providing Lyft services are not required to be licensed by the City of Chicago.',
			meets: null,
			violation: null
		},
		sidecar: {
			name: 'sidecar',
			require: null,
			standard: 'Drivers providing Sidecar services are not required to be licensed by the City of Chicago.',
			meets: null,
			violation: null
		},
		uberx: {
			name: 'uberx',
			require: null,
			standard: 'Drivers providing UberX services are not required to be licensed by the City of Chicago.',
			meets: null,
			violation: null
		},
		uberxl: {
			name: 'uberxl',
			require: null,
			standard: 'Drivers providing UberXL services are not required to be licensed by the City of Chicago.',
			meets: null,
			violation: null
		},
		uberblack: {
			name: 'uberblack',
			require: ['Taxi', 'Livery Only'],
			standard: 'Drivers providing UberBlack services in the City of Chicago are required to have an active City of Chicago Taxi or Livery Chauffeur License.',
			meets: 'This driver appears to have an active Chicago Chauffeur License.',
			violation: 'This driver appears to not have the required active Chicago Chauffeur License.'
		},
		ubersuv: {
			name: 'ubersuv',
			require: ['Taxi', 'Livery Only'],
			standard: 'Drivers providing UberSUV services in the City of Chicago are required to have an active City of Chicago Taxi or Livery Chauffeur License.',
			meets: 'This driver appears to have an active Chicago Chauffeur License.',
			violation: 'This driver appears to not have the required active Chicago Chauffeur License.'
		},
		uberselect: {
			name: 'uberselect',
			require: null,
			standard: 'Drivers providing UberSelect services are not required to be licensed by the City of Chicago.',
			meets: null,
			violation: null
		},
		ubertaxi: {
			name: 'taxi',
			require: ['Taxi'],
			standard: 'Drivers providing UberTaxi services in the City of Chicago are required to have an active City of Chicago Taxi Chauffeur License.',
			meets: 'This driver appears to have an active Chicago Taxi Chauffeur License.',
			violation: 'This driver appears to not have the required active Chicago Taxi Chauffeur License.'
		}
	};
	var MatchPattern = {
		first: /^([a-z-]{2,})\W+([a-z-]{2,}\W+[a-z-])$/i,
		firstWithComma: /^(.{2,}),\W+(.*)$/i,
		last: /^([a-z-]{2,})\W+(?:.*\W+)([a-z-]{2,})$/i
	};
	var MatchArray = [];
	var thisNameMatch = [];

	var compare = function (a,b) {
		if (a.sortname < b.sortname)
			return -1;
		if (a.sortname > b.sortname)
			return 1;
		return 0;
	};

	var ucwords = function(str,force){
		str=force ? str.toLowerCase() : str;
		return str.replace(/(\b)([a-zA-Z])/g,
				function(firstLetter){
					return   firstLetter.toUpperCase();
				});
	};

	var getURLParameter = function(sParam)
	{
		var sPageURL = window.location.search.substring(1);
		var sURLVariables = sPageURL.split('&');
		for (var i = 0; i < sURLVariables.length; i++) {
			var sParameterName = sURLVariables[i].split('=');
			if (sParameterName[0] == sParam) {
				return sParameterName[1].replace('+',' ');
			}
		}
	};

	$('#information').on('click', function() {
		$('#modal-information').modal('show');
	});

	if (typeof getURLParameter('service') !== 'undefined' &&
			typeof getURLParameter('lastname') !== 'undefined' &&
			services.indexOf(getURLParameter('service')) > -1 &&
			getURLParameter('lastname').length > 0) {
		$("#service option[value='" + getURLParameter('service') + "']").attr("selected", true);
		$('#lastname').val(getURLParameter('lastname'));

		$.get("https://data.cityofchicago.org/resource/97wa-y6ff.json?$select=license,status,status_date,driver_type,name,sex&$limit=50000", function (data) {
			// Filter list to matching lastname input
			var lastnameRegex = null;
			for (var i = 0; i < data.length; i++) {
				thisNameMatch = [];
				if (typeof data[i].name !== 'undefined' && data[i].name.match(MatchPattern.first)) {
					thisNameMatch = MatchPattern.first.exec(data[i].name);
					lastnameRegex = new RegExp(getURLParameter('lastname'), "i");
					if (thisNameMatch[1].match(lastnameRegex)) {
						data[i].lastname = thisNameMatch[1];
						data[i].firstname = thisNameMatch[2];
						data[i].sortname = thisNameMatch[1]+' '+thisNameMatch[2];
						MatchArray.push(data[i]);
						//console.log('first',MatchArray.length,data[i].lastname+'::'+data[i].firstname);
					}
				}
				else if (typeof data[i].name !== 'undefined' && data[i].name.match(MatchPattern.firstWithComma)) {
					thisNameMatch = MatchPattern.firstWithComma.exec(data[i].name);
					lastnameRegex = new RegExp(getURLParameter('lastname'), "i");
					if (thisNameMatch[1].match(lastnameRegex)) {
						data[i].lastname = thisNameMatch[1];
						data[i].firstname = thisNameMatch[2];
						data[i].sortname = thisNameMatch[1]+' '+thisNameMatch[2];
						MatchArray.push(data[i]);
					}
				}
				else if (typeof data[i].name !== 'undefined' && data[i].name.match(MatchPattern.last)) {
					thisNameMatch = MatchPattern.last.exec(data[i].name);
					lastnameRegex = new RegExp(getURLParameter('lastname'), "i");
					if (thisNameMatch[2].match(lastnameRegex)) {
						data[i].lastname = thisNameMatch[2];
						data[i].firstname = thisNameMatch[1];
						data[i].sortname = thisNameMatch[2]+' '+thisNameMatch[1];
						MatchArray.push(data[i]);
					}
				}
			}
			MatchArray.sort(compare);

			// Did we find anyone?

			$('#modal-results-service').text(Services[getURLParameter('service')].standard);

			if(MatchArray.length === 0){
				$('#modal-search-body').append('We could not find anyone in the list of City of Chicago licensed Public Chauffeurs that matches the last name you entered.');
				$('#modal-search').modal('show');
			} else {
				$('#modal-search-body').append('<span><small>scrollable list</small></span><br><table id="results-table" class="table table-condensed"></table>');
				$('#results-table').append('<thead><tr><th>Name/Gender</th><th>License #</th></thead>').append('<tbody id="results-table-body"></tbody>');
				for(var i=0; i<MatchArray.length; i++) {
					$('#results-table-body').append('<tr '+(MatchArray[i].status === 'ACTIVE' ? '' : (MatchArray[i].status === 'INACTIVE' ? 'class="inactive"' : 'class="danger"'))+'><th><a id="'+i+'-result" class="results-link">'+ucwords(MatchArray[i].lastname,true)+', '+ucwords(MatchArray[i].firstname,true)+' ('+MatchArray[i].sex.charAt(0)+')</a></th><th>'+MatchArray[i].license+'</th></tr>');
				}

				var setDetails = function(MatchArray) {
					//console.log(MatchArray);
					$('#modal-details-name').text(ucwords(MatchArray.lastname,true)+', '+ucwords(MatchArray.firstname,true)+' ('+MatchArray.sex.charAt(0)+')');
					$('#modal-details-license').text(MatchArray.license);
					$('#modal-details-type').text(MatchArray.driver_type);
					$('#modal-details-status').text(ucwords(MatchArray.status,true));
					$('#modal-details-statusdate').text((typeof MatchArray.status_date !== 'undefined' ? MatchArray.status_date.substr(0, MatchArray.status_date.indexOf('T')) : "[no data]"));

					$('#modal-details-text').html('<p>'+Services[getURLParameter('service')].standard+'</p>');
					if(Services[getURLParameter('service')].require !== null){
						$('#modal-details-text').append('<p>'+(Services[getURLParameter('service')].require.indexOf(MatchArray.driver_type) > -1 && MatchArray.status === 'ACTIVE' ? Services[getURLParameter('service')].meets : Services[getURLParameter('service')].violation)+'</p>');
					}

					$('#modal-details').modal('show');
				};

				$('.results-link').on('click', function(event) {
					setDetails(MatchArray[event.target.id.substr(0,event.target.id.indexOf('-'))]);
				});

				$('#modal-search').modal('show');
			}

		}).fail(function() {
			alert( "It seems the City of Chicago's Data Portal is not responding properly. Please try later." );
		});
	}
})(jQuery);