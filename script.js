let currentPage = 1;
let currentJuz = 1;
let currentSurah = 1;
let selectedVerse = null;
let touchStartX = 0;
let currentMealElement = null;
let isSearching = false;
let currentSequentialRange = null;
let tefsirData = null;
let kelimeMealData = null;

// Yardımcı Fonksiyonlar
const toArabicNumbers = (num) => [...num.toString()].map(d => '٠١٢٣٤٥٦٧٨٩'[d]).join('');

function getBaseUrl(reader) {
  switch (reader) {
    case 'AbdussamedMucevved':
      return 'Abdul_Basit_Mujawwad_128kbps';
      case 'AbdussamedMurattal':
      return 'Abdul_Basit_Murattal_192kbps';
    case 'HusariMurattal':
      return 'Husary_128kbps';
    default:
      return 'Husary_128kbps_Mujawwad';
  }
}


const saveState = () => {
    localStorage.setItem('lastPage', currentPage);
    localStorage.setItem('lastJuz', currentJuz);
    localStorage.setItem('lastSurah', currentSurah);
};

const loadState = () => {
    currentPage = parseInt(localStorage.getItem('lastPage')) || 1;
    currentJuz = parseInt(localStorage.getItem('lastJuz')) || 1;
    currentSurah = parseInt(localStorage.getItem('lastSurah')) || 1;
};

// API İşlemleri
const fetchPage = async (pageNumber) => {
    try {
        const response = await fetch(`https://api.alquran.cloud/v1/page/${pageNumber}/ar.husarymujawwad`);
        return await response.json();
    } catch (error) {
        console.error('Sayfa yüklenirken hata oluştu:', error);
        return null;
    }
};

const fetchJuz = async (juzNumber) => {
    try {
        const response = await fetch(`https://api.alquran.cloud/v1/juz/${juzNumber}/ar.husarymujawwad`);
        return await response.json();
    } catch (error) {
        console.error('Cüz yüklenirken hata oluştu:', error);
        return null;
    }
};

const fetchSurah = async (surahNumber) => {
    try {
        const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.husarymujawwad`);
        return await response.json();
    } catch (error) {
        console.error('Sure yüklenirken hata oluştu:', error);
        return null;
    }
};

const BASE_PAGES_URL = "https://raw.githubusercontent.com/mustafakilic13/kuranikerim/main/";

const fetchMeal = async (surahNumber, ayahNumber) => {
    try {
        if (!window.mealData || !Array.isArray(window.mealData)) {
            console.log('Meal verisi bulunamadı, yeniden yükleniyor...');
            
            const response = await fetch(`${BASE_PAGES_URL}mealmuhtasar.json`);
            
            if (!response.ok) {
                throw new Error(`Sunucu hatası: ${response.status} ${response.statusText}`);
            }
            
            const hamVeri = await response.json();
            
            if (!Array.isArray(hamVeri)) {
                throw new Error('Hatalı veri formatı: JSON dizisi bekleniyordu');
            }
            
            window.mealData = hamVeri;
        }
        
        const bulunanMeal = window.mealData.find(item => 
            Number(item.c0sura) === Number(surahNumber) &&
            Number(item.c1ayah) === Number(ayahNumber)
        );
        
        return bulunanMeal?.c2text || 'Bu ayet için meal bulunamadı';
        
    } catch (hata) {
        console.error('Meal yüklenirken kritik hata:', hata);
        window.mealData = null;
        return `Meal gösterilemiyor: ${hata.message}`;
    }
};

const fetchWordMeal = async (surahNumber, ayahNumber) => {
    try {
        if (!window.wordMealData) {
            const response = await fetch(`${BASE_PAGES_URL}mealkelime.json`);
            window.wordMealData = await response.json();
        }

        const localWords = window.wordMealData
            .filter(item => 
                Number(item.sura) === Number(surahNumber) &&
                Number(item.ayah) === Number(ayahNumber)
            )
            .sort((a, b) => a.word - b.word);

        const kelimeler = await Promise.all(
            localWords.map(async word => ({
                arabic: await getArabicWord(word.sura, word.ayah, word.word),
                translation_tr: word.tr
            }))
        );
        
        return kelimeler;

    } catch (hata) {
        console.error('Kelime meali hatası:', hata);
        return null;
    }
};


const fetchTafsir = async (surahNumber, ayahNumber) => {
    try {
        if (!tefsirData) {
            const response = await fetch(`${BASE_PAGES_URL}tefsirsaidi.json`);
            tefsirData = await response.json();
        }

        const bulunanTefsir = tefsirData.find(item => 
            Number(item.c0sura) === Number(surahNumber) &&
            Number(item.c1ayah) === Number(ayahNumber)
        );

        if (bulunanTefsir?.c2text) {
            return bulunanTefsir.c2text
                .replace(/\n/g, '<br>')
                .replace(/(\d+\.)/g, '<strong>$1</strong>');
        }
        return 'تفسير غير متوفر لهذه الآية';
    } catch (hata) {
        console.error('Tefsir hatası:', hata);
        return 'حدث خطأ أثناء تحميل التفسير';
    }
};


const renderPage = (pageData) => {
    if (!pageData || !pageData.ayahs || pageData.ayahs.length === 0) {
        console.error('Invalid page data');
        return;
    }

    const ayahs = pageData.ayahs;
    const juz = ayahs[0]?.juz || 1;
    currentJuz = juz;
    saveState();

    document.getElementById('juz-number').textContent = toArabicNumbers(juz);
    document.getElementById('page-number').textContent = toArabicNumbers(pageData.number);
    document.getElementById('surah-name').textContent = ayahs[0].surah.name;

    const excludedSurahs = [1, 9];
    const besmeleType1Regex = /بِّسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ/g;
    const besmeleType2Regex = /بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ/g;

    let quranText = '';

    ayahs.forEach((ayah, index) => {
        const isFirstInSurah = ayah.numberInSurah === 1;
        const surahNumber = ayah.surah.number;
        let ayahText = ayah.text;
        
        /* -------------------------------------------------
         * 2:72 ayetindeki yazımı düzeltelim
         * ------------------------------------------------- */
        if (surahNumber === 2 && ayah.numberInSurah === 72) {
            // Tam eşleşme; hatalı karakterler tam aynı biçimde
            // (Unicode karakterlerinden biri ‑‐ farklı olduğu için
            //  doğrudan replace yeterli olacaktır)
            ayahText = ayahText.replace(
                'فَٱدَّٰرَْٰٔتُمْ',
                'فٱدَّٰرَأْتُمْ'
            );
        }

        // Determine ruku color
        const rukuNumber = ayah.ruku;
        const colorIndex = (rukuNumber - 1) % 2;
        const rukuColor = colorIndex === 0 ? '#2ecc71' : '#999eee';

        if (isFirstInSurah) {
            quranText += `
                <h3 style="text-align: center; color: green; border: 1px solid green; padding: 33px; margin: 33px 0;">
                    ${ayah.surah.name}
                </h3>
            `;
            if (excludedSurahs.includes(surahNumber)) {
                // No action for excluded surahs
            } else if ([95, 97].includes(surahNumber)) {
                ayahText = ayahText.replace(besmeleType1Regex, '').trim();
                quranText += `
                    <div class="besmele type1">
                        بِّسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                    </div>
                `;
            } else {
                ayahText = ayahText.replace(besmeleType2Regex, '').trim();
                quranText += `
                    <div class="besmele type2">
                        بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                    </div>
                `;
            }
        }

        const isFirst = index === 0;
        quranText += `
    <span class="verse${isFirst ? ' selected' : ''}" 
         data-surah="${surahNumber}"
         data-ayah="${ayah.numberInSurah}"
         data-surah-name="${ayah.surah.name}" 
         onclick="handleVerseClick(this, ${surahNumber}, ${ayah.numberInSurah})">
        <span class="verse-text">${ayahText.split(' ').map(word => `<span class="word">${word}</span>`).join(' ')}</span><span class="verse-number" onclick="handleVerseNumberClick(event, ${surahNumber}, ${ayah.numberInSurah})" style="color: ${rukuColor}">
            {${toArabicNumbers(ayah.numberInSurah)}}
        </span>
    </span>
    `;
    });

    document.getElementById('quran-text').innerHTML = quranText;

    if(ayahs.length > 0) {
        selectedVerse = document.querySelector('.verse');
    }
    
    currentSurah = pageData.ayahs[0].surah.number;
    applyBlurEffect();
};

function applyBlurEffect() {
    if (!currentSequentialRange) return;

    document.querySelectorAll('.verse').forEach(ayet => {
        const ayetSurah = parseInt(ayet.getAttribute('data-surah'));
        const ayetAyah = parseInt(ayet.getAttribute('data-ayah'));
        
        const inRange = (
            ayetSurah >= currentSequentialRange.startSurah && 
            ayetSurah <= currentSequentialRange.endSurah && 
            (ayetSurah !== currentSequentialRange.startSurah || 
             ayetAyah >= currentSequentialRange.startAyah) &&
            (ayetSurah !== currentSequentialRange.endSurah || 
             ayetAyah <= currentSequentialRange.endAyah)
        );

        ayet.classList.toggle('bulanikMetin', inRange);
        
        if(inRange) {
            ayet.dataset.revealIndex = ayet.dataset.revealIndex || 0;
            ayet.querySelectorAll('.word').forEach((word, index) => {
                word.classList.toggle('revealed', index < ayet.dataset.revealIndex);
            });
        }
    });
}

const handleVerseClick = (element, surahNumber, ayahNumber) => {
    currentSurah = surahNumber; // Mevcut surah'ı güncelle

    if(selectedVerse) selectedVerse.classList.remove('selected');
    element.classList.add('selected');
    selectedVerse = element;
    currentSurah = surahNumber;
    
    const surahName = element.getAttribute('data-surah-name');
    document.getElementById('surah-name').textContent = surahName; 
    
    saveState();
    highlightSurah(currentSurah);
};

const ayetKelimeCache = {};

const getArabicWord = async (surahNo, ayahNo, kelimeNo) => {
    const cacheKey = `${surahNo}:${ayahNo}`;
    try {
        if (!ayetKelimeCache[cacheKey]) {
            const response = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNo}:${ayahNo}/quran-wordbyword-2`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            ayetKelimeCache[cacheKey] = JSON.parse(data.data.text);
        }
        const kelime = ayetKelimeCache[cacheKey].find(w => w.word_number_in_ayah === kelimeNo);
        return kelime?.word_arabic || '???';
    } catch (error) {
        console.error(`Hata: ${cacheKey}`, error);
        delete ayetKelimeCache[cacheKey];
        return '';
    }
};

const toggleTafsir = async (surahNumber, ayahNumber, buttonElement) => {
    const mealContainer = buttonElement.closest('.meal-container');
    const existingTafsir = mealContainer.nextElementSibling;

    if (existingTafsir?.classList.contains('tafsir-container')) {
        existingTafsir.remove();
    } else {
        const tafsirText = await fetchTafsir(surahNumber, ayahNumber);
        const tafsirDiv = document.createElement('div');
        tafsirDiv.className = 'tafsir-container';
        tafsirDiv.innerHTML = `
            <div class="tafsir-content">
                ${tafsirText}
            </div>
        `;
        mealContainer.parentNode.insertBefore(tafsirDiv, mealContainer.nextSibling);
    }
};

const handleVerseNumberClick = async (event, surahNumber, ayahNumber) => {
    event.stopPropagation();
    
    const verseElement = event.target.closest('.verse');
    const nextSibling = verseElement.nextElementSibling;
    
    // Tıklanan ayetin zaten açık olup olmadığını kontrol et
    let hasExistingContent = false;
    if (nextSibling && (
        nextSibling.classList.contains('meal-container') || 
        nextSibling.classList.contains('word-meal-container') ||
        nextSibling.classList.contains('tafsir-container')
    )) {
        hasExistingContent = true;
    }

    // Tüm açık meal ve tefsirleri kapat
    document.querySelectorAll('.meal-container, .word-meal-container, .tafsir-container').forEach(container => {
        container.remove();
    });

    // Eğer zaten açıksa ve aynı ayetse, sadece kapat ve çık
    if (hasExistingContent) {
        return;
    }

    // Yeni meal ve tefsirleri yükle
    try {
        const [meal, wordMeal] = await Promise.all([
            fetchMeal(surahNumber, ayahNumber),
            fetchWordMeal(surahNumber, ayahNumber)
        ]);

        if (meal) {
            const mealContainer = document.createElement('div');
            mealContainer.className = 'meal-container';
            mealContainer.innerHTML = `
                <div class="meal-content">
                    <span class="meal-number">${ayahNumber}.</span>
                    ${meal} <br>
                    <center>
                        <button class="tafsir-btn" 
                                onclick="toggleTafsir(${surahNumber}, ${ayahNumber}, this)">
                            تفسير السعدي
                        </button>
                    </center>
                </div>
            `;
            verseElement.parentNode.insertBefore(mealContainer, verseElement.nextSibling);
        }

        if (wordMeal) {
            const wordMealContainer = document.createElement('div');
            wordMealContainer.className = 'word-meal-container';
            const wordsHTML = wordMeal.map(word => `
                <div class="word-item">
                    <span class="arabic-word">${word.arabic}</span>
                    <span class="translation">${word.translation_tr}</span>
                </div>
            `).join('');
            wordMealContainer.innerHTML = `
                <div class="word-meal-content">
                    <div class="words-grid">${wordsHTML}</div>
                </div>
            `;
            verseElement.parentNode.insertBefore(wordMealContainer, verseElement.nextSibling);
        }
    } catch (error) {
        console.error('Meal yüklenirken hata:', error);
    }
};

const navigateToPage = async (pageNumber) => {
    const pageData = await fetchPage(pageNumber);
    if (pageData) {
        currentPage = pageNumber;
        renderPage(pageData.data);
        saveState();
        
        // Mevcut surah'ın bu sayfada olup olmadığını kontrol et
        const surahOnPage = pageData.data.ayahs.some(a => a.surah.number === currentSurah);
        if (!surahOnPage) {
            currentSurah = pageData.data.ayahs[0].surah.number;
        }
        
        // Yaz modu aktifse bulanık ayetleri yeniden uygula
        if (writeModeActive) {
            // Kısa bir gecikmeyle uygula (DOM'un render edilmesi için)
            setTimeout(() => {
                // Bulanık ayetleri yeniden bulanıklaştır
                blurredVerses.forEach(verseKey => {
                    const [surah, ayah] = verseKey.split(':');
                    const verseEl = document.querySelector(`.verse[data-surah="${surah}"][data-ayah="${ayah}"]`);
                    if (verseEl) {
                        verseEl.classList.add('write-blur');
                        
                        // Kelimeleri karakterlere böl
                        verseEl.querySelectorAll('.word').forEach(word => {
                        	if (word.dataset.original) {
                                word.innerHTML = word.dataset.original;
                                word.dataset.original = '';
                            }
                        });
                    }
                });
                
                // Tüm bitmemiş ayetleri bulanıklaştır
                applyWriteBlur();
                // Geçerli ayete scroll et
                scrollToCurrentVerse();
            }, 100);
        }
        
        const firstAyah = pageData.data.ayahs[0].numberInSurah;
        const surahNumber = pageData.data.ayahs[0].surah.number;
        const ayahElement = document.querySelector(`.verse[data-surah="${surahNumber}"][data-ayah="${firstAyah}"]`);
        if (ayahElement) {
            handleVerseClick(ayahElement, surahNumber, firstAyah);
            ayahElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        highlightPage(currentPage);
        highlightJuz(currentJuz);
        const surahName = pageData.data.ayahs[0].surah.name;
        document.getElementById('surah-name').textContent = surahName;
    }
    
    // Sayfa render edildikten sonra efektleri uygula
    setTimeout(applyBlurEffect, 100);
    
};

const navigateToJuz = async (juzNumber) => {
    const juzData = await fetchJuz(juzNumber);
    if (juzData) {
        const firstPage = juzData.data.ayahs[0].page;
        currentJuz = juzNumber;
        await navigateToPage(firstPage);
        
        const firstAyah = juzData.data.ayahs[0].numberInSurah;
        const surahNumber = juzData.data.ayahs[0].surah.number;
        const ayahElement = document.querySelector(`.verse[data-surah="${surahNumber}"][data-ayah="${firstAyah}"]`);
        if (ayahElement) {
            handleVerseClick(ayahElement, surahNumber, firstAyah);
            ayahElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        highlightJuz(currentJuz);
    }
};

const navigateToSurah = async (surahNumber) => {
    const surahData = await fetchSurah(surahNumber);
    if (surahData) {
        const firstPage = surahData.data.ayahs[0].page;
        currentSurah = surahNumber;
        await navigateToPage(firstPage);
        highlightSurah(currentSurah); 
        
        const firstAyah = surahData.data.ayahs[0].numberInSurah;
        const ayahElement = document.querySelector(`.verse[data-surah="${surahNumber}"][data-ayah="${firstAyah}"]`);
        if (ayahElement) {
            handleVerseClick(ayahElement, surahNumber, firstAyah);
            ayahElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
};        

document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', e => {
    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    const diffX = touchStartX - touchEndX; 
    const diffY = touchStartY - touchEndY;
    const swipeThreshold = 50;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
        if (diffX < 0) {
            if (currentPage < 604) {
                navigateToPage(currentPage + 1);
            } else {
                navigateToPage(1);
            }
        } else {
            if (currentPage > 1) {
                navigateToPage(currentPage - 1);
            } else {
                navigateToPage(604);
            }
        }
    }
});

const autoscrollModal = (listId, containerId) => {
    const list = document.getElementById(listId);
    const container = document.getElementById(containerId);
    const activeItem = list.querySelector('li[style*="background-color"]');
    
    if (activeItem) {
        activeItem.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
};

const setupModals = () => {
    // Juz(selector) Modal
    document.getElementById('juz-selector').addEventListener('click', async () => {
        const modal = document.getElementById('juz-modal');
        if (!modal.querySelector('li')) {
            const juzList = Array.from({length: 30}, (_, i) => i + 1);
            modal.querySelector('ul').innerHTML = juzList.map(juz => 
                `<li onclick="navigateToJuz(${juz}); closeModal(); highlightJuz(${juz});">${toArabicNumbers(juz)}</li>`
            ).join('');
        }
        highlightJuz(currentJuz);
        showModal('juz-modal');
        // Otomatik kaydırmayı başlat
        setTimeout(() => {
            autoscrollModal('juz-list', 'juz-modal');
        }, 100);
    });

    // Page-selector Modal
    document.getElementById('page-selector').addEventListener('click', async () => {
        const modal = document.getElementById('page-modal');
        if (!modal.querySelector('li')) {
            const pageList = Array.from({length: 604}, (_, i) => i + 1);
            modal.querySelector('ul').innerHTML = pageList.map(page => 
                `<li onclick="navigateToPage(${page}); closeModal(); highlightPage(${page});">${toArabicNumbers(page)}</li>`
            ).join('');
        }
        highlightPage(currentPage);
        showModal('page-modal');
        // Otomatik kaydırmayı başlat
        setTimeout(() => {
            autoscrollModal('page-list', 'page-modal');
        }, 100);
    });
    
    // Surah-selector Modal
    document.getElementById('surah-name').addEventListener('click', async () => {
        const modal = document.getElementById('surah-modal');
        if (!modal.querySelector('li')) {
            const response = await fetch('https://api.alquran.cloud/v1/surah');
            const data = await response.json();
            modal.querySelector('ul').innerHTML = data.data.map(surah => 
                `<li data-surah-number="${surah.number}" 
                     onclick="navigateToSurah(${surah.number}); closeModal(); highlightSurah(${surah.number});">
                    ${surah.name} (${toArabicNumbers(surah.number)})
                </li>`
            ).join('');
        }
        highlightSurah(currentSurah);
        showModal('surah-modal');
        // Otomatik kaydırmayı başlat
        setTimeout(() => {
            autoscrollModal('surah-list', 'surah-modal');
        }, 100);
    });
};


const highlightJuz = (juzNumber) => {
    const modalItems = document.querySelectorAll('#juz-list li');
    modalItems.forEach(item => {
        if (item.textContent === toArabicNumbers(juzNumber)) {
            item.style.backgroundColor = '#f0f0f0';
        } else {
            item.style.backgroundColor = '';
        }
    });
};

const highlightPage = (pageNumber) => {
    const modalItems = document.querySelectorAll('#page-list li');
    modalItems.forEach(item => {
        if (item.textContent === toArabicNumbers(pageNumber)) {
            item.style.backgroundColor = '#f0f0f0';
        } else {
            item.style.backgroundColor = '';
        }
    });
};

const highlightSurah = (surahNumber) => {
    const modalItems = document.querySelectorAll('#surah-list li');
    modalItems.forEach(item => {
        item.style.backgroundColor = '';
        const itemSurahNumber = item.getAttribute('data-surah-number');
        if (itemSurahNumber === surahNumber.toString()) {
            item.style.backgroundColor = '#f0f0f0';
        }
    });
};

const highlightSearchResult = (text, keyword) => {
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
};

const searchKeyword = async () => {
    if (isSearching) return;
    isSearching = true;

    const keyword = document.getElementById('search-input').value.trim();
    if (!keyword) {
        alert("Lütfen arama kelimesi girin!");
        isSearching = false;
        return;
    }

    const resultsList = document.getElementById('search-results-list');
    const countDisplay = document.getElementById('search-count');
    resultsList.innerHTML = '';
    countDisplay.textContent = 'Aranıyor...';

    try {
        const isArabic = /^[\u0600-\u06FF]+$/.test(keyword);
        let results = [];

        if (isArabic) {
            const response = await fetch(`https://api.alquran.cloud/v1/search/${keyword}/all/quran-uthmani`);
            const data = await response.json();
            results = data.data?.matches || [];
        } else {
            if (!window.mealData) {
    const response = await fetch(`${BASE_PAGES_URL}mealmuhtasar.json`);
    window.mealData = await response.json();
}

if (!tefsirData) {
    const response = await fetch(`${BASE_PAGES_URL}tefsirsaidi.json`);
    tefsirData = await response.json();
}


            const mealResults = window.mealData.filter(item => 
                item.c2text.toLowerCase().includes(keyword.toLowerCase())
            );

            const tafsirResults = tefsirData.filter(item => 
                item.c2text.toLowerCase().includes(keyword.toLowerCase())
            );

            results = [
                ...mealResults.map(item => ({
                    type: 'meal',
                    sura: item.c0sura,
                    ayah: item.c1ayah,
                    text: item.c2text
                })),
                ...tafsirResults.map(item => ({
                    type: 'tefsir',
                    sura: item.c0sura,
                    ayah: item.c1ayah,
                    text: item.c2text
                }))
            ];
        }

        if (results.length > 0) {
            countDisplay.textContent = `Sonuç Sayısı: ${results.length}`;

            for (const result of results) {
                const listItem = document.createElement('li');
                let sourceText = '';
                let ayahInfo = '';

                if (isArabic) {
                    sourceText = 'Kuran-ı Kerim';
                    ayahInfo = `(${result.surah.name} - Ayet ${result.numberInSurah})`;
                } else {
                    sourceText = result.type === 'meal' ? 
                        'Muhtasar Meal' :
                        'Saidi Tefsiri';
                    const surahName = surahList.find(s => s.number === result.sura)?.name || result.sura;
                    ayahInfo = `(${toArabicNumbers(result.sura)} ${surahName} - الآية ${toArabicNumbers(result.ayah)})`;
}

                listItem.innerHTML = `
                    <div class="result-content">
                        <div class="result-text">${highlightSearchResult(result.text, keyword)}</div>
                        <div class="result-info">
                            <span class="source">${sourceText}</span>
                            <span class="ayah">${ayahInfo}</span>
                        </div>
                    </div>
                `;

                listItem.onclick = async () => {
                    closeModal();
                    let suraNumber, ayahNumber;

                    if (isArabic) {
                        suraNumber = result.surah.number;
                        ayahNumber = result.numberInSurah;
                    } else {
                        suraNumber = result.sura;
                        ayahNumber = result.ayah;
                    }

                    try {
                        const pageResponse = await fetch(`https://api.alquran.cloud/v1/ayah/${suraNumber}:${ayahNumber}/ar.husarymujawwad`);
                        const pageData = await pageResponse.json();
                        
                        if (!pageData || !pageData.data) {
                            throw new Error('Invalid ayah data');
                        }

                        const pageNumber = pageData.data.page;
                        await navigateToPage(pageNumber);

                        setTimeout(() => {
                            const ayahElement = document.querySelector(`.verse[data-surah="${suraNumber}"][data-ayah="${ayahNumber}"]`);
                            if (ayahElement) {
                                if (selectedVerse) selectedVerse.classList.remove('selected');
                                ayahElement.classList.add('selected');
                                selectedVerse = ayahElement;
                                ayahElement.scrollIntoView({ 
                                    behavior: 'smooth', 
                                    block: 'center',
                                    inline: 'center'
                                });
                            }
                        }, 500);
                    } catch (error) {
                        console.error('Navigation error:', error);
                        alert('Ayah could not be loaded.');
                    }
                };

                resultsList.appendChild(listItem);
            } // for döngüsü kapanışı
        } else {
            countDisplay.textContent = 'Sonuç bulunamadı.';
        }
    } catch (error) {
        console.error('Arama hatası:', error);
        countDisplay.textContent = 'Arama sırasında hata oluştu';
    } finally {
        isSearching = false;
        showModal('search-results-modal');
    }
}; // searchKeyword fonksiyonu kapanışı


// Tek event listener ile yönetim
document.getElementById('search-btn').addEventListener('click', function(e) {
    e.stopPropagation();
    const searchInput = document.getElementById('search-input');
    
    if (!searchInput.classList.contains('visible')) {
        searchInput.classList.add('visible');
        searchInput.focus();
        return;
    }
    
    searchKeyword();
});

let revealState = {};

// Input dışına tıklama kontrolü
document.addEventListener('click', async function(e) {
    // Kelime elementine tıklanırsa, verse elementini bul
    const wordElement = e.target.closest('.word');
    const verse = wordElement ? wordElement.closest('.verse.bulanikMetin') : e.target.closest('.verse.bulanikMetin');
    
    if (verse) {
        const words = verse.querySelectorAll('.word');
        let currentIndex = parseInt(verse.dataset.revealIndex) || 0;
        
        if (currentIndex < words.length) {
            // Mevcut kelimeyi aç
            words[currentIndex].classList.add('revealed');
            verse.dataset.revealIndex = currentIndex + 1;
            
            // Scroll işlemi
            const wordRect = words[currentIndex].getBoundingClientRect();
            window.scrollTo({
                top: window.scrollY + wordRect.top - window.innerHeight / 2,
                behavior: 'smooth'
            });

            // Son kelime açıldığında ses çal ve sonraki ayete geç
            if (currentIndex + 1 === words.length) {
                const surah = verse.dataset.surah.padStart(3, '0');
                const ayah = verse.dataset.ayah.padStart(3, '0');
                const reader = document.getElementById('readerSequential').value;
                const baseUrl = `https://www.everyayah.com/data/${getBaseUrl(reader)}`;
                
                const audio = new Audio(`${baseUrl}/${surah}${ayah}.mp3`);
                await audio.play();
                
                const nextVerse = verse.nextElementSibling;
                if (nextVerse && nextVerse.classList.contains('verse')) {
                    nextVerse.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }
    }

    // Arama kutusunu kapatma mantığı
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    if (!searchInput.contains(e.target) && !searchBtn.contains(e.target)) {
        searchInput.classList.remove('visible');
    }
});


// Input için enter tuşu desteği
document.getElementById('search-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchKeyword();
    }
});

const closeModal = () => {
    document.getElementById('modal-container').style.display = 'none';
};

const showModal = (modalId) => {
    document.getElementById('modal-container').style.display = 'block';
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
    document.getElementById(modalId).style.display = 'block';
};

// Başlangıç Yüklemeleri
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    setupModals();
    navigateToPage(currentPage);
    initVirtualKeyboard();
});

document.getElementById('modal-container').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-container')) {
        closeModal();
    }
});

let audioPlayer = null; // Ses çalar
let isPlaying = false; // Oynatma durumu
let currentAyahIndex = 0; // Şu anki ayet indeksi
let ayahsToPlay = []; // Oynatılacak ayetler

const playNextAyah = async () => {
    if (currentAyahIndex < ayahsToPlay.length) {
        const currentAyah = ayahsToPlay[currentAyahIndex];
        
        if (currentAyah && currentAyah.audio && currentAyah.numberInSurah) { 
            const audioUrl = currentAyah.audio; 
            const pageNumber = currentAyah.page; // Ayet sayfa numarasını al

           // Eğer bu surenin ilk ayeti ise ve sura 1 veya 9 değilse besmeleyi çal
if (currentAyah.numberInSurah === 1 && currentSurah !== 1 && currentSurah !== 9) {
    // O surenin 1. ayetinden önceki besmele metnini seçili yap
    const verseElement = document.querySelector(
        `.verse[data-surah="${currentSurah}"][data-ayah="${currentAyah.numberInSurah}"]`
    );
    if (verseElement) {
        const besmeleElement = verseElement.previousElementSibling;
        if (besmeleElement && besmeleElement.classList.contains('besmele')) {
            besmeleElement.classList.add('selected');
            besmeleElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // 1. surenin 1. ayetinin ses dosyasını al
    const besmeleAyah = await fetchAyah(1, 1); // 1. surenin 1. ayeti
    const besmeleAudioUrl = besmeleAyah.data.audio; // Ses dosyasını al

    // Besmele sesini çal
    const besmeleAudio = new Audio(besmeleAudioUrl);
    besmeleAudio.play();

    // Besmele sesinin bitmesini bekle
    besmeleAudio.onended = () => {
        // Besmele metninin seçimini iptal et
        if (verseElement) {
            const besmeleElement = verseElement.previousElementSibling;
            if (besmeleElement && besmeleElement.classList.contains('besmele')) {
                besmeleElement.classList.remove('selected');
            }
        }

        // Besmele bittiğinde ayeti çal
        if (verseElement) {
            if (selectedVerse) selectedVerse.classList.remove('selected'); 
            verseElement.classList.add('selected'); 
            selectedVerse = verseElement; 
            verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
        }

        // Ayet sesini çal
        audioPlayer = new Audio(audioUrl);
        audioPlayer.play();
        
        audioPlayer.onended = () => {
            currentAyahIndex++;
            playNextAyah(); 
        };
    };

            } else {
                // Eğer besmele çalmaya gerek yoksa doğrudan ayeti çal
                const verseElement = document.querySelector(
                    `.verse[data-surah="${currentSurah}"][data-ayah="${currentAyah.numberInSurah}"]`
                );

                if (verseElement) {
                    if (selectedVerse) selectedVerse.classList.remove('selected'); 
                    verseElement.classList.add('selected'); 
                    selectedVerse = verseElement; 
                    verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
                }

                // Ayet sesini çal
                audioPlayer = new Audio(audioUrl);
                audioPlayer.play();
                
                audioPlayer.onended = () => {
                    currentAyahIndex++;
                    playNextAyah(); 
                };
            }

            // Ayet sayfa numarasını kontrol et
            if (pageNumber !== currentPage) {
                navigateToPage(pageNumber); // Ekrandaki sayfa otomatik olarak ilgili sayfaya geç
            }
        } else {
            console.error('Geçerli ayet bulunamadı:', currentAyah);
            isPlaying = false; 
        }
    } else {
        // Sonraki sureye geç
        const nextSurahNumber = currentSurah + 1;
        const surahData = await fetchSurah(nextSurahNumber);
        
        if (surahData) {
            currentSurah = nextSurahNumber;
            currentAyahIndex = 0;
            ayahsToPlay = surahData.data.ayahs;
            playNextAyah();
        } else {
            isPlaying = false;
            document.getElementById('play-pause').textContent = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِِ";
}
    }
};

// fetchAyah fonksiyonu, belirli bir surenin belirli bir ayetinin verilerini almak için kullanılmalıdır.
const fetchAyah = async (surahNumber, ayahNumber) => {
    try {
        const response = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/ar.husarymujawwad`);
        return await response.json();
    } catch (error) {
        console.error('Ayet yüklenirken hata oluştu:', error);
        return null;
    }
};


const playPauseAudio = async () => {
    const playPauseButton = document.getElementById('play-pause');
    
    if (!isPlaying) {
        // Start playing
        isPlaying = true;
        currentAyahIndex = selectedVerse.getAttribute('data-ayah') - 1; // Get the index of the selected ayah
        const surahNumber = selectedVerse.getAttribute('data-surah');
        
        // Fetch surah data
        const surahData = await fetchSurah(surahNumber);
        if (surahData && surahData.data && surahData.data.ayahs) {
            ayahsToPlay = surahData.data.ayahs; // Get the ayahs of the selected surah
            playNextAyah(); // Start playing the first ayah
            playPauseButton.textContent = "صَدَقَ اللّهُ العَظِيمُ"; // Update button text
        } else {
            console.error('Invalid surah data:', surahData);
            alert("An error occurred while loading the audio file. Please try again.");
            isPlaying = false; // Reset play state
        }
    } else {
        // Stop playing
        isPlaying = false;
        if (audioPlayer) {
            audioPlayer.pause();
            audioPlayer = null;
        }
        currentAyahIndex = 0; // Reset index
        playPauseButton.textContent = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِِ"; // Update button text
    }
};

// Oynat/durdur butonuna playPauseAudio fonksiyonunu ekle
document.getElementById('play-pause').addEventListener('click', playPauseAudio);

window.navigateToPage = navigateToPage;
window.navigateToJuz = navigateToJuz;
window.navigateToSurah = navigateToSurah;
window.handleVerseClick = handleVerseClick;
window.handleVerseNumberClick = handleVerseNumberClick;
window.fetchTafsir = fetchTafsir;

// menu-btn için
document.getElementById('menu-btn').addEventListener('click', () => {
    showModal('info-modal');
});

const readerSelect = document.getElementById('reader');
const readerSequentialSelect = document.getElementById('readerSequential');
const surahSelect = document.getElementById('surah');
const startAyahSelect = document.getElementById('startAyah');
const endAyahSelect = document.getElementById('endAyah');
const startSurahSelect = document.getElementById('startSurah');
const endSurahSelect = document.getElementById('endSurah');
const startAyahSequentialSelect = document.getElementById('startAyahSequential');
const endAyahSequentialSelect = document.getElementById('endAyahSequential');
const repeatCountInput = document.getElementById('repeatCount');
const totalRepeatsInput = document.getElementById('totalRepeats');
const messageDiv = document.getElementById('message');
const completionMessageDiv = document.getElementById('completionMessage');
const ayahInfoDiv = document.getElementById('ayahInfo');
const playButton = document.getElementById('playButton');
const readerWriteSelect = document.getElementById('readerWrite');
const surahWriteSelect = document.getElementById('surahWrite');
const startAyahWriteSelect = document.getElementById('startAyahWrite');
const endAyahWriteSelect = document.getElementById('endAyahWrite');

let audio; // Global audio değişkeni
let surahList = []; // Sure listesini tutacak dizi

function setPlayButtonText(text) {
    playButton.textContent = text;
}

async function fetchSurahs() {
    try {
        const response = await fetch('https://api.alquran.cloud/v1/surah');
        const data = await response.json();
        
        if (data.code === 200) { // Yeni API formatına göre kontrol
            surahList = data.data.map(surah => ({
                number: surah.number,
                name: surah.name,
                ayahs: surah.numberOfAyahs
            }));
            populateSurahs();
            populateAyahs(); // Ezber için ayetleri doldur
            populateSequentialSurahs(); // Dinle için sureleri doldur
            populateWriteSurahs();
        } else {
            messageDiv.textContent = "Sure verileri alınamadı.";
        }
    } catch (error) {
        messageDiv.textContent = "Bir hata oluştu: " + error.message;
    }
}

function populateSurahs() {
    surahList.forEach(surah => {
        const option = document.createElement('option');
        option.value = surah.number;
        option.textContent = `${surah.number}. ${surah.name} (${surah.ayahs} ayet)`;
        surahSelect.appendChild(option);
    });
}

function populateSequentialSurahs() {
    surahList.forEach(surah => {
        const option = document.createElement('option');
        option.value = surah.number;
        option.textContent = `${surah.number}. ${surah.name} (${surah.ayahs} ayet)`;
        startSurahSelect.appendChild(option);
        endSurahSelect.appendChild(option.cloneNode(true)); // Aynı seçeneği kopyala
    });
}

function populateAyahs() {
    const selectedSurah = parseInt(surahSelect.value);
    const selectedSurahData = surahList.find(surah => surah.number === selectedSurah);
    
    if (!selectedSurahData) {
        messageDiv.textContent = "Geçersiz sure seçimi.";
        return;
    }
  
    // Temizle
    startAyahSelect.innerHTML = '';
    endAyahSelect.innerHTML = '';

    for (let i = 1; i <= selectedSurahData.ayahs; i++) {
        const startOption = document.createElement('option');
        startOption.value = i;
        startOption.textContent = i;
        startAyahSelect.appendChild(startOption);

        const endOption = document.createElement('option');
        endOption.value = i;
        endOption.textContent = i;
        endAyahSelect.appendChild(endOption);
    }

    // Varsayılan değerleri ayarla
    startAyahSelect.value = 1; // İlk ayet
    endAyahSelect.value = selectedSurahData.ayahs; // Son ayet
}

function populateSequentialAyahs() {
    const selectedStartSurah = parseInt(startSurahSelect.value);
    const selectedStartSurahData = surahList.find(surah => surah.number === selectedStartSurah);
    
    // Temizle
    startAyahSequentialSelect.innerHTML = '';
    endAyahSequentialSelect.innerHTML = '';

        // Başlangıç surenin ayetlerini doldur
    for (let i = 1; i <= selectedStartSurahData.ayahs; i++) {
        const startOption = document.createElement('option');
        startOption.value = i;
        startOption.textContent = i;
        startAyahSequentialSelect.appendChild(startOption);
    }

    // Bitiş surenin ayetlerini doldur
    const selectedEndSurah = parseInt(endSurahSelect.value);
    const selectedEndSurahData = surahList.find(surah => surah.number === selectedEndSurah);
    
    // Bitiş surenin ayetlerini doldur
    for (let i = 1; i <= selectedEndSurahData.ayahs; i++) {
        const endOption = document.createElement('option');
        endOption.value = i;
        endOption.textContent = i;
        endAyahSequentialSelect.appendChild(endOption);
    }

    // Varsayılan değerleri ayarla
    startAyahSequentialSelect.value = 1; // İlk ayet
    endAyahSequentialSelect.value = selectedEndSurahData.ayahs; // Son surenin son ayeti
    document.querySelectorAll('.verse').forEach(ayet => {
        ayet.dataset.revealIndex = 0;
        ayet.querySelectorAll('.word').forEach(word => {
            word.classList.remove('revealed');
        });
    });
}

function populateWriteSurahs() { // Değişen kısım: populateListenSurahs -> populateWriteSurahs
    surahList.forEach(surah => {
        const option = document.createElement('option');
        option.value = surah.number;
        option.textContent = `${surah.number}. ${surah.name} (${surah.ayahs} ayet)`;
        surahWriteSelect.appendChild(option); // Değişen kısım: surahListenSelect -> surahWriteSelect
    });
}

function populateWriteAyahs() { // Değişen kısım: populateListenAyahs -> populateWriteAyahs
    const selectedSurah = parseInt(surahWriteSelect.value); // Değişen kısım: surahListenSelect -> surahWriteSelect
    const selectedSurahData = surahList.find(surah => surah.number === selectedSurah);
    
    if (!selectedSurahData) {
        messageDiv.textContent = "Geçersiz sure seçimi.";
        return;
    }
  
    startAyahWriteSelect.innerHTML = ''; // Değişen kısım: startAyahListenSelect -> startAyahWriteSelect
    endAyahWriteSelect.innerHTML = ''; // Değişen kısım: endAyahListenSelect -> endAyahWriteSelect

    for (let i = 1; i <= selectedSurahData.ayahs; i++) {
        const startOption = document.createElement('option');
        startOption.value = i;
        startOption.textContent = i;
        startAyahWriteSelect.appendChild(startOption); // Değişen kısım: startAyahListenSelect -> startAyahWriteSelect

        const endOption = document.createElement('option');
        endOption.value = i;
        endOption.textContent = i;
        endAyahWriteSelect.appendChild(endOption); // Değişen kısım: endAyahListenSelect -> endAyahWriteSelect
    }

    startAyahWriteSelect.value = 1; // Değişen kısım: startAyahListenSelect -> startAyahWriteSelect
    endAyahWriteSelect.value = selectedSurahData.ayahs; // Değişen kısım: endAyahListenSelect -> endAyahWriteSelect
}

function playAudio(file) {
    return new Promise((resolve) => {
        audio = new Audio(file);
        audio.onended = resolve; // Ses dosyası bittiğinde resolve et
        audio.play();
    });
}

/* -------------------------------------------------------------
   0.  GLOBAL STATE for “Yaz” (write) mode
   ------------------------------------------------------------- */
let writeModeActive   = false;          // true while the user is writing
let writeRange       = null;           // {surah,startAyah,endAyah}
let writeVerses      = [];             // [{surah,ayah,page}]
let writeCurrentIdx  = 0;              // index in writeVerses
let writeCompleted   = new Set();     // “surah:ayah” strings already finished
let blurredVerses = new Set();

/* -------------------------------------------------------------
   1.  Virtual keyboard creation (run once on DOMContentLoaded)
   ------------------------------------------------------------- */
function initVirtualKeyboard() {
    const letters = [
        'ا','ب','ت','ث','ج','ح','خ','د','ذ',
        'ر','ز','س','ش','ص','ض','ط','ظ','ع',
        'غ','ف','ق','ك','ل','م','ن','ه','و',
        'ى','ي','ٱ','أ','إ','ء','ئ','ؤ','ة'
    ];
    
    const container = document.getElementById('virtual-keyboard');
    container.innerHTML = ''; // Önceki içeriği temizle
    
    letters.forEach(l => {
        const key = document.createElement('div');
        key.className = 'key';
        key.textContent = l;
        key.addEventListener('click', () => handleKeyboardPress(l));
        container.appendChild(key);
    });
}


/* -------------------------------------------------------------
   2.  Helpers
   ------------------------------------------------------------- */
function isArabicLetter(ch){
    // Arabic letters (U+0621‑U+064A) + the special ligatures used in the Quran
    return /[\u0621-\u064A\u0671-\u06D3]/.test(ch);
}
function stripHarakat(str){
    // Remove the diacritics (U+064B‑U+0652)
    return str.replace(/[\u064B-\u0652]/g,'');
}

/* -------------------------------------------------------------
   3.  Write‑mode start (called from playRecitation)
   ------------------------------------------------------------- */
async function startWriteMode(){
    // ---- a) build the range -------------------------------------------------
    const surah   = parseInt(surahWriteSelect.value);
    const startA  = parseInt(startAyahWriteSelect.value);
    const endA    = parseInt(endAyahWriteSelect.value);

    writeRange = {surah,startAyah:startA,endAyah:endA};
    writeVerses = [];
    for(let a=startA; a<=endA; a++){
        const ayahData = await fetchAyah(surah,a);
        if(!ayahData) continue;
        writeVerses.push({
            surah,
            ayah:a,
            page:ayahData.data.page
        });
    }
    // ---- b) initialise state ------------------------------------------------
    writeCurrentIdx = 0;
    writeCompleted.clear();
    writeModeActive = true;
    document.getElementById('virtual-keyboard').style.display = 'flex'; // Klavyeyi göster
    document.body.classList.add('keyboard-active');

    // ---- c) go to the first needed page -------------------------------------
    const first = writeVerses[0];
    await navigateToPage(first.page);          // page is rendered -> we can blur
    
    // İlk ayeti seçili yap
    const firstVerse = document.querySelector(`.verse[data-surah="${first.surah}"][data-ayah="${first.ayah}"]`);
    if (firstVerse) {
        if (selectedVerse) selectedVerse.classList.remove('selected');
        firstVerse.classList.add('selected');
        selectedVerse = firstVerse;
    }
    
    applyWriteBlur();                         // put per‑letter blur on the verses
    scrollToCurrentVerse();
}


/* -------------------------------------------------------------
   4.  Apply per‑letter blur to every ayah that is still NOT finished
   ------------------------------------------------------------- */
function applyWriteBlur() {
    // Temizleme
    document.querySelectorAll('.verse.write-blur').forEach(v => v.classList.remove('write-blur'));

    // Tüm aralıktaki ayetleri işle (bitmemiş olanları bulanıklaştır)
    for (let i = writeCurrentIdx; i < writeVerses.length; i++) {
        const { surah, ayah } = writeVerses[i];
        const verseKey = `${surah}:${ayah}`;
        
        // Eğer bu ayet tamamlanmışsa atla
        if (writeCompleted.has(verseKey)) continue;
        
        // Ayet elementi bul
        const verseEl = document.querySelector(`.verse[data-surah="${surah}"][data-ayah="${ayah}"]`);
        if (!verseEl) continue;

        // Bulanıklaştırma sınıfını ekle
        verseEl.classList.add('write-blur');
        
        // Bu ayeti bulanık ayetler listesine ekle
        blurredVerses.add(verseKey);

    verseEl.querySelectorAll('.word').forEach(word => {
        if (word.dataset.original) return;
        
        const txt = word.textContent;
        word.dataset.original = txt;
        
        const frag = document.createDocumentFragment();
        Array.from(txt).forEach(ch => {
            const span = document.createElement('span');
            span.className = 'char';
            span.dataset.char = ch;
            span.textContent = ch;
            
            // Harf değilse (hareke ise) özel sınıf ekle
            if (!isArabicLetter(ch)) {
                span.classList.add('hiddenHaraka');
                span.classList.add('haraka'); // Yeni sınıf ekledik
            }
            
            frag.appendChild(span);
        });
        
        word.innerHTML = '';
        word.appendChild(frag);
    });
  }
}

async function handleKeyboardPress(pressedChar){
    if(!writeModeActive) return;   // safety

    // -----------------------------------------------------------------
    // Find the **current** ayah we are working on
    // -----------------------------------------------------------------
    while(writeCurrentIdx < writeVerses.length){
        const {surah,ayah,page} = writeVerses[writeCurrentIdx];
        let verseEl = document.querySelector(`.verse[data-surah="${surah}"][data-ayah="${ayah}"]`);

        // -----------------------------------------------------------------
        // If the verse is not on the current page, change the page first
        // -----------------------------------------------------------------
        if(!verseEl){
            await navigateToPage(page);
            applyWriteBlur();               // we just switched page → re‑blur
            verseEl = document.querySelector(`.verse[data-surah="${surah}"][data-ayah="${ayah}"]`);
            if(!verseEl) {
                console.error(`Verse ${surah}:${ayah} not found after page navigation`);
                writeCurrentIdx++; // Skip this verse and move to next
                continue;
            }
            
            // Yeni sayfadaki ayeti seçili yap
            if (selectedVerse) selectedVerse.classList.remove('selected');
            verseEl.classList.add('selected');
            selectedVerse = verseEl;
        }

        // -----------------------------------------------------------------
        // Find the first still‑hidden letter (ignore diacritics & punctuation)
        // -----------------------------------------------------------------
        const nextChar = verseEl.querySelector('.char:not(.revealed):not(.hiddenHaraka)');
        if(!nextChar){
            // *****  Whole ayah is already revealed  *****
            // 1) restore the original text (so harakat become visible)
            verseEl.querySelectorAll('.word').forEach(word=>{
                if(word.dataset.original){
                    word.innerHTML = word.dataset.original;
                }
            });
            
        }

        // -----------------------------------------------------------------
        // Check the pressed key against the expected letter
        // -----------------------------------------------------------------
        const expected = stripHarakat(nextChar.dataset.char);
        const typed    = stripHarakat(pressedChar);
        if (expected === typed) {
        nextChar.classList.add('revealed');
        
        // 1. HARF GÖRÜNDÜKTEN SONRA HAREKELERİ AÇ
        let nextSibling = nextChar.nextElementSibling;
        while (nextSibling && nextSibling.classList.contains('hiddenHaraka')) {
            nextSibling.classList.add('revealed');
            nextSibling = nextSibling.nextElementSibling;
        }
            
            // Eğer bu ayetin SON HARFİ ise seslendir
            const remainingChars = verseEl.querySelectorAll('.char:not(.revealed):not(.hiddenHaraka)');
            if (remainingChars.length === 0) {
                const baseUrl = `https://www.everyayah.com/data/${getBaseUrl(readerWriteSelect.value)}`;
                const audioFile = `${baseUrl}/${surah.toString().padStart(3,'0')}${ayah.toString().padStart(3,'0')}.mp3`;
                await playAudio(audioFile);
                
                // Ayeti tamamlanmış olarak işaretle
                writeCompleted.add(`${surah}:${ayah}`);
                writeCurrentIdx++;
                
                // Sonraki ayeti seçili yap
                if (writeCurrentIdx < writeVerses.length) {
                    const nextVerse = writeVerses[writeCurrentIdx];
                    const nextVerseEl = document.querySelector(`.verse[data-surah="${nextVerse.surah}"][data-ayah="${nextVerse.ayah}"]`);
                    if (nextVerseEl) {
                        if (selectedVerse) selectedVerse.classList.remove('selected');
                        nextVerseEl.classList.add('selected');
                        selectedVerse = nextVerseEl;
                        nextVerseEl.scrollIntoView({behavior: 'smooth', block: 'center'});
                    }
                }
                
                // Tüm ayetler tamamlandıysa
                if (writeCurrentIdx >= writeVerses.length) {
                    writeModeActive = false;
                    document.getElementById('virtual-keyboard').classList.add('hidden');
                    document.getElementById('completionMessage').textContent = "Yazma alıştırması tamamlandı";
                    blurredVerses.clear();
                    exitWriteMode();
                    return;
                }
            }
            
            // Eğer tüm kelime açıldıysa - parentWord kontrolü ekleyin
            const parentWord = nextChar.parentElement;
            if (parentWord && parentWord.classList.contains('word')) {
                const allChars = parentWord.querySelectorAll('.char');
                const allRevealed = [...allChars].every(c => 
                    c.classList.contains('revealed') || 
                    c.classList.contains('hiddenHaraka')
                );
                
                if (allRevealed && parentWord.dataset.original) {
                    parentWord.innerHTML = parentWord.dataset.original;
                }
            }
        } else {
            // ❌  wrong key – you may flash the key or beep, but we just ignore
        }
        break;      // stop the while‑loop – wait for the next key press
    }
}


/* -------------------------------------------------------------
   6.  Helper – scroll to the ayah we are currently on
   ------------------------------------------------------------- */
function scrollToCurrentVerse(){
    if(writeCurrentIdx >= writeVerses.length) return;
    const {surah,ayah} = writeVerses[writeCurrentIdx];
    const verse = document.querySelector(`.verse[data-surah="${surah}"][data-ayah="${ayah}"]`);
    if(verse){
        verse.scrollIntoView({behavior:'smooth', block:'center'});
    }
}

/* -------------------------------------------------------------
   8.  Hide the virtual keyboard when we leave “Yaz” mode
   ------------------------------------------------------------- */
function exitWriteMode(){
    writeModeActive = false;
    blurredVerses.clear();
    document.getElementById('virtual-keyboard').style.display = 'none';
    document.body.classList.remove('keyboard-active'); // Bu satırı ekleyin
    
    // Tüm bulanık ayetleri normale döndür
    document.querySelectorAll('.verse.write-blur').forEach(verse => {
        verse.classList.remove('write-blur');
        verse.querySelectorAll('.word').forEach(word => {
            if (word.dataset.original) {
                word.innerHTML = word.dataset.original;
                word.dataset.original = '';
            }
        });
    });
}


async function playWriteMode() { // Değişen kısım: playListenMode -> playWriteMode
    const selectedReader = readerWriteSelect.value; // Değişen kısım: readerListenSelect -> readerWriteSelect
    const selectedSurah = parseInt(surahWriteSelect.value); // Değişen kısım: surahListenSelect -> surahWriteSelect
    const startAyah = parseInt(startAyahWriteSelect.value); // Değişen kısım: startAyahListenSelect -> startAyahWriteSelect
    const endAyah = parseInt(endAyahWriteSelect.value); // Değişen kısım: endAyahListenSelect -> endAyahWriteSelect
    const selectedSurahData = surahList.find(surah => surah.number === selectedSurah);
    const baseUrl = `https://www.everyayah.com/data/${getBaseUrl(selectedReader)}`;

    // Euzu Besmele - Başta bir kere çal
    if (selectedSurah !== 1 && selectedSurah !== 9) {
        await playAudio(`${baseUrl}/001000.mp3`);
        await playAudio(`${baseUrl}/001001.mp3`);
    } else if (startAyah > 1) {
        await playAudio(`${baseUrl}/001000.mp3`);
        await playAudio(`${baseUrl}/001001.mp3`);
    } else {
        await playAudio(`${baseUrl}/001000.mp3`);
    }

    // Ayetleri bir kere çal
    for (let ayah = startAyah; ayah <= endAyah; ayah++) {
        ayahInfoDiv.textContent = `Yazıyor: Ayet ${ayah} - Sure: ${selectedSurahData.name}`; // Mesaj güncellendi
        ayahInfoDiv.classList.remove('hidden');
        await playAudio(`${baseUrl}/${selectedSurah.toString().padStart(3, '0')}${ayah.toString().padStart(3, '0')}.mp3`);
    }
}

async function playRecitation() {
    const selectedReader = document.querySelector('input[name="playType"]:checked').value === 'repeat' ? readerSelect.value : readerSequentialSelect.value;
    const selectedSurah = parseInt(surahSelect.value);
    const startAyah = parseInt(startAyahSelect.value);
    const endAyah = parseInt(endAyahSelect.value);
    const repeatCount = parseInt(repeatCountInput.value) || 1; // Eğer boşsa 1 olarak ayarla
    const playType = document.querySelector('input[name="playType"]:checked').value;
    
    if(playType === 'write'){
        closeModal();
        await startWriteMode();          // <<< NEW ENGINE
        setInputsDisabled(true);         // keep UI frozen while the user writes
        return;                          // stop the old flow
    }
    
    closeModal(); // Modalı kapat
    
    if (playType === 'write') { // Değişen kısım: 'listen' -> 'write'
        await playWriteMode(); // Değişen kısım: playListenMode -> playWriteMode
    }

    
    const firstAyahData = await fetchAyah(selectedSurah, startAyah);
    if(firstAyahData && firstAyahData.data) {
        await navigateToPage(firstAyahData.data.page);
    }

    const selectedSurahData = surahList.find(surah => surah.number === selectedSurah);
    if (!selectedSurahData) {
        messageDiv.textContent = "Geçersiz sure seçimi.";
        return;
    }

    if (startAyah < 1 || endAyah > selectedSurahData.ayahs || startAyah > endAyah) {
        messageDiv.textContent = "Ayet aralığı geçersiz.";
        return;
    }

    // Okuyucuya göre temel URL'yi ayarla
const baseUrl = `https://www.everyayah.com/data/${getBaseUrl(selectedReader)}`;
    
    if (playType === 'repeat') {
    	const firstAyahData = await fetchAyah(selectedSurah, startAyah);
        await navigateToPage(firstAyahData.data.page);

        for (let j = 0; j < totalRepeatsInput.value; j++) { // Baştan sona tekrar sayısı
            // Euzu ve Besmele tekrar döngüsünden önce çal
            if (selectedSurah !== 1 && selectedSurah !== 9) {
                await playAudio(`${baseUrl}/001000.mp3`); // Euzu
                await playAudio(`${baseUrl}/001001.mp3`); // Besmele
            } else if (startAyah > 1) {
                await playAudio(`${baseUrl}/001000.mp3`); // Euzu
                await playAudio(`${baseUrl}/001001.mp3`); // Besmele
            } else {
                await playAudio(`${baseUrl}/001000.mp3`); // Euzu
            }

            for (let ayah = startAyah; ayah <= endAyah; ayah++) {
                // Her ayet için sayfa kontrolü
                const ayahData = await fetchAyah(selectedSurah, ayah);
                const pageNumber = ayahData.data.page;
                if(currentPage !== pageNumber) {
                    await navigateToPage(pageNumber);
                }
                
                // Seçilen ayet tekrarı kadar çal
                for (let i = 0; i < repeatCount; i++) {
                	const verseElement = document.querySelector(`.verse[data-surah="${selectedSurah}"][data-ayah="${ayah}"]`);
            if(verseElement) {
                if(selectedVerse) selectedVerse.classList.remove('selected');
                verseElement.classList.add('selected');
                selectedVerse = verseElement;
                verseElement.scrollIntoView({behavior: 'smooth', block: 'center'});
                }
                    ayahInfoDiv.innerHTML = `Ayet: ${ayah} - Sure: ${selectedSurahData.name}<br>Ayet Tekrar: ${i + 1} / Baştan Sona Tekrar: ${j + 1}`; // Ayet bilgilerini göster
                    ayahInfoDiv.classList.remove('hidden'); // Ayet bilgilerini görünür yap
                    await playAudio(`${baseUrl}/${selectedSurah.toString().padStart(3, '0')}${ayah.toString().padStart(3, '0')}.mp3`);
                }

                // Besmele bir kere çal
                if (selectedSurah !== 1 && selectedSurah !== 9) {
                    await playAudio(`${baseUrl}/001001.mp3`); // Besmele
                }

                // İlk ayetten başlayarak yeni ayete kadar birer kere sırayla çal
            // Sıralı okuma döngüsü
                for (let k = startAyah; k <= ayah; k++) {
                    // Her k ayeti için sayfa kontrolü
                    const kAyahData = await fetchAyah(selectedSurah, k);
                    const kPageNumber = kAyahData.data.page;
                    if(currentPage !== kPageNumber) {
                        await navigateToPage(kPageNumber);
                    }
                    
                    // Element seçimi ve ses çalma
                    const verseElement = document.querySelector(
                        `.verse[data-surah="${selectedSurah}"][data-ayah="${k}"]`
                    );
                    if(verseElement) {
                        if(selectedVerse) selectedVerse.classList.remove('selected');
                        verseElement.classList.add('selected');
                        selectedVerse = verseElement;
                        verseElement.scrollIntoView({behavior: 'smooth', block: 'center'});
                    }
                    await playAudio(`${baseUrl}/${selectedSurah.toString().padStart(3, '0')}${k.toString().padStart(3, '0')}.mp3`);
                }
            }
        }
    } else if (playType === 'sequential') {
        const selectedStartSurah = parseInt(startSurahSelect.value);
        const selectedEndSurah = parseInt(endSurahSelect.value);
        const startAyah = parseInt(startAyahSequentialSelect.value);
        const endAyah = parseInt(endAyahSequentialSelect.value);

        currentSequentialRange = {
            startSurah: selectedStartSurah,
            startAyah: startAyah,
            endSurah: selectedEndSurah,
            endAyah: endAyah
        };
        
        // İlk sayfayı yükle
        const startAyahData = await fetchAyah(selectedStartSurah, startAyah);
        await navigateToPage(startAyahData.data.page);
        applyBlurEffect(); // İlk uygulama
        
        // Scroll to ayah after page renders
        setTimeout(async () => {
            const verseElement = document.querySelector(
                `.verse[data-surah="${selectedStartSurah}"][data-ayah="${startAyah}"]`
            );
            if (verseElement) {
                // Double check page alignment
                const pageCheck = await fetchAyah(selectedStartSurah, startAyah);
                if (pageCheck.data.page !== currentPage) {
                    await navigateToPage(pageCheck.data.page);
                }
                
                verseElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'center'
                });
            }
        }, 300); // Adjusted timeout for rendering
    
        // Apply blur effect
        document.querySelectorAll('.verse').forEach(ayet => {
            const ayetSurah = parseInt(ayet.getAttribute('data-surah'));
            const ayetAyah = parseInt(ayet.getAttribute('data-ayah'));
            
            if (ayetSurah >= selectedStartSurah && ayetSurah <= selectedEndSurah && 
                (ayetSurah === selectedStartSurah ? ayetAyah >= startAyah : true) && 
                (ayetSurah === selectedEndSurah ? ayetAyah <= endAyah : true)) {
                ayet.classList.add('bulanikMetin');
                ayet.dataset.revealIndex = 0;
                ayet.querySelectorAll('.word').forEach(word => {
                    word.classList.remove('revealed');
                });
            } else {
                ayet.classList.remove('bulanikMetin');
                delete ayet.dataset.revealIndex;
            }
        });
        return;

    
        await playAudio(`${baseUrl}/001000.mp3`);

        // Başlangıç ve bitiş sureleri arasında döngü
        for (let surah = selectedStartSurah; surah <= selectedEndSurah; surah++) {
            const surahData = surahList.find(s => s.number === surah);
            if (!surahData) {
                messageDiv.textContent = "Geçersiz sure seçimi.";
                return;
            }

            // Ayet aralığını ayarla
            const start = (surah === selectedStartSurah) ? startAyah : 1;
            const end = (surah === selectedEndSurah) ? endAyah : surahData.ayahs;

            // Eğer sure 1 veya 9 değilse ve dosya adı 001 ile bitiyorsa, besmele çal
            if (surah !== 1 && surah !== 9) {
                await playAudio(`${baseUrl}/001001.mp3`); // Besmele
            } else if (start > 1) {
                await playAudio(`${baseUrl}/001001.mp3`); // Besmele
            }

            for (let ayah = start; ayah <= end; ayah++) {
                ayahInfoDiv.textContent = `Ayet: ${ayah} - Sure: ${surahData.name}`; // Ayet bilgilerini göster
                ayahInfoDiv.classList.remove('hidden'); // Ayet bilgilerini görünür yap
                await playAudio(`${baseUrl}/${surah.toString().padStart(3, '0')}${ayah.toString().padStart(3, '0')}.mp3`);
            }
        }
    }

    ayahInfoDiv.classList.add('hidden'); // Çalma tamamlandığında ayet bilgilerini gizle
}

function setInputsDisabled(disabled) {
    readerSelect.disabled = disabled;
    surahSelect.disabled = disabled;
    startAyahSelect.disabled = disabled;
    endAyahSelect.disabled = disabled;
    repeatCountInput.disabled = disabled;
    totalRepeatsInput.disabled = disabled;
    readerSequentialSelect.disabled = disabled;
    startSurahSelect.disabled = disabled;
    startAyahSequentialSelect.disabled = disabled;
    endSurahSelect.disabled = disabled;
    endAyahSequentialSelect.disabled = disabled;
    readerWriteSelect.disabled = disabled; // Değişen kısım: readerListenSelect -> readerWriteSelect
    surahWriteSelect.disabled = disabled; // Değişen kısım: surahListenSelect -> surahWriteSelect
    startAyahWriteSelect.disabled = disabled; // Değişen kısım: startAyahListenSelect -> startAyahWriteSelect
    endAyahWriteSelect.disabled = disabled; // Değişen kısım: endAyahListenSelect -> endAyahWriteSelect
}

let playButtonClicked = false;

playButton.addEventListener('click', async () => {
    if (!playButtonClicked) {
        playButtonClicked = true;
        setInputsDisabled(true); // Seçim alanlarını pasif yap
        messageDiv.textContent = ""; // Mesajı temizle
        completionMessageDiv.classList.add('hidden'); // Tamamlanma mesajını gizle
        ayahInfoDiv.classList.add('hidden'); // Ayet bilgilerini gizle
        setPlayButtonText('صدق الله العظيم'); // Buton metnini değiştir

        await playRecitation();

        completionMessageDiv.classList.remove('hidden'); // Mesajı görünür yap
        setInputsDisabled(false); // Seçim alanlarını aktif yap
        setPlayButtonText('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ'); // Buton metnini geri değiştir
        playButtonClicked = false; // Çalma bittikten sonra false olarak ayarla
    } else {
        //  butonuna basıldığında çalmayı durdur
        if (audio) {
            audio.pause(); // Çalmayı durdur
            audio.currentTime = 0; // başlangıca döndür
        }
        setInputsDisabled(false); // Seçim alanlarını aktif yap
        setPlayButtonText('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ'); // Buton metnini geri değiştir
        ayahInfoDiv.classList.add('hidden'); // Ayet bilgilerini gizle
        playButtonClicked = false; // Çalma durdurulduktan sonra false olarak ayarla
        
        // Oynatma durdurulduğunda bulanıklaştırma efektini kaldır
        document.querySelectorAll('.verse').forEach(ayet => ayet.classList.remove('bulanikMetin'));
    }
});

document.querySelectorAll('input[name="playType"]').forEach(radio=>{
    radio.addEventListener('change',()=>{
        const keyboard = document.getElementById('virtual-keyboard');
        
        // Tüm seçenek panellerini gizle
        document.getElementById('repeatOptions').classList.add('hidden');
        document.getElementById('sequentialOptions').classList.add('hidden');
        document.getElementById('writeOptions').classList.add('hidden');

        if(radio.value === 'repeat'){
            keyboard.style.display = 'none';
            document.getElementById('repeatOptions').classList.remove('hidden');
        }else if(radio.value === 'sequential'){
            keyboard.style.display = 'none';
            document.getElementById('sequentialOptions').classList.remove('hidden');
            populateSequentialAyahs();
        }else{ // write
            keyboard.style.display = 'flex';
            document.getElementById('writeOptions').classList.remove('hidden');
            populateWriteAyahs();
        }
        resetToDefaults();
    });
});

function resetToDefaults() {
    // Varsayılan değerleri ayarla
    readerSelect.value = "HusariMucevved";
    readerSequentialSelect.value = "HusariMucevved";
    surahSelect.value = 1; // İlk sure
    populateAyahs(); // Ayetleri doldur
    startAyahSelect.value = 1; // İlk ayet
    endAyahSelect.value = surahList[0].ayahs; // İlk surenin son ayeti
    repeatCountInput.value = ''; // Boş bırak
    totalRepeatsInput.value = ''; // Boş bırak

    // Dinle modunda varsayılan değerleri ayarla
    startSurahSelect.value = 1; // İlk sure
    startAyahSequentialSelect.value = 1; // İlk ayet
    endSurahSelect.value = surahList[surahList.length - 1].number; // Son sure
    endAyahSequentialSelect.value = surahList[surahList.length - 1].ayahs; // Son surenin son ayeti
    populateSequentialAyahs(); // Dinle için ayetleri doldur
    
    readerWriteSelect.value = "HusariMucevved";
    surahWriteSelect.value = 1;
    populateWriteAyahs();
}

// Olay dinleyicilerini ekle
surahSelect.addEventListener('change', populateAyahs);
startSurahSelect.addEventListener('change', populateSequentialAyahs);
endSurahSelect.addEventListener('change', populateSequentialAyahs); // Bitiş sure değiştiğinde ayetleri güncelle
surahWriteSelect.addEventListener('change', populateWriteAyahs);

// Sure listesini al
fetchSurahs().then(() => {
    // Başlangıçta ayetleri doldur
    populateAyahs(); // Başlangıçta ayetleri doldur
    populateSequentialAyahs(); // Başlangıçta dinle ayetlerini doldur
    resetToDefaults(); // Varsayılan değerleri ayarla
    populateWriteSurahs();
});
