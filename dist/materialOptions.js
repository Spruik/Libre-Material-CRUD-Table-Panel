'use strict';

System.register(['./utils', './updateMaterial', './apis'], function (_export, _context) {
  "use strict";

  var utils, updateMaterial, apis, onUpdateClick, onRemoveClick, preprocess, showOptionModal;
  return {
    setters: [function (_utils) {
      utils = _utils;
    }, function (_updateMaterial) {
      updateMaterial = _updateMaterial;
    }, function (_apis) {
      apis = _apis;
    }],
    execute: function () {
      onUpdateClick = function onUpdateClick(scope) {
        return function () {
          updateMaterial.showMaterialForm(scope);
        };
      };

      onRemoveClick = function onRemoveClick(scope) {
        return function () {
          var cur = scope.currentMaterial;
          apis.removeMaterial(cur.id, utils.successCallBack('mct-material-option-form-cancelBtn', 'Material has been removed successfully', scope), function (e) {
            return utils.failCallBack('mct-material-option-form-cancelBtn', 'Error occurred when removing the material due to ' + e + ', please try again');
          });
        };
      };

      preprocess = function preprocess(scope) {
        scope.materialOptionForm = {
          onUpdateClick: onUpdateClick(scope),
          onRemoveClick: onRemoveClick(scope)
        };
      };

      _export('showOptionModal', showOptionModal = function showOptionModal(scope) {
        preprocess(scope);
        utils.showModal('material_options.html', scope.materialOptionForm);
      });

      _export('showOptionModal', showOptionModal);
    }
  };
});
//# sourceMappingURL=materialOptions.js.map
