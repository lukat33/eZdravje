
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";
var prijavljen = "nihce";
var ustaviGeneriranje = 0;


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
function kreirajEHRzaBolnika() {
    if (ustaviGeneriranje == 0) {
	sessionId = getSessionId();
	
	$.ajaxSetup({
	    headers: {"Ehr-Session": sessionId}
	});
	
	
    
	for(var i=0; i<3; i++) {
	    generirajPodatke(i);
    }
}

function generirajPodatke(stPacienta) {
    ehrId = "";
    var ime;
	var priimek;
	var rojstvo;
	var sistolicni;
	var diastolicni;
	var cas;
    var visina;
    var teza;
    var temperatura;
    var kisik;
    
  switch(stPacienta) {
    case 0:
        ime = "Zdravko";
        priimek = "Dren";
        rojstvo = "1996-10-30T14:58";
        sistolicni = "109";
        diastolicni = "76";
        cas = "2016-05-30T14:58";
        visina = "179";
        teza = "75.3";
        temperatura = "36.70";
        kisik = "98";
        break;
    
    case 1:
        ime = "Peter";
        priimek = "Peterko";
        rojstvo = "1981-08-30T11:18";
        sistolicni = "129";
        diastolicni = "89";
        cas = "2016-05-14T18:58";
        visina = "179";
        teza = "85.0";
        temperatura = "36.50";
        kisik = "95";
        break;
    
    case 2:
        ime = "Boljan";
        priimek = "Vročinek";
        rojstvo = "1974-12-12T19:52";
        sistolicni = "151";
        diastolicni = "103";
        cas = "2016-04-02T09:17";
        visina = "172";
        teza = "91.0";
        temperatura = "38.40";
        kisik = "92";
        break;
  }
  $.ajax({
        url: baseUrl + "/ehr",
        type: 'POST',
        success: function (data) {
            var ehrId = data.ehrId;
            var partyData = {
                firstNames: ime,
                lastNames: priimek,
                dateOfBirth: rojstvo,
                partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
            };
            $.ajax({
                url: baseUrl + "/demographics/party",
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(partyData),
                success: function (party) {
                    if (party.action == 'CREATE') {
                        if(stPacienta == 1) {
                            $("#prijavaSporocilo").html("<span class='label label-success'>EHR id ustvarjen 3x</span>");
                        }
                    }
                    $( "#preberiObstojeciEHR" ).append( '<option value="' +ehrId+'">'+ ime +" "+ priimek+'</option>' );
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
        	    "ctx/time": cas,
        	    "vital_signs/height_length/any_event/body_height_length": visina,
        	    "vital_signs/body_weight/any_event/body_weight": teza,
        	   	"vital_signs/body_temperature/any_event/temperature|magnitude": temperatura,
        	    "vital_signs/body_temperature/any_event/temperature|unit": "°C",
        	    "vital_signs/blood_pressure/any_event/systolic": sistolicni,
        	    "vital_signs/blood_pressure/any_event/diastolic": diastolicni,
        	    "vital_signs/indirect_oximetry:0/spo2|numerator": kisik
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
    }); ustaviGeneriranje = 1;
    }
}

function preberiEHRodBolnika() {
	sessionId = getSessionId();

	var ehrId = $("#preberiEHRid").val();

	if (!ehrId || ehrId.trim().length == 0) {
		$("#prijavaSporocilo").html("<span class='obvestilo label label-warning " +
      "fade-in'>Prosim vnesite zahtevan podatek!");
	} else {
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
			type: 'GET',
			headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var party = data.party;
				$("#prijavaSporocilo").html("<span class='obvestilo label " +
          "label-success fade-in'>Bolnik '" + party.firstNames + " " +
          party.lastNames + "', ki se je rodil '" + party.dateOfBirth +
          "'.</span>");
			},
			error: function(err) {
				$("#prijavaSporocilo").html("<span class='obvestilo label " +
          "label-danger fade-in'>Napaka '" +
          JSON.parse(err.responseText).userMessage + "'!");
			}
		});
	}
}

$(document).ready(function() {

  /**
   * Napolni testne vrednosti (ime, priimek in datum rojstva) pri kreiranju
   * EHR zapisa za novega bolnika, ko uporabnik izbere vrednost iz
   * padajočega menuja (npr. Pujsa Pepa).
   */
  $('#preberiPredlogoBolnika').change(function() {
    $("#kreirajSporocilo").html("");
    var podatki = $(this).val().split(",");
    $("#kreirajIme").val(podatki[0]);
    $("#kreirajPriimek").val(podatki[1]);
    $("#kreirajDatumRojstva").val(podatki[2]);
  });

  /**
   * Napolni testni EHR ID pri prebiranju EHR zapisa obstoječega bolnika,
   * ko uporabnik izbere vrednost iz padajočega menuja
   * (npr. Dejan Lavbič, Pujsa Pepa, Ata Smrk)
   */
	$('#preberiObstojeciEHR').change(function() {
		$("#prijavaSporocilo").html("");
		$("#prijavljen").val($(this).val());
	});

  /**
   * Napolni testne vrednosti (EHR ID, datum in ura, telesna višina,
   * telesna teža, telesna temperatura, sistolični in diastolični krvni tlak,
   * nasičenost krvi s kisikom in merilec) pri vnosu meritve vitalnih znakov
   * bolnika, ko uporabnik izbere vrednosti iz padajočega menuja (npr. Ata Smrk)
   */
	$('#preberiObstojeciVitalniZnak').change(function() {
		$("#dodajMeritveVitalnihZnakovSporocilo").html("");
		var podatki = $(this).val().split("|");
		$("#dodajVitalnoEHR").val(podatki[0]);
		$("#dodajVitalnoDatumInUra").val(podatki[1]);
		$("#dodajVitalnoTelesnaVisina").val(podatki[2]);
		$("#dodajVitalnoTelesnaTeza").val(podatki[3]);
		$("#dodajVitalnoTelesnaTemperatura").val(podatki[4]);
		$("#dodajVitalnoKrvniTlakSistolicni").val(podatki[5]);
		$("#dodajVitalnoKrvniTlakDiastolicni").val(podatki[6]);
		$("#dodajVitalnoNasicenostKrviSKisikom").val(podatki[7]);
		$("#dodajVitalnoMerilec").val(podatki[8]);
	});

  /**
   * Napolni testni EHR ID pri pregledu meritev vitalnih znakov obstoječega
   * bolnika, ko uporabnik izbere vrednost iz padajočega menuja
   * (npr. Ata Smrk, Pujsa Pepa)
   */
	$('#preberiEhrIdZaVitalneZnake').change(function() {
		$("#preberiMeritveVitalnihZnakovSporocilo").html("");
		$("#rezultatMeritveVitalnihZnakov").html("");
		$("#meritveVitalnihZnakovEHRid").val($(this).val());
	});

});

function prijava() {
    sessionId = getSessionId();
    
    prijavljen = $("#prijavljen").val();
    console.log(prijavljen);
    
    var ehrId = $("#prijavljen").val();
    var ime;
    var priimek;
    
    if (!ehrId || ehrId.trim().length == 0) {
		$("#prijavaSporocilo").html("<span class='obvestilo label label-warning " +
      "fade-in'>Prosim vnesite zahtevan podatek!");
	} else {
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
			type: 'GET',
			headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var party = data.party;
				ime = party.firstNames;
				priimek = party.lastNames;
          
            if($('#vse').css('display') !='none'){
                $('#2').show().siblings('#vse').hide();
                $( "#user" ).html("<b>Pozdravljen </b>" +ime + " " + priimek+ "!");
                $('#prijavljen2').attr('placeholder',ehrId);
            } 
                else if($('#2').css('display')!='none'){
                $('#vse').show().siblings('#2').hide();
                prijavljen = "nihce";
                }
			},
			error: function(err) {
				$("#prijavaSporocilo").html("<span class='obvestilo label " +
          "label-danger fade-in'>Napaka '" +
          JSON.parse(err.responseText).userMessage + "'!");
			}
		});
	}
	
	
}

    

// TODO: Tukaj implementirate funkcionalnost, ki jo podpira vaša aplikacija
//FUNKCIJE



