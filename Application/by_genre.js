angular.module('KRRclass', [ 'chart.js']).controller('MainCtrl', ['$scope','$http', mainCtrl]);


function mainCtrl($scope, $http){
	$scope.start = function(){
		let genre_uri = "ex:" + localStorage.getItem("sbs_genre");
		console.log(genre_uri);
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
prefix dbo:  <http://dbtune.org/musicbrainz/ontology/> 
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX ex: <http://example.org/kad2020/>

SELECT DISTINCT ?label ?artistlabel ?key ?image WHERE {
?artist rdf:type mo:MusicArtist;
		rdfs:label ?artistlabel .
?track foaf:maker ?artist;
       rdfs:label ?label;
       mo:genre ?genre;
	   mo:key ?key;
       ex:popularity ?popularity

        
     FILTER(?genre=` + genre_uri + `)
     FILTER(?popularity!=0)
     }
     
ORDER BY DESC(?popularity)
LIMIT 200`;
		
		$scope.endpoint = "http://localhost:7200/repositories/final_project";
		$scope.query = encodeURI(querystring).replace(/#/g, '%23')
		$http( {
			method: "GET",
			url : $scope.endpoint + "?query=" + $scope.query,
			headers : {'Accept':'application/sparql-results+json', 'Content-Type':'application/sparql-results+json'}
		} )
		.success(function(data, status ) {
			let track_labels = []
			let artist_labels = []
			let keys = []
			
			console.log(data);
			angular.forEach(data.results.bindings, function(val) {
				track_labels.push(val.label.value);
				artist_labels.push(val.artistlabel.value);
				keys.push(val.key.value);
			});
			$scope.populate(artist_labels, track_labels, keys);
		})
		.error(function(error ){
			console.log('Error running the input query!'+error);
		});
		
	};
	
	$scope.populate = function(artist_labels, track_labels, keys){
		let table = document.getElementById("table");
		for (let i = 0; i < artist_labels.length; i++){
			let tr = document.createElement("tr");
			let th = document.createElement("th");
			th.scope = "row";
			th.innerHTML = i + 1;
			let td1 = document.createElement("td");
			td1.innerHTML = track_labels[i];
			let td2 = document.createElement("td");
			td2.innerHTML = artist_labels[i];
			let td3 = document.createElement("td");
			td3.innerHTML = keys[i];
			tr.appendChild(th);
			tr.appendChild(td1);
			tr.appendChild(td2);
			tr.appendChild(td3);
			table.appendChild(tr);
			
		};
	};
	
	$scope.start();
}
