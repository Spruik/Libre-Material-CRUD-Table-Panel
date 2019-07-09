import * as utils from './utils'
import * as apis from './apis'

const onSubmit = scope => () => {
  // check id here, if match any id that exists, stop.
  const indexOfId = scope.materialIds.indexOf(scope.materialForm.material.id)
  if (indexOfId !== -1) { 
    utils.alert('warning', 'Id exists', 'The ID of the material you are creating exists')
    return
   }
  
  apis.addMaterial(
    scope.materialForm.material,
    utils.successCallBack('mct-material-form-cancelBtn', 'Material has been submitted successfully', scope),
    e => utils.failCallBack('mct-material-form-cancelBtn', `Error occurred when submitting the material due to ${e}, please try again`)
  )
}

const preprocess = scope => {
  scope.materialForm = {
    material: {
      id : '',
      description: '',
      description2: '',
      unit: ''
    },
    func: {
      onSubmit: onSubmit(scope)
    },
    submitBtnText: 'Submit',
    formTitle: 'Add Material'
  }
}

export const showMaterialForm = scope => {
  preprocess(scope)
  utils.showLargeModal('material_form.html', scope)
}