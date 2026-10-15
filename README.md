# Los Bursa – GitHub Pages + çok oyunculu sunucu

İki parça var:
- **index.html**: oyunun kendisi. GitHub Pages'te durur.
- **server.js**: oyuncuları birbirine bağlayan küçük sunucu. GitHub Pages sunucu çalıştıramaz, bu yüzden ayrı bir yerde çalışması gerekir.

## 1) Önce bilgisayarında dene
```
npm install
npm start
```
Sonra `index.html` dosyasını tarayıcıda aç (iki sekmede aç, birbirinizi görürsünüz).
Bilgisayarda açınca otomatik `ws://localhost:8080` adresine bağlanır.

## 2) Sunucuyu internete koy
`server.js` ve `package.json` dosyalarını ayrı bir GitHub reposuna yükle, sonra Node.js
çalıştıran bir ücretsiz barındırma servisine bağla (Render, Railway, Fly.io gibi; ücretsiz
planların güncel limitlerine kendin bak).

Render örneği:
1. render.com → New → Web Service → sunucu reposunu seç.
2. Build Command: `npm install`, Start Command: `npm start`.
3. Environment'a şunu ekle (kendi adresinle): `ALLOWED_ORIGINS` = `https://KULLANICIADIN.github.io`
4. Deploy bitince sana `https://xxxx.onrender.com` gibi bir adres verir.

Not: Bazı ücretsiz planlarda sunucu bir süre kullanılmayınca uyur, ilk bağlantı yavaş açılabilir.
Oyun otomatik olarak yeniden bağlanmayı dener.

## 3) Oyunu GitHub Pages'e koy
1. `index.html` içinde şu satırı bul:
   `wss://BURAYA-SUNUCU-ADRESI.onrender.com`
   ve kendi sunucu adresinle değiştir (`https://` yerine **`wss://`** yaz).
2. `index.html` dosyasını GitHub reposuna yükle.
3. Repo → Settings → Pages → Branch: `main` / `(root)` → Save.
4. `https://KULLANICIADIN.github.io/REPOADI/` adresinden herkes oynayabilir.

Hızlı test için sunucu adresini linkle de verebilirsin:
`https://KULLANICIADIN.github.io/REPOADI/?server=wss://xxxx.onrender.com`

## Bilmen gerekenler
- Sağ üstte bağlıysa "Çevrimiçi: N", değilse "Çok oyunculu bağlı değil" yazar.
- Hesap, para ve araçlar kişinin kendi tarayıcısında (localStorage) saklanır; başka bilgisayarda görünmez.
  Şifreler düz metin tutulur, gerçek şifreni kullanma.
- Vurma ve hasar oyuncunun tarayıcısında hesaplanır; hile yapmak mümkün. Arkadaşlar arası oyun için yeterli,
  herkese açık bir oyun için sunucunun hasarı doğrulaması gerekir.
- NPC'ler, trafik ve görevler her oyuncuda ayrı çalışır.
