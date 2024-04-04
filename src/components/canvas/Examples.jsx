'use client'

import { useFBX } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

let colors = ['#AED3FB', '#998CF3', '#DE4FE4', '#D1458D']
colors = [colors[0], ...colors.slice(1), colors[0]]

function getGradientTexture(colors) {
  let c = document.getElementById('gradient')
  let ctx = c.getContext('2d')
  let grd = ctx.createLinearGradient(0, 0, c.width, 0)

  let clrStep = 1 / (colors.length - 1)
  colors.forEach((clr, clrIdx) => {
    grd.addColorStop(clrIdx * clrStep, clr)
  })
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, c.width, c.height)
  let ct = new THREE.CanvasTexture(c)
  ct.colorSpace = THREE.SRGBColorSpace
  ct.minFilter = THREE.NearestFilter
  ct.magFilter = THREE.NearestFilter
  return ct
}

const scale = 0.125

export function Visual(props) {
  const scene = useFBX('/visual-text.fbx')

  let gradTexture = getGradientTexture(colors)
  let u = {
    gradTexture: { value: gradTexture },
    box: {
      min: { value: new THREE.Vector3(-35 * scale, -4 * scale, -11 * scale) },
      max: { value: new THREE.Vector3(35 * scale, 5 * scale, 15 * scale) },
    },
  }
  let iTime = { value: 0.0 }
  useFrame((state) => {
    const { clock } = state
    iTime.value = clock.getElapsedTime()
  })

  scene.children.forEach((child, i) => {
    if (child.isMesh) {
      child.castShadow = true
      child.material = new THREE.MeshPhysicalMaterial({
        color: '#555',
        roughness: 0.4,
        metalness: 0.5,
        clearcoat: 0.0,
        clearcoatRoughness: 0.0,
        reflectivity: 0.5,
        envMapIntensity: 1.0,
        sheen: 1.0,
        sheenRoughness: 1.0,
        side: THREE.DoubleSide,
        toneMapped: false,
      })
      child.material.onBeforeCompile = (shader) => {
        shader.uniforms.gradTexture = u.gradTexture
        shader.uniforms.boxMin = u.box.min
        shader.uniforms.boxMax = u.box.max
        shader.uniforms.iTime = iTime
        shader.vertexShader = `
        varying vec3 wPos;
        ${shader.vertexShader}
      `.replace(
          `#include <project_vertex>`,
          `
          wPos = vec3(modelMatrix * vec4(transformed, 1.));
        
        #include <project_vertex>
        `,
        )
        shader.fragmentShader = `
        uniform sampler2D gradTexture;
        uniform vec3 boxMin;
        uniform vec3 boxMax;
        varying vec3 wPos;
        uniform float iTime;
        ${shader.fragmentShader}
      `.replace(
          `#include <color_fragment>`,
          `#include <color_fragment>
        
          vec3 diag = boxMax - boxMin;
          float diagDist = length(diag);
          vec3 diagN = normalize(diag);
          
          vec3 boundPos = wPos - boxMin;
          
          float dotted = dot(diagN, boundPos);
          float dottedN = clamp(dotted / diagDist, 0., 1.);
          dottedN += iTime * 0.3;
          dottedN = fract(dottedN);
          dottedN = dottedN * 0.99 + 0.005;
          
          vec3 gradColor = texture(gradTexture, vec2(dottedN, 0.5)).rgb;
          
          diffuseColor.rgb = gradColor;
        
        `,
        )
      }
    }
  })
  return <primitive object={scene} {...props} />
}
