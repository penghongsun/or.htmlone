var globalVar = {};
;(function () {
	globalVar.aa = 1;
	var ind = 0;
	function say () {
		console.log(globalVar.aa + ind);
	}
	say();
})();