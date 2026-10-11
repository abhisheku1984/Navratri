/**
 * The chapter story (कथा) for each of the thirteen chapters — full tellings.
 *
 * These are original contemporary renderings written for this app, derived from
 * the public-domain Sanskrit of the Devi Mahatmya as it appears in this edition
 * (`src/content/scripture/chapters/*`), and from the public-domain English
 * witness (Pargiter, 1904) where it helps the English side. They are NOT copied
 * from, or paraphrased out of, any copyrighted edition such as the Gita Press
 * Hindi translation. Every one of them is labelled in the UI as a contemporary
 * rendering so a reader never mistakes it for a published translation.
 *
 * Written in paragraphs (blank-line separated); the reader renders each.
 */

const CHAPTER_STORY_HI_BASE: Record<number, string> = {
  1: `प्रथम अध्याय की कथा वन में बैठे दो टूटे हुए मनुष्यों से आरम्भ होती है — और उसका उत्तर कहीं और निकलता है: सृष्टि के आदि में, उस समुद्र में जहाँ कुछ नहीं था।

चैत्रवंश का राजा सुरथ समस्त पृथ्वीमण्डल का स्वामी था। वह प्रजा को अपने पुत्रों की भाँति पालता था। परन्तु समय के साथ उसके ही अमात्य बलवान्, दुष्ट और दुरात्मा हो गए, और कोल नामक दैत्यों को नष्ट करने वाले राजा उसके शत्रु बन बैठे। युद्ध हुआ। सुरथ की सेना बड़ी थी, फिर भी वह पराजित हुआ। उसके अपने ही नगर में उसके अमात्यों ने उसका कोष और उसका बल छीन लिया। तब वह आखेट के बहाने अकेला ही घोड़े पर बैठकर घने वन की ओर चला गया — एक राजा, एक घोड़ा, और साथ में कुछ नहीं।

वन में उसे द्विजवर मेधा का आश्रम मिला — ऐसा आश्रम जहाँ हिंसक पशु तक शांत थे और जो मुनि के शिष्यों से शोभित था। मुनि ने उसका यथायोग्य सत्कार किया और वह वहीं रहने लगा। परन्तु उसका मन वहाँ नहीं रहा। वह सोचता रहा — जिस नगर को उसके पूर्वजों ने पाला था, वह अब मुझसे हीन होकर रह गया है। मेरे उन दुर्वृत्त भृत्यों के हाथों में न जाने धर्म से पाला जा रहा है या नहीं। वह प्रधान हाथी अब कैसा है? जो लोग नित्य प्रसाद, धन और भोजन पाकर मेरे पीछे चलते थे, वे अब किसी दूसरे राजा की अनुवृत्ति कर रहे होंगे। और वह कोष, जिसे मैंने इतने दुःख से जोड़ा था, उन असम्यक् व्यय करने वालों के हाथों में नष्ट हो रहा होगा।

आश्रम के पास ही उसे एक वैश्य मिला — दुःखी, खिन्न, शोकग्रस्त। राजा ने पूछा कि तुम कौन हो और यहाँ क्यों आए हो। वह वैश्य था समाधि, धनवानों के कुल में उत्पन्न। धन के लोभ में उसके पुत्रों और स्त्री ने उसका धन लेकर उसे घर से निकाल दिया था। वह वन में आ गया था; पर आया था तो भी उसका मन वहीं बँधा था — न जाने मेरे पुत्रों का कुशल है या नहीं, वे सद्वृत्त हैं या दुर्वृत्त, मेरे स्वजन और स्त्री का घर में क्षेम है या अक्षेम।

राजा ने उससे प्रश्न किया जो असल प्रश्न था — जिन लोभियों ने तुम्हें धन के कारण निकाल दिया, उन्हीं में तुम्हारा मन स्नेह क्यों बाँधे हुए है? समाधि उत्तर देता है: क्या करूँ, मेरा मन उनके प्रति कठोर नहीं होता। जिन्होंने पितृ-स्नेह त्यागकर मुझे निकाल दिया, मेरा चित्त उन्हीं में लगा रहता है। मैं जानता हूँ, फिर भी समझ नहीं पाता। उनके कारण मेरे निःश्वास निकलते हैं और मन उदास होता है।

फिर वही दुःख राजा को भी घेर लेता है, और दोनों — वैश्य और राजा — मुनि मेधा के पास जाकर पूछते हैं: दोष दिखते हुए भी मन उन्हीं की ओर खिंचा जाता है; जानते हुए भी हम इस मोह में क्यों पड़े हैं? क्या यह हमारी मूढ़ता है, या हमारे साथ कोई और कुछ कर रहा है?

ऋषि मेधा का उत्तर सम्पूर्ण सप्तशती का बीज है। वे कहते हैं: ज्ञान तो सब प्राणियों में है — पशु-पक्षी में भी। परन्तु यह जो सबको खींच लेने वाली शक्ति है, वह महामाया है — स्वयं देवी, जो ब्रह्मा और विष्णु तक को मोहित कर देती है। वही प्रसन्न होने पर मुक्ति का हेतु बनती है, और वही संसार के बन्धन का कारण — वही विद्या, वही सनातन, वही सर्वेश्वरेश्वरी।

और फिर राजा पूछता है वह प्रश्न जिससे कथा आगे बढ़ती है — वे देवी कौन हैं जिन्हें आप महामाया कहते हैं? वे उत्पन्न कैसे हुईं, उनका कर्म क्या है? ऋषि कहते हैं: वे नित्य हैं, जगत् की मूर्ति हैं; फिर भी उनकी उत्पत्ति अनेक बार हुई है — देवताओं के कार्य की सिद्धि के लिए।

और कथा उस समय की ओर मुड़ती है जब सृष्टि का आरम्भ भी नहीं हुआ था। कल्पान्त में जब सारा जगत् एकार्णव हो गया — केवल जल, और जल — तब भगवान् विष्णु शेष की शय्या बिछाकर योगनिद्रा में सो गए। उस समय विष्णु की नाभि के कमल पर ब्रह्मा प्रजापति विराजमान थे, और योगनिद्रा ने हरि के नेत्रों में निवास किया था।

तभी विष्णु के कान के मैल से दो घोर असुर प्रकट हुए — मधु और कैटभ। वे विख्यात हुए, और वे ब्रह्मा को मारने को उद्यत थे। उन उग्र असुरों को और सोए हुए जनार्दन को देखकर ब्रह्मा एकाग्रचित्त होकर उस योगनिद्रा की स्तुति करने लगे।

उनकी स्तुति साधारण नहीं है। वे कहते हैं — आप स्वाहा हैं, आप स्वधा हैं, आप वषट्कार हैं, आप स्वर की आत्मा हैं; आप अमृत हैं; आप ही संध्या हैं, आप सावित्री हैं, आप ही परा जननी हैं। आपसे यह विश्व धारण किया जाता है, आपसे यह जगत् रचा जाता है, आप ही पालती हैं और आप ही सबका संहार करती हैं। आप महाविद्या हैं, महामाया, महामेधा, महास्मृति, महामोहा, महादेवी, महेश्वरी। आप कालरात्रि हैं, महारात्रि, दारुण मोहरात्रि; आप श्री हैं, ईश्वरी, ह्री, बुद्धि, लज्जा, पुष्टि, तुष्टि, शांति और क्षमा। आप खड्ग धारण करती हैं, शूल धारण करती हैं, गदा और चक्र धारण करती हैं — और फिर भी आप सौम्यता में सब सौम्यों से अधिक सौम्य और सुन्दर हैं। जो कुछ भी, कहीं भी सत् या असत् है, उस सबकी जो शक्ति है, वह आप हैं — तो फिर मैं आपकी स्तुति क्या करूँ?

और वे वर माँगते हैं: इन दुर्जय असुरों को मोहित कीजिए, और जगत्स्वामी अच्युत को शीघ्र जगाइए, जिससे ये मारे जा सकें।

उसी समय देवी विष्णु के नेत्र, मुख, नासिका, बाहु, हृदय और वक्ष से निकलकर अव्यक्तजन्मा ब्रह्मा के सामने प्रकट हुईं — और जनार्दन जाग उठे। जागकर उन्होंने उन दोनों दुरात्माओं को देखा, जो अत्यन्त वीर्य और पराक्रम वाले, क्रोध से रक्तवर्ण नेत्रों वाले थे, और ब्रह्मा को मारने का उद्यम किये हुए थे।

तब भगवान् हरि ने उन दोनों से युद्ध किया — भुजाओं को ही प्रहरण बनाकर, पाँच हज़ार वर्ष तक। वे दोनों बल के मद में मत्त थे, पर महामाया ने उन्हें मोह लिया; और उन्होंने केशव से कहा — हमसे वर माँगिए। भगवान् ने कहा — आज तुम दोनों मुझसे प्रसन्न होओ, और दोनों मेरे वध के योग्य होओ। मैंने तो यही वर चुना है।

वे ठगे गए। सारा जगत् उन्हें जलमय दिखाई दे रहा था, इसलिए उन्होंने कमलनयन भगवान् से कहा — हम दोनों का वध वहाँ कीजिए जहाँ पृथ्वी जल से प्लावित न हो। भगवान् ने कहा — तथास्तु। और शंख, चक्र तथा गदा धारण करने वाले उस भगवान् ने उन दोनों को अपनी जंघाओं पर लिटाकर, चक्र से उनके जघन और शिर काट दिये — वह स्थान, जहाँ जल का प्लावन नहीं था।

इस प्रकार वह देवी, जो स्वयं ब्रह्मा द्वारा स्तुता हुई, प्रकट हुईं। और यही कथा ऋषि मेधा सुरथ और समाधि को सुनाते हैं — उसी प्रश्न का उत्तर देने के लिए जो उन दोनों ने पूछा था: मन उन्हीं से क्यों बँधा रहता है जिन्होंने हमें हानि पहुँचाई? इसका उत्तर यही महामाया हैं, वह शक्ति जो सृष्टि को धारण करती है और जिसके प्रभाव से प्राणी अपने ही अहित की ओर खिंचे जाते हैं।

अन्त में, तेरहवें अध्याय में, दोनों को वरदान मिलेगा — सुरथ को अपना राज्य और भविष्य में उससे बड़ा राज्य, और समाधि को ज्ञान, यानी उसी आसक्ति का अभाव जो उसे वहाँ तक लाई थी। पाठ दोनों वरदान देता है, किसी को ऊँच-नीच ठहराए बिना। और आरम्भ में जो दो टूटे हुए मनुष्य वन में बैठे थे, वे ही इस कथा के बहाने देवी की महिमा तक पहुँच जाते हैं।`,

  2: `द्वितीय अध्याय वह कथा है जो सबसे परिचित भी है और सबसे कम पूरी सुनी जाती है — देवी का प्रकट होना, तेज से, अंग-अंग।

महिषासुर असुरों का अधिपति था। उसने वर्षों की तपस्या से वर पाया था कि न कोई पुरुष उसे मार सकेगा, न कोई पशु। स्त्रियों का उसने उल्लेख नहीं किया — उसे यह कल्पना ही नहीं आई कि वह बात कभी मायने रखेगी। उस रक्षा के बल पर उसने तीनों लोक जीत लिए, स्वर्ग से देवताओं को निकाल बाहर किया, और उनका कोष, उनके अधिकार, यहाँ तक कि इन्द्रपद तक अपने हाथ में ले लिया। सूर्य, चन्द्र, यम, वरुण, वायु, कुबेर — सबके काम वह स्वयं देखता था, और देवता मनुष्यों की भाँति धरती पर भटकने लगे।

तब पराजित देवता ब्रह्मा को आगे करके विष्णु और शिव के पास पहुँचे और उनकी पराजय का पूरा विस्तार कह सुनाया। यह सुनकर विष्णु को और शिव को क्रोध आया; उनके मुख भ्रूकुटी से टेढ़े हो गए। और तब वह हुआ जो पहले कभी नहीं हुआ था — हर देवता के शरीर से एक महान् तेज निकला।

वह तेज मिल गया। उन्होंने उसे जलते पर्वत के समान, ज्वालाओं से सब दिशाएँ भरते देखा; और जब वह एक स्थान पर आया, तो वह स्त्री का रूप हो गया — ऐसा रूप जिसकी दीप्ति से तीनों लोक व्याप्त हो गए।

उसका अंग-अंग किसी एक देवता का नहीं था। शिव के तेज से उसका मुख बना, यम के तेज से उसके केश, विष्णु के तेज से उसकी भुजाएँ। चन्द्रमा के तेज से उसके स्तन, इन्द्र के तेज से मध्यभाग, वरुण के तेज से जंघाएँ और ऊरु, पृथ्वी के तेज से नितम्ब, ब्रह्मा के तेज से चरण, सूर्य के तेज से अँगुलियाँ, वसुओं के तेज से हथेलियाँ और कुबेर के तेज से नासिका। प्रजापति के तेज से दाँत बने, अग्नि के तेज से तीनों नेत्र, संध्या के तेज से भ्रुएँ, और वायु के तेज से कान। इस प्रकार सब देवताओं के तेज का सार एक होकर उस रूप में खड़ा हो गया।

फिर देवताओं ने उसे अपने-अपने आयुध दिये, और यह सूची सप्तशती का सबसे सुन्दर भाग है। शिव ने त्रिशूल दिया, विष्णु ने चक्र, वरुण ने शंख, अग्नि ने शक्ति, वायु ने धनुष और बाणों से भरे दोनों तरकस। इन्द्र ने वज्र और ऐरावत के घंटे का घंटा दिया। यम ने दण्ड दिया, ब्रह्मा ने अक्षमाला और कमण्डलु, सूर्य ने अपनी किरणें, काल ने खड्ग और निर्मल चर्म। सागर ने हार और कभी न मुरझाने वाली कमल-माला दी, हिमालय ने सिंह वाहन और रत्न, कुबेर ने कभी खाली न होने वाला पानपात्र, विश्वकर्मा ने निर्मल परशु और अनेक अस्त्र। शेष नाग ने महामणि-विभूषित नागहार दिया — वही शेष, जो इस पृथ्वी को धारण करते हैं।

इस प्रकार सम्मानित देवी बार-बार अट्टहास के साथ गरजीं। उस नाद से सारा आकाश भर गया, प्रतिध्वनि उठी, सब लोक क्षुब्ध हो गए, समुद्र काँपने लगे, पृथ्वी हिल उठी और पर्वत डोलने लगे। देवताओं ने 'जय' कहा, मुनियों ने स्तुति की।

तीनों लोकों को क्षुब्ध देखकर देवद्रोही असुर पूरी सेना सजाकर आयुध लेकर खड़े हो गए, और महिषासुर ने क्रोध में कहा — अरे, यह क्या है? वह सब असुरों के साथ उस शब्द की ओर दौड़ा और उसने देवी को देखा: उनके चरणों के दबाव से धरती झुकी हुई, मुकुट आकाश को छूता हुआ, हज़ार भुजाएँ चारों दिशाओं को व्याप्त किए हुए, और धनुष की टंकार से पाताल तक क्षुब्ध।

तब युद्ध आरम्भ हुआ। महिषासुर के सेनापति चिक्षुर आए, चामर हाथी पर आरूढ़ होकर आया, उदग्र, महाहनु, असिलोमा, बाष्कल, बिडाल — सब अपार रथ, हाथी और घोड़ों की सेनाएँ लेकर उतरे, और करोड़ों-करोड़ रथों के बीच से महिषासुर भी आया।

देवी ने उनके अस्त्र-शस्त्र खेल-ही-खेल में काट डाले। उनका मुख श्रम से खिन्न नहीं हुआ। उनका वाहन सिंह क्रोध में अयाल हिलाता, वन में आग की भाँति असुर-सेना में विचरने लगा। और देवी ने जो श्वास छोड़े, वे ही श्वास तत्क्षण सैकड़ों हजार की संख्या में गण बन गए — परशु, भिंडिपाल, असि और पट्टिश लेकर लड़ने वाले गण, जो युद्ध के बीच मृदंग, पटह और शंख बजाते थे।

फिर देवी के प्रहार आरम्भ हुए। त्रिशूल, गदा और शक्तियों की वर्षा से सैकड़ों महासुर गिरे; कुछ खड्ग से दो टुकड़े हुए, कुछ गदा से चूर होकर भूमि पर पड़े रहे, कुछ वक्ष में त्रिशूल लगने से फटकर गिरे, कुछ बाणों से छलनी हो गए। किसी की भुजाएँ कटीं, किसी की गर्दनें। किसी के सिर गिरे तो किसी का धड़ बीच से फाड़ा गया। और विचित्र वह दृश्य था — कुछ सिर कटे कबंध श्रेष्ठ आयुध लेकर देवी से फिर भी लड़ते रहे, कुछ युद्ध में बाजों की लय पर नाचने लगे, और कुछ 'ठहर, ठहर' कहते हुए देवी की ओर बढ़ते रहे।

जहाँ वह महायुद्ध हुआ वहाँ गिरे हुए रथों, हाथियों, घोड़ों और असुरों से धरती ऐसी हो गई कि वहाँ से चलना असंभव हो गया, और रक्त की धाराओं से महानदियाँ बहने लगीं। अम्बिका ने उस विशाल सेना को क्षण भर में ऐसे क्षय कर दिया जैसे अग्नि तिनके और काठ के ढेर को भस्म कर देती है। देवता प्रसन्न हुए और आकाश से फूलों की वर्षा करने लगे।`,

  3: `तृतीय अध्याय वह अध्याय है जिसे पढ़ते समय लोग सीधे अंत की ओर देखते हैं — महिषासुर का वध। पर पाठ उतनी जल्दी नहीं करता। पहले वह उसे एक-एक करके उसके योद्धाओं से लड़ाता है।

सेनापति चिक्षुर अपनी सेना को मरते देखकर क्रोध में अम्बिका पर झपटा और उसने बाणों की ऐसी वर्षा की जैसे मेघ मेरु पर्वत पर जल बरसाता है। देवी ने खेल-ही-खेल में उसके बाणों के समूह काट डाले, उसके घोड़े मारे, सारथि मारा, धनुष और ऊँचा फहराता ध्वज काट गिराया। धनुष कटा, रथ नष्ट, घोड़े मारे — फिर भी वह खड्ग और चर्म लेकर दौड़ा, और उसने तीक्ष्ण धार वाले खड्ग से सिंह के सिर पर और देवी की बाईं भुजा पर वार किया। खड्ग देवी की भुज पर पड़ते ही टूट गया। तब उसने क्रोध से स्तंभित नेत्र होकर त्रिशूल फेंका, जो तेज से जल रहा था जैसे आकाश से सूर्यबिम्ब गिरा हो। देवी ने अपना त्रिशूल छोड़ा — और वह त्रिशूल सौ टुकड़े हुआ, और वह महासुर भी।

फिर चामर आया, हाथी पर आरूढ़। उसने शक्ति छोड़ी, जिसे देवी ने 'हुं' के एक प्रहार से निष्प्रभ करके भूमि पर गिरा दिया। उसने त्रिशूल फेंका; बाणों से वह भी कट गया। तब सिंह उछलकर उस हाथी के कुम्भों के बीच जा बैठा, और उस देवद्रोही से बाहुयुद्ध करने लगा। लड़ते-लड़ते वे दोनों हाथी से उतरकर भूमि पर आ गए और भयानक प्रहारों से लड़े; अंत में सिंह ने वेग से उछलकर अपने पंजे के प्रहार से चामर का सिर अलग कर दिया।

उदग्र, कराल, बाष्कल, ताम्र, अन्धक, उग्रास्य, उग्रवीर्य, महाहनु, बिडाल, दुर्धर, दुर्मुख — सब एक-एक करके आए और एक-एक करके गिरे। किसी का अंत शिला और वृक्ष से हुआ, किसी का गदा के प्रहारों से, किसी का भिंडिपाल से, किसी का त्रिशूल से। बिडाल का सिर खड्ग से धड़ से अलग हुआ, और दुर्धर तथा दुर्मुख दोनों यमलोक चले गए।

अब अपनी सेना को क्षय होते देखकर महिषासुर स्वयं उतरा — और वह महिष (भैंस) का रूप धारण करके आया। उसने देवी के गणों को मुख के प्रहार से, खुरों से, पूँछ की चोट से, सींगों से फाड़कर, वेग से, नाद से, घूमने से, और अपने श्वास की वायु से भूमि पर गिराना आरम्भ कर दिया। प्रमथ-सेना को गिराकर वह सिंह को मारने के लिए दौड़ा। उससे महादेवी का क्रोध और बढ़ गया।

वह महापराक्रमी असुर खुरों से धरती रौंदता, सींगों से ऊँचे-ऊँचे पर्वत उछालता और गरजता रहा। उसके वेग से पृथ्वी फटने लगी, पूँछ से आहत होकर समुद्र सब ओर छा गया, सींगों के झटकों से मेघ टुकड़े-टुकड़े उड़ गए, और उसके श्वास की वायु से आकाश से सैकड़ों पर्वत गिर पड़े।

क्रोध से फूले हुए उस महासुर को आते देख चण्डिका ने उसके वध का निश्चय किया। उन्होंने उस पर पाश फेंका — और बँधते ही उसने महिष का रूप छोड़ दिया। वह सिंह बन गया; और जैसे ही अम्बिका उसका सिर काटने को हुईं, वह खड्ग हाथ में लिए पुरुष दिखाई दिया। देवी ने बाणों से उसे काट दिया — और तब वह महागज बन गया। उसने सूँड़ से सिंह को घसीटा और गरजा; पर जब वह खींच रहा था, तभी देवी ने खड्ग से उसकी सूँड़ काट दी। और तब वह फिर महिष का शरीर धारण करके चराचर तीनों लोकों को क्षुब्ध करने लगा।

तब क्रुद्ध जगन्माता चण्डिका ने उत्तम पान किया, बार-बार पिया, और अरुण नेत्र होकर हँसने लगीं। वह असुर भी बल और पराक्रम के मद में उन्मत्त होकर गरजा और अपने सींगों से चण्डिका की ओर पर्वत उछालने लगा। देवी ने बाणों के समूहों से उन पर्वतों को चूर कर दिया, और मद से चूर, मुख की लालिमा से अव्यक्त हो चुके अक्षरों वाले उस असुर से बोलीं — गरज, गरज क्षण भर, हे मूढ़, जब तक मैं यह मदिरा पी लूँ; तुझे यहीं मार डालने पर शीघ्र ही देवता गरजेंगे।

इतना कहकर वे उछलीं, उस महासुर पर चढ़ गईं, पैर से उसके कण्ठ पर आक्रमण किया और त्रिशूल से उसे मारा। उनके चरणों से दबा हुआ वह असुर, देवी के बल से आवृत होकर, अपने ही मुख से आधा ही निकल पाया — और आधा ही निकला था, और लड़ भी रहा था, कि देवी ने महाखड्ग से उसका सिर काटकर उसे गिरा दिया।

तब 'हा-हा' करता हुआ वह सारा दैत्य-सैन्य नष्ट हो गया, और सब देवतागण अत्यन्त हर्ष को प्राप्त हुए। दिव्य महर्षियों के साथ देवताओं ने उस देवी की स्तुति की; गन्धर्वपति गाने लगे और अप्सराओं के गण नाचने लगे।`,

  4: `चतुर्थ अध्याय में युद्ध नहीं है। इसमें कुछ नहीं होता — केवल देवता खड़े होकर स्तुति करते हैं। और यही इस अध्याय की शक्ति है।

महिषासुर मारा गया, उसकी सेना क्षय हो गई। जिनके लिए यह युद्ध हुआ था, वे देवगण — इन्द्र आदि — अब कुछ और नहीं कर सकते थे। वे प्रणाम से झुके सिर और कन्धों के साथ खड़े हो गए, हर्ष से उनके रोम खड़े हो गए थे, और वे वाणी से उस देवी की स्तुति करने लगे।

उनकी स्तुति का पहला स्वर यही है — जिन्होंने अपनी आत्मशक्ति से इस जगत् को व्याप्त किया है, जो सम्पूर्ण देवगणों की शक्तियों के समूह की मूर्ति हैं, उस अखिल देव-महर्षि-पूज्य अम्बिका को हम भक्ति से नत हैं; वे हमारा कल्याण करें।

और फिर वे कहते हैं वह बात जो इस स्तुति को और सब स्तुतियों से अलग करती है — भगवान् अनन्त, ब्रह्मा और शिव भी जिनका अतुलनीय प्रभाव और बल वर्णन करने में समर्थ नहीं हैं। यानी यह स्तुति उसके गुण गाते हुए भी मान लेती है कि गुण बताए नहीं जा सकते।

वे उसे श्री कहते हैं — जो सुकृतियों के घरों में हैं और पापियों के यहाँ अलक्ष्मी; जो कृतधियों के हृदय में बुद्धि, सज्जनों में श्रद्धा और कुलीन जन के लिए लज्जा हैं। वे उससे पूछते हैं, तुम्हारे इस अचिन्त्य रूप का वर्णन हम क्या करें? तुम्हारा महापराक्रम असुरों का क्षय करने वाला है; और देव, असुर तथा देवगण आदि सब में युद्धों में जो-जो तुम्हारे चरित्र हैं, उनका वर्णन भी हम क्या करें?

और यह एक बड़ा वाक्य है — तुम समस्त जगत् का कारण होते हुए भी त्रिगुणात्मिका हो, तो भी दोषों से तुम जानी नहीं जातीं; विष्णु और शिव आदि भी तुम्हारी अपार थाह नहीं पाते। तुम सबकी आश्रय हो, यह अखिल जगत् तुम्हारा अंश है, और तुम अव्याकृत, परमा तथा आद्या प्रकृति हो। देवता यह भी कहते हैं कि जिनके उच्चारण से सब यज्ञों में समस्त देवता तृप्त होते हैं, वे 'स्वाहा' तुम्हीं हो; और पितृगण की तृप्ति का हेतु होने से मनुष्य तुम्हें 'स्वधा' कहकर पुकारते हैं। वे उसे मुक्ति का हेतु कहते हैं, उसे विद्या कहते हैं, उसे ऋग्वेद और यजुर्वेद के निर्मल शब्दों की आत्मा, उद्गीथ से रमणीय सामवेद का पाठ, और त्रयी कहते हैं। उसे मेधा कहते हैं जो अखिल शास्त्रों का सार जानती है, और दुर्गा कहते हैं जो दुर्गम भवसागर से पार लगाने वाली नौका के समान है।

फिर वे एक और बात याद करते हैं, जो अभी-अभी हुई है। जो मुख हँसी से युक्त, निर्मल, पूर्ण चन्द्रबिम्ब के समान और उत्तम स्वर्ण की कान्ति से सुन्दर था, उसे मद और क्रोध में भरे महिषासुर ने प्रहार करते हुए भी सहसा देखा — और भ्रूकुटी से विकराल तथा उदय होते चन्द्र के समान कान्ति वाले उस कुपित मुख को देखकर भी उसने तत्काल प्राण नहीं छोड़े। यह अत्यन्त आश्चर्य है, वे कहते हैं, क्योंकि कुपित अन्तक के दर्शन से कौन जीवित रह सकता है?

फिर वे प्रार्थना करते हैं — हे देवि, प्रसन्न होइए। और वे उस स्तुति में एक बात कहते हैं जो भक्ति में प्रायः नहीं कही जाती: जिन लोगों पर तुम्हारी कृपा होती है, उनका धन, यश और बन्धुवर्ग कभी क्षीण नहीं होता; धन्य हैं वे, जिनके पुत्र, भृत्य और स्त्री शान्त हैं, और जिनके लिए प्रसन्न तुम सदा अभ्युदय देने वाली हो। परन्तु वे यह भी कहते हैं कि तुमने वध करते हुए भी दया दिखाई — तुम्हारी मति यह है कि शस्त्र से पवित्र होकर शत्रु भी लोकों को प्राप्त करें।

और तब आती हैं वे दो पंक्तियाँ जो आज भी घर-घर में बोली जाती हैं — त्रिशूल से हमारी रक्षा करो, हे देवि; हे अम्बिके, खड्ग से रक्षा करो; घंटे के स्वर से तथा धनुष की प्रत्यंचा की टंकार से हमारी रक्षा करो। पूर्व में रक्षा करो, पश्चिम में, दक्षिण में, और हे ईश्वरि, उत्तर दिशा में अपने त्रिशूल के घुमाने से रक्षा करो। त्रैलोक्य में तुम्हारे जो सौम्य रूप विचरते हैं और जो अत्यन्त घोर रूप हैं, उन सबसे हमारी तथा इस पृथ्वी की रक्षा करो; और तुम्हारे हाथ-कमलों में स्थित जो खड्ग, शूल, गदा आदि अस्त्र हैं, उनसे हमारी चारों ओर से रक्षा करो।

इस प्रकार देवताओं द्वारा स्तुता, नन्दनवन से उत्पन्न दिव्य पुष्पों तथा गन्ध और अनुलेपन से पूजित, समस्त देवताओं द्वारा भक्ति से दिव्य धूपों से सुधूपित होकर, प्रसन्न मुख वाली देवी ने उन सब प्रणत देवताओं से कहा — हे देवताओं, हमसे जो चाहो, वर माँगो। देवताओं ने कहा — भगवती ने सब कुछ कर दिया, अब कुछ शेष नहीं है; हमारा शत्रु मारा गया; और यदि तुम वर देना चाहो तो स्मरण किये जाने पर सदा हमारी परम आपदाओं का नाश करो, और जो मनुष्य इन स्तवों से तुम्हारी स्तुति करेगा, उसके धन, ऐश्वर्य, विभव तथा स्त्री-संतान आदि सम्पदाओं की वृद्धि के लिए उस पर प्रसन्न रहो।

देवताओं द्वारा जगत् तथा अपने हित की प्रार्थना से प्रसन्न की गई भद्रकाली ने 'तथास्तु' कहा और अन्तर्धान हो गईं।

और अध्याय के अंतिम श्लोकों में ऋषि कथा का धागा आगे बढ़ाते हैं: यह तो बताया कि देवी पहले देवताओं के शरीरों से कैसे प्रकट हुई; अब सुनो कि शुम्भ और निशुम्भ नामक दुष्ट दैत्यों के वध तथा लोकों की रक्षा के लिए वह गौरी के शरीर से फिर कैसे प्रकट हुई — वही कथा आगे आती है।`,
};

const CHAPTER_STORY_EN_BASE: Record<number, string> = {
  1: `The first chapter begins with two broken men sitting in a forest — and answers their question from somewhere else entirely: the beginning of creation, in an ocean where nothing existed.

Suratha, king of the Chaitra line, ruled the whole earth and cared for his people as if they were his own sons. In time his own ministers grew powerful, wicked and greedy, and the kings called Kolavidhvamsins became his enemies. There was war. His army was larger, yet he was defeated. In his own city his ministers stripped him of his treasury and his army. So, under the pretext of a hunt, he rode alone into the deep forest on one horse — a king, a horse, and nothing else.

In the forest he found the hermitage of the sage Medhas, where even the wild animals were at peace. The sage received him with honour and he stayed. But his mind did not stay with him. He kept thinking: the city my forebears guarded now lies diminished because of me. Are those wicked servants of mine ruling it by dharma or not? How is my great elephant now? The people who used to follow me for alms and favour must now be serving another king. And the treasury I gathered with such pain is being squandered by men who do not know how to spend.

Near the hermitage he met a vaishya, sad and downcast. The king asked who he was and why he had come. He was Samadhi, born into a wealthy family; his wife and sons had taken his money and thrown him out. He had come to the forest, but his mind had not: he could not stop wondering whether his sons were well or unwell, whether his family's house was at peace or not.

The king asked him the question that mattered: those greedy people threw you out for your money — why does your mind still cling to them with love? Samadhi answered: what am I to do? My mind will not harden against them. They threw away all affection for a father, and still my heart runs to them. I know it, and I still do not understand it. Thinking of them, I sigh, and my mind goes dark.

Then the same grief closes over the king, and the two of them go to the sage Medhas and ask him: we can see the fault, and still the mind is dragged towards them. Knowing this, why are we caught? Is it our foolishness, or is something being done to us?

Medhas's answer is the seed of the whole Saptashati. Knowledge, he says, exists in every creature — in animals and birds as well. But this power that drags everyone is Mahamaya: the Goddess herself, who deludes even Brahma and Vishnu. She it is who, pleased, becomes the cause of liberation, and who is also the cause of the world's bondage — she is the supreme knowledge, the eternal, the ruler of all rulers.

And then the king asks the question that carries the story forward: who is this Devi you call Mahamaya? How was she born, and what does she do? The sage answers: she is eternal, she is the very form of the world; and yet her appearance has happened many times, for the accomplishing of the gods' work.

And the story turns to a time before creation. At the end of an age the whole world became a single ocean — water and nothing but water — and Vishnu lay asleep in yogic sleep upon Shesha. Brahma sat on the lotus of Vishnu's navel, and Yoganidra dwelt in Hari's eyes.

From the wax of Vishnu's ears two terrible asuras came forth: Madhu and Kaitabha. They became famous. They were ready to kill Brahma. Seeing them fierce and Janardana asleep, Brahma began to praise Yoganidra with a single mind.

His hymn is not a small one. You are Svaha, he says; you are Svadha; you are the Vashat call; you are the soul of the sacred syllable. You are the amrita; you are twilight; you are Savitri; you are the supreme mother. By you this universe is upheld, by you it is created, you protect it and you destroy it. You are Mahavidya, Mahamaya, Mahamedha, Mahasmriti, Mahamoha, Mahadevi, Maheshvari. You are Kalaratri, Maharatri, the terrible Moharati; you are Shri, Ishvari, Hri, Buddhi, Lajja, Pushti, Tushti, Shanti and Kshanti. You carry the sword, the spear, the mace and the discus — and yet you are gentler and lovelier than everything gentle. Whatever exists anywhere, real or unreal, the power of all of it is you; so what am I to praise in you?

And he asks for a boon: delude these two unconquerable asuras, and wake Achyuta, the lord of the world, quickly, so that they may be killed.

At that very moment the Goddess came forth from Vishnu's eyes, mouth, nostrils, arms, heart and chest and stood before Brahma — and Janardana woke. Waking, he saw the two wicked ones, terrible in strength and valour, their eyes red with rage, ready to destroy Brahma.

Then the Lord fought them — with his own arms for weapons — for five thousand years. They were drunk with strength, but Mahamaya had deluded them, and they said to Keshava: ask a boon of us. He said: be pleased with me today, and be worthy of being killed by me. That is the boon I have chosen.

They had been tricked. The whole world appeared to them as water, and so they said to the lotus-eyed Lord: kill us where the earth is not flooded. He said: so be it. And laying them across his thighs, that Lord who holds conch, discus and mace cut off their heads with his discus — in the one place where water had not spread.

And so that Devi, praised by Brahma himself, came to be. This is the story Medhas tells Suratha and Samadhi — and he tells it to answer the question they asked: why does the mind stay bound to those who have harmed us? The answer is Mahamaya, the power that sustains creation and by whose influence living beings are drawn towards their own harm.

At the end, in the thirteenth chapter, both receive boons — Suratha his kingdom and a greater one in the future, Samadhi knowledge, the very absence of the attachment that brought him there. The text gives both boons without ranking one above the other. And in the end, the two broken men sitting in a forest are carried, through this telling, all the way to the glory of the Devi.`,

  2: `The second chapter holds the story everyone knows and almost nobody hears in full — the coming-forth of the Goddess, limb by limb, out of light.

Mahishasura was the lord of the asuras. By long austerity he had won a boon: no man and no animal could kill him. He had not thought to mention women; it did not occur to him that it would matter. On the strength of that protection he conquered the three worlds, drove the gods out of heaven, and took their treasury, their offices and even Indra's own seat into his hand. Sun, moon, Yama, Varuna, Vayu, Kubera — he supervised them all himself, and the gods wandered the earth like beggars.

So the defeated gods went, with Brahma at their head, to Vishnu and Shiva, and told them the whole story of their defeat. Hearing it, Vishnu and Shiva grew angry; their faces bent with scowling brows. And then something happened that had not happened before: a great radiance came out of the body of every god.

That radiance gathered. The gods saw it as a burning mountain filling the horizons with flame; and when it drew together into one place, it became the form of a woman — a form whose splendour filled the three worlds.

No single god had made her. From Shiva's radiance came her face, from Yama's her hair, from Vishnu's her arms. From the moon's radiance her breasts, from Indra's her waist, from Varuna's her thighs and calves, from the earth's her hips, from Brahma's her feet, from the sun's her toes, from the Vasus' her fingers, from Kubera's her nose. From Prajapati's radiance her teeth; from the fire's, her three eyes; from the twilight's, her brows; from the wind's, her ears. Thus the essence of all the gods' radiance stood up in one form.

Then the gods gave her their own weapons, and this list is among the loveliest passages in the whole Saptashati. Shiva gave his trident, Vishnu his discus, Varuna his conch, Agni his spear, Vayu his bow and two quivers full of arrows. Indra gave his thunderbolt and the bell from Airavata the elephant. Yama gave his staff, Brahma his rosary and water-pot, the sun his rays, Kala his sword and spotless shield. The ocean gave a necklace and a garland of lotuses that never fade; Himavan gave the lion as her mount and many gems; Kubera a drinking-cup that is never empty; Vishvakarma a flawless axe and many weapons. Shesha, the serpent-king who bears the earth, gave a great serpent-necklace jewelled with a mighty gem.

Thus honoured, the Devi laughed again and again, a lion's roar; the sound filled the sky, echoed back, the worlds shook, the oceans trembled, the earth moved and the mountains swayed. The gods cried victory; the sages praised her.

Seeing the three worlds so agitated, the enemies of the gods put on their armour and stood up under arms, and Mahishasura cried in anger: what is this? He rushed towards the sound, surrounded by all his asuras, and saw the Devi: the earth bowed under her feet, her crown scraped the sky, her thousand arms covered every direction, and the twang of her bow shook the underworld.

Then the battle began. Mahishasura's general Chikshura came; Chamara came riding an elephant; Udagra, Mahahanu, Asiloma, Bashkala, Bidala came, each with vast hosts of chariots, elephants and horses — and among crores of chariots, Mahishasura himself.

The Devi cut their weapons away in play. Her face showed no fatigue. Her mount, the lion, raging and shaking its mane, moved through the asura army like fire through a forest. And the breaths she let out became, in that instant, tens of thousands of ganas — armed with axes, maces, swords and spears, beating drums, kettledrums and conches in the middle of the battle.

Then her blows began. Hundreds of great asuras fell to her trident, her mace and showers of spears; some were cut in two by her sword, some lay crushed on the ground by her mace, some burst open with a spear in the chest, some were riddled with arrows. Arms fell, heads fell, bodies were split down the middle. And there was a strange sight too: headless trunks still fought her with their weapons in hand; some danced to the rhythm of the battle-drums; some strode towards her crying "stand, stand".

Where that great battle was fought, the ground became impassable with fallen chariots, elephants, horses and asuras, and rivers of blood ran at once through the middle of them. In a single moment Ambika brought that vast army to nothing, as fire consumes a great heap of grass and wood. The gods rejoiced, and rained flowers from the sky.`,

  3: `The third chapter is the one readers race through to reach the ending — the slaying of Mahishasura. But the text is in no hurry. First it makes him fight his way through his own warriors.

His general Chikshura, seeing his army cut down, rushed at Ambika in fury and loosed such a rain of arrows as a cloud pours on the peak of Meru. The Devi cut his volleys away in play, killed his horses, killed his charioteer, and cut down his bow and his high banner. Bow broken, chariot gone, horses dead — and still he charged with sword and shield, striking the lion on the head and the Devi on her left arm. His sword broke the moment it touched her arm. Then, eyes red with rage, he hurled his trident, blazing like the disc of the sun falling from the sky. The Devi let her own trident go — and that trident was carried into a hundred pieces, and so was the great asura.

Then Chamara came, riding an elephant. He loosed a spear, and the Devi felled it with a single hum from her mouth, its lustre gone. He hurled his trident; she cut it down with arrows. Then the lion leapt up and sat between the elephant's temples, and wrestled the enemy of the gods hand to hand. The two of them came down from the elephant to the ground and fought with terrible blows, until the lion sprang and took Chamara's head off with a blow of its paw.

Udagra, Karala, Bashkala, Tamra, Andhaka, Ugrasya, Ugravirya, Mahahanu, Bidala, Durdhara, Durmukha — each came forward, each fell. One ended under rocks and trees, another under mace-blows, another by the axe, another by the trident. Bidala's head was struck from his body with a sword, and Durdhara and Durmukha were sent to the house of Yama.

Now, watching his own army dissolve, Mahishasura came out himself — in the form of a buffalo. With blows of his muzzle, kicks of his hooves, lashing of his tail and goring of his horns — with speed, with bellowing, with whirling, and with the wind of his breath — he began to throw the Devi's ganas to the ground. Having felled the host, he charged at the lion to kill it. And the great Devi's anger rose.

That asura of immense valour trampled the earth with his hooves, flung huge mountains with his horns, and roared. Under his speed the earth cracked; struck by his tail, the ocean overflowed on every side; the clouds were broken into fragments by the tossing of his horns; and hundreds of mountains fell from the sky in the wind of his breath.

Watching that great asura come, swollen with rage, Chandika resolved to kill him. She threw her noose over him — and the moment he was bound he abandoned the buffalo form. He became a lion; and just as Ambika was about to take his head, he appeared as a man holding a sword. The Devi cut that man down with her arrows — and then he became a great elephant. He dragged the lion with his trunk and trumpeted; and while he was dragging, the Devi cut off his trunk with her sword. And then he took the buffalo body again, and shook the three worlds with all that moves and does not move.

Then the furious mother of the world drank deep and drank again, and laughed, her eyes red. That asura too, drunk with the pride of his strength, bellowed and flung mountains at Chandika with his horns. She powdered them with volleys of arrows, and spoke to him — his mouth swollen with arrogance, his words slurred, his eyes rolling.

She said: Roar, roar for a moment, you fool, while I drink this wine. When I have killed you here, the gods will roar soon enough.

So saying, she sprang up, mounted the great asura, pressed his neck with her foot and struck him with her trident. Pinned by her foot and wrapped in her power, he came halfway out of his own mouth — and while he was half-emerged and still fighting, the goddess cut off his head with her great sword and brought him down.

Then that whole army of daityas died with a cry of despair, and all the hosts of the gods were filled with joy. The gods praised the Devi together with the divine sages; the lords of the gandharvas sang, and the apsaras danced.`,

  4: `The fourth chapter contains no battle. Nothing happens in it — the gods simply stand and praise her. And that is precisely its power.

Mahishasura was dead and his army consumed. The gods, for whom the war had been fought, could do nothing further. They stood with their heads and shoulders bowed in reverence, the hair on their bodies standing up with joy, and began to praise the Devi with speech.

The first note of their hymn is this: she who has pervaded this world with her own power, who is the very form of all the hosts of the gods' powers — to that Ambika, worshipped by all the gods and great sages, we bow in devotion; may she bring us good.

And then they say the thing that sets this hymn apart from every other: even Ananta, Brahma and Shiva cannot describe her immeasurable power. That is, while they are singing her qualities they are also conceding that her qualities cannot be told.

They call her Shri — auspiciousness in the houses of the virtuous and inauspiciousness in the houses of the wicked; intelligence in the hearts of the discerning, faith in the good, modesty in the well-born. They ask her: how are we to describe this inconceivable form of yours? Your valour destroys the asuras; and what of all your deeds in battle among gods, asuras, and the hosts of the gods — how are we to describe those either?

Then comes a great line: you are the cause of the whole world, and though you are the three gunas, you are not known by their faults; Vishnu and Shiva and the rest cannot fathom you. You are the refuge of all; this entire world is a portion of you; you are the unmanifest, the supreme, the primal nature. They tell her that she is Svaha, by whose utterance the gods are satisfied in every sacrifice; that she is Svadha, by whom the ancestors are satisfied. They call her the cause of liberation, the supreme knowledge practised by sages; the soul of the pure words of the Rig and Yajur Vedas; the lovely udgitha-chant of the Sama Veda; the threefold Veda, and the speech that ends all sorrow. They call her Medha, who knows the essence of all scriptures, and Durga, the boat that carries across the hard ocean of becoming.

And then they remember something that has just happened. Her face, touched with a faint smile, spotless, like the full moon's disc, lovely with the shine of fine gold — Mahishasura, swollen with pride and rage, saw it as he struck. And seeing that angry face, terrible with frowning brows, radiant as the rising moon, he still did not give up his life at once. That is the wonder, they say — for who can live who has seen Death himself grown angry?

Then they ask her to be pleased. And the hymn says something that is not often said in devotion: wealth, fame and family never fail for those on whom her grace rests. Blessed are they whose children, servants and spouses are at peace, for whom she, pleased, always brings prosperity. But they also say that even in killing she showed mercy — that her intention is that enemies, purified by the weapon, should reach the worlds too.

And then come the lines still spoken in homes today: guard us with your trident, Devi; guard us with your sword, Ambike; guard us with the sound of your bell and the twang of your bowstring. Guard us in the east, guard us in the west, in the south, and — Ishvari — in the north by the whirling of your trident. Whatever gentle forms of yours wander in the three worlds, and whatever forms are utterly terrible, guard us and this earth by them. And the weapons that rest in the petals of your hands — sword, spear, mace and the rest — guard us with those on every side.

Thus praised, worshipped with divine flowers from Nandana and with perfumes, honoured with incense by all the gods with devotion, the Devi, her face pleased, said to all those bowing gods: ask of me whatever you wish. The gods said: the Goddess has done everything; nothing remains. Our enemy is slain. But if you would grant a boon: that when we remember you, you destroy our greatest dangers; and that whoever praises you with these hymns may, for him, be pleased to increase his wealth, prosperity, splendour, wife and children.

Pleased by the gods' prayer for the world and for themselves, Bhadrakali said: so be it — and vanished.

In the chapter's closing verses the sage takes up the thread again: this is how the Devi came forth from the bodies of the gods. Now hear how, for the slaying of the wicked daityas Shumbha and Nishumbha and for the protection of the worlds, she came forth again from the body of Gauri.`,

  5: `Oppressed by Shumbha and Nishumbha, the gods went to the Himalaya and praised the Devi. She told Shumbha's messenger she was bound by her vow: only he who defeats her in battle may be her lord.`,
  6: `Shumbha sent Dhumralochana and his army; the Devi destroyed them all. Chanda and Munda too could not stand before her.`,
  7: `When Chanda and Munda advanced, the Devi's frowned brow brought forth Mahakali (Chamunda), who slew them — hence the name Chamunda.`,
  8: `In the battle with Raktabija, whose every drop of blood spawned a new demon, the Devi let Kali drink his blood and so ended him.`,
  9: `Then Nishumbha came to fight; the Devi slew him too and gave the gods fearlessness.`,
  10: `The final battle with Shumbha raged; in that moment the gods praised her vast form with the Narayani stuti.`,
  11: `The Narayani stuti hymns the Devi as the all-pervading power, compassion and glory — 'Ya devi sarva-bhuteshu shakti-rupena samsthita…'`,
  12: `The Devi granted that whoever recites or hears this mahatmya shall be blessed; in times of trouble, remembering her, she will protect them.`,
  13: `At last Suratha received his kingdom and Samadhi supreme knowledge. The sage says that those who recite this Devi-mahatmya with faith abide in the Devi's grace.`,
};

/* ------------------------------------------------------------------ merged */

import { CHAPTER_STORY_HI_LATER, CHAPTER_STORY_EN_LATER } from "./chapter-stories-later";

/** All thirteen chapters: 1–4 written here, 5–13 in the companion module. */
export const CHAPTER_STORY_HI: Record<number, string> = {
  ...CHAPTER_STORY_HI_BASE,
  ...CHAPTER_STORY_HI_LATER,
};

export const CHAPTER_STORY_EN: Record<number, string> = {
  ...CHAPTER_STORY_EN_BASE,
  ...CHAPTER_STORY_EN_LATER,
};
