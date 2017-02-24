var meses = new Array ("Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre");
function getDateHoy(){
  var hoy = new Date();
var dd = hoy.getDate();
var mm = hoy.getMonth()+1; //hoy es 0!
var yyyy = hoy.getFullYear();
if(dd<10) {
    dd='0'+dd
} 

if(mm<10) {
    mm='0'+mm
} 
  hoy = yyyy+'-'+mm+'-'+dd;
  return hoy;
}
function getHora(){
  var f=new Date();
  var hora=f.getHours()+":"+f.getMinutes()+":"+f.getSeconds(); 
  return hora;
}
angular.module('starter.controllers', [])

.controller('ctrlInicial', function($scope,$rootScope,$ionicPlatform,$cordovaBatteryStatus,Session){
 
    $ionicPlatform.ready(function() {

        $rootScope.$on("$cordovaBatteryStatus:status", function(event, args) {
            if(args.isPlugged) {
              
              Session.saveBatteryDevice(args.level)                
            } else {
                
                Session.saveBatteryDevice(args.level)          
            }
        });
    });
})

.controller('loginCtrl',function($scope,$ionicPopup,$location,$timeout,Session,ServicesGps,$cordovaDevice){
  $scope.params = {
    usu : '',
    pass : ''
  }
 /* $scope.params = {
    usu : 'VM-P001VM',
    pass : 'vmw2016Mant'
  } */
  $scope.showConfirm = function(item,indexActi) {
   var confirmPopup = $ionicPopup.alert({
     title: '<p clasS="textStyle1">Ocurrio un error !</p>',
     template: '<p class="textStyle2">Usuario y/o Contraseña Invalidos</p>'
               
   });
   }
    $scope.iniciarSesion = function(){
    $scope.showLoader = true;
    var p = $scope.params;

    Session.IniciarSession(p).then(function(result){
    
      if (result[0] == "ERROR") {
        $scope.showConfirm();
        $scope.showLoader = false;  
        return;
      }
  
      $timeout(function() {
        Session.saveSession(result);
        ServicesGps.saveSegTecn(0,'login');
        $location.path('tab/inicio');
        $scope.showLoader = false;  
      }, 1000);
    },function(err){
      $scope.showLoader=false;
      console.log(err)
    })

  }
  document.addEventListener("deviceready",function(){
    var device = $cordovaDevice.getDevice();
    Session.saveDevInformation(device);
  })

})
.controller('InicioCtrl', function($scope,ServicesGps,$ionicActionSheet,$ionicPopup,$timeout,$location,ActividadesServices,Session) {
  // CAPTURAMOS NOMBRE DEL USUARIO LOGEADO  
 
  var DataUsuario = Session.getSession();
  if (DataUsuario != null) {
    $scope.nombresUsuario = DataUsuario[0].no_tecn + ' ' + DataUsuario[0].no_apel_pate
  }
  //
  var fechaini = document.getElementById('txtfechainiL');
  var fechafin = document.getElementById('txtfechafinL');
  var fechaInicial = getDateHoy();
  fechaInicial = fechaInicial.split('-')
  fechaInicial = fechaInicial[0] + '-'+ fechaInicial[1] + '-' + '01'
  fechaini.value = getDateHoy();
  fechafin.value = getDateHoy();

  $scope.getListaActividades = function(){
 
    $scope.showLoadActividad = true;
      var co_usu = 1;
  if (DataUsuario != null) { co_usu = DataUsuario[0].co_tecn}
    var params = {
      condicion : '1',
      co_tecn : co_usu,
      fe_ini : fechaini.value,
      fe_fin : fechafin.value
    };    
    ActividadesServices.getActividades(params).then(function(result){
      $scope.listActividades = [];
      if (result[0] == "ERROR") {  $scope.showLoadActividad = false;return;};
      
      angular.forEach(result,function(item,index){

        var fecha = item.fe_acti_inic.split('-')
        
        fecha = fecha[2] + ' ' + meses[parseInt(fecha[1]-1)]

        $scope.listActividades.push({
          co_acti : item.co_acti,
          fe_acti_fina: item.fe_acti_fina,
          fe_acti_inic: fecha,
          fe_max: item.fe_max,
          ho_ingr_refe: item.ho_ingr_refe,
          ho_sali_refe: item.ho_sali_refe,
          no_desc_loca: item.no_desc_loca,
          no_dire_loca: item.no_dire_loca,
          nu_minu_refe: item.nu_minu_refe,
          co_usua_inic_acti: item.co_usua_inic_acti,
          ho_inic_apli : item.ho_inic_apli,
          co_usua_fina_acti : item.co_usua_fina_acti,
          ho_fina_apli : item.ho_fina_apli,
          st_acti : item.st_acti,
          status : item.status
        })
        $scope.showLoadActividad = false;
      })      
    },function(err){
      console.log(err)
    })
  }


  $scope.getClass = function(estado,status){
    if (status == 0) {
      return 'list card cardKevin colorCard3'; 
    };
    if (estado == 1) {
      return 'list card cardKevin';
    }else if(estado == 2){
      return 'list card cardKevin colorCard2';
    };
    
  }
   $scope.showOptions = function(item,indexActi){
    var textActividad;
    if (item.st_acti == 1) {
      textActividad = "Iniciar Actividad";
    
    }else{
      textActividad = "Continuar con Actividad"
    }
    var buttonsA = "";
    if (item.status == 0) {
        buttonsA = [                  
         { text: 'Ver Actividad' }
       ]
     }else{
      buttonsA = [
         { text: '<b>' + textActividad + '</b>' },
         { text: 'Ver Actividad' }
       ]
     };
     var hideSheet = $ionicActionSheet.show({
 
       buttons: buttonsA,
       titleText: 'Seleccione una opción',
       cancelText: 'Cancelar',
       cancel: function() {
            // add cancel code..
          },
       buttonClicked: function(index,obj) {
        if (obj.text != 'Ver Actividad') {
          hideSheet();
          if (item.st_acti == 1) {
            $scope.showConfirm(item,indexActi);
          }else{
            hideSheet();
            $scope.goToProgramacion(item,1);            
           ServicesGps.saveSegTecn(item.co_acti,'continuar actividad');
          }     
        }else{
          ServicesGps.saveSegTecn(item.co_acti,'ver actividad');
          hideSheet();
          $scope.goToProgramacion(item,0);
        }

       }
     });
     // For example's sake, hide the sheet after two seconds
     $timeout(function() {
       hideSheet();
     }, 3000);

   };

  $scope.goToProgramacion = function(item,con){
    ActividadesServices.saveItemActividad(item);    
    $location.path('tab/tareas/' + item.co_acti + '|' + con)
  }
  $scope.showConfirm = function(item,indexActi) {
   var confirmPopup = $ionicPopup.confirm({
     title: '<p clasS="textStyle1">Confirmación</p>',
     template: '<p class="textStyle2">Esta apunto de iniciar la Actividad #' + item.co_acti + ', Desea continuar? </p>'
               
   });

   confirmPopup.then(function(res) {
     if(res) {
      $scope.listActividades[indexActi].st_acti = 2;
      $scope.saveInicioActividad(item);      
      ServicesGps.saveSegTecn(item.co_acti,'inicio actividad');
      // 
     } else {
       console.log('You are not sure');
     }
   });
 };

 $scope.saveInicioActividad = function(item){
  ServicesGps.getCurrentPosition().then(function(result){
    var ubi = result.lat + '|' + result.long
    var co_usu = 1;
    if (DataUsuario != null) { co_usu = DataUsuario[0].co_tecn}
    var params = {
      co_usua : co_usu,
      ubicacion : ubi,
      co_acti : item.co_acti,
      estado : 2
    }
    ActividadesServices.saveInicioActividad(params).then(function(result){
        $scope.goToProgramacion(item,1);  
    },function(err){
      console.log(err)
    })
  })

 }

})

.controller('InicioTareasCtrl', function($scope,$location,Chats ,ServicesGps,$ionicScrollDelegate,$ionicSlideBoxDelegate ,$stateParams,$ionicPopup,Session,ActividadesServices,TareasServices,$ionicActionSheet,$timeout,$ionicModal) {
  // CAPTURAMOS LOS DATOS DE LA SESSION
    var DataUsuario = Session.getSession();    
  // CAPTURAMOS LA OFICINA Y DIRECCIÓN DEL ITEM SELECCIONADO

    var itemActividad = ActividadesServices.getItemActividad();
    
    if (itemActividad != null) {
      $scope.direccionItem = {
        oficina : itemActividad.no_desc_loca,
        direccion : itemActividad.no_dire_loca
      }
      if (itemActividad.st_acti == 2) {
        // INICIO ACTIVIDAD
        var horaInicActividad;
        if (itemActividad.ho_inic_apli.length == 0) {
          var f=new Date();
          horaInicActividad=f.getHours()+":"+f.getMinutes()+":"+f.getSeconds(); 
          
        }else{
          horaInicActividad = itemActividad.ho_inic_apli.split(' ')
          horaInicActividad = horaInicActividad[1];
        }
        var hora = tConvert(horaInicActividad);
        $scope.textInicioActividad = "actividad iniciada a las " + hora;
      }
    }
    
  //
  // CAPTURAMOS ID DE ACTIVIDAD QUE ES ENVIADO COMO PARAMETROS
  var params = $stateParams.idActividad.split('|');
  var idActividad = params[0]
  // ESTE FLAG ES EL PERMISO NECESARIO PARA PODER REALIZAR ALGUN TIPO DE REGISTROS
    // EN LAS TAREAS , SI ES 0  NO TIENE PERMISOS , SI ES 1 SI LOS TIENE.
  var flagRegistrar = params[1]
  
  if (flagRegistrar == 1) {
    $scope.registerTareas = true;
  }else{
    $scope.registerTareas = false;
  };
  console.log($scope.registerTareas)
  var params = {
      co_act : idActividad
  }
  
  // TRAEMOS A LAS TAREAS DE LA ACTIVIDAD SELECCIONADA Y SUS RESPECTIVOS ITEMS
  $scope.getAllItemsActividades = function(){    
    $scope.getTareas();
    $scope.getHerramientas();  
    $scope.getMateriales();
    $scope.getEquipos();
    $scope.listaInforme();
    $scope.listaVistoBuenoActividad();
    $scope.listaTecnicosxActividad();
  }
  $scope.getTareas = function(){
  
    TareasServices.getTareas(params).then(function(result){
      $scope.listTareas = result;
      
    },function(err){
      console.log(err)
    })  
  }
  $scope.getHerramientas = function(){
    TareasServices.getHerramientas(params).then(function(result){
       if (result[0] == "ERROR") { return;};
      $scope.listHerramientas = result;      
    },function(err){
      console.log(err)
    })  
  }
  $scope.getMateriales = function(){
    TareasServices.getMateriales(params).then(function(result){
       if (result[0] == "ERROR") { return;};
      $scope.listMateriales = result;            
    },function(err){
      console.log(err)
    })  
  }
  $scope.getEquipos = function(){
    TareasServices.getEquipos(params).then(function(result){
       if (result[0] == "ERROR") { return;};
      $scope.listEquipos = result;        
    },function(err){
      console.log(err)
    })  
  }
  $scope.getPhotos = function(){
    var params = {
      co_tare : ItemTareaSelect.co_tare
    }
    console.log(params)
    TareasServices.getFotos(params).then(function(result){
      $scope.listFotos = [];
      if (result[0] == "ERROR") { return;};
      
      angular.forEach(result,function(item,index){        
        $scope.listFotos.push({
          id: item.co_foto_tare,
          codTarea : item.co_tare,
          noFoto : item.no_foto.split('/')[5],
          src : item.no_foto,
          tipofoto: item.ti_foto_sube,
          comentario : item.de_come_foto,
          no_marc: item.no_marc,
          nu_ip: item.nu_ip,
          ms_red: item.ms_red,
          no_mode: item.no_mode,
          pu_enla: item.pu_enla,
          st_tran: item.st_tran,
          nu_seri: item.nu_seri,
          st_grab: item.st_grab,
          no_mac: item.no_mac,
          no_desc: item.no_desc,
          no_reco: item.no_reco
        })
      })      
    })
  }
  $scope.zoomMin = 1;
  $scope.showImages = function(index) {

    $scope.activeSlide = index;
    $scope.showModal('templates/ZoomImage/adm-galleryzoom.html');
  };
     $scope.showImagesVisto = function(index) {

    $scope.activeSlide = index;
    $scope.showModal('templates/ZoomImage/adm-galleryzoomFirma.html');
  };   
  $scope.showModal = function(templateUrl) {
    $ionicModal.fromTemplateUrl(templateUrl, {
      scope: $scope
    }).then(function(modal) {
      $scope.modalImage = modal;
      $scope.modalImage.show();
    });
  }
   
  $scope.closeModalImage = function() {
    $scope.modalImage.hide();
    $scope.modalImage.remove()
  };
   
  $scope.updateSlideStatus = function(slide) {
    var zoomFactor = $ionicScrollDelegate.$getByHandle('scrollHandle' + slide).getScrollPosition().zoom;
    if (zoomFactor == $scope.zoomMin) {
      $ionicSlideBoxDelegate.enableSlide(true);
    } else {
      $ionicSlideBoxDelegate.enableSlide(false);
    }
  };
  var ItemTareaSelect;
  $scope.showConditions = function(item) {
     // Show the action sheet

     ItemTareaSelect = item;
     // CAPTURAMOS EL Co_AREA
     localStorage.setItem("idTareaStore", ItemTareaSelect.co_tare);
     //

     var hideSheet = $ionicActionSheet.show({
       buttons: [
         { text: '<b>Comentarios</b>' },
         { text: 'Toma de Fotos' }
       ],
       titleText: 'Seleccione una opción',
       cancelText: 'Cancelar',
       cancel: function() {
            // add cancel code..
          },
       buttonClicked: function(index) {
        if (index == 0) {
          $scope.titleModal = "Comentarios";
          $scope.titleBodyModal = "Reporte de Tarea";
          $scope.showComentarios = true;
          $scope.showFotos = false;
          if (item.ti_tare == 1) {
            $scope.showClave = true;
          }else{
            $scope.showClave = false;            
          }
          // MOSTRAMOS DATOS DE COMENTS
          $scope.getComents(ItemTareaSelect);
        }else{
          $scope.titleModal = "Toma de Fotos";
          $scope.titleBodyModal = "Fotos de la Tarea";
          $scope.showFotos = true;
          $scope.showComentarios = false;
          
          $scope.getPhotos();
        }
        $scope.openModal();
         return true;
       }
     });

     // For example's sake, hide the sheet after two seconds
     $timeout(function() {
       hideSheet();
     }, 3000);

   };
   $scope.showSaveFoto = true;  
   $scope.showUpdateFoto = false;
  $scope.updateDataFoto = function(){
    angular.forEach($scope.listFotos,function(item,index){
  
      if (index == $scope.parametersFoto.id) {  
        var paramsEnvio = {
          codTarea : item.codTarea,
          src : item.src,
          comentario : $scope.parametersFoto.comentario, 
          no_marc : $scope.parametersFoto.no_marc,
          nu_ip : $scope.parametersFoto.nu_ip,
          ms_red : $scope.parametersFoto.ms_red,
          no_mode : $scope.parametersFoto.no_mode,
          pu_enla : $scope.parametersFoto.pu_enla,
          st_tran : $scope.parametersFoto.st_tran,
          nu_seri : $scope.parametersFoto.nu_seri,
          st_grab : $scope.parametersFoto.st_grab,
          no_mac : $scope.parametersFoto.no_mac,
          no_desc : $scope.parametersFoto.no_desc,
          no_reco : $scope.parametersFoto.no_reco
        }
        TareasServices.updateFotos(paramsEnvio).then(function(result){ 
          ServicesGps.saveSegTecn(idActividad,'update foto');    
        });
        item.comentario = $scope.parametersFoto.comentario;
        item.no_marc = $scope.parametersFoto.no_marc;
        item.nu_ip = $scope.parametersFoto.nu_ip;
        item.ms_red = $scope.parametersFoto.ms_red;
        item.no_mode = $scope.parametersFoto.no_mode;
        item.pu_enla =$scope.parametersFoto.pu_enla;
        item.st_tran = $scope.parametersFoto.st_tran;
        item.nu_seri = $scope.parametersFoto.nu_seri;
        item.st_grab = $scope.parametersFoto.st_grab;
        item.no_mac = $scope.parametersFoto.no_mac;
        item.no_desc = $scope.parametersFoto.no_desc;
        item.no_reco = $scope.parametersFoto.no_reco;  
      };
    })
    $scope.showSaveFoto = true;  
    $scope.showUpdateFoto = false;
     $scope.parametersFoto = {  
        codTarea : '',
        src : '',  
        id : '',
        no_marc: '',
        nu_ip: '',
        ms_red: '',
        no_mode: '',
        pu_enla: '',
        st_tran: '',
        nu_seri: '',
        st_grab: '',
        no_mac: '',
        no_desc: '',
        no_reco: '',
        comentario : ''
     }
    $scope.showAlert('Datos Actualizados!','Actualización de datos realizado correctamente !')
  }
  $scope.showConditionsFoto = function(indexI,item) {
     // Show the action sheet
     ItemTareaSelect = item;
     var hideSheet = $ionicActionSheet.show({
       buttons: [
         { text: '<b>Editar</b>' },
         { text: 'Ver Foto' }
       ],
       titleText: 'Seleccione una opción',
       cancelText: 'Cancelar',
       cancel: function() {
            // add cancel code..
          },
       buttonClicked: function(index) {

        if (index == 0) {
          $scope.showUpdateFoto = true;   
          $scope.showSaveFoto = false;       
          LlenarDatosFoto(item,indexI);
        }else{
          $scope.showSaveFoto = true;
          $scope.showUpdateFoto = false;
          $scope.showImages(indexI)
        }    
         return true;
       }
     });

     // For example's sake, hide the sheet after two seconds
     $timeout(function() {
       hideSheet();
     }, 3000);

   };
   function LlenarDatosFoto(item,index){
      $scope.parametersFoto.id = index;
      $scope.parametersFoto.src = item.src;
      $scope.parametersFoto.codTarea = item.codTarea;
      $scope.parametersFoto.comentario = item.comentario;
      $scope.parametersFoto.no_marc = item.no_marc;
      $scope.parametersFoto.nu_ip = item.nu_ip;
      $scope.parametersFoto.ms_red = item.ms_red;
      $scope.parametersFoto.no_mode = item.no_mode;
      $scope.parametersFoto.pu_enla =item.pu_enla;
      $scope.parametersFoto.st_tran = item.st_tran;
      $scope.parametersFoto.nu_seri = item.nu_seri;
      $scope.parametersFoto.st_grab = item.st_grab;
      $scope.parametersFoto.no_mac = item.no_mac;
      $scope.parametersFoto.no_desc = item.no_desc;
      $scope.parametersFoto.no_reco = item.no_reco;  
   }
   $ionicModal.fromTemplateUrl('my-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
   }).then(function(modal) {
    $scope.modal = modal;
   });
  $scope.openModal = function() {
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  $scope.slideHasChanged = function(index){
    console.log(index)
  }

  // FUNCION APRA REGISTRAR COMENTARIOS Y CLAVES
  $scope.parametrosComent = {
    comentario : '',
    usuario : '',
    clave : ''
  }
  $scope.listComents = [];
  $scope.getComents = function(item){
    $scope.listComents = [];
    if (item.no_usua_0001 !="") {
      $scope.listComents.push({
        comentario : item.de_come_tecn,
        cod_usu : item.co_usua_come,
        no_usu : item.no_usua_0001,
        no_clav : item.no_clav_0001,
        co_tarea : item.co_tare,
        cond : 1
      })      
    }
    if (item.no_usua_0002 !="") {
      $scope.listComents.push({
        comentario : item.de_come_tecn,
        cod_usu : item.co_usua_come,
        no_usu : item.no_usua_0002,
        no_clav : item.no_clav_0002,
        co_tarea : item.co_tare,
        cond : 2
      })     
    }

  }
  var updateComent = false;
  var conAux;
  var itemAux;
  $scope.saveComent = function(){
    var condicion;
    if ($scope.listComents.length == 0) {
        condicion = 1;
      }
    else if($scope.listComents.length ==1){
        condicion = 2;
    }else if($scope.listComents.length ==2){
        condicion = conAux;
    }

    if (!updateComent) {
      if($scope.listComents.length > 1){
        $scope.showAlert('Ocurrio un error !','No puede registrar mas de dos item , pero puede modificarlos al realizar una selección')        
        return;
      }
    };
    $scope.loadSaveComent = true;
    var co_tecn=1;
    if (DataUsuario !=null) { co_tecn = DataUsuario[0].co_tecn }
    var params = {
      comentario : $scope.parametrosComent.comentario,
      cod_usu : co_tecn,
      no_usu : $scope.parametrosComent.usuario,
      no_clav : $scope.parametrosComent.clave,
      co_tarea : ItemTareaSelect.co_tare,
      cond : condicion
    };
    TareasServices.saveComentTarea(params).then(function(result){   
      if (!updateComent) {
        ServicesGps.saveSegTecn(idActividad,'insert comentario');  
        
        $scope.listComents.push(params)
      }else{
        ServicesGps.saveSegTecn(idActividad,'update comentario');  
        angular.forEach($scope.listComents,function(item,index){
          if (item.co_tare == params.co_tare) {
            if (item.cond == params.cond) {              
              item.comentario = params.comentario;
              item.cod_usu = params.cod_usu;
              item.no_usu = params.no_usu;
              item.no_clav = params.no_clav
            }
          }
        })
      }      
      $scope.parametrosComent = [];
      $scope.loadSaveComent = false;
      updateComent = false;
      // CAMBIAMOS VALORES DE DATA YA TRAIDA $scope.listTareas
      for (var i = 0; i < $scope.listTareas.length; i++) {
        if ($scope.listTareas[i].co_tare == params.co_tarea) {
          if (params.cond == 1) {
            $scope.listTareas[i].de_come_tecn = params.comentario;
            $scope.listTareas[i].co_usua_come = params.cod_usu;
            $scope.listTareas[i].no_usua_0001 = params.no_usu;
            $scope.listTareas[i].no_clav_0001 = params.no_clav;
          }else{
            $scope.listTareas[i].de_come_tecn = params.comentario;
            $scope.listTareas[i].co_usua_come = params.cod_usu;
            $scope.listTareas[i].no_usua_0002 = params.no_usu;
            $scope.listTareas[i].no_clav_0002 = params.no_clav;
          }

        }
      }
    })
  }
  // LIMPIAMOS FOTOS
  

  $scope.updateComent = function(item,index){
    updateComent = true;
    conAux = index + 1;
    itemAux = item;
    $scope.parametrosComent = {
      comentario : item.comentario,
      usuario : item.no_usu,
      clave : item.no_clav
    }
  }
  $scope.showAlert = function(title , body) {
   var alertPopup = $ionicPopup.alert({
     title: '<p class="textStyle1">' +  title + '</p>',
     template: '<p class="textStyle2" style="text-align: justify;">' +  body + '</p>'
   });

   alertPopup.then(function(res) {
    
   });
 };
 $scope.parametersFoto = {  
    codTarea : '',
    src : '',  
    id : '',
    no_marc: '',
    nu_ip: '',
    ms_red: '',
    no_mode: '',
    pu_enla: '',
    st_tran: '',
    nu_seri: '',
    st_grab: '',
    no_mac: '',
    no_desc: '',
    no_reco: '',
    comentario : ''
 }
 $scope.listFotos = [];
 $scope.savePhoto = function(){  
  ServicesGps.getCurrentPosition().then(function(result){
    var codTareaR = localStorage.getItem("idTareaStore");
    params = {
      codTarea : codTareaR,
      no_foto : '',
      comentario : $scope.parametersFoto.comentario,
      tip_foto : 'C',
      lat: result.lat,
      long: result.long ,
      no_marc: $scope.parametersFoto.no_marc,
      nu_ip: $scope.parametersFoto.nu_ip,
      ms_red: $scope.parametersFoto.ms_red,
      no_mode:$scope.parametersFoto.no_mode,
      pu_enla: $scope.parametersFoto.pu_enla,
      st_tran: $scope.parametersFoto.st_tran,
      nu_seri: $scope.parametersFoto.nu_seri,
      st_grab: $scope.parametersFoto.st_grab,
      no_mac: $scope.parametersFoto.no_mac,
      no_desc: $scope.parametersFoto.no_desc,
      no_reco: $scope.parametersFoto.no_reco
    }
    var cant = $scope.listFotos.length;
    TareasServices.uploadPhoto(params,cant).then(function(result){
    
          $scope.listFotos.push({
            id: result.id,
            codTarea : codTareaR,
            noFoto : result.noFoto,
            src : result.src,
            tipofoto: result.tipofoto,
            comentario : result.comentario,
            no_marc: result.no_marc,
            nu_ip: result.nu_ip,
            ms_red: result.ms_red,
            no_mode: result.no_mode,
            pu_enla: result.pu_enla,
            st_tran: result.st_tran,
            nu_seri: result.nu_seri,
            st_grab: result.st_grab,
            no_mac: result.no_mac,
            no_desc: result.no_desc,
            no_reco: result.no_reco
          })          
           $scope.parametersFoto = {    
            no_marc: '',
            nu_ip: '',
            ms_red: '',
            no_mode: '',
            pu_enla: '',
            st_tran: '',
            nu_seri: '',
            st_grab: '',
            no_mac: '',
            no_desc: '',
            no_reco: '',
            comentario : ''
         }
            ServicesGps.saveSegTecn(idActividad,'tomo foto');  
    })
  })
 }
 // FUNCIONES PARA HERRAMIENTAS 
 $scope.dato = {comentarioHerr : ""};
 $scope.showComentHerramienta = function(item){
  $scope.dato.comentarioHerr = item.de_come_tecn;
   var dis;
  if ($scope.registerTareas) {
    dis = false;
  }else{
    dis = true;
  };
   var confirmPopup = $ionicPopup.confirm({
     title: '<p clasS="textStyle1">Comentario de Herramienta</p>',
     template: '<textarea ng-disabled="'+ dis +'" ng-model="dato.comentarioHerr" class="textStyle3" style="height: 153px;"type="text" placeholder=".." >hola</textarea>',
     scope: $scope
   });

   confirmPopup.then(function(res) {
     if(res) {
      var co_tecn=1;
       if (DataUsuario !=null) { co_tecn = DataUsuario[0].co_tecn }
        var params = {
        co_herr_acti : item.co_herr_acti,
        comentario : $scope.dato.comentarioHerr,
        co_usua : co_tecn
       }
      angular.forEach($scope.listHerramientas,function(itemh,index){
        if (itemh.co_herr_acti == item.co_herr_acti) {
          ServicesGps.saveSegTecn(idActividad,'update comentario herr');  
          itemh.de_come_tecn = params.comentario;
        }
      })
      TareasServices.saveComentHerramienta(params).then(function(result){
        console.log(result)
      })
     } else {
       console.log('You are not sure');
     }
   });
 }
 //
 $scope.datoMat = {co_mate_acti : '',nu_cant : '' , observacion : '', co_usua : ''}
 $scope.showComentMaterial = function(item){
  $scope.datoMat.co_mate_acti = item.co_mate_acti;
  $scope.datoMat.observacion = item.de_obse;
  $scope.datoMat.nu_cant = item.nu_cant_usud
   var dis;
  if ($scope.registerTareas) {
    dis = false;
  }else{
    dis = true;
  };
   var confirmPopup = $ionicPopup.confirm({
     title: '<p clasS="textStyle1">Observación del Material</p>',
     template: '<textarea ng-disabled="' + dis + '" ng-model="datoMat.observacion" class="textStyle3" style="height: 153px;"type="text" placeholder="Ingresar una observación.." ></textarea>' +
               '<div class="list"> '+
                '<label class="item item-input item-stacked-label">'+
                '<span class="input-label textStyle2" style="white-space: inherit !important">Cantidad Utilizada</span>'+
                 '<input class="textStyle3" type="tel" ng-model="datoMat.nu_cant" placeholder="Cantidad . .">'+
                '</label>'+
              '</div>',
     scope: $scope
   });

   confirmPopup.then(function(res){
    if (res) {
      var co_tecn=1;
      if (DataUsuario !=null) { co_tecn = DataUsuario[0].co_tecn }
      $scope.datoMat.co_usua = co_tecn;
      angular.forEach($scope.listMateriales,function(itemh,index){
        if (itemh.co_mate_acti == item.co_mate_acti) {
          itemh.de_obse = $scope.datoMat.observacion;
          itemh.nu_cant_usud = $scope.datoMat.nu_cant
        }
      })
      TareasServices.saveComentMateriales($scope.datoMat).then(function(result){
        ServicesGps.saveSegTecn(idActividad,'update comentario mat');  
      })
    }else{

    };
   })
 }
$scope.datoEqui = {co_equi_acti : '',nu_cant : '' , observacion : '', co_usua : ''}
  $scope.showComentEquipo = function(item){

  $scope.datoEqui.co_equi_acti = item.co_equi_acti;
  $scope.datoEqui.observacion = item.de_obse_tecn;
  $scope.datoEqui.nu_cant = item.nu_cant_usad
  var dis;
  if ($scope.registerTareas) {
    dis = false;
  }else{
    dis = true;
  };
   var confirmPopup = $ionicPopup.confirm({

     title: '<p clasS="textStyle1">observacion del Equipo</p>',
     template: '<textarea ng-disabled="' + dis + '" ng-model="datoEqui.observacion" class="textStyle3" style="height: 153px;"type="text" placeholder="Ingresar una observación.." ></textarea>' +
               '<div class="list"> '+
                 '<label class="item item-input item-stacked-label">'+
                '<span class="input-label textStyle2" style="white-space: inherit !important">Cantidad Utilizada</span>'+
                 '<input class="textStyle3" ng-disabled="' + dis + '" type="tel" ng-model="datoEqui.nu_cant" placeholder="Cantidad . .">'+
                '</label>'+
              '</div>',
     scope: $scope
   });

   confirmPopup.then(function(res){
    if (res) {
      var co_tecn=1;
      if (DataUsuario !=null) { co_tecn = DataUsuario[0].co_tecn }      
      $scope.datoEqui.co_usua = co_tecn;
      angular.forEach($scope.listEquipos,function(itemh,index){
        if (itemh.co_equi_acti == item.co_equi_acti) {
          itemh.de_obse_tecn = $scope.datoEqui.observacion;
          itemh.nu_cant_usad = $scope.datoEqui.nu_cant
        }
      })
      TareasServices.saveComentEquipo($scope.datoEqui).then(function(result){
        ServicesGps.saveSegTecn(idActividad,'update comentario equi');  
      })
    }else{

    };
   })
 }

 $scope.dataInforme = {
  co_acti : '',
  de_repo : '',
  co_usua : '',
  lat : '',
  lon : '',
  co_repo_acti : 'none'
 };
 $scope.listInforme = [];
 $scope.saveInformeActividad = function(){
  $scope.loadInforme = true;
  var co_tecn=1;
  if (DataUsuario !=null) { co_tecn = DataUsuario[0].co_tecn }
  $scope.dataInforme.co_acti = idActividad;
  $scope.dataInforme.co_usua = co_tecn;
  $scope.dataInforme.lat = "00";
  $scope.dataInforme.lon = "11";
  TareasServices.saveInformeActividad($scope.dataInforme).then(function(res){
    if ($scope.dataInforme.co_repo_acti != "none") {
      ServicesGps.saveSegTecn(idActividad,'update informe');  
      angular.forEach($scope.listInforme,function(item,index){
        if (item.co_repo_acti == $scope.dataInforme.co_repo_acti) {
          $scope.listInforme[index].co_repo_acti = res[0].co_repo_acti;
          $scope.listInforme[index].de_repo_acti = res[0].de_repo_acti;
          $scope.listInforme[index].fe_repo_acti = res[0].fe_repo_acti;
        };
      })     
    }else{
      ServicesGps.saveSegTecn(idActividad,'insert informe');  
      $scope.listInforme.push({
        co_repo_acti : res[0].co_repo_acti,
        de_repo_acti : res[0].de_repo_acti,
        fe_repo_acti : res[0].fe_repo_acti
      })     
    };
    $scope.dataInforme.de_repo = "";
    $scope.dataInforme.co_repo_acti = "none";
    $scope.showAlert('Registro Correcto !','Ha registrado un nuevo informe correctamente.')        
    $scope.loadInforme = false;
  })
 }
 $scope.getInforme = function(item){
  $scope.dataInforme.co_repo_acti = item.co_repo_acti;
  $scope.dataInforme.de_repo = item.de_repo_acti;
 }
 $scope.listaInforme = function(){
  var params = {
    co_act : idActividad
  }
  TareasServices.listaInformeActividad(params).then(function(data){    
    if (data[0] == "ERROR") { return;};
    angular.forEach(data,function(item,index){
      $scope.listInforme.push({
        co_repo_acti : item.co_repo_acti,
        de_repo_acti : item.de_repo_acti,
        fe_repo_acti : item.fe_repo_acti
      })
    })
  })
 }
 $scope.paramsVistoBueno = {
    co_acti : '',
    nom_clie: '',
    nro_docu: '',
    nom_cargo: '',
    nom_firma: '',
    nom_foto : '',
    cod_usu : ''
}
$scope.listVistoBueno = [];
$scope.listaVistoBuenoActividad = function(){
  var params = {
    co_act : idActividad
  }
  TareasServices.listaVistoBuenoActividad(params).then(function(data){
    if (data[0] == "ERROR") {return;};
    angular.forEach(data,function(item,index){
        $scope.listVistoBueno.push({
            id: item.co_repo_clie,         
            noFoto : item.no_firm,
            src: item.no_foto,
            nombre: item.no_clie,
            cargo : item.no_cargo
        })
    })
  })
}
$scope.listaTecnicosxActividad = function(){
  var params = {
    co_act : idActividad
  }
  TareasServices.listaTecnicosxActividad(params).then(function(data){
    if (data[0] == "ERROR") {return;};
    $scope.listTecnicosAct = data;
    
  })
}
$scope.saveVistoBuenoActividad = function(){
  $scope.loadSaveFirma = true;
  var co_tecn=1; 
  if (DataUsuario !=null) { co_tecn = DataUsuario[0].co_tecn }
  $scope.paramsVistoBueno.co_acti = idActividad;
  $scope.paramsVistoBueno.cod_usu = co_tecn;
  var cant = $scope.listVistoBueno.length;
  
  TareasServices.uploadPhotoVistoBueno($scope.paramsVistoBueno,cant).then(function(result){   
    ServicesGps.saveSegTecn(idActividad,'insert vistobueno');  
    $scope.listVistoBueno.push({
        id: result.id,         
        noFoto : result.noFoto,
        src: result.src,
        nombre: result.nombre,
        cargo : result.cargo
    })
    $scope.paramsVistoBueno.nom_clie = "";
    $scope.paramsVistoBueno.nro_docu = "";
    $scope.paramsVistoBueno.nom_cargo = "";
    $scope.loadSaveFirma = false;
 })
}

$scope.ConfirmFinalizarAct = function(){
   var confirmPopup = $ionicPopup.confirm({
     title: '<p clasS="textStyle1">Confirmación</p>',
     template: '<p class="textStyle2">Esta apunto de finalizar la Actividad #' + idActividad + ', Desea continuar? </p>'
               
   });

   confirmPopup.then(function(res){
    if (res) {
      $scope.loadFinalizarAct = true ;
      $timeout(function(){
        ServicesGps.getCurrentPosition().then(function(result){
          var ubi = result.lat + '|' + result.long 
          var co_usu = 1;
          if (DataUsuario != null) { co_usu = DataUsuario[0].co_tecn}
          var params = {
            co_usua : co_usu,
            ubicacion : ubi,
            co_acti : idActividad,
            estado : 0,
          }          
          ActividadesServices.saveFinalizaActividad(params).then(function(res){            
            $scope.loadFinalizarAct = false;
            $scope.showAlert('Actividad Finalizada !','Ha finalizado la actividad correctamente, puede visualizar el detalle en la sección : Historial Programas T.')       
            $location.path('tab/inicio');
          })
          ServicesGps.saveSegTecn(idActividad,'finaliza actividad');
        })
      },1500)
    };
   })
}


})

.controller('HistorialCtrl', function($scope,$ionicActionSheet,$ionicPopup,$timeout,$location,ActividadesServices,Session) {
  // CAPTURAMOS NOMBRE DEL USUARIO LOGEADO  
  var DataUsuario = Session.getSession();
  if (DataUsuario != null) {
    $scope.nombresUsuario = DataUsuario[0].no_tecn + ' ' + DataUsuario[0].no_apel_pate
  }
  //
  var fechaini = document.getElementById('txtfechainiH');
  var fechafin = document.getElementById('txtfechafinH');
  var fechaInicial = getDateHoy();
  fechaInicial = fechaInicial.split('-')
  fechaInicial = fechaInicial[0] + '-'+ fechaInicial[1] + '-' + '01'
  fechaini.value = fechaInicial;
  fechafin.value = getDateHoy();
  $scope.getListaActividades = function(){
   $scope.showLoadActividad = true;
      var co_usu = 1;
  if (DataUsuario != null) { co_usu = DataUsuario[0].co_tecn}
    var params = {
      condicion : '0',
      co_tecn : co_usu,
      fe_ini : fechaini.value,
      fe_fin : fechafin.value
    };
    console.log(params)
    ActividadesServices.getActividades(params).then(function(result){
      $scope.listActividades = [];
      if (result[0] == "ERROR") {  $scope.showLoadActividad = false;return;};
      
      angular.forEach(result,function(item,index){

        var fecha = item.fe_acti_inic.split('-')
        
        fecha = fecha[2] + ' ' + meses[parseInt(fecha[1]-1)]
        $scope.listActividades.push({
          co_acti : item.co_acti,
          fe_acti_fina: item.fe_acti_fina,
          fe_acti_inic: fecha,
          fe_max: item.fe_max,
          ho_ingr_refe: item.ho_ingr_refe,
          ho_sali_refe: item.ho_sali_refe,
          no_desc_loca: item.no_desc_loca,
          no_dire_loca: item.no_dire_loca,
          nu_minu_refe: item.nu_minu_refe,
          co_usua_inic_acti: item.co_usua_inic_acti,
          ho_inic_apli : item.ho_inic_apli,
          co_usua_fina_acti : item.co_usua_fina_acti,
          ho_fina_apli : item.ho_fina_apli,
          st_acti : item.st_acti
        })
        $scope.showLoadActividad = false;
      })      
    },function(err){
      console.log(err)
    })
  }

   $scope.showOptions = function(item,indexActi){
 
     var hideSheet = $ionicActionSheet.show({
       buttons: [         
         { text: 'Ver Actividad' }
       ],
       titleText: 'Seleccione una opción',
       cancelText: 'Cancelar',
       cancel: function() {
            // add cancel code..
          },
       buttonClicked: function(index) {
        if (index == 0) {       
            hideSheet();
            $scope.goToProgramacion(item,1);
          }     
        

       }
     });
     // For example's sake, hide the sheet after two seconds
     $timeout(function() {
       hideSheet();
     }, 3000);

   };

  $scope.goToProgramacion = function(item,con){
    ActividadesServices.saveItemActividad(item);    
    $location.path('tab/historialTareas/' + item.co_acti + '|' + con)
  }

})


.controller('HistorialTareasCtrl', function($scope,$stateParams,$ionicScrollDelegate,$ionicSlideBoxDelegate,$ionicPopup,Session,ActividadesServices,TareasServices,$ionicActionSheet,$timeout,$ionicModal) {
  // CAPTURAMOS LOS DATOS DE LA SESSION
    var DataUsuario = Session.getSession();    
  // CAPTURAMOS LA OFICINA Y DIRECCIÓN DEL ITEM SELECCIONADO

    var itemActividad = ActividadesServices.getItemActividad();
    
    if (itemActividad != null) {
      $scope.direccionItem = {
        oficina : itemActividad.no_desc_loca,
        direccion : itemActividad.no_dire_loca
      }
      if (itemActividad.st_acti == 2) {
        // INICIO ACTIVIDAD
        var horaInicActividad;
        if (itemActividad.ho_inic_apli.length == 0) {
          var f=new Date();
          horaInicActividad=f.getHours()+":"+f.getMinutes()+":"+f.getSeconds(); 
          
        }else{
          horaInicActividad = itemActividad.ho_inic_apli.split(' ')
          horaInicActividad = horaInicActividad[1];
        }
        var hora = tConvert(horaInicActividad);
        $scope.textInicioActividad = "actividad iniciada a las " + hora;
      }
    }
    
  //
  // CAPTURAMOS ID DE ACTIVIDAD QUE ES ENVIADO COMO PARAMETROS
  var params = $stateParams.idActividad.split('|');
  var idActividad = params[0]
  // ESTE FLAG ES EL PERMISO NECESARIO PARA PODER REALIZAR ALGUN TIPO DE REGISTROS
    // EN LAS TAREAS , SI ES 0  NO TIENE PERMISOS , SI ES 1 SI LOS TIENE.
  var flagRegistrar = params[1]
  var params = {
      co_act : idActividad
  }
  
  // TRAEMOS A LAS TAREAS DE LA ACTIVIDAD SELECCIONADA Y SUS RESPECTIVOS ITEMS
  $scope.getAllItemsActividades = function(){

    $scope.getTareas();
    $scope.getHerramientas();  
    $scope.getMateriales();
    $scope.getEquipos();
    $scope.listaInforme();
    $scope.listaVistoBuenoActividad();
    $scope.listaTecnicosxActividad();
  }
  $scope.getTareas = function(){
  
    TareasServices.getTareas(params).then(function(result){
      $scope.listTareas = result;
      
    },function(err){
      console.log(err)
    })  
  }
  $scope.getHerramientas = function(){
    TareasServices.getHerramientas(params).then(function(result){
       if (result[0] == "ERROR") { return;};
      $scope.listHerramientas = result;
    },function(err){
      console.log(err)
    })  
  }
  $scope.getMateriales = function(){
    TareasServices.getMateriales(params).then(function(result){
      if (result[0] == "ERROR") { return;};
      $scope.listMateriales = result;      
      
    },function(err){
      console.log(err)
    })  
  }
  $scope.getEquipos = function(){
    TareasServices.getEquipos(params).then(function(result){
      if (result[0] == "ERROR") { return;};
      $scope.listEquipos = result;      
    },function(err){
      console.log(err)
    })  
  }
  $scope.getPhotos = function(){
    var params = {
      co_tare : ItemTareaSelect.co_tare
    }
    TareasServices.getFotos(params).then(function(result){
      if (result[0] == "ERROR") { return;};
      $scope.listFotos = [];
      angular.forEach(result,function(item,index){        
        $scope.listFotos.push({
          id: item.co_foto_tare,
          codTarea : item.co_tare,
          noFoto : item.no_foto.split('/')[4],
          src : item.no_foto,
          tipofoto: item.ti_foto_sube,
          comentario : item.de_come_foto
        })
      })
      
    })
  }
  $scope.zoomMin = 1;
  $scope.showImages = function(index) {

    $scope.activeSlide = index;
    $scope.showModal('templates/ZoomImage/adm-galleryzoom.html');
  };
   $scope.showImagesVisto = function(index) {

    $scope.activeSlide = index;
    $scope.showModal('templates/ZoomImage/adm-galleryzoomFirma.html');
  };
  $scope.showModal = function(templateUrl) {
    $ionicModal.fromTemplateUrl(templateUrl, {
      scope: $scope
    }).then(function(modal) {
      $scope.modalImage = modal;
      $scope.modalImage.show();
    });
  }
   
  $scope.closeModalImage = function() {
    $scope.modalImage.hide();
    $scope.modalImage.remove()
  };
   
  $scope.updateSlideStatus = function(slide) {
    var zoomFactor = $ionicScrollDelegate.$getByHandle('scrollHandle' + slide).getScrollPosition().zoom;
    if (zoomFactor == $scope.zoomMin) {
      $ionicSlideBoxDelegate.enableSlide(true);
    } else {
      $ionicSlideBoxDelegate.enableSlide(false);
    }
  };

  var ItemTareaSelect;
  $scope.showConditions = function(item) {

     // Show the action sheet
     ItemTareaSelect = item;
     var hideSheet = $ionicActionSheet.show({
       buttons: [
         { text: '<b>Comentarios</b>' },
         { text: 'Toma de Fotos' }
       ],
       titleText: 'Seleccione una opción',
       cancelText: 'Cancelar',
       cancel: function() {
            // add cancel code..
          },
       buttonClicked: function(index) {
        if (index == 0) {
          $scope.titleModal = "Comentarios";
          $scope.titleBodyModal = "Reporte de Tarea";
          $scope.showComentarios = true;
          $scope.showFotos = false;
          if (item.ti_tare == 1) {
            $scope.showClave = true;
          }else{
            $scope.showClave = false;            
          }
          // MOSTRAMOS DATOS DE COMENTS
          $scope.getComents(ItemTareaSelect);
        }else{
          $scope.titleModal = "Toma de Fotos";
          $scope.titleBodyModal = "Fotos de la Tarea";
          $scope.showFotos = true;
          $scope.showComentarios = false;
          
          $scope.getPhotos();
        }
        $scope.openModal();
         return true;
       }
     });

     // For example's sake, hide the sheet after two seconds
     $timeout(function() {
       hideSheet();
     }, 3000);

   };
   $ionicModal.fromTemplateUrl('my-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
   }).then(function(modal) {
    $scope.modal = modal;
   });
  $scope.openModal = function() {
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  $scope.slideHasChanged = function(index){
    console.log(index)
  }

  // FUNCION APRA REGISTRAR COMENTARIOS Y CLAVES
  $scope.parametrosComent = {
    comentario : '',
    usuario : '',
    clave : ''
  }
  $scope.listComents = [];
  $scope.getComents = function(item){
    $scope.listComents = [];
    if (item.no_usua_0001 !="") {
      $scope.listComents.push({
        comentario : item.de_come_tecn,
        cod_usu : item.co_usua_come,
        no_usu : item.no_usua_0001,
        no_clav : item.no_clav_0001,
        co_tarea : item.co_tare,
        cond : 1
      })      
    }
    if (item.no_usua_0002 !="") {
      $scope.listComents.push({
        comentario : item.de_come_tecn,
        cod_usu : item.co_usua_come,
        no_usu : item.no_usua_0002,
        no_clav : item.no_clav_0002,
        co_tarea : item.co_tare,
        cond : 2
      })     
    }

  }
  var updateComent = false;
  var conAux;
  var itemAux;


  $scope.showAlert = function(title , body) {
   var alertPopup = $ionicPopup.alert({
     title: '<p class="textStyle1">' +  title + '</p>',
     template: '<p class="textStyle2" style="text-align: justify;">' +  body + '</p>'
   });

   alertPopup.then(function(res) {
    
   });
 };
$scope.listFotos = [];

 // FUNCIONES PARA HERRAMIENTAS 
 $scope.dato = {comentarioHerr : ""};
 $scope.showComentHerramienta = function(item){
  $scope.dato.comentarioHerr = item.de_come_tecn;
      var confirmPopup = $ionicPopup.alert({
     title: '<p clasS="textStyle1">Comentario de Herramienta</p>',
     template: '<textarea readonly ng-model="dato.comentarioHerr" class="textStyle3" style="height: 153px;"type="text" placeholder=".." >hola</textarea>',
     scope: $scope
   });
 }
 //
 $scope.datoMat = {co_mate_acti : '',nu_cant : '' , observacion : ''}
 $scope.showComentMaterial = function(item){
  $scope.datoMat.co_mate_acti = item.co_mate_acti;
  $scope.datoMat.observacion = item.de_obse;
  $scope.datoMat.nu_cant = item.nu_cant_usud
   var confirmPopup = $ionicPopup.alert({
     title: '<p clasS="textStyle1">Observación del Material</p>',
     template: '<textarea readonly ng-model="datoMat.observacion" class="textStyle3" style="height: 153px;"type="text" placeholder="Ingresar una observación.." ></textarea>' +
               '<div class="list"> '+
                '<label class="item item-input item-stacked-label">'+
                '<span class="input-label textStyle2" style="white-space: inherit !important">Cantidad Utilizada</span>'+
                 '<input readonly class="textStyle3" type="tel" ng-model="datoMat.nu_cant" placeholder="Cantidad . .">'+
                '</label>'+
              '</div>',
     scope: $scope
   });

 }
$scope.datoEqui = {co_equi_acti : '',nu_cant : '' , observacion : ''}
  $scope.showComentEquipo = function(item){

  $scope.datoEqui.co_equi_acti = item.co_equi_acti;
  $scope.datoEqui.observacion = item.de_obse_tecn;
  $scope.datoEqui.nu_cant = item.nu_cant_usad
   var confirmPopup = $ionicPopup.alert({
     title: '<p clasS="textStyle1">observacion del Equipo</p>',
     template: '<textarea ng-model="datoEqui.observacion" class="textStyle3" style="height: 153px;"type="text" placeholder="Ingresar una observación.." ></textarea>' +
               '<div class="list"> '+
                '<label class="item item-input item-stacked-label">'+
                '<span class="input-label textStyle2" style="white-space: inherit !important">Cantidad Utilizada</span>'+
                 '<input class="textStyle3" type="tel" ng-model="datoEqui.nu_cant" placeholder="Cantidad . .">'+
                '</label>'+
              '</div>',
     scope: $scope
   });

 }

 $scope.dataInforme = {
  co_acti : '',
  de_repo : '',
  co_usua : '',
  lat : '',
  lon : '',
  co_repo_acti : 'none'
 };
 $scope.listInforme = [];

 $scope.getInforme = function(item){
  $scope.dataInforme.co_repo_acti = item.co_repo_acti;
  $scope.dataInforme.de_repo = item.de_repo_acti;
 }
 $scope.listaInforme = function(){
  var params = {
    co_act : idActividad
  }
  TareasServices.listaInformeActividad(params).then(function(data){    
    if (data[0] == "ERROR") { return;};
    angular.forEach(data,function(item,index){
      $scope.listInforme.push({
        co_repo_acti : item.co_repo_acti,
        de_repo_acti : item.de_repo_acti,
        fe_repo_acti : item.fe_repo_acti
      })
    })
  })
 }
 $scope.paramsVistoBueno = {
    co_acti : '',
    nom_clie: '',
    nro_docu: '',
    nom_cargo: '',
    nom_firma: '',
    nom_foto : '',
    cod_usu : ''
}
$scope.listVistoBueno = [];
$scope.listaVistoBuenoActividad = function(){
  var params = {
    co_act : idActividad
  }
  TareasServices.listaVistoBuenoActividad(params).then(function(data){
    if (data[0] == "ERROR") {return;};
    angular.forEach(data,function(item,index){
        $scope.listVistoBueno.push({
            id: item.co_repo_clie,         
            noFoto : item.no_firm,
            src: item.no_foto,
            nombre: item.no_clie,
            cargo : item.no_cargo,
            fecha : item.fe_usua_regi
        })
    })
  })
}


})
.controller('AccountCtrl',function($scope,Chats){

  $scope.config = Chats.allConfig();
  console.log($scope.config)


})
function tConvert(time) {
  // Check correct time format and split into components
  time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

  if (time.length > 1) { // If time format correct
    time = time.slice (1);  // Remove full string match value
    time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
    time[0] = +time[0] % 12 || 12; // Adjust hours
  }
  return time.join (''); // return adjusted time or original string
}