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
    nav: { home: 'होम', wedding: 'विवाह', rituals: 'रस्में', reception: 'स्वागत', rsvp: 'RSVP', menu: 'मेनू', close: 'बंद करें' }, 
    opening: { blessing: 'शुभ विवाह', bride: 'चिनाब', and: 'एवं', groom: 'सिद्धार्थ', hint: 'नीचे स्क्रॉल करें' },
    fort: { invocation: '॥ श्री गणेशाय नमः ॥' },
    announce: {
      lead: 'दोनों परिवारों के आशीर्वाद के साथ',
      bride: 'चिनाब', and: 'एवं', groom: 'सिद्धार्थ',
      message: 'अपने जीवन के इस मंगल अवसर पर आपको सादर आमंत्रित करते हैं। आपकी उपस्थिति और स्नेह से यह दिन और भी शुभ हो जाएगा।'
    },
    wedding: {
      heading: 'विवाह', day: '18', monthYear: 'जनवरी 2027', weekday: 'सोमवार', time: 'प्रातः 11 बजे से',
      venue: 'मिलन रिज़ॉर्ट', place: 'कोटा, राजस्थान', directions: 'नक्शे पर देखें'
    },
    families: {
      heading: 'दो घर, एक उत्सव',
      bride: { name: 'चिनाब', parents: 'पुत्री श्रीमती अनीता त्रिवेदी एवं श्री सुनील त्रिवेदी' },
      groom: { name: 'सिद्धार्थ', parents: 'पुत्र श्रीमती कृष्णा भट्टाचार्य एवं स्वर्गीय श्री रंजन भट्टाचार्य' }
    },
    rituals: {
      heading: 'विवाह संस्कार',
      intro: 'परंपराओं के पावन संगम में, अनंत प्रेम का शुभारंभ।',
      nudge: 'आगे बढ़ते रहें',
      items: [
        { n: '१', title: 'विनायक स्थापना', text: 'शुभारंभ और विघ्नों के निवारण के लिए भगवान गणेश का आह्वान।', alt: 'चौकी पर विराजमान भगवान गणेश, सामने दीये, कलश और लड्डू' },
        { n: '२', title: 'बारात स्वागत ', text: 'दूल्हे और उसकी बारात के विवाह स्थल पर पहुँचने पर दुल्हन पक्ष द्वारा पारंपरिक स्वागत किया जाता है।', alt: 'दूल्हा और दुल्हन गेंदे की माला उठाए आमने-सामने' },
        { n: '३', title: 'वरमाला', text: 'दूल्हा और दुल्हन एक-दूसरे को वरमाला पहनाकर अपने जीवनसाथी के रूप में स्वीकार करते हैं।', alt: 'दूल्हा और दुल्हन गेंदे की माला उठाए आमने-सामने' },
        { n: '४', title: 'कन्यादान', text: 'परिवार द्वारा कन्या को प्रेम और आशीर्वाद के साथ वर को सौंपने की पारंपरिक रस्म।', alt: 'लोटे से जल की धारा, वर और वधू के हाथों पर, नीचे परिवार के हाथ' },
        { n: '५', title: 'पाणिग्रहण', text: 'वर द्वारा वधू का हाथ स्वीकार करना और जीवनभर साथ निभाने का संकल्प।', alt: 'मेहंदी रचा वधू का हाथ वर के हाथ में' },
        { n: '६', title: 'सप्तपदी एवं अग्नि फेरे', text: 'पवित्र अग्नि को साक्षी मानकर दोनों सात फेरे लेते हैं।', alt: 'तारों भरी रात में वेदी की अग्नि और गठबंधन में बँधे वर-वधू' },
        // { n: '६', title: 'सप्तपदी', text: 'साथ मिलकर सात कदम और सात जीवन-संकल्प।', alt: 'बावड़ी के जल में सात कमल, हर एक पर महावर लगे चरण' },
        { n: '७', title: 'सिंदूर एवं मंगलसूत्र', text: 'विवाह के पारंपरिक प्रतीकों के माध्यम से वैवाहिक बंधन की पूर्णता।', alt: 'सिंदूरदानी और काले मोतियों का मंगलसूत्र' },
        { n: '८', title: 'आशीर्वाद', text: 'परिवार और प्रियजनों से नवविवाहित जोड़े के लिए आशीर्वाद।', alt: 'बुज़ुर्ग हाथ उठाकर आशीर्वाद देते हुए, ऊपर से गिरती पंखुड़ियाँ' }
      ]
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
    nav: { home: 'Home', wedding: 'Wedding', rituals: 'Rituals', reception: 'Reception', rsvp: 'RSVP', menu: 'Menu', close: 'Close' },
    opening: { blessing: 'The auspicious wedding of', bride: 'Chinab', and: '&', groom: 'Siddharth', hint: 'Scroll toward the sunset' },
    fort: { invocation: 'Om Shree Ganeshay Namah' },
    announce: {
      lead: 'Together with their families',
      bride: 'Chinab', and: '&', groom: 'Siddharth',
      message: 'cordially invite you to join the occasion of their wedding on'
    },
    wedding: {
      day: '18', monthYear: 'January 2027', weekday: 'Monday', time: '11 AM',
      venue: 'Milan Resort', place: 'Kota, Rajasthan', directions: 'View on map'
    },
    families: {
      heading: 'Two homes, one celebration',
      bride: { name: 'Chinab', parents: 'D/O Smt. Anita Trivedi & Mr Sunil Trivedi', address: 'House No: 1-D-1, Jawahar Nagar, Bundi, Rajasthan, 324002' },
      groom: { name: 'Siddharth', parents: 'S/O Smt. Krishna Bhattacharya & Late Mr Ranjan Bhattacharya', address: 'House No: 1561/4, Yadav Colony, Jabalpur, MP, 482001' }
    },
    rituals: {
      heading: 'The Wedding Rituals',
      intro: 'Where time-honored traditions meet the promise of forever.',
      nudge: 'Keep walking',
      items: [
        { n: '1', title: 'Vinayak Sthapna', text: 'An invocation of Lord Ganesha, for an auspicious beginning and the removal of obstacles.', alt: 'Lord Ganesha seated on a low altar with lamps, kalash and laddoos before him' },
        { n: '2', title: 'Barat Swagat', text: 'When the groom and his baraat arrive at the wedding venue, a traditional welcome is given by the bride’s side.', alt: 'Groom welcome' },
        { n: '3', title: 'Varmala', text: 'The bride and groom garland each other, accepting one another as life partners.', alt: 'Bride and groom face each other, lifting a marigold garland' },
        { n: '4', title: 'Kanyadaan', text: 'The traditional rite in which the family entrusts the bride to the groom, with love and blessings.', alt: 'Water pours from a brass lota over the couple’s hands, with the family’s hands beneath' },
        { n: '5', title: 'Panigrahan', text: 'The groom accepts the bride’s hand, with a vow to stand together for life.', alt: 'The bride’s hennaed hand rests in the groom’s' },
        { n: '6', title: 'Saptapadi & Agni Pheras', text: 'With the sacred fire as witness, the couple walk the seven rounds.', alt: 'A sacred fire under a starry sky, the couple joined by a knotted cloth' },
        // { n: '6', title: 'Saptapadi', text: 'Seven steps together, and seven promises for life.', alt: 'Seven lotuses across a stepwell’s water, each marked with alta footprints' },
        { n: '7', title: 'Sindoor & Mangalsutra', text: 'The marriage bond is completed through its traditional symbols.', alt: 'A brass sindoor box beside a black-beaded mangalsutra' },
        { n: '8', title: 'Aashirwad', text: 'Blessings from family and loved ones for the newlywed couple.', alt: 'Elders raise their hands in blessing as petals fall over the couple' }
      ]
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
