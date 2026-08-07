<div align="center">

**بسم الله الرحمن الرحيم**

</div>

---

# القرءان الكريم — Kur'an-ı Kerim Ezber Web Uygulaması

> Tarayıcıda çalışan, PWA destekli Kur'an-ı Kerim okuma ve ezber uygulaması.

🌐 **Canlı Demo:** [mustafakilic13.github.io/kuranikerim](https://mustafakilic13.github.io/kuranikerim/)

---

## ✨ Özellikler

### 📖 Metin ve Görüntüleme
- **Osmani Hattı (Uthmani)** ile tam Kur'an-ı Kerim metni — Scheherazade New fontu
- Ayetler sağa-sola hizalı (justify) düz yazı formatında
- Sure başlıkları süslü çerçeve içinde, besmele ortalanmış
- **Ruku grubu** ayrımı — tek ve çift ruku ayet numaraları farklı renkte (yeşil / mor)
- Durak işaretleri:

  (**Durmak gerekir   م**)
  (**Geçmek gerekir   لا**)
  (**Durmak ve geçmek eşittir   ج**)
  (**Durmak tercih edilir   قلى**)
  (**Geçmek tercih edilir   صلى**)
  (**Kısa bir süre nefes almadan durulur ve okumaya devam edilir   س**)
  (**İkisinden birisinde durmak tercih edilebilir   ∴ ∴**)

### 🧭 Navigasyon
- **Sure, Sayfa, Cüz** modalları — aktif içerik otomatik vurgulanır ve ortaya kaydırılır
- Sure başlığına tıklayınca **sure bilgi modalı** açılır (İniş yeri, Ayet sayısı, Mushaf/Nüzul sırası, Cüz, Hakkında, Nüzul, Konusu, Fazileti — akordion menü)
- Mobilde parmakla kaydırarak sayfa geçişi, masaüstünde fare sürükleyerek
- Son kaldığı sayfa `localStorage`'da hatırlanır

### 🔉 Ses / Dinle
- **Husary (Mucevved)** ve **Abdulbasit (Mucevved)** okuyucuları
- Seçili ayetten itibaren sıralı dinleme (**بسم الله الرحمن الرحيم** butonu)
- Sure, ayet aralığı, tekrar sayısı ile kişiselleştirilmiş dinleme (**Ezber → Dinle** modu)
- Dinlenen ses dosyaları cihaza kaydedilir — aynı ayet sonraki dinlemelerde **çevrimdışı** çalınır

### 📚 Meal ve Tefsir
- **Tefsîru's-Saʿdî meali** — ayet numarasına tıklayınca açılır/kapanır
- **Kelime meali** — her kelimenin Türkçe karşılığı kart formatında
- **Tefsîru's-Saʿdî tefsiri** — Arapça tefsir metni + Türkçe tercümesi

### 🔍 Arama
- **Arapça** arama → Kur'an metninde
- **Türkçe** arama → Sa'di meali + Sa'di tefsiri içinde eş zamanlı
- Eşleşen kelimeler sarı ile vurgulanır
- Sonuçlar 33'lü gruplar halinde, "Devamı…" ile kademeli yükleme
- Kaynak etiketi: 📖 Kur'an-ı Kerim / 📗 Meal / 📝 Tefsir

### 🧠 Ezber Modları

#### 🎧 Dinle Modu
Kümülatif tekrar yöntemiyle profesyonel ezber:
- Euzu → Besmele → Ayet × N kez → Besmele + Ayet tekrarı → Sonraki ayet...
- Ayet tekrar ve aynısını tekrar sayısı ayarlanabilir
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

### 📱 Mobil Uyum ve PWA
- **PWA desteği** — "Ana ekrana ekle" ile uygulama gibi kurulabilir
- **Çevrimdışı çalışma** — tüm Kur'an metni, meal, tefsir ve fontlar Service Worker ile cache'lenir
- Mobilde iki parmak ile metin büyütme/küçültme
- Ekran kapanma engeli (Wake Lock API)
- Responsive tasarım — tüm ekran boyutlarında kullanılabilir

---

## 🚀 Kurulum ve Kullanım

### Çevrimiçi Kullanım
[mustafakilic13.github.io/kuranikerim](https://mustafakilic13.github.io/kuranikerim/) adresini tarayıcınızda açın.

Mobilde **"Ana ekrana ekle"** seçeneği ile uygulamayı cihazınıza kurabilirsiniz. Kurulumdan sonra internet bağlantısı olmadan da kullanılabilir.

### Yerel Kullanım

1. Repository'yi indirin:
   ```bash
   git clone https://github.com/mustafakilic13/kuranikerim.git
   cd kuranikerim
   ```

2. Yerel bir sunucu başlatın (Service Worker için gerekli):
   ```bash
   python -m http.server 8000
   # veya
   npx serve .
   ```

3. Tarayıcınızda `http://localhost:8000` adresini açın.

---

## 📁 Dosya Yapısı

| Dosya | Açıklama | Boyut |
|-------|----------|-------|
| `quran-app.html` | Ana uygulama (HTML + CSS + JS) | ~107 KB |
| `quran-data-full.json` | Kur'an metni + sayfa/cüz/ruku verileri | ~3.5 MB |
| `meal.json` | Tefsîru's-Saʿdî Türkçe meali | ~950 KB |
| `tafsir.json` | Tefsîru's-Saʿdî tefsiri (Arapça + Türkçe) | ~11 MB |
| `words.json` | Kelime meali | ~1 MB |
| `sura_info.json` | Sure bilgileri (Diyanet) | ~206 KB |
| `sw.js` | Service Worker (PWA / offline) | — |
| `manifest.json` | PWA manifest | — |
| `ScheherazadeNew-*.woff2` | Arapça font (Regular/Medium/Bold) | ~400 KB |

---

## 📡 Kaynaklar

| İçerik | Kaynak | Bağlantı |
|--------|--------|----------|
| Kur'an metni (Osmani Hattı) | Tanzil.net | [tanzil.net](https://tanzil.net) |
| Sayfa / Cüz / Ruku verileri | Tanzil.net | [tanzil.net](https://tanzil.net) |
| Tefsîru's-Saʿdî (meal + tefsir) | islamenc.com | [saadi.islamenc.com](https://saadi.islamenc.com/tr/browse/tafsir/saadi/) |
| Sure bilgileri | Diyanet İşleri Başkanlığı | [kuran.diyanet.gov.tr](https://kuran.diyanet.gov.tr/Tefsir/) |
| Ses dosyaları | EveryAyah | [everyayah.com](https://everyayah.com) |
| Kelime meali | GTAF | [gtaf.org](https://gtaf.org) |
| Arapça font | Scheherazade New | [sil.org](https://software.sil.org/scheherazade/) |
| İkonlar | Font Awesome | [fontawesome.com](https://fontawesome.com) |
| Kod | Claude Sonnet 4.6 | [claude.ai](https://claude.ai) |

---

## 🛠 Teknik Bilgiler

- **Teknoloji:** Vanilla JavaScript (ES6+), HTML5, CSS3 — framework kullanılmamıştır
- **Mimari:** Tek HTML dosyası + ayrı JSON veri dosyaları
- **Offline:** Service Worker ile statik dosyalar ve ses dosyaları cache'lenir
- **Tarayıcı desteği:** Chrome, Firefox, Safari, Edge (modern sürümler)

---

## 🤝 Katkı

Hata bildirimi ve öneriler için [Issues](https://github.com/mustafakilic13/kuranikerim/issues) bölümünü kullanabilirsiniz.

---

## ⚖️ Lisans

Bu proje MIT lisansı ile dağıtılmaktadır. Kullanılan içeriklerin (meal, tefsir, ses dosyaları) kendi lisans koşullarına tabidir.

---

<div align="center">

**بسم الله الرحمن الرحيم**

*"Bu, kendisinde hiçbir şüphe bulunmayan, muttakiler için yol gösterici bir kitaptır."*
*(Bakara, 2:2)*

</div>

---

<div align="right">

**وَمَا تَوْفِيقِىٓ إِلَّا بِٱللَّهِ**

</div>
