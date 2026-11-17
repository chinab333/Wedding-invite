/* All invitation wording lives here. Facts come from the family's invitation PDF; change them in one place. */
window.WEDDING = {
  config: {
    defaultLang: 'hi',
    phone: '+918107771682',
    phoneDisplay: '+91 8107771682',
    // Add a URL to also POST RSVPs as JSON ({name, choice, guests, lang}). Guests always send their reply by WhatsApp.
    rsvpEndpoint: null,
    maps: {
      wedding: 'https://www.google.com/maps/search/?api=1&query=Milan+Resort+Kota+Rajasthan',
      reception: 'https://www.google.com/maps/search/?api=1&query=Hotel+Yuvraj+Grand+Vijaynagar+Jabalpur'
    }
  },
  hi: {
    meta: { title: 'चिनाब एवं सिद्धार्थ | शुभ विवाह' },
    nav: { home: 'होम', wedding: 'विवाह', reception: 'स्वागत', rsvp: 'RSVP', menu: 'मेनू', close: 'बंद करें' }, 
    opening: { blessing: 'शुभ विवाह', bride: 'चिनाब', and: 'एवं', groom: 'सिद्धार्थ', hint: 'ऊपर स्क्रॉल करें' },
    fort: { invocation: '॥ श्री गणेशाय नमः ॥' },
    sound: { label: 'शहनाई संगीत चालू या बंद करें' },
    announce: {
      lead: 'दोनों परिवारों के आशीर्वाद के साथ',
      bride: 'चिनाब', and: 'एवं', groom: 'सिद्धार्थ',
      message: 'अपने जीवन के इस मंगल अवसर पर आपको सादर आमंत्रित करते हैं। आपकी उपस्थिति और स्नेह से यह दिन और भी शुभ हो जाएगा।'
    },
    events: {
      directions: 'नक्शे पर देखें',
      items: [
        { heading: 'विनायक स्थापना', day: '17', monthYear: 'जनवरी 2027', line: 'रविवार', venue: 'मिलन रिज़ॉर्ट', place: 'कोटा, राजस्थान' },
        { heading: 'डीजे नाइट', day: '17', monthYear: 'जनवरी 2027', line: 'रविवार', venue: 'मिलन रिज़ॉर्ट', place: 'कोटा, राजस्थान' },
        { heading: 'हल्दी', day: '18', monthYear: 'जनवरी 2027', line: 'सोमवार', venue: 'मिलन रिज़ॉर्ट', place: 'कोटा, राजस्थान' },
        { heading: 'विवाह', day: '18', monthYear: 'जनवरी 2027', line: 'सोमवार, प्रातः 11 बजे से', venue: 'मिलन रिज़ॉर्ट', place: 'कोटा, राजस्थान' }
      ]
    },
    families: {
      heading: 'दो घर, एक उत्सव',
      bride: { name: 'चिनाब', parents: 'पुत्री श्रीमती अनीता त्रिवेदी एवं श्री सुनील त्रिवेदी' },
      groom: { name: 'सिद्धार्थ', parents: 'पुत्र श्रीमती कृष्णा भट्टाचार्य एवं स्वर्गीय श्री रंजन भट्टाचार्य' }
    },
    route: { line: 'और कहानी आगे बढ़ती है, नर्मदा की नगरी की ओर।', from: 'कोटा', to: 'जबलपुर', river: 'नर्मदा' },
    reception: { heading: 'प्रीतिभोज', date: '20 जनवरी 2027', venue: 'होटल युवराज ग्रैंड', place: 'विजयनगर, जबलपुर', directions: 'नक्शे पर देखें', art: 'भेड़ाघाट की संगमरमरी चट्टानों के बीच नर्मदा पर एक नाव' },
    rsvp: {
      heading: 'आपकी उपस्थिति हमारे इस विशेष दिन को और भी सुंदर बना देगी', label: 'RSVP', contact: 'संपर्क', cta: 'उपस्थिति की पुष्टि करें',
      lampPrompt: 'दीया जलाएँ', lampLabel: 'दीया जलाएँ',
      optBoth: 'दोनों कार्यक्रम', optWed: 'केवल विवाह', optRec: 'केवल प्रीतिभोज', optNo: 'नहीं आ पाएँगे',
      guestsLabel: 'कितने व्यक्ति', guestsDec: 'एक व्यक्ति कम करें', guestsInc: 'एक व्यक्ति बढ़ाएँ',
      nameLabel: 'आपका नाम (वैकल्पिक)', whatsapp: 'WhatsApp पर उत्तर भेजें',
      msgBoth: 'नमस्ते! निमंत्रण के लिए धन्यवाद। हम {n} व्यक्ति विवाह और प्रीतिभोज, दोनों में आएँगे।',
      msgWed: 'नमस्ते! निमंत्रण के लिए धन्यवाद। हम {n} व्यक्ति कोटा में विवाह में आएँगे।',
      msgRec: 'नमस्ते! निमंत्रण के लिए धन्यवाद। हम {n} व्यक्ति जबलपुर में प्रीतिभोज में आएँगे।',
      msgNo: 'नमस्ते! निमंत्रण के लिए धन्यवाद। क्षमा करें, हम नहीं आ पाएँगे, पर हमारा आशीर्वाद आपके साथ है।',
      msgName: '— {name}'
    },
    calm: { lake: 'झील के किनारे, सूर्यास्त में रेलिंग पर खड़े दूल्हा और दुल्हन', fort: 'सूर्यास्त में झील और पहाड़ियों के बीच राजस्थानी किला' }
  },
  en: {
    meta: { title: 'Chinab & Siddharth | Wedding Invitation' },
    nav: { home: 'Home', wedding: 'Wedding', reception: 'Reception', rsvp: 'RSVP', menu: 'Menu', close: 'Close' },
    opening: { blessing: 'The auspicious wedding of', bride: 'Chinab', and: '&', groom: 'Siddharth', hint: 'Scroll up' },
    fort: { invocation: 'Om Shree Ganeshay Namah' },
    sound: { label: 'Turn shehnai music on or off' },
    announce: {
      lead: 'Together with their families',
      bride: 'Chinab', and: '&', groom: 'Siddharth',
      message: 'cordially invite you to join their wedding celebrations on'
    },
    events: {
      directions: 'View on map',
      items: [
        { heading: 'Vinayak Sthapna', day: '17', monthYear: 'January 2027', line: 'Sunday', venue: 'Milan Resort', place: 'Kota, Rajasthan' },
        { heading: 'DJ Night', day: '17', monthYear: 'January 2027', line: 'Sunday', venue: 'Milan Resort', place: 'Kota, Rajasthan' },
        { heading: 'Haldi', day: '18', monthYear: 'January 2027', line: 'Monday', venue: 'Milan Resort', place: 'Kota, Rajasthan' },
        { heading: 'Shadi', day: '18', monthYear: 'January 2027', line: 'Monday, 11 AM', venue: 'Milan Resort', place: 'Kota, Rajasthan' }
      ]
    },
    families: {
      heading: 'Two homes, one celebration',
      bride: { name: 'Chinab', parents: 'D/O Smt. Anita Trivedi & Mr Sunil Trivedi', address: 'House No: 1-D-1, Jawahar Nagar, Bundi, Rajasthan, 324002' },
      groom: { name: 'Siddharth', parents: 'S/O Smt. Krishna Bhattacharya & Late Mr Ranjan Bhattacharya', address: 'House No: 1561/4, Yadav Colony, Jabalpur, MP, 482001' }
    },
    route: { line: 'And the story travels on, to the city of the Narmada.', from: 'Kota', to: 'Jabalpur', river: 'Narmada' },
    reception: { heading: 'Reception', date: 'January 20, 2027', venue: 'Hotel Yuvraj Grand', place: 'Vijaynagar, Jabalpur', directions: 'View on map', art: 'A boat on the Narmada among the marble rocks of Bhedaghat' },
    rsvp: {
      heading: 'Your presence would mean so much to us', label: 'RSVP', contact: 'Contact', cta: 'Confirm your attendance',
      lampPrompt: 'Light the diya', lampLabel: 'Light the diya',
      optBoth: 'Both events', optWed: 'Wedding only', optRec: 'Reception only', optNo: 'Can’t make it',
      guestsLabel: 'Number of guests', guestsDec: 'One guest fewer', guestsInc: 'One guest more',
      nameLabel: 'Your name (optional)', whatsapp: 'Reply on WhatsApp',
      msgBoth: 'Hello! Thank you for the invitation. We will attend both the wedding and the reception: {n} guest(s).',
      msgWed: 'Hello! Thank you for the invitation. We will attend the wedding in Kota: {n} guest(s).',
      msgRec: 'Hello! Thank you for the invitation. We will attend the reception in Jabalpur: {n} guest(s).',
      msgNo: 'Hello! Thank you for the invitation. Sadly we can’t make it, but our blessings are with you.',
      msgName: '— {name}'
    },
    calm: { lake: 'The bride and groom at a railing by the lake at sunset', fort: 'A Rajasthani fort between lake and hills at sunset' }
  }
};
