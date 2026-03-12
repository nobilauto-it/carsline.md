// Система локализации для Carento
const Locale = {
    currentLang: 'ro', // По умолчанию румынский

    // Словарь переводов
    translations: {
        ro: {
            // Навигация
            'nav.home': 'Acasă',
            'nav.about': 'Despre noi',
            'nav.contact': 'Contact',

            // Баннер
            'banner.subtitle': 'Găsește mașina perfectă pentru tine',
            'banner.title': 'Cauți un vehicul??',
            'banner.title2': 'Ești în locul perfect.',
            'banner.item1': 'Calitate înaltă la un preț redus.',
            'banner.item2': 'Servicii premium',
            'banner.item3': 'Asistență rutieră 24/7.',

            // Секция "О нас"
            'section.badge': 'Cel mai bun sistem de închiriere auto',
            'section.title': 'Închiriezi simplu.<br>Conduci cu încredere.',
            'section.description': 'Închirierea automobilelor pentru orice necesitate – de la călătorii zilnice până la evenimente speciale. Cu o rețea de 7 filiale în întreaga țară și un parc auto diversificat.',
            'section.item1': '7 filiale în toată Moldova',
            'section.item2': 'Asistență 24/7',
            'section.item3': 'First Class Service',
            'section.item4': 'Gamă variată de automobile',
            'section.subtitle': 'Găsește mașina perfectă pentru orice ocazie',

            // Контакты
            'contact.title': 'Contact Us',
            'contact.address': '4517 Washington Ave. <br />Manchester, Kentucky 39495',
            'contact.hours': 'Hours: 8:00 - 17:00, Mon - Sat',
            'contact.email': 'support@carento.com',
            'contact.getInTouch': 'Luați legătura',
            'contact.ourLocation': 'Locația noastră',
            'contact.agentsWorldwide': 'Agenții noștri din întreaga țară',
            'contact.firstName': 'Prenume',
            'contact.lastName': 'Nume',
            'contact.emailAddress': 'Adresă de email',
            'contact.phoneNumber': 'Număr de telefon',
            'contact.yourMessage': 'Mesajul dvs.',
            'contact.leaveMessage': 'Lăsați-ne un mesaj...',
            'contact.agreeToOur': 'Sunt de acord cu',
            'contact.termsOfService': 'Termenii de serviciu',
            'contact.privacyPolicy': 'Politica de confidențialitate',
            'contact.sendMessage': 'Trimite mesaj',
            'faq.contactUs': 'Contactează-ne',

            // About Us
            'about.title': 'Despre noi – CarsLine.md',
            'about.subtitle': 'La CarsLine.md, oferim închiriere auto rapidă, sigură și fără complicații. <br />Punem la dispoziție o flotă modernă, prețuri transparente și un serviciu orientat spre nevoile fiecărui client. <br />Alegem calitatea și încrederea pentru ca mobilitatea ta să fie mereu simplă și comodă. <br /><strong>CarsLine.md — ușor de închiriat, sigur de condus.</strong>',
            'about.rentPriority': 'Închiriază cu prioritate',
            'about.description': 'La CarsLine.md, găsești mașina potrivită rapid, sigur și fără complicații. Flota noastră modernă îți oferă confort, libertate și mobilitate atunci când ai nevoie. Alege CarsLine.md și pornește la drum cu încredere.',
            'about.advantages.title': 'Avantajele chiriei auto CarsLine.md',
            'about.advantages.description': 'Alege CarsLine.md pentru o experiență de închiriere simplă, sigură și fără complicații. Oferim servicii orientate spre confortul și încrederea clienților.',
            'about.advantages.points': 'Puncte forte:',
            'about.advantages.point1': 'Proces rapid și transparent – rezervare ușoară, fără taxe ascunse.',
            'about.advantages.point2': 'Flotă modernă și bine întreținută – mașini verificate tehnic, curate și pregătite pentru drum.',
            'about.advantages.point3': 'Prețuri corecte și suport profesionist – echipă pregătită să te ajute oricând.',
            'about.advantages.footer': 'CarsLine.md — mobilitate simplă, încredere la fiecare kilometru.',
            'about.assistance': 'Asistență',
            'about.cars': 'Mașini',

            // Privacy Policy
            'privacy.title': 'Politica de Confidențialitate',
            'privacy.lastUpdated': 'Ultima actualizare:',
            'privacy.intro': 'CarsLine.md respectă confidențialitatea dumneavoastră și este angajată să protejeze datele personale. Această politică explică cum colectăm, folosim și protejăm informațiile dumneavoastră.',
            'privacy.contact.title': 'Date de contact',
            'privacy.contact.text': 'Pentru întrebări despre această politică, ne puteți contacta la:',
            'privacy.data.title': 'Ce date colectăm',
            'privacy.data.text': 'Colectăm următoarele informații:',
            'privacy.data.item1': 'Date personale: nume, prenume, adresă de email, număr de telefon',
            'privacy.data.item2': 'Date de rezervare: data și ora preluării, locația, tipul de vehicul',
            'privacy.data.item3': 'Date tehnice: adresă IP, tip de browser, informații despre dispozitiv',
            'privacy.purpose.title': 'Scopul utilizării datelor',
            'privacy.purpose.text': 'Folosim datele dumneavoastră pentru:',
            'privacy.purpose.item1': 'Procesarea și gestionarea rezervărilor',
            'privacy.purpose.item2': 'Comunicarea cu dumneavoastră despre serviciile noastre',
            'privacy.purpose.item3': 'Îmbunătățirea calității serviciilor noastre',
            'privacy.purpose.item4': 'Conformitatea cu cerințele legale',
            'privacy.storage.title': 'Stocarea datelor',
            'privacy.storage.text': 'Păstrăm datele dumneavoastră doar atât timp cât este necesar pentru îndeplinirea scopurilor menționate sau conform cerințelor legale.',
            'privacy.rights.title': 'Drepturile dumneavoastră',
            'privacy.rights.text': 'Aveți dreptul la:',
            'privacy.rights.item1': 'Acces la datele dumneavoastră personale',
            'privacy.rights.item2': 'Corectarea datelor incorecte',
            'privacy.rights.item3': 'Ștergerea datelor (dreptul de a fi uitat)',
            'privacy.rights.item4': 'Retragerea consimțământului',
            'privacy.security.title': 'Securitatea datelor',
            'privacy.security.text': 'Implementăm măsuri de securitate tehnice și organizatorice pentru a proteja datele dumneavoastră împotriva accesului neautorizat, pierderii sau distrugerii.',
            'privacy.cookies.title': 'Cookie-uri',
            'privacy.cookies.text': 'Utilizăm cookie-uri pentru a îmbunătăți experiența dumneavoastră pe site-ul nostru. Puteți controla cookie-urile prin setările browserului dumneavoastră.',
            'privacy.changes.title': 'Modificări ale politicii',
            'privacy.changes.text': 'Ne rezervăm dreptul de a actualiza această politică. Vă vom notifica despre modificări importante prin publicarea noii versiuni pe această pagină.',

            // Футер
            'footer.follow': 'Urmărește-ne',
            'footer.address': 'Adresă: or. Chișinău, str. Ion Creanga 10/1',
            'footer.hours': 'Ore de lucru: 8:00 - 17:00, Luni - Vineri',
            'footer.email': 'info@carsline.md',
            'footer.needHelp': '',
            'footer.phone': '+373 60 411 444',
            'footer.company': 'Company',
            'footer.aboutUs': 'Despre noi',
            'footer.privacyNotice': 'Notificare privind confidențialitatea',

            // Кнопки
            'btn.rezerva': 'Rezervă acum',
            'btn.explore': 'Explore Our Fleet',
            'btn.contact': 'Contact Us',

            // Другие тексты
            'title.marcile': 'Mărcile noastre',
            'title.whyChoose': 'De ce să alegi închirierea auto?',
            'title.whyDescription': 'Închirierea unei mașini îți oferă libertatea de a te deplasa oricând și oriunde, fără grija întreținerii sau a costurilor suplimentare. Alegi modelul potrivit nevoilor tale, plătești doar pentru perioada dorită și te bucuri de confort, siguranță și flexibilitate maximă.',

            // Популярные автомобили
            'popular.title': 'Cele mai căutate vehicule',
            'popular.subtitle': 'Cele mai renumite mărci auto din lume',
            'popular.found': 'Au fost găsite',
            'popular.vehicule': 'de vehicule',

            // Валюта (всегда Lei, не переводится)
            'price.perDay': '/zi',
            'price.fromDays': 'De la 30 de zile',
            'price.onRequest': 'La cerere',

            // Фильтры
            'filter.price': 'Filtrează după preț',
            'filter.currency': 'Lei',
            'filter.clear': 'Curăță',
            'filter.resetBrand': 'Resetează',
            'filter.category': 'Categorie',
            'filter.fuel': 'Combustibil',
            'filter.transmission': 'Transmisie',

            // Секция преимуществ
            'section.item5': 'Flexibilitate în bugete și condiții',
            'section.item6': 'Mașini verificate și curate',
            'section.browse': 'Răsfoiește după tip',

            // Как это работает
            'how.title': 'CUM FUNCȚIONEAZĂ',
            'how.subtitle': 'Prezentăm Noua Ta Experiență Preferată',
            'how.subtitle2': 'De Închiriere Auto',

            // Карточки машин
            'car.seats': 'locuri',
            'car.book': 'Rezervă acum',

            // Топливо
            'fuel.benzina95': 'Benzina 95',
            'fuel.motorina': 'Motorina',
            'fuel.hybrid': 'Hybrid/Benzina',

            // Трансмиссия
            'transmission.automatic': 'Automatic',
            'transmission.manual': 'Manual',
            'transmission.variator': 'Variator',

            // Как это работает - шаги
            'how.step1.title': 'Alege o Locație',
            'how.step1.desc': 'Selectează destinația ideală pentru a-ți începe călătoria cu ușurință',
            'how.step2.title': 'Alege-ți Vehiculul',
            'how.step2.desc': 'Răsfoiește flota noastră și găsește mașina perfectă pentru nevoile tale',
            'how.step3.title': 'Verificare',
            'how.step3.desc': 'Revizuiește informațiile și confirmă rezervarea ta',
            'how.step4.title': 'Începe-ți Călătoria',
            'how.step4.desc': 'Pornește în aventură cu încredere și ușurință',

            // Почему выбирают нас
            'why.location.title': 'Alege o Locație',
            'why.location.desc': 'Selectează destinația ideală pentru a-ți începe călătoria cu ușurință',
            'why.pricing.title': 'Prețuri Transparente',
            'why.pricing.desc': 'Bucură-te de prețuri clare și transparente, fără surprize, asigurându-te că știi exact pentru ce plătești.',
            'why.booking.title': 'Rezervare Convenabilă',
            'why.booking.desc': 'Beneficiază de o varietate de opțiuni de închiriere, inclusiv pe termen scurt, pe termen lung și oferte speciale pentru weekend.',
            'why.support.title': 'Suport Clienți 24/7',
            'why.support.desc': 'Obține asistență oricând ai nevoie cu echipa noastră dedicată de suport disponibilă non-stop.',

            // Миссия
            'mission.button': 'Misiunea noastră',
            'mission.title': 'Închiriere simplă, rapidă și de încredere. <br />La CarsLine.md, ai transparență totală și rezervări fără complicații.',
            'mission.points': 'Puncte forte:',
            'mission.item1': 'Proces rapid și contract clar',
            'mission.item2': 'Mașini verificate și pregătite pentru drum',
            'mission.item3': 'Prețuri corecte și echipă profesionistă',
            'mission.footer': 'CarsLine.md — închiriezi ușor, conduci cu încredere.',

            // Статистика
            'stats.branches.line1': 'Filiale în Moldova',
            'stats.branches.line2': 'în Moldova',
            'stats.fleet.line1': 'Flotă de mașini',
            'stats.fleet.line2': 'de mașini',
            'stats.experience.line1': 'Ani experiență',
            'stats.experience.line2': 'experiență',
            'stats.employees': 'Angajați',
            'stats.km.value': '1Milion+',
            'stats.km.line1': 'Parcurși de clienții noștri',
            'stats.km.line2': 'clienții noștri',

            // Мы предлагаем
            'offer.button': 'Noi oferim',
            'offer.description': 'Închirierea automobilelor pentru orice necesitate – de la călătorii zilnice până la evenimente speciale. Cu o rețea de 7 filiale în întreaga țară și un parc auto diversificat.',
            'offer.item1': '7 filiale în toată Moldova',
            'offer.item2': 'Gamă variată de automobile',
            'offer.item3': 'First Class Service',

            // FAQ
            'faq.support': 'Suportul nostru',
            'faq.title': 'Întrebări frecvente',
            'faq.q1': 'Cum pot face o rezervare pe site-ul dumneavoastră?',
            'faq.q2': 'De ce documente am nevoie pentru călătoria mea și cum le pot obține?',
            'faq.q3': 'În cazul în care trebuie să îmi modific sau să îmi anulez rezervarea, care sunt politicile în vigoare?',
            'faq.q4': 'Puteți specifica tipurile de carduri de credit/debit, portofele digitale sau alte metode de plată online acceptate?',
            'faq.q5': 'Care este programul de lucru și la ce mă pot aștepta în ceea ce privește timpii de răspuns?',
            'faq.a1': 'Accesează site-ul CarsLine (sau sună la birou).<br /><br />Specifică data şi ora de preluare a maşinii.<br /><br />Specifică locaţia de preluare (de ex. biroul din Chișinău, aeroport, etc).<br /><br />Specifică data şi ora de returnare (şi locul de returnare, dacă este diferit).<br /><br />Alege tipul de maşină (SUV, Sedan, Hatchback, Universal, Bus, Minivan) potrivit nevoilor tale.',
            'faq.a2': 'Cash, card(orice banca cu metoda de plata internationala), transfer bancar.',
            'faq.a3': 'Buletin, permis de conducere original!',
            'faq.a4': 'Cu CarsLine ai suport 24/7, raspuns imediat la solicitare!',

            // Партнеры
            'partner.benefit.title': 'Beneficiază de ofertă.',
            'partner.benefit.desc': 'Fă un apel către partenerii noștri.',
            'partner.garage.question': 'Ești în căutarea unui autoservice?',
            'partner.garage.desc': 'Perfect Garage este locul unde serviciile sunt prestate la cel mai înalt nivel.',
            'partner.garage.button': 'Începe Acum',
            'partner.nobil.question': 'Ai dorința de a face o achiziție auto?',
            'partner.nobil.desc': 'Nobil Auto este locul unde, cu siguranță, vei primi oferte de mașini pe placul tău.',

            // Отзывы и видео
            'review.title': 'Recenzie Mașină',
            'review.subtitle': 'Sfaturi de la experți și evaluări oneste pentru a te ajuta să alegi mașina perfectă',
            'review.lux.title': 'Experiență de lux la volan!',
            'review.lux.desc': 'Experiență de lux! La noi poți închiria nu doar mașini practice, ci și modele exotice care atrag toate privirile. Porsche Macan S — o bijuterie unică în flotă - puterea, eleganța și rafinament.',
            'review.credit.title': 'Închiriază acum, plătește mai târziu!',
            'review.credit.desc': 'Cu ajutorul partenerilor noștri de la Iute Credit, ai posibilitatea unică de a lua mașina în chirie în credit. Extinde perioada de închiriere fără griji și bucură-te de confortul condusului.',
            'review.worry.title': 'Conduce fără griji!',
            'review.worry.desc': 'Închiriind o mașină de la noi, te bucuri de libertate totală fără să-ți faci griji pentru întreținere, reparații sau alte costuri neașteptate. Tu te concentrezi doar pe drum și confort, noi ne ocupăm de restul.',

            // Детали автомобиля
            'details.rental': 'Închiriere auto',
            'details.included': 'Inclus în preț',
            'details.cancel': 'Anulare gratuită până la 48 de ore înainte de ridicare',
            'details.insurance': 'Asigurare de coliziune cu franșiză de 700$',
            'details.theft': 'Protecție împotriva furtului cu exces de ₫66,926,626',
            'details.mileage': 'Chilometraj nelimitat',
            'details.faq': 'Întrebări și răspunsuri',
            'details.faq1.question': 'Este High Roller potrivit pentru toate vârstele?',
            'details.faq1.answer': 'Absolut! High Roller oferă o experiență prietenoasă pentru familie, potrivită pentru vizitatori de toate vârstele. Copiii trebuie să fie însoțiți de un adult.',
            'details.faq2.question': 'Pot să aduc mâncare sau băuturi la bordul High Roller?',
            'details.faq2.answer': 'Mâncarea și băuturile din exterior nu sunt permise pe High Roller. Cu toate acestea, există opțiuni de alimentație în apropiere la The LINQ Promenade unde vă puteți bucura de o masă înainte sau după plimbare.',
            'details.faq3.question': 'Este High Roller accesibil pentru scaunele cu rotile?',
            'details.faq3.answer': 'Da, cabinele High Roller sunt accesibile pentru scaunele cu rotile, permițând tuturor să se bucure de priveliștile uimitoare ale Las Vegas-ului.',

            // Калькулятор кредита
            'loan.calculator': 'Calculator de împrumut auto',
            'loan.vehiclePrice': 'Prețul vehiculului',
            'loan.interestRate': 'Rata dobânzii',
            'loan.terms': 'Termeni',
            'loan.downPayment': 'Avans',
            'loan.downPaymentAmount': 'Suma avansului',
            'loan.financedAmount': 'Suma finanțată',
            'loan.monthlyPayment': 'Plata lunară',
            'loan.request': 'Solicită un împrumut',

            // Форма бронирования
            'booking.title': 'Închiriază acest vehicul',
            'booking.pickup': 'Preluare',
            'booking.dropoff': 'Predare',
            'booking.pickupLocation': 'Locație preluare',
            'booking.dropoffLocation': 'Locație predare',
            'booking.pickupTime': 'Ora preluării',
            'booking.extras': 'Opțiuni suplimentare:',
            'booking.extra.childSeat': 'Scaun pentru copil (20 lei/zi)',
            'booking.extra.driver': 'Șoferul nostru (8 ore – 800 lei/zi)',
            'booking.extra.delivery': 'Livrare (prin acord)',
            'booking.extra.returnOther': 'Returnare în altă locație (prin acord)',
            'booking.extra.abroad': 'Călătorie în afara țării (200 lei/zi, în funcție de destinație – UE/Ucraina)',
            'booking.subtotal': 'Subtotal',
            'booking.discount': 'Reducere',
            'booking.total': 'Total de plată',
            'booking.reserve': 'Rezervă acum',

            // Поля формы (шаг 2)
            'booking.lastName': 'Nume',
            'booking.firstName': 'Prenume',
            'booking.phone': 'Telefon',
            'booking.email': 'Email',
            'booking.car': 'Automobil',
            'booking.placeholder.car': 'Numele mașinii va fi completat automat',
            'booking.placeholder.lastName': 'Introduceți numele',
            'booking.placeholder.firstName': 'Introduceți prenumele',
            'booking.placeholder.phone': 'Ex: +373 60 000 000',
            'booking.placeholder.email': 'exemplu@email.com',
            'booking.submit': 'Trimite'
        },

        en: {
            // Навигация
            'nav.home': 'Home',
            'nav.about': 'About Us',
            'nav.contact': 'Contact',

            // Баннер
            'banner.subtitle': 'Find the perfect car for you',
            'banner.title': 'Looking for a vehicle?',
            'banner.title2': 'You are in the perfect place.',
            'banner.item1': 'High quality at a reduced price.',
            'banner.item2': 'Premium services',
            'banner.item3': '24/7 roadside assistance.',

            // Секция "О нас"
            'section.badge': 'The best car rental system',
            'section.title': 'Rent simply.<br>Drive with confidence.',
            'section.description': 'Car rental for any need - from daily trips to special events. With a network of 7 branches throughout the country and a diverse car fleet.',
            'section.item1': '7 branches throughout Moldova',
            'section.item2': '24/7 assistance',
            'section.item3': 'First Class Service',
            'section.item4': 'Wide range of vehicles',
            'section.subtitle': 'Find the perfect car for any occasion',

            // Контакты
            'contact.title': 'Contact Us',
            'contact.address': '4517 Washington Ave. <br />Manchester, Kentucky 39495',
            'contact.hours': 'Hours: 8:00 - 17:00, Mon - Sat',
            'contact.email': 'support@carento.com',
            'contact.getInTouch': 'Get in Touch',
            'contact.ourLocation': 'Our location',
            'contact.agentsWorldwide': 'Our agents throughout the country',
            'contact.firstName': 'First Name',
            'contact.lastName': 'Last Name',
            'contact.emailAddress': 'Email Address',
            'contact.phoneNumber': 'Phone Number',
            'contact.yourMessage': 'Your Message',
            'contact.leaveMessage': 'Leave us a message...',
            'contact.agreeToOur': 'Agree to our',
            'contact.termsOfService': 'Terms of service',
            'contact.privacyPolicy': 'Privacy Policy',
            'contact.sendMessage': 'Send message',
            'faq.contactUs': 'Contact Us',

            // About Us
            'about.title': 'About Us – CarsLine.md',
            'about.subtitle': 'At CarsLine.md, we offer fast, safe and hassle-free car rental. <br />We provide a modern fleet, transparent prices and service tailored to each client\'s needs. <br />We choose quality and trust so your mobility is always simple and comfortable. <br /><strong>CarsLine.md — easy to rent, safe to drive.</strong>',
            'about.rentPriority': 'Rent with Priority',
            'about.description': 'At CarsLine.md, you find the right car quickly, safely and without complications. Our modern fleet offers you comfort, freedom and mobility when you need it. Choose CarsLine.md and hit the road with confidence.',
            'about.advantages.title': 'CarsLine.md Car Rental Advantages',
            'about.advantages.description': 'Choose CarsLine.md for a simple, safe and hassle-free rental experience. We offer services focused on customer comfort and trust.',
            'about.advantages.points': 'Key strengths:',
            'about.advantages.point1': 'Fast and transparent process – easy booking, no hidden fees.',
            'about.advantages.point2': 'Modern and well-maintained fleet – technically verified, clean and road-ready cars.',
            'about.advantages.point3': 'Fair prices and professional support – team ready to help you anytime.',
            'about.advantages.footer': 'CarsLine.md — simple mobility, trust at every kilometer.',
            'about.assistance': 'Assistance',
            'about.cars': 'Cars',

            // Privacy Policy
            'privacy.title': 'Privacy Policy',
            'privacy.lastUpdated': 'Last updated:',
            'privacy.intro': 'CarsLine.md respects your privacy and is committed to protecting your personal data. This policy explains how we collect, use and protect your information.',
            'privacy.contact.title': 'Contact Information',
            'privacy.contact.text': 'For questions about this policy, you can contact us at:',
            'privacy.data.title': 'What data we collect',
            'privacy.data.text': 'We collect the following information:',
            'privacy.data.item1': 'Personal data: name, surname, email address, phone number',
            'privacy.data.item2': 'Booking data: pickup date and time, location, vehicle type',
            'privacy.data.item3': 'Technical data: IP address, browser type, device information',
            'privacy.purpose.title': 'Purpose of data use',
            'privacy.purpose.text': 'We use your data to:',
            'privacy.purpose.item1': 'Process and manage bookings',
            'privacy.purpose.item2': 'Communicate with you about our services',
            'privacy.purpose.item3': 'Improve the quality of our services',
            'privacy.purpose.item4': 'Comply with legal requirements',
            'privacy.storage.title': 'Data storage',
            'privacy.storage.text': 'We keep your data only as long as necessary to fulfill the stated purposes or as required by law.',
            'privacy.rights.title': 'Your rights',
            'privacy.rights.text': 'You have the right to:',
            'privacy.rights.item1': 'Access your personal data',
            'privacy.rights.item2': 'Correct inaccurate data',
            'privacy.rights.item3': 'Delete data (right to be forgotten)',
            'privacy.rights.item4': 'Withdraw consent',
            'privacy.security.title': 'Data security',
            'privacy.security.text': 'We implement technical and organizational security measures to protect your data against unauthorized access, loss or destruction.',
            'privacy.cookies.title': 'Cookies',
            'privacy.cookies.text': 'We use cookies to improve your experience on our website. You can control cookies through your browser settings.',
            'privacy.changes.title': 'Policy changes',
            'privacy.changes.text': 'We reserve the right to update this policy. We will notify you of significant changes by posting the new version on this page.',

            // Футер
            'footer.follow': 'Follow us',
            'footer.address': 'Address: Chișinău, str. Ion Creanga 10/1',
            'footer.hours': 'Working hours: 8:00 - 17:00, Monday - Friday',
            'footer.email': 'info@carsline.md',
            'footer.needHelp': '',
            'footer.phone': '+373 60 411 444',
            'footer.company': 'Company',
            'footer.aboutUs': 'About Us',
            'footer.privacyNotice': 'Privacy Notice',

            // Кнопки
            'btn.rezerva': 'Book now',
            'btn.explore': 'Explore Our Fleet',
            'btn.contact': 'Contact Us',

            // Другие тексты
            'title.marcile': 'Our Brands',
            'title.whyChoose': 'Why choose car rental?',
            'title.whyDescription': 'Renting a car gives you the freedom to travel anytime and anywhere, without the worry of maintenance or additional costs. You choose the model that suits your needs, pay only for the desired period and enjoy maximum comfort, safety and flexibility.',

            // Популярные автомобили
            'popular.title': 'Most Popular Vehicles',
            'popular.subtitle': 'The Most Renowned Car Brands in the World',
            'popular.found': 'Found',
            'popular.vehicule': 'vehicles',

            // Валюта (всегда Lei, не переводится)
            'price.perDay': '/day',
            'price.fromDays': 'From 30 days',
            'price.onRequest': 'On request',

            // Фильтры
            'filter.price': 'Filter by Price',
            'filter.currency': 'Lei',
            'filter.clear': 'Clear',
            'filter.resetBrand': 'Reset',
            'filter.category': 'Category',
            'filter.fuel': 'Fuel',
            'filter.transmission': 'Transmission',

            // Секция преимуществ
            'section.item5': 'Flexibility in budgets and conditions',
            'section.item6': 'Verified and clean cars',
            'section.browse': 'Browse by Type',

            // Как это работает
            'how.title': 'HOW IT WORKS',
            'how.subtitle': 'Presenting Your New Preferred',
            'how.subtitle2': 'Car Rental Experience',

            // Карточки машин
            'car.seats': 'seats',
            'car.book': 'Book now',

            // Топливо
            'fuel.benzina95': 'Gasoline 95',
            'fuel.motorina': 'Diesel',
            'fuel.hybrid': 'Hybrid/Gasoline',

            // Трансмиссия
            'transmission.automatic': 'Automatic',
            'transmission.manual': 'Manual',
            'transmission.variator': 'CVT',

            // Как это работает - шаги
            'how.step1.title': 'Choose a Location',
            'how.step1.desc': 'Select the ideal destination to start your journey with ease',
            'how.step2.title': 'Choose Your Vehicle',
            'how.step2.desc': 'Browse our fleet and find the perfect car for your needs',
            'how.step3.title': 'Verification',
            'how.step3.desc': 'Review the information and confirm your reservation',
            'how.step4.title': 'Start Your Journey',
            'how.step4.desc': 'Embark on an adventure with confidence and ease',

            // Why Choose Us
            'why.location.title': 'Choose a Location',
            'why.location.desc': 'Select the ideal destination to begin your journey with ease',
            'why.pricing.title': 'Transparent Pricing',
            'why.pricing.desc': 'Enjoy clear and upfront pricing with no surprises, ensuring you know exactly what you\'re paying for.',
            'why.booking.title': 'Convenient Booking',
            'why.booking.desc': 'Benefit from a variety of rental options, including short-term, long-term, and weekend specials',
            'why.support.title': '24/7 Customer Support',
            'why.support.desc': 'Get assistance whenever you need it with our dedicated support team available around the clock.',

            // Mission
            'mission.button': 'Our Mission',
            'mission.title': 'Simple, fast and reliable rental. <br />At CarsLine.md, you have total transparency and hassle-free bookings.',
            'mission.points': 'Key strengths:',
            'mission.item1': 'Fast process and clear contract',
            'mission.item2': 'Verified and road-ready cars',
            'mission.item3': 'Fair prices and professional team',
            'mission.footer': 'CarsLine.md — rent easily, drive with confidence.',

            // Статистика
            'stats.branches.line1': 'Branches in Moldova',
            'stats.branches.line2': 'in Moldova',
            'stats.fleet.line1': 'Car fleet',
            'stats.fleet.line2': 'of cars',
            'stats.experience.line1': 'Years of experience',
            'stats.experience.line2': 'of experience',
            'stats.employees': 'Employees',
            'stats.km.value': '1Million+',
            'stats.km.line1': 'Traveled by our clients',
            'stats.km.line2': 'our clients',

            // We offer
            'offer.button': 'We offer',
            'offer.description': 'Car rental for any need - from daily trips to special events. With a network of 7 branches throughout the country and a diverse car fleet.',
            'offer.item1': '7 branches throughout Moldova',
            'offer.item2': 'Wide range of vehicles',
            'offer.item3': 'First Class Service',

            // FAQ
            'faq.support': 'Our Support',
            'faq.title': 'Frequently Asked Questions',
            'faq.q1': 'How do I make a reservation on your website?',
            'faq.q2': 'What documents do I need for my trip, and how do I obtain them?',
            'faq.q3': 'In the event that I need to modify or cancel my reservation, what are the policies in place?',
            'faq.q4': 'Can you specify the types of credit/debit cards, digital wallets, or other online payment methods accepted?',
            'faq.q5': 'What are the working hours, and what can I expect in terms of response times?',
            'faq.a1': 'Access the CarsLine website (or call the office).<br /><br />Specify the date and time of car pickup.<br /><br />Specify the pickup location (e.g., Chisinau office, airport, etc.).<br /><br />Specify the return date and time (and return location, if different).<br /><br />Choose the type of car (SUV, Sedan, Hatchback, Universal, Bus, Minivan) that suits your needs.',
            'faq.a2': 'Cash, card (any bank with international payment method), bank transfer.',
            'faq.a3': 'ID card, original driver\'s license!',
            'faq.a4': 'With CarsLine you have 24/7 support, immediate response to requests!',

            // Партнеры
            'partner.benefit.title': 'Benefit from offers.',
            'partner.benefit.desc': 'Make a call to our partners.',
            'partner.garage.question': 'Looking for a car service?',
            'partner.garage.desc': 'Perfect Garage is the place where services are provided at the highest level.',
            'partner.garage.button': 'Start Now',
            'partner.nobil.question': 'Want to make a car purchase?',
            'partner.nobil.desc': 'Nobil Auto is the place where you will definitely receive car offers to your liking.',

            // Отзывы и видео
            'review.title': 'Car Review',
            'review.subtitle': 'Expert advice and honest reviews to help you choose the perfect car',
            'review.lux.title': 'Luxury experience behind the wheel!',
            'review.lux.desc': 'Luxury experience! With us you can rent not only practical cars, but also exotic models that attract all eyes. Porsche Macan S — a unique gem in the fleet - power, elegance and refinement.',
            'review.credit.title': 'Rent now, pay later!',
            'review.credit.desc': 'With the help of our partners from Iute Credit, you have the unique opportunity to rent a car on credit. Extend the rental period without worries and enjoy the comfort of driving.',
            'review.worry.title': 'Drive without worries!',
            'review.worry.desc': 'Renting a car from us, you enjoy complete freedom without worrying about maintenance, repairs or other unexpected costs. You focus only on the road and comfort, we take care of the rest.',

            // Car details
            'details.rental': 'Car Rental',
            'details.included': 'Included in Price',
            'details.cancel': 'Free cancellation up to 48 hours before pickup',
            'details.insurance': 'Collision insurance with $700 deductible',
            'details.theft': 'Theft protection with excess of ₫66,926,626',
            'details.mileage': 'Unlimited mileage',
            'details.faq': 'Questions and Answers',
            'details.faq1.question': 'Is High Roller suitable for all ages?',
            'details.faq1.answer': 'Absolutely! High Roller offers a family-friendly experience, suitable for visitors of all ages. Children must be accompanied by an adult.',
            'details.faq2.question': 'Can I bring food or drinks on board High Roller?',
            'details.faq2.answer': 'Outside food and drinks are not permitted on High Roller. However, there are dining options nearby at The LINQ Promenade where you can enjoy a meal before or after your ride.',
            'details.faq3.question': 'Is High Roller accessible for wheelchairs?',
            'details.faq3.answer': 'Yes, High Roller cabins are accessible for wheelchairs, allowing everyone to enjoy the amazing views of Las Vegas.',

            // Loan calculator
            'loan.calculator': 'Auto Loan Calculator',
            'loan.vehiclePrice': 'Vehicle Price',
            'loan.interestRate': 'Interest Rate',
            'loan.terms': 'Terms',
            'loan.downPayment': 'Down Payment',
            'loan.downPaymentAmount': 'Down Payment Amount',
            'loan.financedAmount': 'Financed Amount',
            'loan.monthlyPayment': 'Monthly Payment',
            'loan.request': 'Request a Loan',

            // Booking form
            'booking.title': 'Rent This Vehicle',
            'booking.pickup': 'Pickup',
            'booking.dropoff': 'Drop-off',
            'booking.pickupLocation': 'Pickup Location',
            'booking.dropoffLocation': 'Drop-off Location',
            'booking.pickupTime': 'Pickup Time',
            'booking.extras': 'Additional Options:',
            'booking.extra.childSeat': 'Child Seat (20 lei/day)',
            'booking.extra.driver': 'Our Driver (8 hours – 800 lei/day)',
            'booking.extra.delivery': 'Delivery (by agreement)',
            'booking.extra.returnOther': 'Return to Different Location (by agreement)',
            'booking.extra.abroad': 'Travel Abroad (200 lei/day, depending on destination – EU/Ukraine)',
            'booking.subtotal': 'Subtotal',
            'booking.discount': 'Discount',
            'booking.total': 'Total Payment',
            'booking.reserve': 'Book Now',

            // Form fields (step 2)
            'booking.lastName': 'Last Name',
            'booking.firstName': 'First Name',
            'booking.phone': 'Phone',
            'booking.email': 'Email',
            'booking.car': 'Vehicle',
            'booking.placeholder.car': 'Car name will be filled automatically',
            'booking.placeholder.lastName': 'Enter your last name',
            'booking.placeholder.firstName': 'Enter your first name',
            'booking.placeholder.phone': 'Ex: +373 60 000 000',
            'booking.placeholder.email': 'example@email.com',
            'booking.submit': 'Submit'
        },

        ru: {
            // Навигация
            'nav.home': 'Главная',
            'nav.about': 'О нас',
            'nav.contact': 'Контакты',

            // Баннер
            'banner.subtitle': 'Найди идеальную машину для себя',
            'banner.title': 'Ищешь автомобиль?',
            'banner.title2': 'Ты в идеальном месте.',
            'banner.item1': 'Высокое качество по доступной цене.',
            'banner.item2': 'Премиум услуги',
            'banner.item3': 'Круглосуточная помощь на дороге.',

            // Секция "О нас"
            'section.badge': 'Лучшая система аренды автомобилей',
            'section.title': 'Арендуй просто.<br>Езжай с уверенностью.',
            'section.description': 'Аренда автомобилей для любых нужд - от ежедневных поездок до особых событий. С сетью из 7 филиалов по всей стране и разнообразным автопарком.',
            'section.item1': '7 филиалов по всей Молдове',
            'section.item2': 'Помощь 24/7',
            'section.item3': 'Сервис первого класса',
            'section.item4': 'Широкий выбор автомобилей',
            'section.subtitle': 'Найди идеальную машину для любого случая',

            // Контакты
            'contact.title': 'Свяжитесь с нами',
            'contact.address': '4517 Washington Ave. <br />Manchester, Kentucky 39495',
            'contact.hours': 'Часы работы: 8:00 - 17:00, Пн - Сб',
            'contact.email': 'support@carento.com',
            'contact.getInTouch': 'Свяжитесь с нами',
            'contact.ourLocation': 'Наше местоположение',
            'contact.agentsWorldwide': 'Наши агенты по всей стране',
            'contact.firstName': 'Имя',
            'contact.lastName': 'Фамилия',
            'contact.emailAddress': 'Адрес электронной почты',
            'contact.phoneNumber': 'Номер телефона',
            'contact.yourMessage': 'Ваше сообщение',
            'contact.leaveMessage': 'Оставьте нам сообщение...',
            'contact.agreeToOur': 'Я согласен с',
            'contact.termsOfService': 'Условиями обслуживания',
            'contact.privacyPolicy': 'Политикой конфиденциальности',
            'contact.sendMessage': 'Отправить сообщение',
            'faq.contactUs': 'Свяжитесь с нами',

            // Футер
            'footer.follow': 'Следите за нами',
            'footer.address': 'Адрес: г. Кишинёв, ул. Ион Крянгэ 10/1',
            'footer.hours': 'Часы работы: 8:00 - 17:00, Понедельник - Пятница',
            'footer.email': 'info@carsline.md',
            'footer.needHelp': '',
            'footer.phone': '+373 60 411 444',
            'footer.company': 'Компания',
            'footer.aboutUs': 'О нас',
            'footer.privacyNotice': 'Уведомление о конфиденциальности',

            // Кнопки
            'btn.rezerva': 'Выбор',
            'btn.explore': 'Посмотреть наш автопарк',
            'btn.contact': 'Связаться с нами',

            // Другие тексты
            'title.marcile': 'Наши бренды',
            'title.whyChoose': 'Почему стоит выбрать аренду автомобиля?',
            'title.whyDescription': 'Аренда автомобиля даёт вам свободу передвигаться в любое время и в любом месте, без забот об обслуживании или дополнительных расходах. Вы выбираете модель, подходящую вашим потребностям, платите только за желаемый период и наслаждаетесь максимальным комфортом, безопасностью и гибкостью.',

            // Популярные автомобили
            'popular.title': 'Самые популярные автомобили',
            'popular.subtitle': 'Самые известные автомобильные бренды в мире',
            'popular.found': 'Найдено',
            'popular.vehicule': 'автомобилей',

            // Валюта (всегда Lei, не переводится)
            'price.perDay': '/день',
            'price.fromDays': 'От 30 дней',
            'price.onRequest': 'По запросу',

            // Фильтры
            'filter.price': 'Фильтр по цене',
            'filter.currency': 'Лей',
            'filter.clear': 'Очистить',
            'filter.resetBrand': 'Сброс',
            'filter.category': 'Категория',
            'filter.fuel': 'Топливо',
            'filter.transmission': 'Трансмиссия',

            // Секция преимуществ
            'section.item5': 'Гибкость в бюджетах и условиях',
            'section.item6': 'Проверенные и чистые машины',
            'section.browse': 'Просмотр по типу',

            // Как это работает
            'how.title': 'КАК ЭТО РАБОТАЕТ',
            'how.subtitle': 'Представляем ваш новый любимый',
            'how.subtitle2': 'Опыт аренды автомобилей',

            // Карточки машин
            'car.seats': 'мест',
            'car.book': 'Выбор',

            // Топливо
            'fuel.benzina95': 'Бензин 95',
            'fuel.motorina': 'Дизель',
            'fuel.hybrid': 'Гибрид/Бензин',

            // Трансмиссия
            'transmission.automatic': 'Автомат',
            'transmission.manual': 'Механическая',
            'transmission.variator': 'Вариатор',

            // Как это работает - шаги
            'how.step1.title': 'Выберите локацию',
            'how.step1.desc': 'Выберите идеальное место назначения, чтобы начать ваше путешествие с легкостью',
            'how.step2.title': 'Выберите автомобиль',
            'how.step2.desc': 'Просмотрите наш автопарк и найдите идеальный автомобиль для ваших потребностей',
            'how.step3.title': 'Проверка',
            'how.step3.desc': 'Проверьте информацию и подтвердите вашу бронь',
            'how.step4.title': 'Начните ваше путешествие',
            'how.step4.desc': 'Отправляйтесь в приключение с уверенностью и легкостью',

            // Почему выбирают нас
            'why.location.title': 'Выберите локацию',
            'why.location.desc': 'Выберите идеальное место назначения, чтобы начать ваше путешествие с легкостью',
            'why.pricing.title': 'Прозрачные цены',
            'why.pricing.desc': 'Наслаждайтесь четкими и прозрачными ценами без сюрпризов, гарантируя, что вы точно знаете, за что платите.',
            'why.booking.title': 'Удобное бронирование',
            'why.booking.desc': 'Воспользуйтесь разнообразием вариантов аренды, включая краткосрочную, долгосрочную аренду и специальные предложения на выходные.',
            'why.support.title': 'Поддержка клиентов 24/7',
            'why.support.desc': 'Получите помощь в любое время, когда она вам нужна, с нашей преданной командой поддержки, доступной круглосуточно.',

            // Миссия
            'mission.button': 'Наша миссия',
            'mission.title': 'Простая, быстрая и надежная аренда. <br />В CarsLine.md у вас полная прозрачность и бронирование без осложнений.',
            'mission.points': 'Ключевые преимущества:',
            'mission.item1': 'Быстрый процесс и прозрачный договор',
            'mission.item2': 'Проверенные и готовые к поездке автомобили',
            'mission.item3': 'Справедливые цены и профессиональная команда',
            'mission.footer': 'CarsLine.md — арендуй легко, езжай с уверенностью.',

            // Статистика
            'stats.branches.line1': 'Филиалы в Молдове',
            'stats.branches.line2': 'в Молдове',
            'stats.fleet.line1': 'Автопарк машин',
            'stats.fleet.line2': 'машин',
            'stats.experience.line1': 'Лет опыта',
            'stats.experience.line2': 'опыта',
            'stats.employees': 'Сотрудники',
            'stats.km.value': '1Млн+',
            'stats.km.line1': 'Пройдено нашими клиентами',
            'stats.km.line2': 'нашими клиентами',

            // Мы предлагаем
            'offer.button': 'Мы предлагаем',
            'offer.description': 'Аренда автомобилей для любых нужд - от ежедневных поездок до специальных мероприятий. С сетью из 7 филиалов по всей стране и разнообразным автопарком.',
            'offer.item1': '7 филиалов по всей Молдове',
            'offer.item2': 'Широкий выбор автомобилей',
            'offer.item3': 'Сервис первого класса',

            // FAQ
            'faq.support': 'Наша поддержка',
            'faq.title': 'Часто задаваемые вопросы',
            'faq.q1': 'Как я могу сделать бронирование на вашем сайте?',
            'faq.q2': 'Какие документы мне нужны для поездки и как их получить?',
            'faq.q3': 'В случае, если мне нужно изменить или отменить бронирование, какие действуют политики?',
            'faq.q4': 'Можете ли вы указать типы кредитных/дебетовых карт, цифровых кошельков или других принятых методов онлайн-платежей?',
            'faq.q5': 'Каковы рабочие часы и чего мне ожидать в плане времени ответа?',
            'faq.a1': 'Зайдите на сайт CarsLine (или позвоните в офис).<br /><br />Укажите дату и время получения машины.<br /><br />Укажите место получения (например, офис в Кишинёве, аэропорт и т.д.).<br /><br />Укажите дату и время возврата (и место возврата, если оно отличается).<br /><br />Выберите тип машины (SUV, Sedan, Hatchback, Universal, Bus, Minivan), подходящий вашим потребностям.',
            'faq.a2': 'Наличные, карта (любой банк с международным методом оплаты), банковский перевод.',
            'faq.a3': 'Удостоверение личности, оригинальные водительские права!',
            'faq.a4': 'С CarsLine у вас есть поддержка 24/7, немедленный ответ на запросы!',

            // Партнеры
            'partner.benefit.title': 'Получите предложение.',
            'partner.benefit.desc': 'Позвоните нашим партнерам.',
            'partner.garage.question': 'Ищете автосервис?',
            'partner.garage.desc': 'Perfect Garage — это место, где услуги предоставляются на самом высоком уровне.',
            'partner.garage.button': 'Начать сейчас',
            'partner.nobil.question': 'Хотите купить автомобиль?',
            'partner.nobil.desc': 'Nobil Auto — это место, где вы обязательно получите предложения автомобилей по вашему вкусу.',

            // Отзывы и видео
            'review.title': 'Обзор автомобиля',
            'review.subtitle': 'Советы экспертов и честные обзоры, чтобы помочь вам выбрать идеальный автомобиль',
            'review.lux.title': 'Роскошный опыт за рулем!',
            'review.lux.desc': 'Роскошный опыт! У нас вы можете арендовать не только практичные автомобили, но и экзотические модели, которые привлекают все взгляды. Porsche Macan S — уникальная жемчужина в автопарке - мощь, элегантность и утонченность.',
            'review.credit.title': 'Арендуйте сейчас, платите позже!',
            'review.credit.desc': 'С помощью наших партнеров из Iute Credit, у вас есть уникальная возможность арендовать автомобиль в кредит. Продлите период аренды без забот и наслаждайтесь комфортом вождения.',
            'review.worry.title': 'Ездите без забот!',
            'review.worry.desc': 'Арендуя автомобиль у нас, вы наслаждаетесь полной свободой, не беспокоясь об обслуживании, ремонте или других неожиданных расходах. Вы сосредотачиваетесь только на дороге и комфорте, мы заботимся обо всем остальном.',

            // Детали автомобиля
            'details.rental': 'Аренда автомобиля',
            'details.included': 'Включено в цену',
            'details.cancel': 'Бесплатная отмена до 48 часов до получения',
            'details.insurance': 'Страхование от столкновения с франшизой 700$',
            'details.theft': 'Защита от кражи с превышением ₫66,926,626',
            'details.mileage': 'Неограниченный пробег',
            'details.faq': 'Вопросы и ответы',
            'details.faq1.question': 'Подходит ли High Roller для всех возрастов?',
            'details.faq1.answer': 'Абсолютно! High Roller предлагает дружелюбный для семьи опыт, подходящий для посетителей всех возрастов. Дети должны сопровождаться взрослым.',
            'details.faq2.question': 'Могу ли я принести еду или напитки на борт High Roller?',
            'details.faq2.answer': 'Еда и напитки извне не разрешены на High Roller. Однако поблизости есть варианты питания в The LINQ Promenade, где вы можете насладиться едой до или после поездки.',
            'details.faq3.question': 'Доступен ли High Roller для инвалидных колясок?',
            'details.faq3.answer': 'Да, кабины High Roller доступны для инвалидных колясок, позволяя всем наслаждаться удивительными видами Лас-Вегаса.',

            // Калькулятор кредита
            'loan.calculator': 'Калькулятор автокредита',
            'loan.vehiclePrice': 'Цена автомобиля',
            'loan.interestRate': 'Процентная ставка',
            'loan.terms': 'Срок',
            'loan.downPayment': 'Первоначальный взнос',
            'loan.downPaymentAmount': 'Сумма первоначального взноса',
            'loan.financedAmount': 'Сумма финансирования',
            'loan.monthlyPayment': 'Ежемесячный платеж',
            'loan.request': 'Запросить кредит',

            // Форма бронирования
            'booking.title': 'Арендовать этот автомобиль',
            'booking.pickup': 'Получение',
            'booking.dropoff': 'Возврат',
            'booking.pickupLocation': 'Место получения',
            'booking.dropoffLocation': 'Место возврата',
            'booking.pickupTime': 'Время получения',
            'booking.extras': 'Дополнительные опции:',
            'booking.extra.childSeat': 'Детское кресло (20 лей/день)',
            'booking.extra.driver': 'Наш водитель (8 часов – 800 лей/день)',
            'booking.extra.delivery': 'Доставка (по договоренности)',
            'booking.extra.returnOther': 'Возврат в другое место (по договоренности)',
            'booking.extra.abroad': 'Поездка за границу (200 лей/день, в зависимости от назначения – ЕС/Украина)',
            'booking.subtotal': 'Подытог',
            'booking.discount': 'Скидка',
            'booking.total': 'Итого к оплате',
            'booking.reserve': 'Забронировать',

            // Поля формы (шаг 2)
            'booking.lastName': 'Фамилия',
            'booking.firstName': 'Имя',
            'booking.phone': 'Телефон',
            'booking.email': 'Email',
            'booking.car': 'Автомобиль',
            'booking.placeholder.car': 'Название автомобиля будет заполнено автоматически',
            'booking.placeholder.lastName': 'Введите фамилию',
            'booking.placeholder.firstName': 'Введите имя',
            'booking.placeholder.phone': 'Пример: +373 60 000 000',
            'booking.placeholder.email': 'example@email.com',
            'booking.submit': 'Отправить',

            // About Us
            'about.title': 'О нас – CarsLine.md',
            'about.subtitle': 'В CarsLine.md мы предлагаем быструю, безопасную и простую аренду автомобилей. <br />Предоставляем современный парк, прозрачные цены и сервис, ориентированный на потребности каждого клиента. <br />Выбираем качество и доверие, чтобы ваша мобильность всегда была простой и удобной. <br /><strong>CarsLine.md — легко арендовать, безопасно управлять.</strong>',
            'about.rentPriority': 'Арендуйте с приоритетом',
            'about.description': 'В CarsLine.md вы найдете подходящий автомобиль быстро, безопасно и без осложнений. Наш современный автопарк предлагает вам комфорт, свободу и мобильность, когда вам это нужно. Выберите CarsLine.md и отправляйтесь в путь с уверенностью.',
            'about.advantages.title': 'Преимущества аренды автомобилей CarsLine.md',
            'about.advantages.description': 'Выберите CarsLine.md для простого, безопасного и беззаботного опыта аренды. Мы предлагаем услуги, ориентированные на комфорт и доверие клиентов.',
            'about.advantages.points': 'Ключевые преимущества:',
            'about.advantages.point1': 'Быстрый и прозрачный процесс – легкое бронирование, без скрытых платежей.',
            'about.advantages.point2': 'Современный и хорошо обслуживаемый автопарк – технически проверенные, чистые и готовые к поездке автомобили.',
            'about.advantages.point3': 'Справедливые цены и профессиональная поддержка – команда готова помочь вам в любое время.',
            'about.advantages.footer': 'CarsLine.md — простая мобильность, доверие на каждом километре.',
            'about.assistance': 'Помощь',
            'about.cars': 'Автомобили',

            // Privacy Policy
            'privacy.title': 'Политика конфиденциальности',
            'privacy.lastUpdated': 'Последнее обновление:',
            'privacy.intro': 'CarsLine.md уважает вашу конфиденциальность и обязуется защищать ваши персональные данные. Эта политика объясняет, как мы собираем, используем и защищаем вашу информацию.',
            'privacy.contact.title': 'Контактная информация',
            'privacy.contact.text': 'По вопросам о данной политике вы можете связаться с нами:',
            'privacy.data.title': 'Какие данные мы собираем',
            'privacy.data.text': 'Мы собираем следующую информацию:',
            'privacy.data.item1': 'Персональные данные: имя, фамилия, адрес электронной почты, номер телефона',
            'privacy.data.item2': 'Данные бронирования: дата и время получения, место, тип транспортного средства',
            'privacy.data.item3': 'Технические данные: IP-адрес, тип браузера, информация об устройстве',
            'privacy.purpose.title': 'Цель использования данных',
            'privacy.purpose.text': 'Мы используем ваши данные для:',
            'privacy.purpose.item1': 'Обработки и управления бронированиями',
            'privacy.purpose.item2': 'Связи с вами по поводу наших услуг',
            'privacy.purpose.item3': 'Улучшения качества наших услуг',
            'privacy.purpose.item4': 'Соблюдения правовых требований',
            'privacy.storage.title': 'Хранение данных',
            'privacy.storage.text': 'Мы храним ваши данные только столько времени, сколько необходимо для выполнения указанных целей или в соответствии с требованиями закона.',
            'privacy.rights.title': 'Ваши права',
            'privacy.rights.text': 'Вы имеете право:',
            'privacy.rights.item1': 'Получить доступ к вашим персональным данным',
            'privacy.rights.item2': 'Исправить неточные данные',
            'privacy.rights.item3': 'Удалить данные (право на забвение)',
            'privacy.rights.item4': 'Отозвать согласие',
            'privacy.security.title': 'Безопасность данных',
            'privacy.security.text': 'Мы применяем технические и организационные меры безопасности для защиты ваших данных от несанкционированного доступа, потери или уничтожения.',
            'privacy.cookies.title': 'Файлы cookie',
            'privacy.cookies.text': 'Мы используем файлы cookie для улучшения вашего опыта на нашем веб-сайте. Вы можете управлять файлами cookie через настройки браузера.',
            'privacy.changes.title': 'Изменения в политике',
            'privacy.changes.text': 'Мы оставляем за собой право обновлять эту политику. Мы уведомим вас о значительных изменениях, опубликовав новую версию на этой странице.'
        }
    },

    // Инициализация
    init() {
        // Загружаем сохраненный язык из localStorage или используем RO по умолчанию
        const savedLang = localStorage.getItem('carento_lang') || 'ro';
        this.setLanguage(savedLang);

        // Добавляем обработчики кликов на переключатель языка
        this.initLanguageSwitcher();
    },

    // Инициализация переключателя языка
    initLanguageSwitcher() {
        // Находим все переключатели языков (десктопный и мобильный)
        const langSwitchers = document.querySelectorAll('.head-lang');
        if (!langSwitchers || langSwitchers.length === 0) return;

        // Добавляем обработчики ко всем переключателям
        langSwitchers.forEach(langSwitcher => {
            const langLinks = langSwitcher.querySelectorAll('.dropdown-account a');
            langLinks.forEach(link => {
                // Удаляем старые обработчики, если они есть
                const newLink = link.cloneNode(true);
                link.parentNode.replaceChild(newLink, link);

                // Добавляем новый обработчик
                newLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Пробуем получить язык из data-lang атрибута, если нет - из текста
                    let lang = newLink.getAttribute('data-lang');
                    if (!lang) {
                        lang = newLink.textContent.trim().toLowerCase();
                    }
                    if (['en', 'ro', 'ru'].includes(lang)) {
                        this.setLanguage(lang);
                        // Закрываем все dropdown после выбора
                        document.querySelectorAll('.dropdown-account').forEach(dropdown => {
                            dropdown.classList.remove('dropdown-open');
                        });
                    }
                });
            });
        });
    },

    // Установка языка
    setLanguage(lang) {
        if (!this.translations[lang]) {
            // console.error(`Language ${lang} not found`);
            return;
        }

        this.currentLang = lang;
        localStorage.setItem('carento_lang', lang);

        // Добавляем data-lang атрибут к body для CSS селекторов
        if (document.body) {
            document.body.setAttribute('data-lang', lang);
        }

        // Обновляем отображение текущего языка
        // Обновляем индикатор языка во всех переключателях (десктопный и мобильный)
        const langIndicators = document.querySelectorAll('.head-lang .arrow-down');
        langIndicators.forEach(indicator => {
            indicator.textContent = lang.toUpperCase();
        });

        // Применяем переводы
        this.translatePage();

        // Отправляем событие о смене языка для других модулей
        window.dispatchEvent(new CustomEvent('localeChanged', { detail: { lang: lang } }));
    },

    // Перевод страницы
    translatePage() {
        const translations = this.translations[this.currentLang];

        // Находим все элементы с data-lang-key
        document.querySelectorAll('[data-lang-key]').forEach(element => {
            const key = element.getAttribute('data-lang-key');
            if (translations[key]) {
                const translation = translations[key];

                // Для input и textarea
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    if (element.type === 'button' || element.type === 'submit') {
                        element.value = translation;
                    } else {
                        element.placeholder = translation;
                        // Если значение совпадает с предыдущим переводом, обновляем его
                        const prevLang = localStorage.getItem('carento_prev_lang') || 'ro';
                        if (prevLang !== this.currentLang) {
                            element.value = translation;
                        }
                    }
                }
                // Для button
                else if (element.tagName === 'BUTTON') {
                    element.textContent = translation;
                }
                // Для остальных элементов (span, p, h1-h6, div, a, li и т.д.)
                else {
                    // Для span используем textContent, чтобы не удалять пробелы перед ним
                    // Но для элементов с HTML тегами (например, <br />) используем innerHTML
                    if (element.tagName === 'SPAN' && translation.includes('<br')) {
                        element.innerHTML = translation;
                    } else if (element.tagName === 'SPAN') {
                        element.textContent = translation;
                    } else {
                        element.innerHTML = translation;
                    }
                }
            }
        });

        // Обновляем tooltip для элементов с data-lang-key-tooltip
        document.querySelectorAll('[data-lang-key-tooltip]').forEach(element => {
            const key = element.getAttribute('data-lang-key-tooltip');
            if (translations[key]) {
                element.setAttribute('data-tooltip', translations[key]);
            }
        });

        // Сохраняем текущий язык для следующего переключения
        localStorage.setItem('carento_prev_lang', this.currentLang);
    },

    // Получить перевод по ключу
    t(key) {
        return this.translations[this.currentLang][key] || key;
    }
};

// Инициализация при загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        Locale.init();
    });
} else {
    Locale.init();
}

// Обработчик события смены языка для обновления inline стилей
window.addEventListener('localeChanged', (event) => {
    const lang = event.detail.lang;
    // Обновляем inline стили для элементов с Basenji при русском языке
    if (lang === 'ru') {
        document.querySelectorAll('h2[style*="Basenji"], h1[style*="Basenji"]').forEach(el => {
            const style = el.getAttribute('style') || '';
            if (style.includes('Basenji')) {
                el.setAttribute('style', style.replace(/font-family:\s*['"]?Basenji[^;]*;?/gi, 'font-family: "Nexa Trial", "Segoe UI", "Helvetica Neue", Arial, sans-serif !important;'));
            }
        });
    } else {
        // Восстанавливаем Basenji для других языков
        document.querySelectorAll('h2[data-lang-key="contact.getInTouch"], h2[data-lang-key="about.title"]').forEach(el => {
            const style = el.getAttribute('style') || '';
            if (!style.includes('Basenji')) {
                el.setAttribute('style', style.replace(/font-family:\s*['"][^'"]*['"];?/gi, '') + ' font-family: "Basenji Variable", "Segoe UI", "Helvetica Neue", Arial, sans-serif !important;');
            }
        });
    }
});

// Экспортируем для глобального доступа
window.Locale = Locale;
