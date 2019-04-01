import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import { SimpleMaterial as Material } from "@babylonjs/materials/simple";
import _ from "lodash";
// createXXX methods from mesh
import "@babylonjs/core/Meshes/meshBuilder";

const canvas = document.getElementById("renderCanvas");
const engine = new Engine(canvas);
var scene = new Scene(engine);

var camera = new FreeCamera("camera1", new Vector3(6, 10, -20), scene);
camera.setTarget(Vector3.Zero());
camera.attachControl(canvas, true);

var light = new HemisphericLight("light1", new Vector3(-10, 1, 5), scene);
light.intensity = 0.7;

var material = new Material("material", scene);
material.wireframe = true;
material.backfaceCulling = false;

/*
var sphere = Mesh.CreateSphere("sphere1", 16, 2, scene);
sphere.position.y = 2;
sphere.material = material;
*/

function renderHeights(heights, size) {
  const x0 = -10;
  const x1 = 10;
  const dx = x1 - x0;
  const z0 = -10;
  const z1 = 10;
  const dz = z1 - z0;

  const mesh = new Mesh("custom", scene);
  mesh.material = material;

  const positions = [];
  for (let z = 0; z < size; ++z) {
    for (let x = 0; x < size; ++x) {
      positions.push(x0 + (dx * x) / (size - 1));
      positions.push(heights[x + size * z]);
      positions.push(z0 + (dz * z) / (size - 1));
    }
  }

  const indices = [];
  for (let z = 1; z < size; z += 2) {
    for (let x = 1; x < size; x += 2) {
      indices.push(x + z * size);
      indices.push(x - 1 + (z - 1) * size);
      indices.push(x + (z - 1) * size);

      indices.push(x + z * size);
      indices.push(x + (z - 1) * size);
      indices.push(x + 1 + (z - 1) * size);

      indices.push(x + z * size);
      indices.push(x + 1 + (z - 1) * size);
      indices.push(x + 1 + z * size);

      indices.push(x + z * size);
      indices.push(x + 1 + z * size);
      indices.push(x + 1 + (z + 1) * size);

      indices.push(x + z * size);
      indices.push(x + 1 + (z + 1) * size);
      indices.push(x + (z + 1) * size);

      indices.push(x + z * size);
      indices.push(x + (z + 1) * size);
      indices.push(x - 1 + (z + 1) * size);

      indices.push(x + z * size);
      indices.push(x - 1 + (z + 1) * size);
      indices.push(x - 1 + z * size);

      indices.push(x + z * size);
      indices.push(x - 1 + z * size);
      indices.push(x - 1 + (z - 1) * size);
    }
  }

  var vertexData = new VertexData();
  const normals = [];
  VertexData.ComputeNormals(positions, indices, normals);
  vertexData.positions = positions;
  vertexData.indices = indices;
  vertexData.normals = normals;
  vertexData.applyToMesh(mesh);
}

function island(size) {
  const heights = new Array(size * size);
  let scale = 20;
  function rnd() {
    return (Math.random() - 0.5) * scale;
  }
  heights[0] = rnd();
  heights[size - 1] = rnd();
  heights[size * (size - 1)] = rnd();
  heights[(size + 1) * (size - 1)] = rnd();

  for (let step = (size - 1) / 2; step > 0; step >>= 1) {
    scale *= 0.49;
    for (let z = step; z < size; z += 2 * step) {
      for (let x = step; x < size; x += 2 * step) {
        heights[x + step + z * size] =
          (heights[x + step + (z + step) * size] +
            heights[x + step + (z - step) * size]) /
            2 +
          rnd();
        heights[x - step + z * size] =
          (heights[x - step + (z + step) * size] +
            heights[x - step + (z - step) * size]) /
            2 +
          rnd();

        heights[x + (z + step) * size] =
          (heights[x - step + (z + step) * size] +
            heights[x + step + (z + step) * size]) /
            2 +
          rnd();
        heights[x + (z - step) * size] =
          (heights[x - step + (z - step) * size] +
            heights[x + step + (z - step) * size]) /
            2 +
          rnd();

        heights[x + z * size] =
          (heights[x + step + z * size] +
            heights[x - step + z * size] +
            heights[x + (z + step) * size] +
            heights[x + (z - step) * size]) /
            4 +
          rnd();
      }
    }
    for (let i = 0; i < size; ++i) {
      heights[i] = 0;
      heights[size * size - i - 1] = 0;
      heights[size * i] = 0;
      heights[size * i + size - 1] = 0;
    }
  }
  return heights;
}

renderHeights(island(129), 129);

/*
var ground = Mesh.CreateGround("ground1", 6, 6, 2, scene);
ground.material = material;
*/

engine.runRenderLoop(() => {
  scene.render();
});
