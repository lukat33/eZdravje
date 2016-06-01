
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";


/**
 * Prijava v sistem z privzetim uporabnikom za predmet OIS in pridobitev
 * enolične ID številke za dostop do funkcionalnosti
 * @return enolični identifikator seje za dostop do funkcionalnosti
 */
function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}


/**
 * Generator podatkov za novega pacienta, ki bo uporabljal aplikacijo. Pri
 * generiranju podatkov je potrebno najprej kreirati novega pacienta z
 * določenimi osebnimi podatki (ime, priimek in datum rojstva) ter za njega
 * shraniti nekaj podatkov o vitalnih znakih.
 * @param stPacienta zaporedna številka pacienta (1, 2 ali 3)
 * @return ehrId generiranega pacienta
 */
function generirajPodatke(stPacienta) {
    ehrId = "";

  switch(stPacienta) {
    case 0:
        $.ajax({
        url: baseUrl + "/ehr",
        type: 'POST',
        success: function (data) {
            var ehrId = data.ehrId;
            var partyData = {
                firstNames: "Zdravko",
                lastNames: "Dren",
                dateOfBirth: "1996-10-30T14:58",
                partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
            };
            $.ajax({
                url: baseUrl + "/demographics/party",
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(partyData),
                success: function (party) {
                    if (party.action == 'CREATE') {
                        $("#kreirajSporocilo").html("<span class='label label-success'>Dober '" +
                      ehrId + "'</span>");
                    }
                },
                error: function(err) {
                	$("#kreirajSporocilo").html("<span class='obvestilo label " +
                "label-danger fade-in'>Napaka '" +
                JSON.parse(err.responseText).userMessage + "'!");
                }
            });
            
        	var podatki = {
        	    "ctx/language": "en",
        	    "ctx/territory": "SI",
        	    "ctx/time": "2016-05-30T14:58",
        	    "vital_signs/height_length/any_event/body_height_length": "179",
        	    "vital_signs/body_weight/any_event/body_weight": "75.3",
        	   	"vital_signs/body_temperature/any_event/temperature|magnitude": "36.70",
        	    "vital_signs/body_temperature/any_event/temperature|unit": "°C",
        	    "vital_signs/blood_pressure/any_event/systolic": "109",
        	    "vital_signs/blood_pressure/any_event/diastolic": "76",
        	    "vital_signs/indirect_oximetry:0/spo2|numerator": "98"
            };
        	var parametriZahteve = {
        	    ehrId: ehrId,
        	    templateId: 'Vital Signs',
        	    format: 'FLAT',
        	    committer: 'Medicinska sestra Anja'
        	};
            
            $.ajax({
        	    url: baseUrl + "/composition?" + $.param(parametriZahteve),
        	    type: 'POST',
        	    contentType: 'application/json',
        	    data: JSON.stringify(podatki)   
            });
        }
    });
    break;
    
    case 1:
        $.ajax({
        url: baseUrl + "/ehr",
        type: 'POST',
        success: function (data) {
            var ehrId = data.ehrId;
            var partyData = {
                firstNames: "Peter",
                lastNames: "Peterko",
                dateOfBirth: "1981-08-30T11:18",
                partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
            };
            $.ajax({
                url: baseUrl + "/demographics/party",
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(partyData),
                success: function (party) {
                    if (party.action == 'CREATE') {
                        $("#kreirajSporocilo2").html("<span class='label label-primary'>Normalen '" +
                      ehrId + "'</span>");
                    }
                },
                error: function(err) {
                	$("#kreirajSporocilo").html("<span class='obvestilo label " +
                "label-danger fade-in'>Napaka '" +
                JSON.parse(err.responseText).userMessage + "'!");
                }
            });
            
        	var podatki = {
        	    "ctx/language": "en",
        	    "ctx/territory": "SI",
        	    "ctx/time": "2016-04-14T14:12",
        	    "vital_signs/height_length/any_event/body_height_length": "185",
        	    "vital_signs/body_weight/any_event/body_weight": "85.0",
        	   	"vital_signs/body_temperature/any_event/temperature|magnitude": "36.50",
        	    "vital_signs/body_temperature/any_event/temperature|unit": "°C",
        	    "vital_signs/blood_pressure/any_event/systolic": "129",
        	    "vital_signs/blood_pressure/any_event/diastolic": "89",
        	    "vital_signs/indirect_oximetry:0/spo2|numerator": "95"
            };
        	var parametriZahteve = {
        	    ehrId: ehrId,
        	    templateId: 'Vital Signs',
        	    format: 'FLAT',
        	    committer: 'Medicinska sestra Franja'
        	};
            
            $.ajax({
        	    url: baseUrl + "/composition?" + $.param(parametriZahteve),
        	    type: 'POST',
        	    contentType: 'application/json',
        	    data: JSON.stringify(podatki)   
            });
        }
    });
    break;
    
    case 2:
        $.ajax({
        url: baseUrl + "/ehr",
        type: 'POST',
        success: function (data) {
            var ehrId = data.ehrId;
            var partyData = {
                firstNames: "Boljan",
                lastNames: "Vročinek",
                dateOfBirth: "1974-12-12T19:52",
                partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
            };
            $.ajax({
                url: baseUrl + "/demographics/party",
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(partyData),
                success: function (party) {
                    if (party.action == 'CREATE') {
                        $("#kreirajSporocilo3").html("<span class='label label-danger'>Slab '" +
                      ehrId + "'</span>");
                    }
                },
                error: function(err) {
                	$("#kreirajSporocilo").html("<span class='obvestilo label " +
                "label-danger fade-in'>Napaka '" +
                JSON.parse(err.responseText).userMessage + "'!");
                }
            });
            
        	var podatki = {
        	    "ctx/language": "en",
        	    "ctx/territory": "SI",
        	    "ctx/time": "2016-04-02T09:17",
        	    "vital_signs/height_length/any_event/body_height_length": "172",
        	    "vital_signs/body_weight/any_event/body_weight": "91.0",
        	   	"vital_signs/body_temperature/any_event/temperature|magnitude": "38.40",
        	    "vital_signs/body_temperature/any_event/temperature|unit": "°C",
        	    "vital_signs/blood_pressure/any_event/systolic": "151",
        	    "vital_signs/blood_pressure/any_event/diastolic": "103",
        	    "vital_signs/indirect_oximetry:0/spo2|numerator": "92"
            };
        	var parametriZahteve = {
        	    ehrId: ehrId,
        	    templateId: 'Vital Signs',
        	    format: 'FLAT',
        	    committer: 'Medicinska sestra Bolanka'
        	};
            
            $.ajax({
        	    url: baseUrl + "/composition?" + $.param(parametriZahteve),
        	    type: 'POST',
        	    contentType: 'application/json',
        	    data: JSON.stringify(podatki)   
            });
        }
    });
        
    break;
        
    default:
        return 0;
}

  // TODO: Potrebno implementirati

  return ehrId;
}


// TODO: Tukaj implementirate funkcionalnost, ki jo podpira vaša aplikacija

function kreirajEHRzaBolnika() {
	sessionId = getSessionId();
	
	$.ajaxSetup({
	    headers: {"Ehr-Session": sessionId}
	});
	
	
	
	for(var i=0; i<3; i++) {
	    generirajPodatke(i);
	    
    
}
}
