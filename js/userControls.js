//init bootstrap switches
$("[type='checkbox']").bootstrapSwitch();

//user can select which models to have loaded from file(s)
$("input[role='loadModel']").on('switchChange.bootstrapSwitch', function(event, state) {
    var objName = this.name;
    if(state){
        App.selectedModels.push(objName);
    }else{
        App.selectedModels.pop(objName);
    }
    loadedObjs = [];
    App.prepareToLoadModels();
    dataLoader.loadModels();
    App.initScene();
    $("[type='checkbox']").bootstrapSwitch('toggleReadonly');
    setTimeout(function(){$("[type='checkbox']").bootstrapSwitch('toggleReadonly');}, 1500);
});

//show wireframe?
$("input[name='showWireFrame']").on('switchChange.bootstrapSwitch', function(event, state) {
    showWireFrames = state;
});

