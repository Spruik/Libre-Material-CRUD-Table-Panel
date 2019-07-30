'use strict';

System.register(['./utils', './apis'], function (_export, _context) {
  "use strict";

  var utils, apis, onSubmit, preprocess, showMaterialForm;
  return {
    setters: [function (_utils) {
      utils = _utils;
    }, function (_apis) {
      apis = _apis;
    }],
    execute: function () {
      onSubmit = function onSubmit(scope) {
        return function () {
          var cur = scope.currentMaterial;
          var newMaterial = scope.materialForm.material;

          if (newMaterial.name !== cur.name) {
            var result = scope.materialNames.filter(function (name) {
              return name === newMaterial.name && name !== cur.name;
            });
            if (result.length >= 1) {
              utils.alert('warning', 'Id exists', 'The ID of the material you are updating exists');
              return;
            }
          }

          apis.updateMaterial(cur.id, newMaterial, utils.successCallBack('mct-material-form-cancelBtn', 'Material has been updated successfully', scope), function (e) {
            return utils.failCallBack('mct-material-form-cancelBtn', 'Error occurred when updating the material due to ' + e + ', please try again');
          });
        };
      };

      preprocess = function preprocess(scope) {
        var cur = scope.currentMaterial;
        scope.materialForm = {
          material: {
            id: cur.id,
            description: cur.description,
            description2: cur.description_optional,
            unit: cur.unit_of_measure,
            name: cur.name
          },
          func: {
            onSubmit: onSubmit(scope)
          },
          submitBtnText: 'Update',
          formTitle: 'Update Material'
        };
      };

      _export('showMaterialForm', showMaterialForm = function showMaterialForm(scope) {
        preprocess(scope);
        utils.showLargeModal('material_form.html', scope);
      });

      _export('showMaterialForm', showMaterialForm);
    }
  };
});
//# sourceMappingURL=updateMaterial.js.map
