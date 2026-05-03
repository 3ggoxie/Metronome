import { onMounted, onUnmounted, watch, type Ref } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useTheme } from './useTheme';
import gsap from 'gsap';
import violinUrl from '@/assets/violin.glb?url';

export function useViolin3D(containerRef: Ref<HTMLDivElement | null>) {
  const { resolvedTheme } = useTheme();

  let renderer: THREE.WebGLRenderer | null = null;
  let scene: THREE.Scene | null = null;
  let camera: THREE.PerspectiveCamera | null = null;
  let controls: OrbitControls | null = null;
  let animationId: number | null = null;
  let cleanupResize: (() => void) | null = null;

  let ambientLight: THREE.AmbientLight | null = null;
  let directionalLight: THREE.DirectionalLight | null = null;
  let pointLight: THREE.PointLight | null = null;

  function applyTheme() {
    if (!scene) return;
    const isDark = resolvedTheme.value === 'dark';

    scene.background = null;

    const targetAmbient = isDark ? '#2a1f14' : '#fff8f0';
    const targetAmbientIntensity = isDark ? 1.2 : 2.2;
    const targetDirectional = isDark ? '#e8d8c0' : '#fffef8';
    const targetDirectionalIntensity = isDark ? 3 : 4.5;
    const targetPoint = isDark ? '#ffc080' : '#ffe8c0';
    const targetPointIntensity = isDark ? 3.5 : 3;

    gsap.to(ambientLight!, {
      intensity: targetAmbientIntensity,
      duration: 0.5,
      ease: 'power2.out',
    });
    gsap.to(ambientLight!.color, {
      r: new THREE.Color(targetAmbient).r,
      g: new THREE.Color(targetAmbient).g,
      b: new THREE.Color(targetAmbient).b,
      duration: 0.5,
      ease: 'power2.out',
    });
    gsap.to(directionalLight!, {
      intensity: targetDirectionalIntensity,
      duration: 0.5,
      ease: 'power2.out',
    });
    gsap.to(directionalLight!.color, {
      r: new THREE.Color(targetDirectional).r,
      g: new THREE.Color(targetDirectional).g,
      b: new THREE.Color(targetDirectional).b,
      duration: 0.5,
      ease: 'power2.out',
    });
    gsap.to(pointLight!, {
      intensity: targetPointIntensity,
      duration: 0.5,
      ease: 'power2.out',
    });
    gsap.to(pointLight!.color, {
      r: new THREE.Color(targetPoint).r,
      g: new THREE.Color(targetPoint).g,
      b: new THREE.Color(targetPoint).b,
      duration: 0.5,
      ease: 'power2.out',
    });
  }

  function setupScene(container: HTMLDivElement) {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;

    // Renderer
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(3, 1.5, 5);
    camera.lookAt(0, 0, 0);

    // OrbitControls — mouse drag to rotate, scroll to zoom, right-drag to pan
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 0, 0);
    controls.minDistance = 2;
    controls.maxDistance = 12;
    controls.maxPolarAngle = Math.PI * 0.8;
    controls.update();

    // Lights
    ambientLight = new THREE.AmbientLight('#fff8f0', 2.0);
    scene.add(ambientLight);

    directionalLight = new THREE.DirectionalLight('#fffef8', 4);
    directionalLight.position.set(5, 3, 8);
    scene.add(directionalLight);

    pointLight = new THREE.PointLight('#ffe8c0', 3, 12);
    pointLight.position.set(1, 2, 4);
    scene.add(pointLight);

    // Load violin GLB model
    const loader = new GLTFLoader();
    loader.load(
      violinUrl,
      (gltf) => {
        scene!.add(gltf.scene);

        // Auto-center & scale to fit nicely
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 3.5 / maxDim;

        gltf.scene.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
        gltf.scene.scale.setScalar(scale);

        controls!.target.set(0, 0, 0);
        controls!.update();
      },
      undefined,
      (err) => console.error('Failed to load violin.glb:', err),
    );

    applyTheme();
  }

  function animate() {
    if (!scene || !camera || !renderer || !controls) {
      animationId = requestAnimationFrame(animate);
      return;
    }
    controls.update();
    renderer.render(scene, camera);
    animationId = requestAnimationFrame(animate);
  }

  function dispose() {
    gsap.killTweensOf([ambientLight, ambientLight?.color, directionalLight, directionalLight?.color, pointLight, pointLight?.color]);
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    if (controls) {
      controls.dispose();
      controls = null;
    }
    if (renderer) {
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer = null;
    }
    if (scene) {
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else if (obj.material) {
            obj.material.dispose();
          }
        }
      });
      scene.clear();
    }
    scene = null;
    camera = null;
    ambientLight = null;
    directionalLight = null;
    pointLight = null;
  }

  onMounted(() => {
    const container = containerRef.value;
    if (!container) return;

    setupScene(container);

    let pending = false;
    const ro = new ResizeObserver(() => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        if (!container || !renderer || !camera) return;
        const w = container.clientWidth || 1;
        const h = container.clientHeight || 1;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      });
    });
    ro.observe(container);
    cleanupResize = () => ro.disconnect();

    animationId = requestAnimationFrame(animate);
  });

  onUnmounted(() => {
    dispose();
    if (cleanupResize) cleanupResize();
  });

  watch(resolvedTheme, () => {
    applyTheme();
  });
}
