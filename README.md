<div align="center">

**بسم الله الرحمن الرحيم**

</div>

---

# القرءان الكريم —  Kur'an-ı Kerim  Ezber Web Uygulaması

> Tarayıcıda çalışan, Kur'an-ı Kerim ezber web uygulaması.

🌐 **Canlı Demo:** [mustafakilic13.github.io/kuranikerim](https://mustafakilic13.github.io/kuranikerim/)

## ✨ Özellikler

### 📖 Metin ve Görüntüleme
- **Osmani Hattı (Uthmani)** ile tam Kur'an-ı Kerim metni — Scheherazade New fontu
- Ayetler **düz yazı** formatında, sağa-sola hizalı (justify)
- Sure başlıkları süslü çerçeve içinde, besmele ortalanmış
- **Ruku grubu** ayrımı — tek ve çift ruku ayet numaraları farklı renkte (yeşil / mor)
- Durak işaretleri:

	(**Durmak gerekir   م**)
	
	(**Geçmek gerekir   لا**)
	
	(**Durmak ve geçmek eşittir   ج**)
	
	(**Durmak tercih edilir   قلى**)
	
	(**Geçmek tercih edilir   صلى**)
	
	(**Kısa bir süre nefes almadan durulur ve okumaya devam edilir  س**)
	
	(**İkisinden birisinde durmak tercih edilebilir   ∴ ∴**)

### 🧭 Navigasyon
- **Sure, Sayfa, Cüz** modalları — aktif içerik otomatik vurgulanır ve ortaya kaydırılır
- Mobilde **parmakla kaydırarak** sayfa geçişi, masaüstünde **fare sürükleyerek**
- Son kaldığı sayfa `localStorage`'da hatırlanır

### 🔉 Ses / Dinle
- **Husary (Mucevved)** ve **Abdulbasit (Mecevved)** okuyucuları
- Seçili ayetten itibaren sıralı dinleme (**بسم الله الرحمن الرحيم** butonu)
- Sure, ayet aralığı, tekrar sayısı ile kişiselleştirilmiş dinleme (**Ezber → Dinle** modu)

### 📚 Meal ve Tefsir
- **Tefsîru's-Saʿdî** Türkçe meali — ayet numarasına tıklayınca açılır/kapanır
- **Kelime meali** — her kelimenin Türkçe karşılığı kart formatında
- **Tefsîru's-Saʿdî** Türkçe tefsiri — meal altında ayrı bölümde Tefsîru's-Saʿdî metnine tıklayınca açılır.

### 🔍 Arama
- **Arapça** arama → Kur'an metninde
- **Türkçe** arama → Meal + Tefsîru's-Saʿdî içinde aynı anda
- Eşleşen kelimeler sarı ile vurgulanır
- Sonuçlar 33'lü gruplar halinde, "Devamı…" ile kademeli yükleme
- Sonuçlarda kaynak etiketi: 📖 Kur'an-ı Kerim / 📗 Meal / 📝 Tefsir olarak belirtilir.

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
- Mobilde iki parmak ile metin büyütme/küçültme
- Ekran kapanma engeli (Wake Lock API)
- Responsive tasarım — tüm ekran boyutlarında kullanılabilir

---

## 🚀 Kurulum ve Kullanım

### Çevrimiçi Kullanım
[mustafakilic13.github.io/kuranikerim](https://mustafakilic13.github.io/kuranikerim/) adresini tarayıcınızda açın.

### Yerel Kullanım

1. Bu repository'yi indirin:
   ```bash
   git clone https://github.com/mustafakilic13/kuranikerim.git
   ```

3. modern bir tarayıcıda http://localhost:{port_numarası} adresini açın.

---

## 📡 Kaynaklar

| İçerik | Kaynak | Bağlantı |
|--------|--------|----------|
| Kur'an metni (Osmani Hattı) | Tanzil.net API | [tanzil.net](https://tanzil.net) |
| Sure bilgileri | Diyanet İşleri Başkanlığı - Kur'an Yolu Tefsiri | [diyanet.gov.tr](https://www.diyanet.gov.tr) |
| Ses dosyaları | EveryAyah | [everyayah.com](https://everyayah.com) |
| Kelime Meali | GTAF | [gtaf.org](https://gtaf.org) |
| Tefsîru's-Saʿdî (Türkçe) | islamenc.com | [islamenc.com](https://saadi.islamenc.com/tr/browse/tafsir/saadi/) |
| Arapça font | Scheherazade New | [sil.org](https://software.sil.org/scheherazade/) |
| İkonlar | Font Awesome | [fontawesome.com](https://fontawesome.com) |

---

## 🛠 Teknik Bilgiler

- **Teknoloji:** Vanilla JavaScript (ES6+), HTML5, CSS3 — framework kullanılmamıştır
- **Tek dosya:** Tüm uygulama mantığı ile html, css, JavaScript `index.html` içindedir
- **Çevrimdışı:** Kur'anı Kerim ses dosyaları için internet gerekir
- **Tarayıcı desteği:** Chrome, Firefox, Safari, Edge (güncel sürümler)

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

**وَمَا تَوْفِيقِىٓ إِلَّا بِٱللَّهِ**

</div>
