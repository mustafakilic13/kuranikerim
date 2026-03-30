<div align="center">

**بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ**

</div>

---

# القرآن الكريم — Kur'an-ı Kerim Web Uygulaması

> Tarayıcıda çalışan, internet bağlantısı gerektiren, modern ve mobil uyumlu Kur'an-ı Kerim uygulaması.

🌐 **Canlı Demo:** [mustafakilic13.github.io/kuranikerim](https://mustafakilic13.github.io/kuranikerim/)

---

## 📋 İçindekiler

- [Özellikler](#özellikler)
- [Ekran Görüntüleri](#ekran-görüntüleri)
- [Kurulum ve Kullanım](#kurulum-ve-kullanım)
- [Dosya Yapısı](#dosya-yapısı)
- [Kaynaklar](#kaynaklar)
- [Teknik Bilgiler](#teknik-bilgiler)
- [Lisans](#lisans)

---

## ✨ Özellikler

### 📖 Metin ve Görüntüleme
- **Osmani Hattı (Uthmani)** ile tam Kur'an-ı Kerim metni — Scheherazade New fontu
- Ayetler **düz yazı** formatında, sağa-sola hizalı (justify)
- Sure başlıkları süslü çerçeve içinde, besmele ortalanmış
- **Ruku grubu** ayrımı — tek ve çift ruku ayet numaraları farklı renkte (yeşil / mor)
- U+06DF tilavet işaretleri görsel olarak ayırt edilmiş

### 🧭 Navigasyon
- **Sure, Sayfa, Cüz** modalları — aktif içerik otomatik vurgulanır ve ortaya kaydırılır
- Mobilde **parmakla kaydırarak** sayfa geçişi, masaüstünde **fare sürükleyerek**
- Son kaldığı sayfa `localStorage`'da hatırlanır
- Sure modalında Türkçe/Arapça arama filtresi

### 🔉 Ses / Dinle
- **Husary (Mücevved)** ve **Abdulbasit (Mücevved)** okuyucuları
- Seçili ayetten itibaren sıralı dinleme (**بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ** butonu)
- Sure, ayet aralığı, tekrar sayısı ile kişiselleştirilmiş dinleme (**Ezber → Dinle** modu)
- Her surenin başında euzu ve besmele otomatik çalınır

### 📚 Meal ve Tefsir
- **Diyanet İşleri** Türkçe meali — ayet numarasına tıklayınca açılır/kapanır
- **Kelime meali** — her kelimenin Türkçe karşılığı kart formatında
- **Tefsîrü's-Saʿdî** Türkçe tefsiri — meal altında ayrı bölümde

### 🔍 Arama
- **Arapça** arama → Kur'an metninde
- **Türkçe** arama → Meal (Diyanet) + Tefsîrü's-Saʿdî içinde aynı anda
- Eşleşen kelimeler sarı ile vurgulanır
- Sonuçlar 33'lü gruplar halinde, "Devamı…" ile kademeli yükleme
- Sonuçlarda kaynak etiketi: 📖 Kur'an-ı Kerim / 📗 Meal / 📝 Tefsir

### 🧠 Ezber Modları

#### 🎧 Dinle Modu
Kümülatif tekrar yöntemiyle profesyonel ezber:
- Euzu → Besmele → Ayet × N kez → Besmele + Ayet tekrarı → Sonraki ayet...
- **Ayet Tekrar** ve **Aynısını Tekrar** sayısı ayarlanabilir
- Ayet aralığı seçimi, okuyucu seçimi

#### 👁 Oku Modu
- Seçilen ayet aralığı bulanık gösterilir
- Her tıklamada bir kelime netleşir
- Son kelime netleşince ayet okunur, sıradaki ayete geçilir
- Kelime netleşirken üstünde Türkçe anlamı görünür

#### ✍️ Yaz Modu
- Seçilen ayet aralığı bulanık gösterilir
- **Arapça sanal klavye** ile harf harf yazılır
- Doğru harfe basınca o harf netleşir, yanlışta hiçbir şey olmaz
- **💡 İpucu** tuşu ile kelimenin Türkçe anlamı gösterilebilir
- Tüm harfler netleşince ayet okunur

### 📱 Mobil Uyum
- Mobilde pinch-to-zoom ile metin büyütme/küçültme
- Ekran kapanma engeli (Wake Lock API)
- Responsive tasarım — tüm ekran boyutlarında kullanılabilir

---

## 📱 Ekran Görüntüleri

*Ekran görüntüleri eklenecek*

---

## 🚀 Kurulum ve Kullanım

### Çevrimiçi Kullanım
[mustafakilic13.github.io/kuranikerim](https://mustafakilic13.github.io/kuranikerim/) adresini tarayıcınızda açın.

### Yerel Kullanım

1. Bu repository'yi indirin:
   ```bash
   git clone https://github.com/mustafakilic13/kuranikerim.git
   ```

2. Klasörü açın — üç dosya birlikte olmalı:
   ```
   index.html
   words.json
   tafsir.json
   ```

3. `index.html` dosyasını modern bir tarayıcıda açın.

> ⚠️ **Not:** Kelime meali (`words.json`) ve tefsir (`tafsir.json`) dosyalarının `index.html` ile **aynı klasörde** olması gerekir. Uygulama internet bağlantısı gerektirir (Kur'an metni ve ses dosyaları API üzerinden yüklenir).

---

## 📁 Dosya Yapısı

```
kuranikerim/
├── index.html    # Ana uygulama (tek HTML dosyası)
├── words.json        # Kelime meali veritabanı (~1 MB)
├── tafsir.json       # Tefsîrü's-Saʿdî veritabanı (~7 MB)
└── README.md
```

---

## 📡 Kaynaklar

| İçerik | Kaynak | Bağlantı |
|--------|--------|----------|
| Kur'an metni (Osmani Hattı) | AlQuran Cloud API | [alquran.cloud](https://alquran.cloud) |
| Türkçe Meal | Diyanet İşleri Başkanlığı | [diyanet.gov.tr](https://www.diyanet.gov.tr) |
| Ses dosyaları | EveryAyah | [everyayah.com](https://everyayah.com) |
| Kelime Meali | GTAF | [gtaf.org](https://gtaf.org) |
| Tefsîrü's-Saʿdî (Türkçe) | GTAF | [gtaf.org](https://gtaf.org) |
| Arapça font | Scheherazade New | [fonts.google.com](https://fonts.google.com/specimen/Scheherazade+New) |
| İkonlar | Font Awesome | [fontawesome.com](https://fontawesome.com) |

---

## 🛠 Teknik Bilgiler

- **Teknoloji:** Vanilla JavaScript (ES6+), HTML5, CSS3 — framework kullanılmamıştır
- **Tek dosya:** Tüm uygulama mantığı `quran-app.html` içindedir
- **API:** [AlQuran Cloud](https://alquran.cloud/api) — ücretsiz, açık kaynak
- **Ses:** [EveryAyah.com](https://everyayah.com) CDN
- **Çevrimdışı:** Kur'an metni ve ses dosyaları internet gerektirir; kelime meali ve tefsir yerel JSON dosyalarından yüklenir
- **Tarayıcı desteği:** Chrome, Firefox, Safari, Edge (modern sürümler)

### Kullanılan API Endpointleri
```
https://api.alquran.cloud/v1/quran/quran-uthmani     # Kur'an metni
https://api.alquran.cloud/v1/quran/tr.diyanet         # Türkçe meal
https://api.alquran.cloud/v1/search/{q}/all/{edition} # Arama
https://everyayah.com/data/{okuyucu}/{sure}{ayet}.mp3 # Ses
```

---

## 🤝 Katkı

Hata bildirimi ve öneriler için [Issues](https://github.com/mustafakilic13/kuranikerim/issues) bölümünü kullanabilirsiniz.

---

## ⚖️ Lisans

Bu proje MIT lisansı ile dağıtılmaktadır. Kullanılan içeriklerin (meal, tefsir, ses dosyaları) kendi lisans koşullarına tabidir.

---

<div align="center">

**بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ**

*"Bu, kendisinde hiçbir şüphe bulunmayan, muttakiler için yol gösterici bir kitaptır."*
*(Bakara, 2:2)*

</div>

---

<div align="right">

**وَمَا تَوْفِيقِىٓ إِلَّا بِٱللَّهِ**

</div>
