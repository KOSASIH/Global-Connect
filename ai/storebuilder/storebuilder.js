const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Generate product description from product name and features
async function generateProductDescription(name, features) {
  const prompt = `Write an engaging product description for an e-commerce store. 
    Product: ${name}
    Features: ${features.join(', ')}
    Make it appealing for customers.`;

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [{role: "user", content: prompt}],
      temperature: 0.7
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );
  return response.data.choices[0].message.content.trim();
}

// Suggest product categories from a list of product names
async function suggestCategories(productNames) {
  const prompt = `Given these products: ${productNames.join(', ')}
    Suggest appropriate e-commerce categories for each.`;

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [{role: "user", content: prompt}],
      temperature: 0.6
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );
  return response.data.choices[0].message.content.trim();
}

// Summarize the store for the "About Us" page
async function generateStoreSummary(storeName, mission, productTypes) {
  const prompt = `Write a concise and inviting "About Us" page for an e-commerce store.
    Store: ${storeName}
    Mission: ${mission}
    Products: ${productTypes.join(', ')}
    Make it engaging and trustworthy.`;

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [{role: "user", content: prompt}],
      temperature: 0.7
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );
  return response.data.choices[0].message.content.trim();
}

module.exports = {
  generateProductDescription,
  suggestCategories,
  generateStoreSummary
};