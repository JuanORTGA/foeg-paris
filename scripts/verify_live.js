const http = require('http');

http.get('http://localhost:3000/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const hasMedia = data.includes('foeg-media');
    const hasCardPos = data.includes('translate3d(');
    console.log('HAS_FOEG_MEDIA:', hasMedia);
    console.log('HAS_CARD_POS:', hasCardPos);

    // Extract hero image src
    const match = data.match(/foeg-media-[^"& ]+/);
    console.log('MATCHED_HERO_MEDIA:', match ? match[0] : 'None');

    const posMatch = data.match(/translate3d\([^)]+\)/);
    console.log('MATCHED_TRANSLATE:', posMatch ? posMatch[0] : 'None');
  });
}).on('error', err => console.error('FETCH_ERR:', err));
