import * as utils from './utils'
import * as apis from './apis'

const onSubmit = scope => () => {
  const cur = scope.currentMaterial
  const newMaterial = scope.materialForm.material

  if (newMaterial.name !== cur.name) {
    const result = scope.materialNames.filter(name => name === newMaterial.name && name !== cur.name)
    if (result.length >= 1) {
      utils.alert('warning', 'Id exists', 'The ID of the material you are updating exists')
      return
    }
  }

  apis.updateMaterial(
    cur.id, 
    newMaterial,
    utils.successCallBack('mct-material-form-cancelBtn', 'Material has been updated successfully', scope),
    e => utils.failCallBack('mct-material-form-cancelBtn', `Error occurred when updating the material due to ${e}, please try again`)
  )
}

const preprocess = scope => {
  const cur = scope.currentMaterial
  scope.materialForm = {
    material: {
      id : cur.id,
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
  }
}

export const showMaterialForm = scope => {
  preprocess(scope)
  utils.showLargeModal('material_form.html', scope)
}