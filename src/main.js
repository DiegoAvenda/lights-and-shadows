import * as THREE from "three"
import { ThreeMFLoader } from "three/examples/jsm/Addons.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { Pane } from "tweakpane"

import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js"
import { RectAreaLightHelper } from "three/addons/helpers/RectAreaLightHelper.js"

class App {
  #threejs_ = null
  #camera_ = null

  #scene_ = null
  #clock_ = null
  #controls_ = null

  #torus_ = null
  #cube_ = null

  #light_ = null
  #lightHelper_ = null

  constructor() {}

  async initialize() {
    this.#clock_ = new THREE.Clock(true)

    window.addEventListener(
      "resize",
      () => {
        this.#onWindowResize_()
      },
      false
    )

    await this.#setupProject_()

    this.#onWindowResize_()
    this.#raf_()
  }

  async #setupProject_() {
    this.#threejs_ = new THREE.WebGLRenderer()
    this.#threejs_.shadowMap.enabled = true
    this.#threejs_.shadowMap.type = THREE.PCFSoftShadowMap
    this.#threejs_.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(this.#threejs_.domElement)

    const fov = 70
    const aspect = window.innerWidth / window.innerHeight
    const near = 0.1
    const far = 1000
    this.#camera_ = new THREE.PerspectiveCamera(fov, aspect, near, far)
    this.#camera_.position.set(0, 3, 15)
    this.#camera_.lookAt(new THREE.Vector3(0, 0, 0))

    this.#controls_ = new OrbitControls(
      this.#camera_,
      this.#threejs_.domElement
    )
    this.#controls_.enableDamping = true
    this.#controls_.target.set(0, 0, 0)

    this.#scene_ = new THREE.Scene()
    this.#scene_.background = new THREE.Color(0x000000)

    this.#createScene_()
  }

  #createScene_() {
    //create an ambient light
    // const ambientLight = new THREE.AmbientLight(0xffffff, 0.1)
    // this.#scene_.add(ambientLight)

    //create a hemisphere light
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xff0000, 0.1)
    this.#scene_.add(hemiLight)

    //create a directional light
    const SIZE = 128

    const dirLight = new THREE.DirectionalLight(0xffffff, 1)
    dirLight.position.set(5, 20, -5)
    dirLight.target.position.set(0, 0, 0)
    dirLight.castShadow = true
    dirLight.shadow.camera.near = 0.1
    dirLight.shadow.camera.far = 100
    dirLight.shadow.camera.left = -SIZE
    dirLight.shadow.camera.right = SIZE
    dirLight.shadow.camera.top = SIZE
    dirLight.shadow.camera.bottom = -SIZE
    dirLight.shadow.mapSize.set(4096, 4096)
    this.#scene_.add(dirLight)
    this.#scene_.add(dirLight.target)

    //create spotlight
    // const spotLight = new THREE.SpotLight(0xffffff, 20, 20, Math.PI / 6, 0.9)
    // spotLight.position.set(5, 5, 5)
    // spotLight.target.position.set(0, 0, 0)
    // spotLight.castShadow = true
    // this.#scene_.add(spotLight)
    // this.#scene_.add(spotLight.target)

    // this.#light_ = spotLight

    // const helper = new THREE.SpotLightHelper(spotLight)
    // this.#scene_.add(helper)

    // this.#lightHelper_ = helper

    //create a point light
    // const pointLight = new THREE.PointLight(0xffffff, 10, 100)
    // pointLight.position.set(0, 2, 0)
    // pointLight.castShadow = true
    // this.#scene_.add(pointLight)

    // const helper = new THREE.PointLightHelper(pointLight, 0.1)
    // this.#scene_.add(helper)

    //create a rect light
    // RectAreaLightUniformsLib.init()

    // const rectLight = new THREE.RectAreaLight(0xffffff, 1, 4, 5)
    // rectLight.position.set(0, 1, 0)
    // rectLight.lookAt(new THREE.Vector3(0, 0, 1))
    // this.#scene_.add(rectLight)

    // const helper = new RectAreaLightHelper(rectLight)
    // this.#scene_.add(helper)

    //create a floor
    const floorGeometry = new THREE.PlaneGeometry(500, 500)
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
      metalness: 0.5,
    })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -2
    floor.receiveShadow = true
    this.#scene_.add(floor)

    //some walls
    const wallGeo = new THREE.BoxGeometry(1, 4, 10)
    const wallMat = floorMaterial.clone()
    wallMat.color.setRGB(0.5, 0.5, 1)

    const wall = new THREE.Mesh(wallGeo, wallMat)
    wall.position.set(-8, 0, 0)
    wall.castShadow = true
    this.#scene_.add(wall)

    const wall2 = new THREE.Mesh(wallGeo, wallMat)
    wall2.position.set(8, 0, 0)
    wall2.receiveShadow = true
    wall2.castShadow = true
    this.#scene_.add(wall2)

    //create a floating cube
    const cubeGeo = new THREE.BoxGeometry(1, 1, 1)
    const cubeMat = floorMaterial.clone()
    cubeMat.color.setRGB(1, 1, 0.5)
    cubeMat.roughness = 0.1

    this.#cube_ = new THREE.Mesh(cubeGeo, cubeMat)
    this.#cube_.position.set(-3, 0, 3)
    this.#cube_.castShadow = true
    this.#cube_.receiveShadow = true
    this.#scene_.add(this.#cube_)

    //create a torus knot
    const torusGeo = new THREE.TorusKnotGeometry(1, 0.3, 100, 16)
    const torusMat = floorMaterial.clone()
    torusMat.color.setRGB(1, 0.5, 0.5)
    this.#torus_ = new THREE.Mesh(torusGeo, torusMat)
    this.#torus_.position.set(3, 0, 3)
    this.#torus_.castShadow = true
    this.#torus_.receiveShadow = true
    this.#scene_.add(this.#torus_)

    for (let x = -5; x <= 5; x++) {
      const mat = floorMaterial.clone()
      mat.color.setRGB(0.5, 1, 0.5)
      const cube = new THREE.Mesh(cubeGeo, mat)
      cube.scale.set(2, 10, 2)
      cube.position.set(x * 20, 3, 0)
      cube.castShadow = true
      cube.receiveShadow = true
      this.#scene_.add(cube)
    }
  }

  #onWindowResize_() {
    const dpr = window.devicePixelRatio
    const canvas = this.#threejs_.domElement
    canvas.style.width = window.innerWidth + "px"
    canvas.style.height = window.innerHeight + "px"
    const w = canvas.clientWidth
    const h = canvas.clientHeight

    const aspect = w / h

    this.#threejs_.setSize(w * dpr, h * dpr, false)
    this.#camera_.aspect = aspect
    this.#camera_.updateProjectionMatrix()
  }

  #raf_() {
    requestAnimationFrame((t) => {
      this.#step_(this.#clock_.getDelta())
      this.#render_()
      this.#raf_()
    })
  }

  #render_() {
    this.#threejs_.render(this.#scene_, this.#camera_)
  }

  #step_(timeElapsed) {
    //this.#controls_.update(timeElapsed)
    // this.#light_.position.set(
    //   5 * Math.sin(this.#clock_.getElapsedTime() * 0.1),
    //   5,
    //   5 * Math.cos(this.#clock_.getElapsedTime() * 0.1)
    // )
    // this.#lightHelper_.update()

    this.#cube_.rotation.z += 0.11 * timeElapsed
    this.#cube_.rotation.x -= 0.2 * timeElapsed

    this.#torus_.rotation.x += 0.2 * timeElapsed
    this.#torus_.rotation.y -= 0.25 * timeElapsed
  }
}

let APP_ = null

window.addEventListener("DOMContentLoaded", async () => {
  APP_ = new App()
  await APP_.initialize()
})
