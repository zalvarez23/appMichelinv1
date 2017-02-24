angular.module('starter.session', [])

.factory('Session', function($q,$http,wepapi) {

	var Result = {};
  var deviceInformation;
  var dataSession;
  var battery;
	Result.IniciarSession = function(params){
		var q = $q.defer();
		var url = wepapi + 'inicioSesion.php';
     	$http.post(url, params,{
              headers : {
                'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
            }}).success(function(result){
            	q.resolve(result)
            }).error(function(err){
            	q.reject(err)
            })
		return q.promise;	}


  Result.saveSession = function(item){
    dataSession = item;
  }
  Result.getSession = function(){
    return dataSession;
  }
  Result.saveDevInformation = function(values){
    deviceInformation = values;
  }
  Result.getDevInformation = function(){
    return deviceInformation;
  }
  Result.saveBatteryDevice = function(values){
    battery = values;
    
  }
  Result.getBatteryDevice = function(){
    return battery;
  }

  return Result;
})
  // Might use a resource here thag