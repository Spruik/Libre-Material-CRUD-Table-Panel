'use strict';

System.register(['./utils'], function (_export, _context) {
  "use strict";

  var utils, addMaterial, updateMaterial, removeMaterial;
  return {
    setters: [function (_utils) {
      utils = _utils;
    }],
    execute: function () {
      _export('addMaterial', addMaterial = function addMaterial(material, success, fail) {
        var toSend = {
          id: material.id,
          description: material.description,
          description_optional: material.description2 || null,
          unit_of_measure: material.unit
        };

        var url = utils.postgRestHost + 'material';
        utils.post(url, JSON.stringify(toSend)).then(function (res) {
          success();
        }).catch(function (e) {
          fail(e);
        });
      });

      _export('addMaterial', addMaterial);

      _export('updateMaterial', updateMaterial = function updateMaterial(originalId, material, success, fail) {
        var toSend = {
          id: material.id,
          description: material.description,
          description_optional: material.description2 || null,
          unit_of_measure: material.unit
        };

        var url = utils.postgRestHost + 'material?id=eq.' + originalId;
        utils.update(url, JSON.stringify(toSend)).then(function (res) {
          success();
        }).catch(function (e) {
          fail(e);
        });
      });

      _export('updateMaterial', updateMaterial);

      _export('removeMaterial', removeMaterial = function removeMaterial(id, success, fail) {
        var url = utils.postgRestHost + 'material?id=eq.' + id;
        utils.remove(url).then(function (res) {
          success();
        }).catch(function (e) {
          fail(e);
        });
      });

      _export('removeMaterial', removeMaterial);
    }
  };
});
//# sourceMappingURL=apis.js.map
