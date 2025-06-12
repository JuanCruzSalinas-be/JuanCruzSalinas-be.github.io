import React from 'react';
import { Brain } from 'lucide-react';
import BrainIcon from '../components/icons/BrainIcon';

const BrainIconUsage: React.FC = () => {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Brain Icon Examples</h1>
      
      {/* Direct usage from Lucide React */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Direct Lucide React Usage</h2>
        
        {/* Small brain icon */}
        <div className="flex items-center space-x-2">
          <Brain size={16} className="text-blue-600" />
          <span>Small brain icon (16px)</span>
        </div>
        
        {/* Medium brain icon (header size) */}
        <div className="flex items-center space-x-2">
          <Brain size={32} className="text-blue-600" />
          <span>Header brain icon (32px)</span>
        </div>
        
        {/* Large brain icon (auth pages) */}
        <div className="flex items-center space-x-2">
          <Brain size={40} className="text-blue-600" />
          <span>Auth page brain icon (40px)</span>
        </div>
        
        {/* Extra large brain icon */}
        <div className="flex items-center space-x-2">
          <Brain size={64} className="text-blue-600" />
          <span>Extra large brain icon (64px)</span>
        </div>
      </div>
      
      {/* Different colors */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Different Colors</h2>
        
        <div className="flex items-center space-x-4">
          <Brain size={32} className="text-blue-600" />
          <Brain size={32} className="text-green-600" />
          <Brain size={32} className="text-purple-600" />
          <Brain size={32} className="text-red-600" />
          <Brain size={32} className="text-gray-600" />
        </div>
      </div>
      
      {/* Using custom component */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Using Custom BrainIcon Component</h2>
        
        <div className="flex items-center space-x-4">
          <BrainIcon size={24} className="text-blue-500" />
          <BrainIcon size={32} className="text-blue-600" />
          <BrainIcon size={40} className="text-blue-700" />
        </div>
      </div>
      
      {/* Logo combinations */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Logo Combinations</h2>
        
        {/* Header style logo */}
        <div className="flex items-center space-x-2 text-blue-600 text-2xl font-bold">
          <Brain size={32} className="text-blue-600" />
          <span>MemoryLane</span>
        </div>
        
        {/* Auth page style logo */}
        <div className="flex flex-col items-center">
          <Brain size={40} className="text-blue-600 mb-2" />
          <h1 className="text-2xl font-bold text-gray-900">MemoryLane</h1>
          <p className="text-gray-600 mt-1">Memory Training Platform</p>
        </div>
        
        {/* Compact logo */}
        <div className="flex items-center space-x-1 text-blue-600 text-lg font-semibold">
          <Brain size={24} className="text-blue-600" />
          <span>MemoryLane</span>
        </div>
      </div>
      
      {/* Background variations */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Background Variations</h2>
        
        <div className="flex space-x-4">
          {/* White background */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <Brain size={32} className="text-blue-600" />
          </div>
          
          {/* Blue background */}
          <div className="bg-blue-600 p-4 rounded-lg">
            <Brain size={32} className="text-white" />
          </div>
          
          {/* Gray background */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <Brain size={32} className="text-blue-600" />
          </div>
          
          {/* Circular background */}
          <div className="bg-blue-100 p-4 rounded-full">
            <Brain size={32} className="text-blue-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrainIconUsage;