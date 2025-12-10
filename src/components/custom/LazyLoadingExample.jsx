import React from 'react';
import LazySection from './LazySection';

const LazyLoadingExample = () => {
  return (
    <div className="p-8">
      <LazySection animationType="fade" delay={0.1}>
        <h1 className="text-3xl font-bold mb-6">Lazy Loading Example</h1>
      </LazySection>
      
      <LazySection animationType="slide-up" delay={0.2}>
        <p className="text-lg mb-8">
          This is an example of how to implement lazy loading with animations across your application.
          As you scroll down, each section will animate into view.
        </p>
      </LazySection>
      
      <LazySection animationType="slide-up" delay={0.3}>
        <div className="bg-blue-100 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">Feature 1</h2>
          <p>This section will fade in when it enters the viewport.</p>
        </div>
      </LazySection>
      
      <LazySection animationType="slide-left" delay={0.4}>
        <div className="bg-green-100 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">Feature 2</h2>
          <p>This section will slide in from the left when it enters the viewport.</p>
        </div>
      </LazySection>
      
      <LazySection animationType="slide-right" delay={0.5}>
        <div className="bg-yellow-100 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">Feature 3</h2>
          <p>This section will slide in from the right when it enters the viewport.</p>
        </div>
      </LazySection>
      
      <LazySection animationType="scale" delay={0.6}>
        <div className="bg-purple-100 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">Feature 4</h2>
          <p>This section will scale up when it enters the viewport.</p>
        </div>
      </LazySection>
      
      <LazySection animationType="bounce" delay={0.7}>
        <div className="bg-red-100 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">Feature 5</h2>
          <p>This section will bounce in when it enters the viewport.</p>
        </div>
      </LazySection>
    </div>
  );
};

export default LazyLoadingExample;