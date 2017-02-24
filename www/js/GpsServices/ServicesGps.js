
angular.module('starter.gps', [])

.factory('ServicesGps', function($q,$http,wepapi,$cordovaGeolocation,Session) {
	var Result = {};
  var objPosition;
	Result.getCurrentPosition = function(){
		var q = $q.defer();
    var posOptions = {timeout: 10000, enableHighAccuracy: false};
    $cordovaGeolocation
      .getCurrentPosition(posOptions)
      .then(function (position) {
        objPosition = {
          lat : position.coords.latitude,
          long : position.coords.longitude
        }
        q.resolve(objPosition);
      }, function(err) {
        objPosition = {
          lat : '0',
          long : '0'
        }
        q.resolve(objPosition)
    });

		return q.promise;

    }

  Result.saveSegTecn = function(co_acti,proc){    
    var url = wepapi + 'saveSegTec.php';
    Result.getCurrentPosition().then(function(result){
      var DataUsuario = Session.getSession();
      var co_usu = 1;
      if (DataUsuario != null) { co_usu = DataUsuario[0].co_tecn}
      var ho_movi = getDateHoy() + ' ' + getHora();
        // TRAEMOS INFORMACIÓN DEL DEVICE GUARDADOS EN LA SESION
      var devInformation = Session.getDevInformation();
        // TRAEMOS EL PORCENTAJE DE BATERIA
      var statusBattery = Session.getBatteryDevice();
      var params = {
        co_acti: co_acti,
        de_ubic_long: result.long,
        de_ubic_lati: result.lat,
        ho_movi: ho_movi,
        co_usua_regi: co_usu,
        no_proc_sist: proc,
        de_bate: statusBattery,
        de_celu_marc: devInformation.manufacturer,
        de_celu_mode: devInformation.model,
        co_celu_unic: devInformation.serial,
      }      
      $http.post(url,params,{
         headers : {
           'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
         }}).success(function(result){
            console.log(result)
         }).error(function(err){
            console.log(err)
      })
    })

  }
 
    
  return Result;
})
  // Might use a resource here thag