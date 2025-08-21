import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Slider } from './components/ui/slider';
import { Label } from './components/ui/label';
import { Upload, Download, Play, Pause, RotateCcw } from 'lucide-react';
import './App.css';
import SVGModel from './components/SVGModel';
import FileUpload from './components/FileUpload';

function App() {
  const [svgContent, setSvgContent] = useState(null);
  const [thickness, setThickness] = useState([0.2]);
  const [metalness, setMetalness] = useState([0.8]);
  const [roughness, setRoughness] = useState([0.2]);
  const [opacity, setOpacity] = useState([0.6]);
  const [isAnimating, setIsAnimating] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState([1]);
  const [selectedMaterial, setSelectedMaterial] = useState('chrome');
  const modelRef = useRef();

  const handleSVGUpload = (content) => {
    setSvgContent(content);
  };

  const handleExportGLTF = () => {
    if (modelRef.current) {
      modelRef.current.exportGLTF();
    }
  };

  const handleExportVideo = () => {
    if (modelRef.current) {
      modelRef.current.exportVideo();
    }
  };

  const materialPresets = {
    chrome: { metalness: 0.9, roughness: 0.1, color: '#ffffff' },
    gold: { metalness: 0.8, roughness: 0.2, color: '#ffd700' },
    copper: { metalness: 0.7, roughness: 0.3, color: '#b87333' },
    steel: { metalness: 0.6, roughness: 0.4, color: '#c0c0c0' },
    bronze: { metalness: 0.5, roughness: 0.5, color: '#cd7f32' }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-neutral-900 to-neutral-950">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">SVG to 3D</h1>
              <p className="text-gray-300 mt-1">Turn your 2D logo into a 3D animation in seconds</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleExportGLTF}
                disabled={!svgContent}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export 3D Model
              </Button>
              <Button 
                onClick={handleExportVideo}
                disabled={!svgContent}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Video
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* File Upload */}
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload SVG
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FileUpload onUpload={handleSVGUpload} />
              </CardContent>
            </Card>

            {/* Material Settings */}
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Material Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Material Presets */}
                <div>
                  <Label className="text-gray-300 mb-3 block">Material Presets</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(materialPresets).map(([name, preset]) => (
                      <Button
                        key={name}
                        variant={selectedMaterial === name ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSelectedMaterial(name);
                          setMetalness([preset.metalness]);
                          setRoughness([preset.roughness]);
                        }}
                        className="capitalize"
                      >
                        {name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Thickness */}
                <div>
                  <Label className="text-gray-300 mb-3 block">
                    Thickness: {thickness[0].toFixed(2)}
                  </Label>
                  <Slider
                    value={thickness}
                    onValueChange={setThickness}
                    max={2}
                    min={0.1}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                {/* Metalness */}
                <div>
                  <Label className="text-gray-300 mb-3 block">
                    Metalness: {metalness[0].toFixed(2)}
                  </Label>
                  <Slider
                    value={metalness}
                    onValueChange={setMetalness}
                    max={1}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                {/* Roughness */}
                <div>
                  <Label className="text-gray-300 mb-3 block">
                    Roughness: {roughness[0].toFixed(2)}
                  </Label>
                  <Slider
                    value={roughness}
                    onValueChange={setRoughness}
                    max={1}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                {/* Opacity */}
                <div>
                  <Label className="text-gray-300 mb-3 block">
                    Opacity: {opacity[0].toFixed(2)}
                  </Label>
                  <Slider
                    value={opacity}
                    onValueChange={setOpacity}
                    max={1}
                    min={0.1}
                    step={0.05}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Animation Controls */}
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Animation Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsAnimating(!isAnimating)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    {isAnimating ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {isAnimating ? 'Pause' : 'Play'}
                  </Button>
                  <Button
                    onClick={() => {
                      if (modelRef.current) {
                        modelRef.current.resetRotation();
                      }
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>

                <div>
                  <Label className="text-gray-300 mb-3 block">
                    Animation Speed: {animationSpeed[0].toFixed(1)}x
                  </Label>
                  <Slider
                    value={animationSpeed}
                    onValueChange={setAnimationSpeed}
                    max={3}
                    min={0.1}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 3D Preview */}
          <div className="lg:col-span-2">
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm h-[600px]">
              <CardHeader>
                <CardTitle className="text-white">3D Preview</CardTitle>
              </CardHeader>
              <CardContent className="h-full p-3">
                <div className="w-full h-full rounded-lg overflow-hidden">
                  <Canvas
                    camera={{ position: [0, 0, 5], fov: 50 }}
                    style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)' }}
                  >
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 5]} intensity={1} />
                    <pointLight position={[-10, -10, -5]} intensity={0.5} />
                    
                    <Environment preset="studio" />
                    
                    {svgContent && (
                      <SVGModel
                        ref={modelRef}
                        svgContent={svgContent}
                        thickness={thickness[0]}
                        metalness={metalness[0]}
                        roughness={roughness[0]}
                        opacity={opacity[0]}
                        isAnimating={isAnimating}
                        animationSpeed={animationSpeed[0]}
                        materialColor={materialPresets[selectedMaterial].color}
                      />
                    )}
                    
                    <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
                  </Canvas>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
