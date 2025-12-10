# Lazy Loading with Animation Implementation Guide

This guide explains how to implement lazy loading with animations across all pages and routes in the TravelEase application.

## Overview

The lazy loading system uses the `LazySection` component which combines the Intersection Observer API with Framer Motion animations to create smooth, performant animations as users scroll through content.

## Available Animation Types

1. **fade** - Elements fade in smoothly
2. **slide-up** - Elements slide up from below
3. **slide-down** - Elements slide down from above
4. **slide-left** - Elements slide in from the left
5. **slide-right** - Elements slide in from the right
6. **scale** - Elements scale up from a smaller size
7. **bounce** - Elements bounce in with a spring animation

## Implementation

### Basic Usage

```jsx
import LazySection from './LazySection';

const MyComponent = () => {
  return (
    <LazySection animationType="slide-up" delay={0.3}>
      <div className="my-content">
        <h2>My Animated Content</h2>
        <p>This content will animate when scrolled into view</p>
      </div>
    </LazySection>
  );
};
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| animationType | string | 'fade' | Type of animation to use |
| delay | number | 0 | Delay in seconds before animation starts |
| threshold | number | 0.1 | Percentage of element visibility to trigger animation (0-1) |
| once | boolean | true | Whether animation should only happen once |
| className | string | '' | Additional CSS classes to apply |

### Example with All Animation Types

```jsx
<LazySection animationType="fade" delay={0.1}>
  <h1>Fade Animation</h1>
</LazySection>

<LazySection animationType="slide-up" delay={0.2}>
  <div>Slide Up Animation</div>
</LazySection>

<LazySection animationType="slide-down" delay={0.3}>
  <div>Slide Down Animation</div>
</LazySection>

<LazySection animationType="slide-left" delay={0.4}>
  <div>Slide Left Animation</div>
</LazySection>

<LazySection animationType="slide-right" delay={0.5}>
  <div>Slide Right Animation</div>
</LazySection>

<LazySection animationType="scale" delay={0.6}>
  <div>Scale Animation</div>
</LazySection>

<LazySection animationType="bounce" delay={0.7}>
  <div>Bounce Animation</div>
</LazySection>
```

## Best Practices

1. **Performance**: Use `once={true}` for elements that don't need to re-animate when scrolled back into view
2. **Threshold**: Adjust the `threshold` prop based on when you want the animation to trigger
3. **Delays**: Use staggered delays (0.1, 0.2, 0.3...) for sequential animations
4. **Content Wrapping**: Always wrap your content in a single root element within LazySection

## Integration Across Routes

To implement lazy loading across all routes:

1. Import the `LazySection` component in any page or component
2. Wrap sections of content that should animate when scrolled into view
3. Choose appropriate animation types and delays for a cohesive experience
4. Test on various devices to ensure smooth performance

## Example Route Implementation

```jsx
// In any page component (e.g., TripHistory.jsx, WeatherIntegration.jsx, etc.)

import LazySection from '../components/custom/LazySection';

const TripHistory = () => {
  return (
    <div className="trip-history-page">
      <LazySection animationType="slide-up" delay={0.1}>
        <header>
          <h1>Trip History</h1>
        </header>
      </LazySection>
      
      <LazySection animationType="slide-up" delay={0.2}>
        <section className="trip-list">
          {/* Trip items will animate as they come into view */}
          <div className="trip-item">Trip 1</div>
          <div className="trip-item">Trip 2</div>
          <div className="trip-item">Trip 3</div>
        </section>
      </LazySection>
    </div>
  );
};
```

## Customization

To customize the animations, modify the `getAnimationVariants` function in `LazySection.jsx`:

```jsx
const getAnimationVariants = () => {
  
  switch (animationType) {
    case 'custom-animation':
      variants.hidden = { opacity: 0, rotate: -10 };
      variants.visible = { 
        opacity: 1, 
        rotate: 0, 
        transition: { duration: 0.6, delay } 
      };
      break;
    // ... rest of cases
  }
  
  return variants;
};
```

## Troubleshooting

1. **Animations not triggering**: Check that the element has sufficient height and is actually scrollable
2. **Performance issues**: Reduce the number of animated elements on a single page
3. **Styling conflicts**: Ensure LazySection doesn't interfere with existing CSS layouts
4. **Mobile issues**: Test on various devices as intersection observers may behave differently

## Conclusion

With this implementation, all pages across every route in the TravelEase application will now feature progressive content loading with smooth animations as users scroll. This enhances the user experience while maintaining performance across all devices.