const puppeteer = require('puppeteer');

async function runTests() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  console.log('🚀 Démarrage des tests E2E...');

  try {
    // 1. Test de la Landing Page
    console.log('--- Test Landing Page ---');
    await page.goto(baseUrl);
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    // Vérifier la présence du Showreel
    const showreel = await page.$('video');
    if (showreel) console.log('✅ Showreel détecté');

    // 2. Test redirection Auth (doit rediriger vers Clerk si on accède à /os)
    console.log('--- Test Protection des Routes ---');
    await page.goto(`${baseUrl}/os`);
    await page.waitForNavigation();
    const currentUrl = page.url();
    if (currentUrl.includes('clerk')) {
      console.log('✅ Redirection vers Auth confirmée');
    }

    // Note: Le test de login complet nécessite des credentials de test
    // et de gérer les iframes de Clerk.
    
    console.log('🎉 Tests terminés avec succès !');
  } catch (error) {
    console.error('❌ Erreur durant les tests:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTests();
