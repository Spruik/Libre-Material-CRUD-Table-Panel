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
          // check name here, if match any name that exists, stop.
          // we call it name, but for users, it's the ID
          var nameIndex = scope.materialNames.indexOf(scope.materialForm.material.name);
          if (nameIndex !== -1) {
            utils.alert('warning', 'Id exists', 'The ID of the material you are creating exists');
            return;
          }

          apis.addMaterial(scope.materialForm.material, utils.successCallBack('mct-material-form-cancelBtn', 'Material has been submitted successfully', scope), function (e) {
            return utils.failCallBack('mct-material-form-cancelBtn', 'Error occurred when submitting the material due to ' + e + ', please try again');
          });
        };
      };

      preprocess = function preprocess(scope) {
        scope.materialForm = {
          material: {
            name: '',
            description: '',
            description2: '',
            unit: ''
          },
          func: {
            onSubmit: onSubmit(scope)
          },
          submitBtnText: 'Submit',
          formTitle: 'Add Material'
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
//# sourceMappingURL=addMaterial.js.map
