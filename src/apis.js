import * as utils from './utils'

export const addMaterial = (material, success, fail) => {
  const toSend = {
    id: material.id,
    description: material.description,
    description_optional: material.description2 || null,
    unit_of_measure: material.unit,
  }

  const url = utils.postgRestHost + 'material'
  utils.post(url, JSON.stringify(toSend)).then(res => {
    success()
  }).catch(e => {
    fail(e)
  })
}

export const updateMaterial = (originalId, material, success, fail) => {
  const toSend = {
    id: material.id,
    description: material.description,
    description_optional: material.description2 || null,
    unit_of_measure: material.unit,
  }

  const url = `${utils.postgRestHost}material?id=eq.${originalId}`
  utils.update(url, JSON.stringify(toSend)).then(res => {
    success()
  }).catch(e => {
    fail(e)
  })
}

export const removeMaterial = (id, success, fail) => {
  const url = `${utils.postgRestHost}material?id=eq.${id}`
  utils.remove(url).then(res => {
    success()
  }).catch(e => {
    fail(e)
  })
}