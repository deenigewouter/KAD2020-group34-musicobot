angular.module('KRRclass', [ 'chart.js']).controller('MainCtrl', ['$scope','$http', mainCtrl]);


function mainCtrl($scope, $http){
	$scope.start = function(){
		let artist_uri = localStorage.getItem("sbs_uri");
		let artist_label = localStorage.getItem("sbs_label");
		console.log(artist_label);
		$scope.getRelatedArtists(artist_label);
		
	};
	
	$scope.start2 = function(){
		$scope.artist_tracks = []
		if ($scope.artist_labels.length > 40){
			$scope.artist_labels = $scope.artist_labels.slice(0,40);
		};
		console.log($scope.artist_labels);
		for (let i = 0; i < $scope.artist_labels.length; i++){
			$scope.getArtistsTracks($scope.artist_labels[i]);
		};
		
	};
	
	$scope.getArtistsTracks = function(artist_label){
		let querystring = `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
			PREFIX dc: <http://purl.org/dc/elements/1.1/>
		PREFIX foaf: <http://xmlns.com/foaf/0.1/>
		PREFIX http: <http://www.w3.org/2011/http#>
		PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
		PREFIX pmo: <http://premon.fbk.eu/ontology/core#>
		PREFIX geo: <http://www.geonames.org/ontology#>
		PREFIX wgs: <http://www.w3.org/2003/01/geo/wgs84_pos#>
		prefix mo: <http://purl.org/ontology/mo/>
		prefix dba: <http://dbtune.org/jamendo/artist/>
		prefix db:  <http://dbtune.org/musicbrainz/resource/> 
		PREFIX owl: <http://www.w3.org/2002/07/owl#>
		PREFIX ex: <http://example.org/kad2020/>
		PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
	SELECT DISTINCT ?trackLABEL  WHERE {
?artist rdf:type mo:MusicArtist;
        rdfs:label|foaf:name ?artistLABEL;
        ^foaf:maker ?track.
  ?track  rdfs:label ?trackLABEL;
          ex:popularity ?popularity.
    MINUS {
        ?track ex:popularity "0"^^xsd:float .}FILTER(STR(?artistLABEL)="` + String(artist_label) + `")}
ORDER BY DESC(?popularity)`
		$scope.endpoint = "http://localhost:7200/repositories/final_project";
		$scope.query = encodeURI(querystring).replace(/#/g, '%23')
		$http( {
			method: "GET",
			url : $scope.endpoint + "?query=" + $scope.query,
			headers : {'Accept':'application/sparql-results+json', 'Content-Type':'application/sparql-results+json'}
		} )
		.success(function(data, status ) {
			let track_labels = [];
			console.log(data);
			angular.forEach(data.results.bindings, function(val) {
				track_labels.push(val.trackLABEL.value);
			});
			$scope.artist_tracks.push(track_labels);
			if ($scope.artist_tracks.length == $scope.artist_labels.length){
				console.log($scope.artist_tracks);
				$scope.populate();
			};
		})
		.error(function(error ){
			console.log('Error running the input query!'+error);
		});
	
	}; // getArtistData
	
	
	
	
	$scope.populate = function(){
		
		
		let cardholder = document.getElementById("cardholder");
		let row = document.createElement("div")
		row.className = "row"
		for (let i=0; i < $scope.artist_labels.length; i++){
			if ((i != 0) && (i % 2 == 0)){
				console.log(i);
				cardholder.appendChild(row);
				row.className = "row"
			};
			let card = document.createElement("div");
			card.className = "col-lg-6 col-sm-6 mb-4";
			let card2 = document.createElement("div");
			card2.className = "card h-100";
			card.appendChild(card2);
			let cardbody = document.createElement("div");
			cardbody.className = "card-body";
			let cardtitle = document.createElement("h4");
			cardtitle.className = "text-dark";
			cardtitle.innerHTML = $scope.artist_labels[i];
			cardbody.appendChild(cardtitle);
			let cardtext = document.createElement("p");
			cardtext.className = "card-text text-dark";
			if ($scope.artist_tracks[i].length > 0){
				cardtext.innerHTML = "Songs:";
				cardbody.appendChild(cardtext);
				let ol = document.createElement("ol");
				ol.className = "card-text text-dark";
				for (let j = 0; j < $scope.artist_tracks[i].length; j++){
					let li = document.createElement("li");
					li.innerHTML = $scope.artist_tracks[i][j];
					ol.appendChild(li);
				};
				cardbody.appendChild(ol);
			} else {
				cardtext.innerHTML = "No available songs:";
				cardbody.appendChild(cardtext);
			};
			
			card2.appendChild(cardbody);
			row.appendChild(card);		
		};
		cardholder.appendChild(row);
	};
	
	$scope.getRelatedArtists = function(label){
		let querystring = `
		PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
		PREFIX foaf: <http://xmlns.com/foaf/0.1/>
		PREFIX http: <http://www.w3.org/2011/http#>
		PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
		PREFIX wgs: <http://www.w3.org/2003/01/geo/wgs84_pos#>
		prefix mo: <http://purl.org/ontology/mo/>
		prefix dba: <http://dbtune.org/jamendo/artist/>
		prefix db:  <http://dbtune.org/musicbrainz/resource/> 
		PREFIX owl: <http://www.w3.org/2002/07/owl#>
		PREFIX ex: <http://example.org/kad2020/>
		PREFIX dbo: <http://dbpedia.org/ontology/>
		PREFIX rel: <http://purl.org/vocab/relationship/>

		SELECT ?labelDB ?associatedDB ?associatedlabel WHERE {
		SERVICE <http://dbpedia.org/sparql>{
			?artist rdf:type dbo:MusicalArtist;
					rdfs:label ?labelDB;
					^dbo:associatedMusicalArtist ?associatedDB. FILTER(STR(?labelDB)="` + String(label) + `")
					FILTER(lang(?labelDB)="en") .
			?associatedDB rdfs:label ?associatedlabel. FILTER(lang(?associatedlabel)="en")
			}
		}`;
		$scope.endpoint = "http://localhost:7200/repositories/final_project";
		$scope.query = encodeURI(querystring).replace(/#/g, '%23')
		$http( {
			method: "GET",
			url : $scope.endpoint + "?query=" + $scope.query,
			headers : {'Accept':'application/sparql-results+json', 'Content-Type':'application/sparql-results+json'}
		} )
		.success(function(data, status ) {
			let artist_uris = [];
			$scope.artist_labels = [];
			console.log(data);
			angular.forEach(data.results.bindings, function(val) {
				artist_uris.push(val.associatedDB.value);
				$scope.artist_labels.push(val.associatedlabel.value);
			});
			$scope.start2();

		})
		.error(function(error ){
			console.log('Error running the input query!'+error);
		});
		
	}; // end getRelatedArtists
	
	$scope.start();

}
