import { getPlaceImage } from './src/service/ImageGenerationService.jsx';

async function testUnsplashIntegration() {
  try {
    console.log('Testing Unsplash integration...');
    
    // Test with a common landmark
    const imageUrl = await getPlaceImage('Eiffel Tower');
    
    if (imageUrl) {
      console.log('✅ Unsplash integration test passed!');
      console.log('Image URL:', imageUrl);
    } else {
      console.log('⚠️  No image found, but no error occurred');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Unsplash integration test failed:', error.message);
    return false;
  }
}

testUnsplashIntegration();