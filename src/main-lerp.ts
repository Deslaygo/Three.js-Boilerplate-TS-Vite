import './style.css'
import {
  Mesh,
  Color,
  MeshStandardMaterial,
  Raycaster,
  Scene,
  SpotLight,
  PerspectiveCamera,
  WebGLRenderer,
  VSMShadowMap,
  CylinderGeometry,
  PlaneGeometry,
  Vector2,
  Clock,
  EquirectangularReflectionMapping,
  MeshPhongMaterial,
  TetrahedronGeometry,
} from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import Stats from 'three/addons/libs/stats.module.js'
import Pickable from './models/Pickable'

const scene = new Scene()

const spotLight = new SpotLight(0xffffff, 500)
spotLight.position.set(5, 5, 5)
spotLight.angle = 0.3
spotLight.penumbra = 0.5
spotLight.castShadow = true
spotLight.shadow.radius = 20
spotLight.shadow.blurSamples = 20
spotLight.shadow.camera.far = 20
scene.add(spotLight)

await new RGBELoader().loadAsync('img/overcast_puresk.hdr').then((texture) => {
  texture.mapping = EquirectangularReflectionMapping
  scene.environment = texture
  scene.background = texture
})

const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(0, 2, 4)

const renderer = new WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = VSMShadowMap
document.body.appendChild(renderer.domElement)

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.maxPolarAngle = Math.PI / 2 + Math.PI / 16 // ~ 100 degrees

const raycaster = new Raycaster()
const pickables: Pickable[] = [] // used in the raycaster intersects methods
let intersects
const mouse = new Vector2()

renderer.domElement.addEventListener('dblclick', (e) => {
  mouse.set((e.clientX / renderer.domElement.clientWidth) * 2 - 1, -(e.clientY / renderer.domElement.clientHeight) * 2 + 1)

  raycaster.setFromCamera(mouse, camera)

  // const intersects = raycaster.intersectObjects([suzanne, plane], false)

  if (intersects.length) {
    // const p = intersects[0].point

    //controls.target.set(p.x, p.y, p.z)

    // //  Tweening controls.target
    // new TWEEN.Tween(controls.target)
    //   .to(
    //     {
    //       x: p.x,
    //       y: p.y,
    //       z: p.z
    //     },
    //     500
    //   )
    //   //.delay (1000)
    //   //.easing(TWEEN.Easing.Cubic.Out)
    //   //.onUpdate(() => render())
    //   .start()

    // // slding x,z
    // new TWEEN.Tween(suzanne.position)
    //   .to(
    //     {
    //       x: p.x,
    //       z: p.z
    //     },
    //     500
    //   )
    //   .start()

    // // going up
    // new TWEEN.Tween(suzanne.position)
    //   .to(
    //     {
    //       y: p.y + 3
    //     },
    //     250
    //   )
    //   //.easing(TWEEN.Easing.Cubic.Out)
    //   .start()
    // //.onComplete(() => {

    // // going down
    // new TWEEN.Tween(suzanne.position)
    //   .to(
    //     {
    //       y: p.y + 1
    //     },
    //     250
    //   )
    //   .delay(250)
    //   //.easing(TWEEN.Easing.Cubic.In)
    //   .start()
    // //})
  }
})

renderer.domElement.addEventListener('pointerdown', (e) => {
  mouse.set((e.clientX / renderer.domElement.clientWidth) * 2 - 1, -(e.clientY / renderer.domElement.clientHeight) * 2 + 1)

  raycaster.setFromCamera(mouse, camera)

  intersects = raycaster.intersectObjects(pickables, false)

  // toggles `clicked` property for only the Pickable closest to the camera
  intersects.length && ((intersects[0].object as Pickable).clicked = !(intersects[0].object as Pickable).clicked)

  // toggles `clicked` property for all overlapping Pickables detected by the raycaster at the same time
  // intersects.forEach((i) => {
  //   ;(i.object as Pickable).clicked = !(i.object as Pickable).clicked
  // })
})

 renderer.domElement.addEventListener('mousemove', (e) => {
   mouse.set(
     (e.clientX / renderer.domElement.clientWidth) * 2 - 1,
     -(e.clientY / renderer.domElement.clientHeight) * 2 + 1
   )

   raycaster.setFromCamera(mouse, camera)

   intersects = raycaster.intersectObjects(pickables, false)

   pickables.forEach((p) => (p.hovered = false))

   intersects.length && ((intersects[0].object as Pickable).hovered = true)
 })

const cylinder = new Pickable(new CylinderGeometry(0.66, 0.66), new MeshStandardMaterial({ color: 0x888888 }), new Color(0x27ae60))
scene.add(cylinder)
pickables.push(cylinder)

// const cube = new Pickable(
//   new BoxGeometry(),
//   new MeshStandardMaterial({ color: 0x888888 }),
//   new Color(0xff2200)
// )
// cube.position.set(-2, 0, 0)
// scene.add(cube)
// pickables.push(cube)

const pyramid = new Pickable(
  new TetrahedronGeometry(),
  new MeshStandardMaterial({ color: 0x888888 }),
  new Color(0x0088ff)
)
pyramid.position.set(2, 0, 0)
scene.add(pyramid)
pickables.push(pyramid)

const floor = new Mesh(new PlaneGeometry(20, 20), new MeshPhongMaterial())
floor.rotateX(-Math.PI / 2)
floor.position.y = -1.25
floor.receiveShadow = true
//floor.material.envMapIntensity = 0
scene.add(floor)

const stats = new Stats()
document.body.appendChild(stats.dom)

const clock = new Clock()
let delta = 0

function animate() {
  requestAnimationFrame(animate)

  delta = clock.getDelta()

  pickables.forEach((p) => {
    p.update(delta)
  })

  controls.update()

  renderer.render(scene, camera)

  stats.update()
}

animate()