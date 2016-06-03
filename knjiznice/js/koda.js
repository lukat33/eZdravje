
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

// TODO: Tukaj implementirate funkcionalnost, ki jo podpira vaša aplikacija

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
    	for(var i=0; i<3; i++) {
    	    generirajPodatke(i);
        }
    }
}

function generirajPodatke(stPacienta) {
    sessionId = getSessionId();
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
        temperatura = "36.7";
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
        temperatura = "36.5";
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
        temperatura = "38.4";
        kisik = "92";
        break;
  }
  
  $.ajaxSetup({
	    headers: {"Ehr-Session": sessionId}
    });
	
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
                            $("#prijavaSporocilo").html("<span class='label label-success' >Ustvarjeni 3 EHR id-ji</span>");
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
        	   	"vital_signs/body_temperature/any_event/temperature|magnitude": temperatura,
        	    "vital_signs/body_temperature/any_event/temperature|unit": "°C",
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

$(document).ready(function() {

  /**
   * Napolni testni EHR ID pri prebiranju EHR zapisa obstoječega bolnika,
   * ko uporabnik izbere vrednost iz padajočega menuja
   * (npr. Dejan Lavbič, Pujsa Pepa, Ata Smrk)
   */
	$('#preberiObstojeciEHR').change(function() {
		$("#prijavaSporocilo").html("");
		$("#prijavljen").val($(this).val());
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
          
            if($('#prijavaOff').css('display') !='none'){
                $('#prijavaOn').show().siblings('#prijavaOff').hide();
                $( "#user" ).html("<b>Pozdravljen </b>" +ime + " " + priimek+ "!");
                $('#prijavljen2').attr('placeholder',ehrId);
                $("#dodajVitalnoDatumInUra").attr('disabled', false);
                $("#dodajVitalnoTelesnaTemperatura").attr('disabled', false);
                $("#gumbMeritve").attr('disabled', false);
                $("#izrisiGraf").attr('disabled', false);
                setTimeout(graf(prijavljen), 500);
                
            } 
            else if($('#prijavaOn').css('display')!='none'){
            $('#prijavaOff').show().siblings('#prijavaOn').hide();
            prijavljen = "nihce";
            $("#prijavljen").val("");
            $("#dodajVitalnoDatumInUra").attr('disabled', true);
            $("#dodajVitalnoTelesnaTemperatura").attr('disabled', true);
            $("#gumbMeritve").attr('disabled', true);
            $("#izrisiGraf").attr('disabled', true);
            setTimeout(graf(undefined), 500);
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

function dodajMeritveVitalnihZnakov() {
	sessionId = getSessionId();

	var ehrId = prijavljen;
	var telesnaTemperatura = $("#dodajVitalnoTelesnaTemperatura").val();
	var datumInUra = $("#dodajVitalnoDatumInUra").val();

	$.ajaxSetup({
	    headers: {"Ehr-Session": sessionId}
	});
	var podatki = {
		// Struktura predloge je na voljo na naslednjem spletnem naslovu:
  // https://rest.ehrscape.com/rest/v1/template/Vital%20Signs/example
	    "ctx/language": "en",
	    "ctx/territory": "SI",
	    "ctx/time": datumInUra,
	   	"vital_signs/body_temperature/any_event/temperature|magnitude": telesnaTemperatura,
	   	"vital_signs/body_temperature/any_event/temperature|unit": "°C",
	};
	var parametriZahteve = {
	    ehrId: ehrId,
	    templateId: 'Vital Signs',
	    format: 'FLAT',
	    committer: 'Anja'
	};
	$.ajax({
	    url: baseUrl + "/composition?" + $.param(parametriZahteve),
	    type: 'POST',
	    contentType: 'application/json',
	    data: JSON.stringify(podatki),
	    success: function (res) {
	        $("#dodajMeritveVitalnihZnakovSporocilo").html(
          "<span class='obvestilo label label-success fade-in'>Meritev uspešno dodana</span>");
	    },
	    error: function(err) {
	    	$("#dodajMeritveVitalnihZnakovSporocilo").html(
        "<span class='obvestilo label label-danger fade-in'>Prišlo je do napake");
	    }
	});
	setTimeout(graf(prijavljen), 500);
}

function vrniVrocino(ehrId, callback) {
    $.ajax({
	url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
	type: 'GET',
	headers: {"Ehr-Session": sessionId},
	success: function (data) {
		var party = data.party;

		$.ajax({
  		    url: baseUrl + "/view/" + ehrId + "/" + "body_temperature",
		    type: 'GET',
		    headers: {"Ehr-Session": sessionId},
		    success: function (res) {
	    	    if(res.length > 0){
                    callback(res); console.log("uspelo");
                }
		    }
		});
	}
	});
}

function graf(prijavljen) {
    sessionId = getSessionId();
	var ehrId = prijavljen; console.log(prijavljen);
    var vroc = ['0','0','0','0','0','0'];
    var bg = [];
    var bgB = [];
    var date = ['/','/','/','/','/','/'];
    
    $('#myChart').remove(); // this is my <canvas> element
    $('#canvasContainer').append('<canvas id="myChart" width="300" height="300"></canvas>');
    // pridobi podatke
    
    if (ehrId != undefined || ehrId == 'nihce' || ehrId == '') {
        setTimeout(vrniVrocino(ehrId,function(res){
    		for(var i = res.length-1; i>=0; i--){
    			vroc[i] = res[i].temperature;
    			date[i] = res[i].time.substring(0,10); 
    			//console.log(vroc[i] + "   " +date[i]);
    		}
    		
            setTimeout(izrisiGraf(vroc,date), 450);
    	}), 300);
        
    } else {
        izrisiGraf(vroc,date);
    }
}

function izrisiGraf(vroc,date){
    var ctx = document.getElementById("myChart");
    for(var i = 0; i < 6; i++) {
        console.log(vroc[i] + "   " +date[i]);
    }
    var bg = [];
    var bgB = [];
    for(var i=0; i<6; i++) {
                if (vroc[i] > 37.2 || vroc[i] < 35.7) {
                    bg[i] = 'rgba(255, 99, 132, 0.2)';
                    bgB[i] = 'rgba(255,99,132,1)';
                } else {
                    bg[i] = 'rgba(54, 162, 235, 0.2)';
                    bgB[i] = 'rgba(54, 162, 235, 1)';
                }
            }
    var myChart = new Chart(ctx, {
        type: 'bar', 
        data: {
            labels: [date[5], date[4], date[3],date[2], date[1], date[0]],
            datasets: [{
                label: '°C',
                
                data: [vroc[5], vroc[4], vroc[3],vroc[2],vroc[1], vroc[0]],
                
                backgroundColor: [
                    bg[5],
                    bg[4],
                    bg[3],
                    bg[2],
                    bg[1],
                    bg[0],
    
                ],
                borderColor: [
                    bgB[5],
                    bgB[4],
                    bgB[3],
                    bgB[2],
                    bgB[1],
                    bgB[0],
    
                ],
                borderWidth: 0.7
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true,
                        max: 43,
                        min: 30,
                        stepSize: 1,
                    }
                }]
            }
        }
});
}

window.onload = function() {
  graf();
};