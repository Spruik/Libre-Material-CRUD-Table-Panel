import * as utils from './utils'
import * as updateMaterial from './updateMaterial'
import * as apis from './apis'

const onUpdateClick = scope => () => {
  console.log(scope)
  updateMaterial.showMaterialForm(scope)
}

const onRemoveClick = scope => () => {
  const cur = scope.currentMaterial
  apis.removeMaterial(
    cur.id,
    utils.successCallBack('mct-material-option-form-cancelBtn', 'Material has been removed successfully', scope),
    e => utils.failCallBack('mct-material-option-form-cancelBtn', `Error occurred when removing the material due to ${e}, please try again`)
  )
}

const preprocess = scope => {
  scope.materialOptionForm = {
    onUpdateClick: onUpdateClick(scope),
    onRemoveClick: onRemoveClick(scope)
  }
}

export const showOptionModal = scope => {
  preprocess(scope)
  utils.showModal('material_options.html', scope.materialOptionForm)
}