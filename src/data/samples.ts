export interface SampleItem {
  id: string;
  type: 'leaf' | 'crop' | 'seed';
  title: string;
  crop: string;
  imagePath: string;
  description: string;
}

export const SAMPLE_SCANS: SampleItem[] = [
  {
    id: 'sample-leaf-1',
    type: 'leaf',
    title: 'Foliar Blight & Powdery Mildew on Cucurbit/Vegetable Leaf',
    crop: 'Tomato / Cucurbit',
    imagePath: '/src/assets/images/sample_leaf_pest_1793870932448.jpg',
    description: 'Shows prominent yellow-rimmed necrotic fungal spots and white powdery mildew spore patches.',
  },
  {
    id: 'sample-crop-1',
    type: 'crop',
    title: 'Tomato & Chilli Field Canopy Stress',
    crop: 'Tomato',
    imagePath: '/src/assets/images/sample_crop_field_1793870934117.jpg',
    description: 'Field row stand with localized lower-leaf yellowing and early nutrient/soil stress indicators.',
  },
  {
    id: 'sample-seed-1',
    type: 'seed',
    title: 'Wheat & Chickpea Seed Lot Inspection',
    crop: 'Wheat & Bengal Gram',
    imagePath: '/src/assets/images/sample_healthy_seeds_1793870933882.jpg',
    description: 'Manual seed quality inspection checking for broken seed coats, bruchid weevil holes, and seed uniformity.',
  },
];

export const COMMON_CROPS = [
  'Tomato (ಟೊಮೇಟೊ / टमाटर)',
  'Rice / Paddy (ಭತ್ತ / धान)',
  'Cotton (ಹತ್ತಿ / कपास)',
  'Wheat (ಗೋಧಿ / गेहूं)',
  'Chilli / Pepper (ಮೆಣಸಿನಕಾಯಿ / मिर्च)',
  'Maize / Corn (ಮೆಕ್ಕೆಜೋಳ / मक्का)',
  'Potato (ಆಲೂಗಡ್ಡೆ / आलू)',
  'Soybean (ಸೋಯಾಬೀನ್ / सोयाबीन)',
  'Onion (ಈರುಳ್ಳಿ / प्याज)',
  'Bengal Gram / Chickpea (ಕಡಲೆ / चना)',
  'Sugarcane (ಕಬ್ಬು / गन्ना)',
  'Groundnut / Peanut (ಕಡಲೆಕಾಯಿ / मूंगफली)',
  'Other / General Crop',
];

export const INDIAN_STATES = [
  'Karnataka',
  'Maharashtra',
  'Uttar Pradesh',
  'Punjab',
  'Tamil Nadu',
  'Andhra Pradesh',
  'Telangana',
  'Madhya Pradesh',
  'Gujarat',
  'Haryana',
  'West Bengal',
  'Rajasthan',
  'Bihar',
  'Kerala',
  'Odisha',
];

export const HERO_IMAGE = '/src/assets/images/hero_indian_farm_1793870932728.jpg';
