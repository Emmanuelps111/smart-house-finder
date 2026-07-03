// Lightweight EN <-> SW translator for Smart House Finder
// Walks text nodes + common attributes, replacing matches from a dictionary.
// Persists user's choice in localStorage under 'shf-lang'.
// Runs on every page (loaded from partials.js) so the toggle is global.
(function () {
  const LANG_KEY = 'shf-lang';
  const DEFAULT = 'en';

  // English -> Swahili dictionary.
  // Add exact phrases as they appear in the UI. Matching is on trimmed text.
  const DICT_SW = {
    // ── Long marketing / hero copy ──────────────────────────────────────
    'Browse verified listings, message landlords, and explore neighborhoods on an interactive map — built for students and renters.':
      'Vinjari matangazo yaliyothibitishwa, tuma ujumbe kwa wamiliki, na chunguza mitaa kwenye ramani ya mwingiliano — imejengwa kwa wanafunzi na wapangaji.',
    '"I found my student flat in Mwenge in just two days. The map view made comparing neighborhoods around UDSM so easy."':
      '"Nilipata chumba changu Mwenge ndani ya siku mbili tu. Mtazamo wa ramani ulirahisisha kulinganisha mitaa karibu na UDSM."',
    '"As a landlord in Kinondoni, I had three viewings booked within a week. Far better than older platforms."':
      '"Kama mmiliki Kinondoni, nilipata maombi matatu ya kuangalia ndani ya wiki moja. Bora zaidi kuliko mifumo ya zamani."',
    '"Verified badges gave me confidence when renting near SUA. No scams, no time wasted, great support."':
      '"Alama za uthibitisho zilinipa imani nilipopanga karibu na SUA. Hakuna ulaghai, hakuna wakati uliopotea, msaada mzuri."',

    // ── Login helpers ───────────────────────────────────────────────────
    "Still can't access your account?": 'Bado huwezi kufikia akaunti yako?',
    'Message us on WhatsApp': 'Tutumie ujumbe WhatsApp',
    'Sign In as Student': 'Ingia kama Mwanafunzi',
    'Sign In as Renter': 'Ingia kama Mpangaji',
    'Sign In as Landlord': 'Ingia kama Mmiliki',
    'Sign Up as Student': 'Jisajili kama Mwanafunzi',
    'Sign Up as Renter': 'Jisajili kama Mpangaji',
    'Sign Up as Landlord': 'Jisajili kama Mmiliki',
    'student': 'mwanafunzi',
    'renter': 'mpangaji',
    'landlord': 'mmiliki',
    'admin': 'msimamizi',

    // ── Price suffix variants ───────────────────────────────────────────
    '/month': '/mwezi',
    ' /month': ' /mwezi',
    '/ month': '/ mwezi',

    // ── Toasts / alerts / dynamic messages ──────────────────────────────
    'Please sign in first.': 'Tafadhali ingia kwanza.',
    'Please sign in to request a roommate.': 'Tafadhali ingia ili kuomba mwenzi.',
    'Please sign in to leave a review.': 'Tafadhali ingia ili kuacha tathmini.',
    'Please fill all required fields.': 'Tafadhali jaza sehemu zote zinazohitajika.',
    'Enter a valid phone number.': 'Weka namba sahihi ya simu.',
    'Please enter a valid email address.': 'Tafadhali weka barua pepe sahihi.',
    'Phone must be in the format +255XXXXXXXXX (9 digits after +255).': 'Simu lazima iwe katika muundo +255XXXXXXXXX (nambari 9 baada ya +255).',
    'Pick a star rating first.': 'Chagua ukadiriaji wa nyota kwanza.',
    'Write a short message first.': 'Andika ujumbe mfupi kwanza.',
    'Please select a video file.': 'Tafadhali chagua faili la video.',
    'Video is over 100MB. Please pick a smaller file.': 'Video inazidi 100MB. Tafadhali chagua faili dogo.',
    'Viewing request sent to the landlord!': 'Ombi la kuangalia limetumwa kwa mmiliki!',
    'Request sent! Admin will notify you when a match is found.': 'Ombi limetumwa! Msimamizi atakujulisha ukipata mwenzi.',
    'Listing updated!': 'Tangazo limesasishwa!',
    'Listing submitted for review!': 'Tangazo limewasilishwa kwa ukaguzi!',
    'Listing deleted.': 'Tangazo limefutwa.',
    'Reply sent — the renter will get a notification.': 'Jibu limetumwa — mpangaji atapata arifa.',
    'Review deleted.': 'Tathmini imefutwa.',
    'Review updated.': 'Tathmini imesasishwa.',
    'Thanks for your review!': 'Asante kwa tathmini yako!',
    'Could not save listing.': 'Haikuwezekana kuhifadhi tangazo.',
    'Could not post review.': 'Haikuwezekana kuchapisha tathmini.',
    'Could not post your request.': 'Haikuwezekana kuchapisha ombi lako.',
    'Please sign in to view listing details.': 'Tafadhali ingia ili kuona maelezo ya tangazo.',
    'Please sign in to interact with listings.': 'Tafadhali ingia ili kushirikiana na matangazo.',
    'Please sign in to continue.': 'Tafadhali ingia ili kuendelea.',

    // ── Navigation & shell ──────────────────────────────────────────────

    'Home': 'Nyumbani',
    'Listings': 'Matangazo',
    'All Listings': 'Matangazo Yote',
    'View all listings': 'Angalia matangazo yote',
    'Map': 'Ramani',
    'Pricing': 'Bei',
    'Contact': 'Wasiliana',
    'About': 'Kuhusu',
    'FAQ': 'Maswali',
    'Sign In': 'Ingia',
    'Sign in': 'Ingia',
    'Sign Up': 'Jisajili',
    'Sign up': 'Jisajili',
    'Log out': 'Toka',
    'Logout': 'Toka',
    'Account': 'Akaunti',
    'Your account': 'Akaunti yako',
    'Notifications': 'Arifa',
    'Admin': 'Msimamizi',
    'Admin dashboard': 'Dashibodi ya Msimamizi',
    'Admin Dashboard': 'Dashibodi ya Msimamizi',
    'Landlord dashboard': 'Dashibodi ya Mmiliki',
    'Analytics dashboard': 'Dashibodi ya Uchambuzi',
    'Browse listings': 'Vinjari matangazo',
    'Browse Listings': 'Vinjari Matangazo',
    'Browse all listings': 'Vinjari matangazo yote',
    'Menu': 'Menyu',
    'Toggle theme': 'Badilisha mandhari',
    'Back to top': 'Rudi juu',
    'Language': 'Lugha',
    'Back': 'Rudi',
    'Back to listings': 'Rudi kwenye matangazo',
    'Back to sign in': 'Rudi kwenye kuingia',
    'Go to sign in': 'Nenda kuingia',
    'Continue to sign in': 'Endelea kuingia',
    'Loading…': 'Inapakia…',
    'Loading...': 'Inapakia...',
    'Mark all read': 'Weka zote kama zimesomwa',

    // ── Auth / forms ────────────────────────────────────────────────────
    'Email': 'Barua pepe',
    'Password': 'Nenosiri',
    'New password': 'Nenosiri jipya',
    'Confirm password': 'Thibitisha nenosiri',
    'Confirm new password': 'Thibitisha nenosiri jipya',
    'At least 8 characters.': 'Angalau herufi 8.',
    'Full name': 'Jina kamili',
    'Your name': 'Jina lako',
    'Name': 'Jina',
    'Phone': 'Simu',
    'Phone number': 'Namba ya simu',
    'Contact phone': 'Simu ya mawasiliano',
    'Contact details': 'Maelezo ya mawasiliano',
    'Role': 'Jukumu',
    'Renter': 'Mpangaji',
    'Student': 'Mwanafunzi',
    'Landlord': 'Mmiliki',
    'Agency': 'Wakala',
    'Choose your account type to continue.': 'Chagua aina ya akaunti yako ili kuendelea.',
    'Forgot password?': 'Umesahau nenosiri?',
    'Forgot password': 'Umesahau nenosiri',
    'New here?': 'Mgeni hapa?',
    'First Time?': 'Mara ya kwanza?',
    'Sign In as Student': 'Ingia kama Mwanafunzi',
    'Reset your password': 'Weka upya nenosiri lako',
    'Could not verify reset link. Please try again.': 'Hatukuweza kuthibitisha kiungo cha kubadilisha. Tafadhali jaribu tena.',
    'Sign in below to complete ID verification.': 'Ingia hapa chini ili kukamilisha uthibitisho wa kitambulisho.',
    'Sign in to verify': 'Ingia ili kuthibitisha',
    'Edit my details — back to sign up': 'Hariri maelezo yangu — rudi kwenye kujisajili',
    'Try again — back to sign up': 'Jaribu tena — rudi kwenye kujisajili',
    'You can start the sign-up again with fresh photos.': 'Unaweza kuanza upya kujisajili na picha mpya.',
    'Retry with the same photos': 'Jaribu tena na picha zilezile',
    'Retry verification': 'Jaribu tena uthibitisho',
    'We couldn\u2019t complete verification': 'Hatukuweza kukamilisha uthibitisho',
    "We couldn't complete verification": 'Hatukuweza kukamilisha uthibitisho',
    'How to fix this': 'Jinsi ya kurekebisha hili',
    'Sign in and browse listings': 'Ingia na vinjari matangazo',
    'Browse listings while you wait': 'Vinjari matangazo ukisubiri',

    // ── ID / OCR verification ───────────────────────────────────────────
    'Identity verification': 'Uthibitisho wa utambulisho',
    'Verifying your ID…': 'Inathibitisha kitambulisho chako…',
    'Uploading your document…': 'Inapakia hati yako…',
    'Extracting text from the image': 'Inatoa maandishi kutoka kwenye picha',
    'Reading your document with AI and comparing it to what you entered.': 'Inasoma hati yako kwa AI na kulinganisha na ulichoingiza.',
    'Matching against your details': 'Inalinganisha na maelezo yako',
    'OCR confidence:': 'Uhakika wa OCR:',
    'Read from ID:': 'Kilichosomwa kwenye kitambulisho:',
    'You entered:': 'Ulichoingiza:',
    'Numbers': 'Nambari',
    'Other checks': 'Ukaguzi mwingine',
    'Role added!': 'Jukumu limeongezwa!',
    'can now also sign in as a': 'sasa unaweza pia kuingia kama',
    'National ID number (exactly 20 digits)': 'Nambari ya Kitambulisho cha Taifa (nambari 20 haswa)',
    'Upload copy of National ID (front & back)': 'Pakia nakala ya Kitambulisho cha Taifa (mbele & nyuma)',
    'National ID (front, optional back):': 'Kitambulisho cha Taifa (mbele, nyuma si lazima):',
    'Selfie holding the ID:': 'Picha yako ukishikilia kitambulisho:',
    'Selfie holding your ID (recommended)': 'Picha yako ukishikilia kitambulisho (inashauriwa)',
    'Click to upload selfie — JPG or PNG': 'Bonyeza kupakia picha yako — JPG au PNG',
    'Click to upload student ID — JPG or PNG (max 5MB)': 'Bonyeza kupakia kitambulisho cha mwanafunzi — JPG au PNG (kikubwa 5MB)',
    'Click to upload — JPG, PNG or PDF (max 5MB)': 'Bonyeza kupakia — JPG, PNG au PDF (kikubwa 5MB)',
    'Click to upload — PDF, JPG or PNG (max 10MB)': 'Bonyeza kupakia — PDF, JPG au PNG (kikubwa 10MB)',
    'Upload student ID card (front)': 'Pakia kadi ya mwanafunzi (mbele)',
    'Student details': 'Maelezo ya mwanafunzi',
    'Student registration number': 'Nambari ya usajili ya mwanafunzi',
    'University / College': 'Chuo Kikuu / Chuo',
    'ID verified': 'Kitambulisho kimethibitishwa',

    // ── Listings & filters ──────────────────────────────────────────────
    'Find your next home': 'Tafuta nyumba yako inayofuata',
    'Find your next home, the smart way': 'Tafuta nyumba yako inayofuata, kwa njia mahiri',
    'Search': 'Tafuta',
    'Filters': 'Vichujio',
    'Sort by': 'Panga kwa',
    'Price': 'Bei',
    'Price: Low to High': 'Bei: Chini kwenda Juu',
    'Price: High to Low': 'Bei: Juu kwenda Chini',
    'Newest first': 'Mpya kwanza',
    'Oldest first': 'Zamani kwanza',
    'Newest': 'Mpya zaidi',
    'Oldest': 'Zamani zaidi',
    'Most bedrooms': 'Vyumba vingi zaidi',
    'Any bedrooms': 'Vyumba vyovyote',
    'Any price': 'Bei yoyote',
    '1+ bed': 'Chumba 1+',
    '2+ beds': 'Vyumba 2+',
    '3+ beds': 'Vyumba 3+',
    '4+ beds': 'Vyumba 4+',
    'Under TSh 300,000': 'Chini ya TSh 300,000',
    'Under TSh 600,000': 'Chini ya TSh 600,000',
    'Under TSh 1,000,000': 'Chini ya TSh 1,000,000',
    'Under TSh 2,000,000': 'Chini ya TSh 2,000,000',
    'Under TSh 5,000,000': 'Chini ya TSh 5,000,000',
    'Location': 'Eneo',
    'Neighbourhood': 'Kitongoji',
    'City *': 'Jiji *',
    'Bedrooms': 'Vyumba vya kulala',
    'Bedrooms *': 'Vyumba vya kulala *',
    'Bathrooms': 'Vyoo',
    'Bathrooms *': 'Vyoo *',
    'Size': 'Ukubwa',
    'Size (sqm)': 'Ukubwa (sqm)',
    'Amenities': 'Huduma',
    'Description': 'Maelezo',
    'View details': 'Angalia maelezo',
    'View details →': 'Angalia maelezo →',
    'Details': 'Maelezo',
    'Listed by': 'Imewekwa na',
    'Verified Landlord': 'Mmiliki Aliyeidhinishwa',
    'Verified Listings': 'Matangazo Yaliyoidhinishwa',
    'Verified landlord badge': 'Alama ya mmiliki aliyeidhinishwa',
    'Verified landlords': 'Wamiliki walioidhinishwa',
    'Available from': 'Inapatikana kuanzia',
    'Available': 'Inapatikana',
    'per month': 'kwa mwezi',
    'month': 'mwezi',
    '/ month': '/ mwezi',
    'Rent / month (TSh) *': 'Kodi / mwezi (TSh) *',
    'Deposit (months)': 'Amana (miezi)',
    'Property title *': 'Kichwa cha nyumba *',
    'Property type': 'Aina ya nyumba',
    'Property photos': 'Picha za nyumba',
    'Property video': 'Video ya nyumba',
    'Property ownership': 'Umiliki wa nyumba',
    'Proof of property ownership (title deed / utility bill)': 'Uthibitisho wa umiliki (hati ya umiliki / bili ya huduma)',
    'Furnishing': 'Samani',
    'Video tour': 'Ziara ya video',
    'Existing video attached': 'Video iliyopo imeambatishwa',
    'Remove video': 'Ondoa video',
    'No media uploaded': 'Hakuna faili lililopakiwa',
    'No file selected': 'Hakuna faili lililochaguliwa',
    'Click to upload photos — JPG or PNG (max 3MB each)': 'Bonyeza kupakia picha — JPG au PNG (kikubwa 3MB kila moja)',
    'Click to upload a short video tour of the house': 'Bonyeza kupakia video fupi ya ziara ya nyumba',
    '(optional, up to 8)': '(si lazima, hadi 8)',
    '(optional, max 100MB — MP4/WebM/MOV)': '(si lazima, kikubwa 100MB — MP4/WebM/MOV)',
    "(optional — required if you don't upload any photos or a video)": '(si lazima — ni lazima ikiwa hutapakia picha au video)',
    '— optional': '— si lazima',
    '— supports decimals & negatives': '— inakubali desimali na hasi',
    '— only selected ones are shown to renters': '— zile zilizochaguliwa tu ndizo huonyeshwa kwa wapangaji',
    'Latitude': 'Latitudo',
    'Longitude': 'Longitudo',
    'About this property': 'Kuhusu nyumba hii',
    'Listing not found': 'Tangazo halipatikani',
    "The property you're looking for doesn't exist or has been removed.": 'Nyumba unayoitafuta haipo au imeondolewa.',
    'No amenities listed.': 'Hakuna huduma zilizotajwa.',
    'No description provided.': 'Hakuna maelezo yaliyotolewa.',
    'No listings match your filters.': 'Hakuna matangazo yanayolingana na vichujio vyako.',
    'No listings yet. Add your first property using the form.': 'Bado hakuna matangazo. Ongeza nyumba yako ya kwanza kwa fomu.',
    'No active listings.': 'Hakuna matangazo hai.',
    'No results': 'Hakuna matokeo',
    'No listings found': 'Hakuna matangazo yaliyopatikana',
    'Featured Listings': 'Matangazo Maalum',
    'Recently added homes': 'Nyumba zilizoongezwa hivi karibuni',
    'Listings on map': 'Matangazo kwenye ramani',
    'Click a card or marker to focus the location.': 'Bonyeza kadi au alama kuzingatia eneo.',
    'Map view & filters': 'Mtazamo wa ramani & vichujio',
    'Side-by-side comparison': 'Ulinganisho wa upande kwa upande',

    // ── Actions & CTAs ──────────────────────────────────────────────────
    'Request Viewing': 'Omba Kuangalia',
    'Send Request': 'Tuma Ombi',
    'Send message': 'Tuma ujumbe',
    'Send Message': 'Tuma Ujumbe',
    'Send reply': 'Tuma jibu',
    'Post review': 'Chapisha tathmini',
    'Contact Landlord': 'Wasiliana na Mmiliki',
    'Message': 'Ujumbe',
    'Call': 'Piga simu',
    'WhatsApp': 'WhatsApp',
    'Send': 'Tuma',
    'Cancel': 'Ghairi',
    'Save': 'Hifadhi',
    'Save favorites': 'Hifadhi vipendwa',
    'Submit': 'Wasilisha',
    'Update': 'Sasisha',
    'Delete': 'Futa',
    'Edit': 'Hariri',
    'Approve': 'Idhinisha',
    'Reject': 'Kataa',
    'Reason': 'Sababu',
    'Pending': 'Inasubiri',
    'Pending review': 'Inasubiri ukaguzi',
    'Approved': 'Imeidhinishwa',
    'Rejected': 'Imekataliwa',
    'Get started': 'Anza',
    'Get Started': 'Anza',
    'Start free trial': 'Anza jaribio la bure',
    'Contact sales': 'Wasiliana na mauzo',
    'List Your Property': 'Orodhesha Nyumba Yako',
    'Add a new property': 'Ongeza nyumba mpya',
    'Number of properties': 'Idadi ya nyumba',
    'Manage your properties, view requests and update availability.': 'Simamia nyumba zako, angalia maombi na sasisha upatikanaji.',
    'Notes for the admin': 'Vidokezo kwa msimamizi',
    'New viewing requests': 'Maombi mapya ya kuangalia',
    'No viewing requests yet.': 'Bado hakuna maombi ya kuangalia.',
    'Updates about your activity will appear here.': 'Sasisho kuhusu shughuli zako yataonekana hapa.',

    // ── Occupancy ───────────────────────────────────────────────────────
    'Vacant': 'Wazi',
    'Occupied': 'Imekaliwa',
    'Occupancy status': 'Hali ya ukaaji',
    '🟢 Vacant — available to rent': '🟢 Wazi — inapatikana kupangwa',
    '🔴 Occupied — currently rented': '🔴 Imekaliwa — imepangwa kwa sasa',

    // ── Roommate ────────────────────────────────────────────────────────
    'Find a Roommate to Split Cost': 'Tafuta Mwenzi wa Kugawana Gharama',
    '🙋‍♂️ Find a Roommate to Split Cost': '🙋‍♂️ Tafuta Mwenzi wa Kugawana Gharama',
    '🙋 Find a Roommate': '🙋 Tafuta Mwenzi',
    'Roommate Requests': 'Maombi ya Wenzi',
    '🤝 Roommate Requests': '🤝 Maombi ya Wenzi',
    'Cleanliness': 'Usafi',
    'Cleanliness preference': 'Upendeleo wa usafi',
    'Sleep schedule': 'Ratiba ya usingizi',
    'Early Bird': 'Anaamka mapema',
    'Night Owl': 'Anakesha usiku',
    'Flexible': 'Inanyumbulika',
    'High': 'Juu',
    'Medium': 'Wastani',
    'Bio': 'Wasifu',
    'Short bio': 'Wasifu mfupi',
    'Short bio (shown on listings)': 'Wasifu mfupi (unaonekana kwenye matangazo)',
    'No one has requested a roommate here yet. Be the first!': 'Hakuna aliyeomba mwenzi hapa bado. Kuwa wa kwanza!',
    'Students looking to co-tenant this property.': 'Wanafunzi wanaotafuta kupanga pamoja nyumba hii.',
    'Phone (for the admin to share with your match)': 'Simu (ili msimamizi ashiriki na mwenzi wako)',

    // ── Reviews ─────────────────────────────────────────────────────────
    '⭐ Reviews': '⭐ Tathmini',
    'Reviews': 'Tathmini',
    'Your rating': 'Ukadiriaji wako',
    'Be the first to review this property.': 'Kuwa wa kwanza kutoa tathmini kwa nyumba hii.',
    'No reviews yet.': 'Bado hakuna tathmini.',
    'to leave a review.': 'ili kuacha tathmini.',
    'Avg rating': 'Wastani wa ukadiriaji',
    'Reviews service unavailable.': 'Huduma ya tathmini haipatikani.',
    'Roommate service unavailable.': 'Huduma ya wenzi haipatikani.',
    'Could not load landlord profile.': 'Haikuwezekana kupakia wasifu wa mmiliki.',
    'Could not load reviews.': 'Haikuwezekana kupakia tathmini.',
    'Could not load roommate requests.': 'Haikuwezekana kupakia maombi ya wenzi.',
    'Landlord not found.': 'Mmiliki hakupatikana.',
    'Missing landlord id.': 'Nambari ya mmiliki haipo.',
    'Loading landlord…': 'Inapakia mmiliki…',

    // ── Home / marketing ────────────────────────────────────────────────
    'Welcome to Smart House Finder': 'Karibu Smart House Finder',
    'Direct Connection': 'Muunganisho wa Moja kwa Moja',
    'Direct landlord messaging': 'Kutuma ujumbe moja kwa moja kwa mmiliki',
    'Talk to landlords without middlemen. No hidden fees, just clarity.': 'Ongea na wamiliki bila madalali. Hakuna ada zilizofichwa, uwazi tu.',
    'Trusted Landlords': 'Wamiliki Wanaoaminika',
    'Trusted by thousands': 'Anaaminiwa na maelfu',
    'Trusted nationwide': 'Anaaminiwa nchi nzima',
    'Smart Search': 'Utafutaji Mahiri',
    'Fast Listings': 'Matangazo ya Haraka',
    'Featured placement': 'Nafasi maalum',
    'Interactive Map': 'Ramani ya Mwingiliano',
    'Secure Accounts': 'Akaunti Salama',
    'Built for Students': 'Imejengwa kwa Wanafunzi',
    'Built by students, for students': 'Imejengwa na wanafunzi, kwa ajili ya wanafunzi',
    'Why Smart House Finder': 'Kwa nini Smart House Finder',
    'Everything renters and landlords need': 'Kila kitu ambacho wapangaji na wamiliki wanahitaji',
    'Every property is reviewed for accuracy so you avoid scams and surprises.': 'Kila nyumba hukaguliwa kwa usahihi ili uepuke ulaghai na mshangao.',
    'Filter and browse verified rentals across the country.': 'Chuja na vinjari nyumba zilizoidhinishwa nchi nzima.',
    'Filters tailored to budget, room type, and shared housing preferences.': 'Vichujio vinavyolingana na bajeti, aina ya chumba, na upendeleo wa kupanga pamoja.',
    'Find homes by neighborhood, transport links and proximity to your campus.': 'Tafuta nyumba kwa kitongoji, usafiri na ukaribu na chuo chako.',
    'Landlords can post a new property in under three minutes.': 'Wamiliki wanaweza kuchapisha nyumba mpya chini ya dakika tatu.',
    'Separate logins for students and landlords with role-based protection.': 'Kuingia tofauti kwa wanafunzi na wamiliki kwa ulinzi wa majukumu.',
    'Landlords only': 'Wamiliki tu',
    'Active renters': 'Wapangaji hai',
    'Satisfaction rate': 'Kiwango cha kuridhika',
    'Years as a landlord': 'Miaka kama mmiliki',
    '50k+': '50k+',
    '98%': '98%',
    'Testimonials': 'Ushuhuda',
    'Featured': 'Maalum',
    'Featured Listings': 'Matangazo Maalum',

    // ── Pricing ─────────────────────────────────────────────────────────
    'Simple, transparent pricing': 'Bei rahisi, wazi',
    'Free for renters, flexible plans for landlords.': 'Bure kwa wapangaji, mipango rahisi kwa wamiliki.',
    'Free': 'Bure',
    'For students and renters searching for a home.': 'Kwa wanafunzi na wapangaji wanaotafuta nyumba.',
    'For agencies managing multiple properties.': 'Kwa mawakala wanaosimamia nyumba nyingi.',
    'Unlimited listings': 'Matangazo yasiyo na kikomo',
    'Unlimited search': 'Utafutaji usio na kikomo',
    'Up to 5 active listings': 'Hadi matangazo 5 hai',
    'List up to 5 properties with priority support.': 'Orodhesha hadi nyumba 5 na msaada wa kipaumbele.',
    'Priority email support': 'Msaada wa barua pepe wa kipaumbele',
    'Dedicated account manager': 'Meneja wa akaunti wa kipekee',
    'Team accounts': 'Akaunti za timu',
    'Frequently asked questions': 'Maswali yanayoulizwa mara kwa mara',
    'Is Smart House Finder free for students?': 'Je, Smart House Finder ni bure kwa wanafunzi?',
    'How are listings verified?': 'Je, matangazo huthibitishwaje?',
    'Can I cancel my landlord plan anytime?': 'Naweza kughairi mpango wangu wa mmiliki wakati wowote?',
    'Do you support payments and tenancy contracts?': 'Je, mnaunga mkono malipo na mikataba ya upangaji?',

    // ── About / contact ─────────────────────────────────────────────────
    'About Smart House Finder': 'Kuhusu Smart House Finder',
    'Our story': 'Hadithi yetu',
    'Today we serve over 50,000 renters and 4,200 landlords across the UK.': 'Leo tunahudumia zaidi ya wapangaji 50,000 na wamiliki 4,200.',
    'Get in touch': 'Wasiliana nasi',
    'Your email': 'Barua pepe yako',
    'Your message': 'Ujumbe wako',
    'We typically respond within 24 hours.': 'Kwa kawaida tunajibu ndani ya masaa 24.',
    'Landlord Terms': 'Masharti ya Mmiliki',
    'Privacy Policy': 'Sera ya Faragha',

    // ── Payout & business ───────────────────────────────────────────────
    'Payout & business': 'Malipo & biashara',
    'Bank name': 'Jina la benki',
    'Account / IBAN (last 4)': 'Akaunti / IBAN (nambari 4 za mwisho)',
    'Tax ID / VAT number (optional)': 'Nambari ya kodi / VAT (si lazima)',
    'Residential address': 'Anwani ya makazi',
    'Date of birth': 'Tarehe ya kuzaliwa',

    // ── Titles (per-page <title>) ───────────────────────────────────────
    'Smart House Finder — Find Your Next Home': 'Smart House Finder — Tafuta Nyumba Yako',
    'Listings — Smart House Finder': 'Matangazo — Smart House Finder',
    'Listing Details — Smart House Finder': 'Maelezo ya Tangazo — Smart House Finder',
    'Landlord Dashboard — Smart House Finder': 'Dashibodi ya Mmiliki — Smart House Finder',
    'Landlord Profile — Smart House Finder': 'Wasifu wa Mmiliki — Smart House Finder',
    'Map View — Smart House Finder': 'Mtazamo wa Ramani — Smart House Finder',
    'Pricing — Smart House Finder': 'Bei — Smart House Finder',
    'Contact — Smart House Finder': 'Wasiliana — Smart House Finder',
    'About — Smart House Finder': 'Kuhusu — Smart House Finder',
    'Notifications · Smart House Finder': 'Arifa · Smart House Finder',
    'Sign In / Sign Up — Smart House Finder': 'Ingia / Jisajili — Smart House Finder',
    'Reset Password — Smart House Finder': 'Weka Upya Nenosiri — Smart House Finder',

    // ── Misc ────────────────────────────────────────────────────────────
    '(you)': '(wewe)',
    'Select…': 'Chagua…',
    'Welcome back': 'Karibu tena',
    'All rights reserved.': 'Haki zote zimehifadhiwa.',
  };

  const DICTS = { en: null, sw: DICT_SW };

  function currentLang() {
    return localStorage.getItem(LANG_KEY) || DEFAULT;
  }

  function reverseDict(d) {
    const r = {};
    for (const k in d) if (!r[d[k]]) r[d[k]] = k;
    return r;
  }
  const REV_SW = reverseDict(DICT_SW);

  const ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];

  function translateNode(root, targetLang) {
    if (!root) return;
    const toMap = targetLang === 'sw' ? DICT_SW : REV_SW; // toEN: use SW->EN

    // Also translate the document <title>
    if (root === document.body && document.title) {
      const t = document.title.trim();
      if (toMap[t]) document.title = toMap[t];
    }

    // Text nodes
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const p = n.parentNode;
        if (!p) return NodeFilter.FILTER_REJECT;
        const tag = p.nodeName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'CODE' || tag === 'PRE' || tag === 'TEXTAREA') return NodeFilter.FILTER_REJECT;
        if (p.closest && p.closest('[data-no-i18n]')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const n of nodes) {
      const orig = n.nodeValue;
      const trimmed = orig.trim();
      const hit = toMap[trimmed];
      if (hit) n.nodeValue = orig.replace(trimmed, hit);
    }

    // Attributes
    const els = root.querySelectorAll ? root.querySelectorAll('*') : [];
    els.forEach((el) => {
      if (el.closest && el.closest('[data-no-i18n]')) return;
      ATTRS.forEach((a) => {
        if (!el.hasAttribute(a)) return;
        const v = el.getAttribute(a);
        if (!v) return;
        const t = v.trim();
        const hit = toMap[t];
        if (hit) el.setAttribute(a, v.replace(t, hit));
      });
      // Translate button value attributes
      if (el.tagName === 'INPUT' && ['button','submit','reset'].includes((el.type||'').toLowerCase())) {
        const v = el.value; if (v) { const hit = toMap[v.trim()]; if (hit) el.value = hit; }
      }
    });
  }

  function applyLang(lang) {
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.setAttribute('lang', lang);
    translateNode(document.body, lang === 'sw' ? 'sw' : 'en');
    document.querySelectorAll('[data-lang-label]').forEach((el) => {
      el.textContent = lang === 'sw' ? 'SW' : 'EN';
    });
  }

  function observe() {
    const obs = new MutationObserver((muts) => {
      if (currentLang() !== 'sw') return;
      for (const m of muts) {
        m.addedNodes.forEach((n) => {
          if (n.nodeType === 1) translateNode(n, 'sw');
          else if (n.nodeType === 3 && n.nodeValue && n.nodeValue.trim()) {
            const t = n.nodeValue.trim();
            const hit = DICT_SW[t];
            if (hit) n.nodeValue = n.nodeValue.replace(t, hit);
          }
        });
      }
    });
    obs.observe(document.body, { childList: true, subtree: true, characterData: false });
  }

  window.SHFi18n = {
    get lang() { return currentLang(); },
    set(lang) { applyLang(lang); },
    toggle() { applyLang(currentLang() === 'sw' ? 'en' : 'sw'); },
    translate: translateNode,
  };

  // Translate a raw string used in toasts/alerts/confirms.
  function tr(s) {
    if (currentLang() !== 'sw' || typeof s !== 'string') return s;
    const t = s.trim();
    return DICT_SW[t] ? s.replace(t, DICT_SW[t]) : s;
  }
  window.SHFi18n.tr = tr;

  // Hook toast + native dialogs so dynamic messages get translated too.
  function hookDialogs() {
    if (window.toast && !window.toast.__i18n) {
      const orig = window.toast;
      const t = (m, type, ms) => orig(tr(m), type, ms);
      t.success = (m) => orig(tr(m), 'success');
      t.error   = (m) => orig(tr(m), 'error');
      t.info    = (m) => orig(tr(m), 'info');
      t.__i18n = true;
      window.toast = t;
    }
    if (!window.alert.__i18n) {
      const oa = window.alert.bind(window);
      const w = (m) => oa(tr(m));
      w.__i18n = true; window.alert = w;
    }
    if (!window.confirm.__i18n) {
      const oc = window.confirm.bind(window);
      const w = (m) => oc(tr(m));
      w.__i18n = true; window.confirm = w;
    }
    if (!window.prompt.__i18n) {
      const op = window.prompt.bind(window);
      const w = (m, d) => op(tr(m), d);
      w.__i18n = true; window.prompt = w;
    }
  }

  // Apply after partials mount their header/footer.
  function boot() {
    hookDialogs();
    applyLang(currentLang());
    observe();
    setTimeout(() => { hookDialogs(); applyLang(currentLang()); }, 400);
    setTimeout(() => { hookDialogs(); applyLang(currentLang()); }, 1200);
    setTimeout(() => { hookDialogs(); applyLang(currentLang()); }, 3000);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 50));
  } else {
    setTimeout(boot, 50);
  }
})();
