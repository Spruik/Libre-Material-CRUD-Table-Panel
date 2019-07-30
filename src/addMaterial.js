import * as utils from './utils'
import * as apis from './apis'

const onSubmit = scope => () => {
  // check name here, if match any name that exists, stop.
  // we call it name, but for users, it's the ID
  const nameIndex = scope.materialNames.indexOf(scope.materialForm.material.name)
  if (nameIndex !== -1) { 
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
      name : '',
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