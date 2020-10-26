angular.module('KRRclass', [ 'chart.js']).controller('MainCtrl', ['$scope','$http', mainCtrl]);

$( "#artbutton").click(function() {
        console.log("hoi");
});

function mainCtrl($scope, $http){
	console.log("start");
	
	$scope.goArtistname = function(){
		localStorage.setItem("sbs_label", $scope.inputSong);
		window.location.href="related_artist.html";
	};
	
	$scope.goGenre = function(){
		localStorage.setItem("sbs_genre", $scope.inputSong);
		window.location.href="by_genre.html";
	};
	
	$scope.goSongname = function(){
		$scope.song_name = $scope.inputSong
		console.log($scope.song_name);
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
			SELECT ?artisturi ?label WHERE{
			?song_name rdfs:label "` + String($scope.song_name) + `" .
			?song_name foaf:maker ?artisturi.
			?artisturi rdf:type mo:MusicArtist.
			?artisturi rdfs:label ?label         
			}`;
		console.log(querystring);
		$scope.endpoint = "http://localhost:7200/repositories/final_project";
		$scope.query = encodeURI(querystring).replace(/#/g, '%23')
		$http( {
			method: "GET",
			url : $scope.endpoint + "?query=" + $scope.query,
			headers : {'Accept':'application/sparql-results+json', 'Content-Type':'application/sparql-results+json'}
		} )
		.success(function(data, status ) {
			$scope.artist_uris = [];
			$scope.artist_labels = [];
			console.log(data);
			angular.forEach(data.results.bindings, function(val) {
				$scope.artist_uris.push(val.artisturi.value);
				$scope.artist_labels.push(val.label.value);
			});
			console.log($scope.artist_uris);
			console.log($scope.artist_labels);
			localStorage.setItem("sbs_label", $scope.artist_labels[0]);
			//localStorage.setItem("sbs_uri", artist_uris[0]);
			$scope.generateButtons();
			window.location.href="related_artist.html";
		})
		.error(function(error ){
			console.log('Error running the input query!'+error);
		});
	}
	
	$scope.generateButtons = function(){
		let buttondiv = document.getElementById("artistbuttons");
		// remove children first
		while (buttondiv.firstChild) {
			buttondiv.removeChild(buttondiv.lastChild);
		}
		for (let i = 0; i < $scope.artist_labels.length; i++){
			let inputdiv = document.createElement("div");
			inputdiv.class = "input-group-append"
			let buttonel = document.createElement("button");
			buttonel.className = "btn";
			buttonel.className += " btn-success";
			buttonel.type = "button";
			buttonel.value = i;
			//buttonel.onclick = "selectArtist";
			buttonel.id = "artbutton";
			buttonel.innerHTML = $scope.artist_labels[i];
			inputdiv.appendChild(buttonel);
			buttondiv.appendChild(inputdiv);
			
		};
	}// end generateButtons
	
	
	
}

