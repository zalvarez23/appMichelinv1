angular.module('starter.tareas', [])

.factory('TareasServices', function($q,$http,wepapi,Chats,$cordovaCamera,$cordovaFileTransfer) {

	var Result = {};
  var ItemActividad;
  

	Result.getTareas = function(params){
		var q = $q.defer();
		var url = wepapi + 'listaTareas.php';
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
  Result.getHerramientas = function(params){
    var q = $q.defer();
    var url = wepapi + 'listHerramientas.php';

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
  Result.getMateriales = function(params){
    var q = $q.defer();
    var url = wepapi + 'listaMateriales.php';
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
  Result.getEquipos = function(params){
    var q = $q.defer();
    var url = wepapi + 'listaEquipos.php';
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
  // FUNCIONES QUE AGREGARAN REGISTROS

  Result.saveComentTarea = function(params){    
    var q = $q.defer();
    var url = wepapi + 'saveComentTareas.php';
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

  Result.savePhoto = function(params){
    var q = $q.defer();
    var url = wepapi + 'savePhoto.php';
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


  Result.getFotos = function(params){
    var q = $q.defer();
    var url = wepapi + 'listPhotos.php';
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
  Result.updateFotos = function(params){
    var q = $q.defer();
    var url = wepapi + 'updatePhoto.php';
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
  Result.uploadPhoto = function(params,cant){
     var q = $q.defer();
     var server;
     var filePath;
     var config=Chats.allConfig()
     if (config[0].checked == false) {
       params.tip_foto = "C";
       var options= {
         quality: 100,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        allowEdit: true,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 250,
        targetHeight: 324,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false
       }        
     }else{
        params.tip_foto = "G";
        var options= {
        quality: 100,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        allowEdit: true,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 250,
        targetHeight: 324,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false
       }
     };

    $cordovaCamera.getPicture(options).then(function(imageData){
     // LLENAMOS AL OBJETO CON UN PUSH POR CADA FOTO QUE ESCOGAMOS COMO MAXIMO 4 REGISTROS   
    var codTareaR = localStorage.getItem("idTareaStore");  
     var listPhotos = {
         id: cant,
         codTarea : codTareaR,
         noFoto : codTareaR + '_' + 'Foto_' + cant + '.jpg',
         src: "data:image/jpeg;base64," + imageData,
         tipofoto: params.tip_foto,
         comentario: params.comentario,
         no_marc: params.no_marc,
         nu_ip: params.nu_ip,
         ms_red: params.ms_red,
         no_mode: params.no_mode,
         pu_enla: params.pu_enla,
         st_tran: params.st_tran,
         nu_seri: params.nu_seri,
         st_grab: params.st_grab,
         no_mac: params.no_mac,
         o_desc: params.no_desc,
         no_reco: params.no_reco
         }
      
      params.no_foto = 'http://vmwaresis.com.pe/movil/img/' + codTareaR + '_' + 'Foto_' + cant + '.jpg'
      server = "http://vmwaresis.com.pe/movil/uploader.php";
      filePath =  "data:image/jpeg;base64," +imageData;
      var options = {
                fileKey: "file",
                fileName: codTareaR + '_' + 'Foto_' + cant + '.jpg',
                chunkedMode: false,
                mimeType: "image/jpg"
      };  
        Result.fileTranferFoto(server,filePath,options,params).then(function(){
          q.resolve(listPhotos);  
        });
        
    }, function(error){
      q.reject(error)

    });
    return q.promise;
  }

  Result.fileTranferFoto = function(server,filePath,options,params){
    var q = $q.defer();
    $cordovaFileTransfer.upload(server, filePath, options).then(function(result) {
        Result.savePhoto(params).then(function(result){
          q.resolve('success')
        })        
      }, function(err) {
         q.reject(err)
        })
    return q.promise;
  }

  Result.saveComentHerramienta = function(params){
    var q = $q.defer();
    var url = wepapi + 'saveComentHerramienta.php';
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

  Result.saveComentMateriales = function(params){

    var q = $q.defer();
    var url = wepapi + 'saveComentMaterial.php';
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

  Result.saveComentEquipo = function(params){    
    var q = $q.defer();
    var url = wepapi + 'saveComentEquipo.php';
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

  Result.saveInformeActividad = function(params){    
    var q = $q.defer();
    var url = wepapi + 'saveInformeActividad.php';
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

  Result.listaInformeActividad = function(params){    
    var q = $q.defer();
    var url = wepapi + 'listaInformes.php';
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

  Result.listaVistoBuenoActividad = function(params){    
    var q = $q.defer();
    var url = wepapi + 'listaVistoBuenoActividad.php';
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

  Result.listaTecnicosxActividad = function(params){    
    var q = $q.defer();
    var url = wepapi + 'getTecnicosxActividad.php';
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

  Result.saveVistoBuenoActividad = function(params){
    
    var q = $q.defer();
    var url = wepapi + 'saveVistoBuenoActividad.php';
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

  Result.uploadPhotoVistoBueno = function(params,cant){
    
     var q = $q.defer();
     var server;
     var filePath;
     var options= {
       quality: 100,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.CAMERA,
      allowEdit: true,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 250,
      targetHeight: 324,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false
    }
    $cordovaCamera.getPicture(options).then(function(imageData){
     // LLENAMOS AL OBJETO CON UN PUSH POR CADA FOTO QUE ESCOGAMOS COMO MAXIMO 4 REGISTROS   
     var noFoto = params.co_acti + '_' + 'Firma_' + cant + '.jpg';
     var objVistoBueno = {
         id: cant,         
         noFoto : noFoto,
         src: "data:image/jpeg;base64," + imageData,
         nombre: params.nom_clie,
         cargo : params.nom_cargo
     }     
      params.nom_firma = params.co_acti + '_Firma_' + cant; 
      params.nom_foto = 'http://vmwaresis.com.pe/movil/img/' + noFoto;
      server = "http://vmwaresis.com.pe/movil/uploader.php";
      filePath =  "data:image/jpeg;base64," +imageData;
      var options = {
                fileKey: "file",
                fileName: noFoto,
                chunkedMode: false,
                mimeType: "image/jpg"
      };
        Result.fileTranferFirma(server,filePath,options,params).then(function(){
          q.resolve(objVistoBueno);       
        });        
    }, function(error){
      q.reject(error)

    });
    return q.promise;
  }
  Result.fileTranferFirma = function(server,filePath,options,params){
    var q = $q.defer();
    $cordovaFileTransfer.upload(server, filePath, options).then(function(result) {
        Result.saveVistoBuenoActividad(params).then(function(result){
          q.resolve('success')
        })
        
      }, function(err) {
         q.reject(err)
        })

    return q.promise;
  }
	return Result;
})