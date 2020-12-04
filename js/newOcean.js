/**
 * Flat-shaded ocean primitive.
 *
 * Based on a Codrops tutorial:
 * http://tympanus.net/codrops/2016/04/26/the-aviator-animating-basic-3d-scene-threejs/
 */

AFRAME.registerComponent('new-ocean', {
  schema: {
    // Dimensions of the ocean area.
    width: { default: 10, min: 0 },
    depth: { default: 10, min: 0 },

    // Density of waves.
    density: { default: 10 },

    // Wave amplitude and variance.
    amplitude: { default: 0.1 },
    amplitudeVariance: { default: 0.3 },

    // Wave speed and variance.
    speed: { default: 1 },
    speedVariance: { default: 2 },

    // Material.
    color: { default: '#7AD2F7', type: 'color' },
    opacity: { default: 0.8 },
  },

  createNewOcean() {
    console.log('updating')
    const el = this.el,
      data = this.data
    let material = el.components.material

    const geometry = new THREE.PlaneGeometry(
      data.width,
      data.depth,
      data.density,
      data.density
    )
    geometry.mergeVertices()
    this.waves = []
    for (let v, i = 0, l = geometry.vertices.length; i < l; i++) {
      v = geometry.vertices[i]
      this.waves.push({
        z: v.z,
        ang: Math.random() * Math.PI * 2,
        amp: data.amplitude + Math.random() * data.amplitudeVariance,
        speed: (data.speed + Math.random() * data.speedVariance) / 1000, // radians / frame
      })
    }

    if (!material) {
      material = {}
      material.material = new THREE.MeshPhongMaterial({
        color: data.color,
        transparent: data.opacity < 1,
        opacity: data.opacity,
        shading: THREE.FlatShading,
      })
    }

    this.material = material

    this.mesh = new THREE.Mesh(geometry, material.material)
    el.setObject3D('mesh', this.mesh)
  },

  /**
   * Use play() instead of init(), because component mappings – unavailable as dependencies – are
   * not guaranteed to have parsed when this component is initialized.
   */
  play: function () {
    const el = this.el,
      data = this.data
    let material = el.components.material

    const geometry = new THREE.PlaneGeometry(
      data.width,
      data.depth,
      data.density,
      data.density
    )
    geometry.mergeVertices()
    this.waves = []
    for (let v, i = 0, l = geometry.vertices.length; i < l; i++) {
      v = geometry.vertices[i]
      this.waves.push({
        z: v.z,
        ang: Math.random() * Math.PI * 2,
        amp: data.amplitude + Math.random() * data.amplitudeVariance,
        speed: (data.speed + Math.random() * data.speedVariance) / 1000, // radians / frame
      })
    }

    if (!material) {
      material = {}
      material.material = new THREE.MeshPhongMaterial({
        color: data.color,
        transparent: data.opacity < 1,
        opacity: data.opacity,
        shading: THREE.FlatShading,
      })
    }

    this.material = material

    this.mesh = new THREE.Mesh(geometry, material.material)
    el.setObject3D('mesh', this.mesh)

    // REMOVE THIS TO STOP AUTO UPDATE EVERY 10 SECONDS
    setInterval(() => {
      this.createNewOcean()
    }, 10000)
  },

  remove: function () {
    this.el.removeObject3D('mesh')
  },

  tick: function (t, dt) {
    /*
      if you wanted to update the density of the ocean you could track the density of the last tick and if it's different than the current tick,
      call this.createNewOcean().
    */

    if (!dt) return

    const verts = this.mesh.geometry.vertices
    for (let v, vprops, i = 0; (v = verts[i]); i++) {
      vprops = this.waves[i]
      v.z = vprops.z + Math.sin(vprops.ang) * vprops.amp
      vprops.ang += vprops.speed * dt
    }
    this.mesh.geometry.verticesNeedUpdate = true
  },
})
