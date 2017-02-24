angular.module('starter.actividades', [])

.factory('ActividadesServices', function($q,$http,wepapi) {

	var Result = {};
  var ItemActividad;

	Result.getActividades = function(params){
		var q = $q.defer();
		var url = wepapi + 'listaActividades.php';
    $http.post(url,params,{
              headers : {
                'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
            }}).success(function(result){
            	q.resolve(result)
            }).error(function(err){
            	q.reject(err)
            })
		return q.promise;
	}

  Result.saveInicioActividad = function(params){
    var q = $q.defer();
    var url = wepapi + 'saveInicioActividad.php';
    $http.post(url,params,{
      headers : {
        'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
      }
    }).success(function(result){
      q.resolve(result)
    }).error(function(err){
      q.reject(err)
    })
    return q.promise;
  }
  Result.saveFinalizaActividad = function(params){
    var q = $q.defer();
    var url = wepapi + 'saveFinalizaActividad.php';
    $http.post(url,params,{
      headers : {
        'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
      }
    }).success(function(result){
      q.resolve(result)
    }).error(function(err){
      q.reject(err)
    })
    return q.promise;
  }

  Result.saveItemActividad = function(item){
    ItemActividad = item;
  }
  Result.getItemActividad = function(){
    return ItemActividad;
  }
	return Result;
})