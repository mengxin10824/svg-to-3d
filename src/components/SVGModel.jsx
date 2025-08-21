import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import * as THREE from 'three';

const SVGModel = forwardRef(({
  svgContent,
  thickness,
  metalness,
  roughness,
  opacity,
  isAnimating,
  animationSpeed,
  materialColor
}, ref) => {

  const groupRef = useRef();
  const { gl } = useThree();

  useImperativeHandle(ref, () => ({
    exportGLTF: () => {
      if (groupRef.current) {
        const exporter = new GLTFExporter();
        exporter.parse(
          groupRef.current,
          (gltf) => {
            const output = JSON.stringify(gltf, null, 2);
            const blob = new Blob([output], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'svg-model.gltf';
            link.click();
            URL.revokeObjectURL(url);
          },
          (error) => {
            console.error('Export failed:', error);
          }
        );
      }
    },
    exportVideo: () => {
      if (!groupRef.current) {
        alert('No 3D model to record');
        return;
      }

      // 改进的视频导出功能
      const canvas = gl.domElement;
      const stream = canvas.captureStream(30); // 30 FPS
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      const chunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'svg-3d-animation.webm';
        link.click();
        URL.revokeObjectURL(url);
        alert('Video exported successfully!');
      };
      
      // 开始录制
      mediaRecorder.start();
      alert('Video recording started! Recording will stop automatically after 5 seconds.');
      
      // 5秒后自动停止录制
      setTimeout(() => {
        mediaRecorder.stop();
      }, 5000);
    },
    resetRotation: () => {
      if (groupRef.current) {
        groupRef.current.rotation.set(0, 0, 0);
      }
    }
  }));

  useEffect(() => {
    if (!svgContent || !groupRef.current) return;

    // 清除之前的几何体
    while (groupRef.current.children.length > 0) {
      const child = groupRef.current.children[0];
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
      groupRef.current.remove(child);
    }

    try {
      const loader = new SVGLoader();
      const svgData = loader.parse(svgContent);
      
      const shapes = [];
      svgData.paths.forEach((path) => {
        const pathShapes = SVGLoader.createShapes(path);
        shapes.push(...pathShapes);
      });

      if (shapes.length === 0) {
        console.warn('No shapes found in SVG');
        return;
      }

      // 计算边界框以居中模型
      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;

      shapes.forEach(shape => {
        const points = shape.getPoints();
        points.forEach(point => {
          minX = Math.min(minX, point.x);
          maxX = Math.max(maxX, point.x);
          minY = Math.min(minY, point.y);
          maxY = Math.max(maxY, point.y);
        });
      });

      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const scaleX = maxX - minX;
      const scaleY = maxY - minY;
      const maxScale = Math.max(scaleX, scaleY);
      const scale = maxScale > 0 ? 2 / maxScale : 1; // 缩放到合适大小

      shapes.forEach((shape) => {
        const extrudeSettings = {
          depth: thickness,
          bevelEnabled: true,
          bevelSegments: 2,
          steps: 2,
          bevelSize: thickness * 0.1,
          bevelThickness: thickness * 0.1,
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        
        // 居中和缩放几何体
        geometry.translate(-centerX, -centerY, -thickness / 2);
        geometry.scale(scale, -scale, 1); // Y轴翻转以匹配SVG坐标系

        const material = new THREE.MeshStandardMaterial({
          color: materialColor,
          metalness: metalness,
          roughness: roughness,
          opacity: opacity,
          transparent: opacity < 1.0,
          envMapIntensity: 1,
          // 改进透明度渲染
          alphaTest: opacity < 0.5 ? 0.1 : 0,
          side: opacity < 1.0 ? THREE.DoubleSide : THREE.FrontSide,
        });

        const mesh = new THREE.Mesh(geometry, material);
        groupRef.current.add(mesh);
      });

    } catch (error) {
      console.error('Error parsing SVG:', error);
    }
  }, [svgContent, thickness, metalness, roughness, opacity, materialColor]);

  useFrame((state, delta) => {
    if (isAnimating && groupRef.current) {
      groupRef.current.rotation.y += delta * animationSpeed;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* SVG模型将在这里动态创建 */}
    </group>
  );
});

SVGModel.displayName = 'SVGModel';

export default SVGModel;

