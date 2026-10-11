// Polygon offset under a logarithmic depth buffer.
//
// With `logarithmicDepthBuffer` the fragment shader writes gl_FragDepth itself, and GL then ignores the material's
// polygon offset (the offset only applies to the depth the rasteriser produces). The campus's flat layers (grass,
// areas, paths, asphalt, road paint, the route's road) all lie on the same plane and relied on that offset alone to
// stack, so with the log depth buffer they fought each other and flickered. This carries each material's
// polygonOffsetFactor/Units into the written depth, the way the hardware applies them: factor times the depth's slope
// across the pixel, plus units times the smallest step of a 24-bit depth buffer.
import * as THREE from 'three';

const UNIT = (1 / 16777216).toExponential(8);
const TAGGED = Symbol('logDepthOffset');

let installed = false;

type Tagged = THREE.Material & { [TAGGED]?: { value: THREE.Vector2 } };

/**
 * Gives a polygon-offset material the offset uniform. One define switches the shader code on (so all offset materials
 * of a kind share a program); the factor and units are a uniform kept in step with the material each time it is drawn.
 */
function tag(m: Tagged) {
  if (!m.polygonOffset) return;
  let u = m[TAGGED];
  if (!u) {
    u = m[TAGGED] = { value: new THREE.Vector2() };
    const uniform = u;
    (m.defines ??= {}).LOGDEPTH_PO = '';
    const prev = m.onBeforeCompile;
    m.onBeforeCompile = function (shader, renderer) {
      prev.call(this, shader, renderer);
      shader.uniforms.lrPolygonOffset = uniform;
    };
    // the program cache key stays what it was (three's default key is the source of onBeforeCompile, which the
    // wrapper above would otherwise replace for every material alike)
    const prevKey = m.customProgramCacheKey;
    m.customProgramCacheKey = function () {
      const mine = this.onBeforeCompile;
      this.onBeforeCompile = prev;
      try { return prevKey.call(this); } finally { this.onBeforeCompile = mine; }
    };
    m.needsUpdate = true;
  }
  u.value.set(m.polygonOffsetFactor, m.polygonOffsetUnits);
}

/** Tags every polygon-offset material under `root` (call before compiling, so no program is rebuilt mid-ride). */
export function tagLogDepthOffsets(root: THREE.Object3D) {
  if (!installed) return;
  root.traverse((o) => {
    const m = (o as THREE.Mesh).material;
    if (m) for (const mat of Array.isArray(m) ? m : [m]) tag(mat);
  });
}

/** Installs the offset in the log-depth fragment chunks; meshes made later are tagged the first time they are drawn. */
export function installLogDepthOffset() {
  if (installed) return;
  installed = true;
  THREE.ShaderChunk.logdepthbuf_pars_fragment += /* glsl */ `
#if defined( USE_LOGARITHMIC_DEPTH_BUFFER ) && defined( LOGDEPTH_PO )
	uniform vec2 lrPolygonOffset;
#endif
`;
  THREE.ShaderChunk.logdepthbuf_fragment = /* glsl */ `
#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	float lrLogDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
	#ifdef LOGDEPTH_PO
		lrLogDepth += lrPolygonOffset.x * max( abs( dFdx( lrLogDepth ) ), abs( dFdy( lrLogDepth ) ) ) + lrPolygonOffset.y * ${UNIT};
	#endif
	gl_FragDepth = lrLogDepth;
#endif
`;
  const before = THREE.Mesh.prototype.onBeforeRender;
  THREE.Mesh.prototype.onBeforeRender = function (renderer, scene, camera, geometry, material, group) {
    if (material.polygonOffset) tag(material);
    before.call(this, renderer, scene, camera, geometry, material, group);
  };
}
