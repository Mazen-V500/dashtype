window.TypingGame = (() => {
    const wordsByLanguage = {
        ar: [
            "برمجة", "تحدي", "مطور", "سرعة", "متصفح", "انجاز", "مستقبل", "واجهة", "ابداع", "تقنية",
            "حاسوب", "شاشة", "لوحة", "فأرة", "كاميرا", "صوت", "ضوء", "حرارة", "بطارية", "شحن",
            "رقم", "حرف", "كلمة", "جملة", "نص", "ملف", "مجلد", "قرص", "ذاكرة", "معالج",
            "شبكة", "انترنت", "موقع", "تطبيق", "برنامج", "نظام", "نويتن", "لينكس", "ويندوز", "ماك",
            "بيانات", "قاعدة", "جدول", "صفحة", "صف", "عمود", "خانة", "مفتاح", "قيمة", "خيار",
            "صدقة", "عطاء", "حب", "سلام", "امن", "نظيف", "جميل", "رائع", "ممتاز", "باهر",
            "عالم", "كون", "نجم", "قمر", "شمس", "ارض", "ماء", "هواء", "نار", "تراب",
            "انسان", "طفل", "أم", "أب", "أخ", "أخت", "ولد", "بنت", "زوج", "زوجة",
            "طعام", "شراب", "فاكهة", "خضار", "لحم", "سمك", "دجاج", "حليب", "جبن", "خبز",
            "ملح", "سكر", "زيت", "دهن", "عسل", "فلفل", "بهار", "ثوم", "بصل", "ليمون",
            "مدرسة", "جامعة", "مكتبة", "معهد", "كلية", "قسم", "فصل", "درس", "امتحان", "شهادة",
            "كتاب", "مجلة", "جريدة", "قاموس", "دليل", "خريطة", "صورة", "رسم", "فن", "موسيقى",
            "اغنية", "صوت", "نغم", "إيقاع", "رقص", "حركة", "رياضة", "لعبة", "فريق", "لاعب",
            "كرة", "ملعب", "مسار", "هدف", "نقطة", "فوز", "خسارة", "تعادل", "قاضي", "حكم",
            "حرب", "سلام", "معركة", "جيش", "جندي", "سلاح", "درع", "حصار", "انتصار", "استسلام",
            "عدل", "ظلم", "قانون", "محكمة", "قاضي", "محامي", "شاهد", "جريمة", "عقوبة", "سجن",
            "مستشفى", "طبيب", "ممرض", "دواء", "علاج", "مرض", "صحة", "قوة", "ضعف", "ألم",
            "جراحة", "عملية", "مختبر", "فحص", "مصل", "لقاح", "حمى", "سعال", "زكام", "انفلونزا",
            "موسم", "فصل", "صيف", "شتاء", "ربيع", "خريف", "حار", "بارد", "ممطر", "جاف",
            "يوم", "ليل", "غروب", "شروق", "فجر", "ظهيرة", "عصر", "مساء", "منتصف", "لحظة",
            "أسبوع", "شهر", "سنة", "عقد", "قرن", "دقيقة", "ثانية", "ساعة", "صباح", "مساء",
            "ماضي", "حاضر", "مستقبل", "تاريخ", "ذكرى", "حدث", "قصة", "رواية", "أسطورة", "خيال",
            "أحمر", "أزرق", "أخضر", "أصفر", "أسود", "أبيض", "رمادي", "برتقالي", "بنفسجي", "وردي",
            "بني", "نحاسي", "فضي", "ذهبي", "غامق", "فاتح", "مشرق", "خافت", "زاهي", "كئيب",
            "صغير", "كبير", "طويل", "قصير", "واسع", "ضيق", "سميك", "رقيق", "ثقيل", "خفيف",
            "دافئ", "بارد", "حار", "فاتر", "معتدل", "قاسي", "لين", "صلب", "طري", "قاس",
            "شرقي", "غربي", "شمالي", "جنوبي", "وسط", "جانب", "حافة", "طرف", "نهاية", "بداية",
            "أمام", "خلف", "يمين", "يسار", "فوق", "تحت", "داخل", "خارج", "قريب", "بعيد",
            "سعادة", "حزن", "فرح", "غضب", "خوف", "شجاعة", "قلق", "اطمئنان", "ثقة", "شك",
            "ذكاء", "حكمة", "علم", "معرفة", "تعليم", "تدريب", "مهارة", "خبرة", "فهم", "إدراك",
            "عمل", "مهنة", "وظيفة", "حرفة", "صناعة", "تجارة", "خدمة", "إنتاج", "ربح", "خسارة",
            "سفر", "رحلة", "قارة", "دولة", "مدينة", "قرية", "محافظة", "منطقة", "حي", "شارع",
            "بيت", "دار", "غرفة", "باب", "نافذة", "سرير", "كرسي", "طاولة", "رف", "خزانة",
            "سيارة", "قطار", "طائرة", "سفينة", "دراجة", "حافلة", "سيارة", "شاحنة", "جرار", "آلية",
            "أكل", "شرب", "نوم", "استيقاظ", "عمل", "راحة", "لعب", "دراسة", "اجتماع", "حوار",
            "ماضي", "حاضر", "مستقبل", "الآن", "هنا", "هناك", "أمس", "غداً", "اليوم", "لاحقاً",
            "شرق", "غرب", "شمال", "جنوب", "أعلى", "أسفل", "عمق", "ارتفاع", "انخفاض", "استقامة",
            "مسلم", "مسيحي", "يهودي", "ملحد", "متدين", "علماني", "محافظ", "متحرر", "متساهل", "دقيق",
            "جميل", "قبيح", "حسن", "سوء", "كمال", "نقص", "فضيلة", "رذيلة", "خير", "شر",
            "قوي", "ضعيف", "شجاع", "جبان", "ذكي", "غبي", "حكيم", "سفيه", "لبق", "أرعن",
            "مفيد", "ضار", "نافع", "مؤذي", "ملائم", "غير ملائم", "مناسب", "غير مناسب", "صحيح", "خطأ",
            "فقر", "غنى", "ثراء", "فقه", "ثقافة", "جهل", "أمية", "تعليم", "معلم", "طالب",
            "مريض", "صحيح", "سليم", "معافى", "شافي", "مصاب", "مجروح", "معوق", "معسكر", "حاج",
            "زراعة", "صيد", "حرث", "بذر", "حصاد", "طحن", "خبز", "طهي", "قلي", "شواء",
            "خياط", "نجار", "حداد", "زجاج", "بناء", "رسام", "نحات", "فنان", "موسيقار", "شاعر",
            "أديب", "روائي", "صحفي", "منتج", "ممثل", "مخرج", "سينمائي", "مصور", "رسام", "مهندس",
            "مهندس", "عالم", "فيلسوف", "منطقي", "متكلم", "محدث", "فقيه", "قاض", "المفتي", "الخليفة",
            "ملك", "أمير", "سلطان", "قيصر", "محارب", "قائد", "جندي", "فارس", "محارب", "مقاتل",
            "بحار", "ملاح", "غواص", "صياد", "صياد", "تاجر", "بائع", "مشتري", "صاحب", "مالك",
            "عبد", "حر", "محرر", "أسير", "أذل", "معز", "منظم", "منفذ", "مسؤول", "قائم",
            "صديق", "عدو", "حبيب", "مبغوض", "معاون", "خائن", "موالي", "معارض", "حليف", "خصم",
            "والد", "والدة", "ابن", "ابنة", "إخوة", "إخوات", "جد", "جدة", "عم", "عمة",
            "خال", "خالة", "cousin", "أرملة", "أيم", "مطلق", "متزوج", "عازب", "خاطب", "عروس",
            "عبادة", "دعاء", "ذكر", "تسبيح", "استغفار", "شهادة", "صلاة", "صيام", "زكاة", "حج",
            "إيمان", "كفر", "ردة", "شرك", "توحيد", "تثليث", "تجسيم", "تشبيه", "تنزيه", "تقديس",
            "جنة", "نار", "جهنم", "عذاب", "ثواب", "عقاب", "نعيم", "سعادة", "شقاء", "هلاك",
            "روح", "جسد", "عقل", "قلب", "حواس", "بصر", "سمع", "شم", "ذوق", "لمس",
            "طالب", "معلم", "مدير", "ناظر", "فني", "إداري", "عامل", "موظف", "موسوسة", "صاحب",
            "مجد", "شرف", "كرامة", "عز", "ذل", "خزي", "عار", "فضيحة", "سمعة", "سوء",
            "أتقن", "أنقن", "أحسن", "أساء", "أصاب", "أخطأ", "نجح", "فشل", "ربح", "خسر",
            "واسع", "ضيق", "محصور", "منفتح", "مغلق", "مفتوح", "محكم", "مرخي", "شديد", "ليّن",
            "حكومة", "دولة", "إمارة", "ولاية", "محافظة", "مديرية", "قرية", "حي", "حارة", "زقاق",
            "قصر", "عمارة", "بناء", "جدار", "سياج", "سور", "حصن", "قلعة", "برج", "منارة",
            "نهر", "بحر", "محيط", "بحيرة", "تيار", "جدول", "عين", "ينبوع", "بئر", "ساقية",
            "جبل", "تل", "وادي", "سهل", "صحراء", "غابة", "بستان", "حديقة", "حقل", "مرج",
            "نبات", "شجرة", "عشب", "زهرة", "ورد", "ياسمين", "نخل", "صنوبر", "حور", "سرو",
            "فاكهة", "برتقال", "تفاح", "إجاص", "موز", "عنب", "رمان", "تمر", "زيتون", "تين",
            "حيوان", "أسد", "ببر", "فيل", "جمل", "حصان", "كلب", "قطة", "أرنب", "فأر",
            "طير", "نسر", "عقاب", "بازي", "غراب", "حمام", "عصفور", "ببغاء", "بومة", "نعامة",
            "سمك", "حوت", "دولفين", "أخطبوط", "سرطان", "جمبري", "محار", "نجم", "قنفذ", "أرضة",
            "حشرة", "نحلة", "نملة", "دودة", "فراشة", "يعسوب", "جراد", "صرصار", "بق", "برغوث",
            "مرض", "وجع", "ألم", "حمى", "سعال", "عطس", "رشح", "ربو", "ضغط", "السكري",
            "قلب", "رئة", "كبد", "كلية", "دماغ", "معدة", "أمعاء", "عضل", "عظم", "جلد",
            "طعم", "طعام", "لذيذ", "حار", "بارد", "حلو", "مالح", "حامض", "مرّ", "عديم",
            "رائحة", "رائحة", "عطر", "رائح", "متعفن", "نتن", "طيب", "كريه", "زكية", "نكهة",
            "مشهور", "غير مشهور", "معروف", "خافي", "ظاهر", "مستور", "علني", "سري", "إعلان", "طي",
            "سعر", "ثمن", "قيمة", "سلعة", "مال", "نقود", "عملة", "درهم", "دينار", "ريال",
            "جيش", "فيلق", "كتيبة", "فصيل", "دورية", "حامية", "متقاعد", "متطوع", "محترف", "مجند",
            "حرب", "سلام", "هدنة", "معاهدة", "حصار", "حصن", "تحصين", "استحكام", "تراجع", "انسحاب",
            "نصر", "هزيمة", "تكسير", "انتصار", "استسلام", "استنزاف", "الحيل", "الفخ", "المكيدة", "الخطة",
            "دبلوماسية", "سفارة", "سفير", "قنصلية", "قنصل", "رسول", "بعثة", "وفد", "ممثل", "وسيط",
            "عقد", "معاهدة", "اتفاق", "بروتوكول", "اتفاقية", "تعاهد", "عهد", "وعد", "شرط", "بند",
            "أمن", "أمان", "حماية", "درع", "حصن", "ملجأ", "مأمن", "ملاذ", "ضمان", "ضمانة",
            "خطر", "تهديد", "تضارب", "عدوان", "هجوم", "غزو", "اجتياح", "وغل", "تسلل", "كمين"
        ],
        en: [
            "code", "game", "speed", "logic", "play", "input", "timer", "fast", "skill", "debug",
            "computer", "screen", "keyboard", "mouse", "camera", "sound", "light", "heat", "battery", "charge",
            "number", "letter", "word", "sentence", "text", "file", "folder", "disk", "memory", "processor",
            "network", "internet", "website", "application", "program", "system", "linux", "windows", "mac", "unix",
            "data", "database", "table", "page", "row", "column", "cell", "key", "value", "option",
            "charity", "donation", "love", "peace", "safety", "clean", "beautiful", "wonderful", "excellent", "amazing",
            "world", "universe", "star", "moon", "sun", "earth", "water", "air", "fire", "ground",
            "human", "child", "mother", "father", "brother", "sister", "boy", "girl", "husband", "wife",
            "food", "drink", "fruit", "vegetable", "meat", "fish", "chicken", "milk", "cheese", "bread",
            "salt", "sugar", "oil", "fat", "honey", "pepper", "spice", "garlic", "onion", "lemon",
            "school", "university", "library", "institute", "college", "department", "class", "lesson", "exam", "certificate",
            "book", "magazine", "newspaper", "dictionary", "guide", "map", "picture", "drawing", "art", "music",
            "song", "voice", "tone", "rhythm", "dance", "movement", "sport", "game", "team", "player",
            "ball", "field", "track", "goal", "point", "win", "lose", "draw", "judge", "referee",
            "war", "peace", "battle", "army", "soldier", "weapon", "shield", "siege", "victory", "surrender",
            "justice", "injustice", "law", "court", "judge", "lawyer", "witness", "crime", "punishment", "prison",
            "hospital", "doctor", "nurse", "medicine", "treatment", "disease", "health", "strength", "weakness", "pain",
            "surgery", "operation", "laboratory", "examination", "serum", "vaccine", "fever", "cough", "cold", "flu",
            "season", "summer", "winter", "spring", "autumn", "hot", "cold", "rainy", "dry", "weather",
            "day", "night", "sunset", "sunrise", "dawn", "noon", "afternoon", "evening", "midnight", "moment",
            "week", "month", "year", "decade", "century", "minute", "second", "hour", "today", "yesterday",
            "past", "present", "future", "history", "memory", "event", "story", "novel", "legend", "fiction",
            "red", "blue", "green", "yellow", "black", "white", "gray", "orange", "purple", "pink",
            "brown", "copper", "silver", "gold", "dark", "light", "bright", "dim", "vivid", "dull",
            "small", "big", "tall", "short", "wide", "narrow", "thick", "thin", "heavy", "light",
            "warm", "cool", "hot", "tepid", "moderate", "harsh", "soft", "hard", "tender", "rough",
            "east", "west", "north", "south", "center", "side", "edge", "corner", "end", "beginning",
            "front", "back", "right", "left", "above", "below", "inside", "outside", "near", "far",
            "happiness", "sadness", "joy", "anger", "fear", "courage", "anxiety", "peace", "trust", "doubt",
            "intelligence", "wisdom", "knowledge", "science", "education", "training", "skill", "experience", "understanding", "perception",
            "work", "profession", "job", "craft", "industry", "trade", "service", "production", "profit", "loss",
            "travel", "journey", "continent", "country", "city", "village", "province", "area", "district", "street",
            "house", "home", "room", "door", "window", "bed", "chair", "table", "shelf", "cabinet",
            "car", "train", "plane", "ship", "bicycle", "bus", "truck", "engine", "vehicle", "motorcycle",
            "eating", "drinking", "sleeping", "waking", "working", "resting", "playing", "studying", "meeting", "conversation",
            "time", "now", "here", "there", "yesterday", "tomorrow", "today", "later", "soon", "always",
            "direction", "direction", "right", "wrong", "correct", "error", "accurate", "inaccurate", "deep", "shallow",
            "useful", "useless", "beneficial", "harmful", "suitable", "unsuitable", "appropriate", "inappropriate", "true", "false",
            "poverty", "wealth", "rich", "poor", "educated", "ignorant", "literate", "illiterate", "teacher", "student",
            "sick", "healthy", "whole", "cured", "wounded", "injured", "disabled", "army", "pilgrim", "doctor",
            "agriculture", "hunting", "plowing", "sowing", "harvest", "milling", "baking", "cooking", "frying", "roasting",
            "tailor", "carpenter", "blacksmith", "glass", "building", "painter", "sculptor", "artist", "musician", "poet",
            "writer", "novelist", "journalist", "producer", "actor", "director", "filmmaker", "photographer", "sculptor", "engineer",
            "engineer", "scholar", "philosopher", "logician", "theologian", "historian", "jurist", "judge", "mufti", "caliph",
            "king", "prince", "sultan", "caesar", "warrior", "leader", "soldier", "knight", "fighter", "combatant",
            "sailor", "navigator", "diver", "fisherman", "hunter", "merchant", "seller", "buyer", "owner", "proprietor",
            "slave", "free", "freeman", "prisoner", "humiliated", "honored", "organizer", "executor", "responsible", "manager",
            "friend", "enemy", "beloved", "despised", "helper", "traitor", "supporter", "opponent", "ally", "enemy",
            "parent", "mother", "son", "daughter", "brothers", "sisters", "grandfather", "grandmother", "uncle", "aunt",
            "uncle", "aunt", "cousin", "widow", "divorcee", "divorced", "married", "single", "groom", "bride",
            "worship", "prayer", "remembrance", "glorification", "repentance", "testimony", "prayer", "fasting", "zakat", "pilgrimage",
            "faith", "disbelief", "apostasy", "polytheism", "monotheism", "trinity", "incarnation", "resemblance", "transcendence", "sanctification",
            "paradise", "hell", "hellfire", "torture", "reward", "punishment", "bliss", "happiness", "misery", "destruction",
            "spirit", "body", "mind", "heart", "senses", "sight", "hearing", "smell", "taste", "touch",
            "student", "teacher", "director", "principal", "technician", "administrative", "worker", "employee", "employee", "owner",
            "glory", "honor", "dignity", "grandeur", "humiliation", "shame", "disgrace", "scandal", "reputation", "bad",
            "perfect", "improved", "good", "harmed", "hit", "missed", "succeeded", "failed", "profit", "loss",
            "wide", "narrow", "enclosed", "open", "closed", "open", "tight", "loose", "strong", "soft",
            "government", "state", "emirate", "state", "province", "directorate", "village", "district", "street", "alley",
            "palace", "building", "building", "wall", "fence", "fence", "fortress", "castle", "tower", "lighthouse",
            "river", "sea", "ocean", "lake", "current", "stream", "spring", "fountain", "well", "waterwheel",
            "mountain", "hill", "valley", "plain", "desert", "forest", "orchard", "garden", "field", "meadow",
            "plant", "tree", "grass", "flower", "rose", "jasmine", "palm", "pine", "poplar", "cypress",
            "fruit", "orange", "apple", "pear", "banana", "grape", "pomegranate", "date", "olive", "fig",
            "animal", "lion", "tiger", "elephant", "camel", "horse", "dog", "cat", "rabbit", "mouse",
            "bird", "eagle", "hawk", "falcon", "crow", "dove", "sparrow", "parrot", "owl", "ostrich",
            "fish", "whale", "dolphin", "octopus", "crab", "shrimp", "oyster", "star", "hedgehog", "termite",
            "insect", "bee", "ant", "worm", "butterfly", "dragonfly", "grasshopper", "cockroach", "bug", "flea",
            "disease", "pain", "ache", "fever", "cough", "sneeze", "cold", "asthma", "pressure", "diabetes",
            "heart", "lung", "liver", "kidney", "brain", "stomach", "intestine", "muscle", "bone", "skin",
            "taste", "food", "delicious", "hot", "cold", "sweet", "salty", "sour", "bitter", "flavorless",
            "smell", "odor", "perfume", "fragrant", "rotten", "stink", "sweet", "foul", "fragrant", "flavor",
            "famous", "unknown", "known", "hidden", "visible", "hidden", "public", "secret", "announcement", "secrecy",
            "price", "cost", "value", "commodity", "money", "currency", "money", "dirham", "dinar", "rial",
            "army", "corps", "battalion", "company", "platoon", "garrison", "retired", "volunteer", "professional", "recruit",
            "war", "peace", "truce", "treaty", "siege", "fortress", "fortification", "fortification", "retreat", "withdrawal",
            "victory", "defeat", "breakage", "triumph", "surrender", "drain", "tricks", "traps", "trick", "plan",
            "diplomacy", "embassy", "ambassador", "consulate", "consul", "envoy", "mission", "delegation", "representative", "mediator",
            "contract", "treaty", "agreement", "protocol", "convention", "covenant", "covenant", "promise", "condition", "clause",
            "security", "safety", "protection", "shield", "fortress", "shelter", "refuge", "haven", "guarantee", "warranty",
            "danger", "threat", "contradiction", "aggression", "attack", "invasion", "invasion", "infiltration", "infiltration", "ambush"
        ]
    };

    const textMap = {
        ar: {
            pageTitle: "DashType - نمط 3 كلمات",
            gameTitle: "DashType - نمط 3 كلمات",
            greeting: "تحدي كتابة 3 كلمات معاً لرفع التركيز والانسيابية.",
            startRound: "بدء جولة",
            startGate: "بدء الجولة",
            newWord: "كلمة جديدة",
            home: "الصفحة الرئيسية",
            typingPlaceholder: "اكتب هنا...",
            timerLabel: "الوقت:",
            timerUnit: "ث",
            progressSingle: "النمط الحالي: كلمة واحدة",
            progressTriple: "النمط الحالي: 3 كلمات (مجموع 14 حرفاً)",
            progressTripleSeq: "الكلمة {index} من 3 (المجموع 14 حرفاً)",
            readyWordBox: "جاهز؟ اضغط بدء",
            endedWordBox: "انتهت الجولة",
            resultStart: "ابدأ الجولة الآن",
            resultStartTyping: "بدأ الوقت!",
            resultGoodContinue: "ممتاز، استمر",
            resultWrong: "يوجد خطأ، حاول التصحيح",
            resultNextWord: "ممتاز، الكلمة التالية",
            resultDoneSingle: "ممتاز! أنهيت الكلمة في {time} ثانية",
            resultDoneTriple: "ممتاز! أنهيت 3 كلمات (14 حرفاً) خلال {time} ثانية",
            resultDoneTripleSeq: "ممتاز! أنهيت 3 كلمات متتالية (14 حرفاً) خلال {time} ثانية",
            themeLabel: "المظهر",
            colorModeLabel: "الوضع",
            langLabel: "اللغة",
            themeOcean: "أزرق وبرتقالي",
            themeSunset: "وردي وأصفر",
            themeForest: "أخضر وأزرق",
            themeBerry: "بنفسجي ووردي",
            themeNeon: "أخضر وأصفر",
            themeViolet: "بنفسجي ووردي",
            themeBrown: "بني",
            darkMode: "داكن",
            blurMode: "ضبابي",
            lightMode: "فاتح",
            langArabic: "العربية",
            langEnglish: "English",
            mazenNameTxt: "مازن",
            ahmedNameTxt: "أحمد",
            contactLabel: "للتواصل معنا",
            versionLabel: "الإصدار",
            betaLabel: "بيتا"
        },
        en: {
            pageTitle: "DashType - 3 Words Mode",
            gameTitle: "DashType - 3 Words Mode",
            greeting: "Type 3 words together to build focus and flow.",
            startRound: "Start Round",
            startGate: "Start Round",
            newWord: "New Word",
            home: "Home",
            typingPlaceholder: "Type here...",
            timerLabel: "Time:",
            timerUnit: "s",
            progressSingle: "Current Mode: Single Word",
            progressTriple: "Current Mode: 3 Words (Total 14 letters)",
            progressTripleSeq: "Word {index} of 3 (Total 14 letters)",
            readyWordBox: "Ready? Press start",
            endedWordBox: "Round Ended",
            resultStart: "Start a round now",
            resultStartTyping: "Timer started!",
            resultGoodContinue: "Great, keep going",
            resultWrong: "There is a mistake, correct it",
            resultNextWord: "Great, next word",
            resultDoneSingle: "Great! You finished the word in {time} seconds",
            resultDoneTriple: "Great! You finished 3 words (14 letters) in {time} seconds",
            resultDoneTripleSeq: "Great! You finished 3 sequential words (14 letters) in {time} seconds",
            themeLabel: "Theme",
            colorModeLabel: "Mode",
            langLabel: "Language",
            themeOcean: "Blue & Orange",
            themeSunset: "Pink & Yellow",
            themeForest: "Green & Blue",
            themeBerry: "Purple & Pink",
            themeNeon: "Green & Yellow",
            themeViolet: "Purple & Pink",
            themeBrown: "Brown",
            darkMode: "Dark",
            blurMode: "Blurred",
            lightMode: "Light",
            langArabic: "Arabic",
            langEnglish: "English",
            mazenNameTxt: "Mazen",
            ahmedNameTxt: "Ahmed",
            contactLabel: "Contact us",
            versionLabel: "Version",
            betaLabel: "Beta"
        }
    };

    function initGamePage(config) {
        const mode = config.mode;
        const tripleTotalLetters = 14;
        const tripleWordCount = 3;

        const wordBox = document.getElementById("wordBox");
        const typingInput = document.getElementById("typingInput");
        const timeValue = document.getElementById("timeValue");
        const resultText = document.getElementById("resultText");
        const startBtn = document.getElementById("startBtn");
        const gateStartBtn = document.getElementById("gateStartBtn");
        const startGate = document.getElementById("startGate");
        const nextBtn = document.getElementById("nextBtn");
        const homeBtn = document.getElementById("homeBtn");
        const progressText = document.getElementById("progressText");
        const playerGreeting = document.getElementById("playerGreeting");
        const gameTitle = document.getElementById("gameTitle");
        const timerLabel = document.getElementById("timerLabel");
        const timerUnit = document.getElementById("timerUnit");
        const themeLabel = document.getElementById("themeLabel");
        const colorModeLabel = document.getElementById("colorModeLabel");
        const langLabel = document.getElementById("langLabel");
        const langArBtn = document.getElementById("langArBtn");
        const langEnBtn = document.getElementById("langEnBtn");
        const themeOceanBtn = document.getElementById("themeOceanBtn");
        const themeSunsetBtn = document.getElementById("themeSunsetBtn");
        const themeForestBtn = document.getElementById("themeForestBtn");
        const themeBerryBtn = document.getElementById("themeBerryBtn");
        const themeNeonBtn = document.getElementById("themeNeonBtn");
        const themeVioletBtn = document.getElementById("themeVioletBtn");
        const themeBrownBtn = document.getElementById("themeBrownBtn");
        const colorModeDarkBtn = document.getElementById("colorModeDarkBtn");
        const colorModeBlurBtn = document.getElementById("colorModeBlurBtn");
        const colorModeLightBtn = document.getElementById("colorModeLightBtn");

        const themeButtons = [themeOceanBtn, themeSunsetBtn, themeForestBtn, themeBerryBtn, themeNeonBtn, themeVioletBtn, themeBrownBtn];
        const colorModeButtons = [colorModeDarkBtn, colorModeBlurBtn, colorModeLightBtn];

        let playerName = "لاعب";
        let currentLanguage = "ar";
        let currentWord = "";
        let timerStarted = false;
        let startTime = 0;
        let finalTime = 0;
        let rafId = null;
        let sequentialWords = [];
        let sequentialIndex = 0;

        function t(key) {
            return textMap[currentLanguage][key];
        }

        function format(template, values) {
            let out = template;
            for (const [k, v] of Object.entries(values)) {
                out = out.replaceAll("{" + k + "}", String(v));
            }
            return out;
        }

        function saveState() {
            const state = {
                playerName,
                currentLanguage,
                currentTheme: document.documentElement.getAttribute("data-theme") || "ocean",
                currentColorMode: document.documentElement.getAttribute("data-color-mode") || "blur",
                selectedMode: mode
            };
            localStorage.setItem("typingGameState", JSON.stringify(state));
        }

        function setTheme(theme) {
            document.documentElement.setAttribute("data-theme", theme);
            themeButtons.forEach((btn) => {
                btn.classList.toggle("active", btn.dataset.theme === theme);
            });
            saveState();
        }

        function setColorMode(colorMode) {
            document.documentElement.setAttribute("data-color-mode", colorMode);
            colorModeButtons.forEach((btn) => {
                btn.classList.toggle("active", btn.dataset.colorMode === colorMode);
            });
            updateLogo();
            saveState();
        }

        function updateLogo() {
            const logoImg = document.getElementById("logoImg");
            if (!logoImg) return;
            const colorMode = document.documentElement.getAttribute("data-color-mode") || "blur";
            const logoSrc = colorMode === "light" ? "photo/dashtype%20black%20logo.png" : "photo/dashtype%20white%20logo.png";
            logoImg.src = logoSrc;
        }

        function loadState() {
            try {
                const saved = JSON.parse(localStorage.getItem("typingGameState") || "{}");
                if (typeof saved.playerName === "string" && saved.playerName.trim()) {
                    playerName = saved.playerName;
                }
                if (saved.currentLanguage === "ar" || saved.currentLanguage === "en") {
                    currentLanguage = saved.currentLanguage;
                }
                const theme = typeof saved.currentTheme === "string" ? saved.currentTheme : "ocean";
                const colorMode = typeof saved.currentColorMode === "string" ? saved.currentColorMode : "blur";
                setTheme(theme);
                setColorMode(colorMode);
            } catch (_error) {
                setTheme("ocean");
                setColorMode("blur");
            }
        }

        function getWords() {
            return wordsByLanguage[currentLanguage];
        }

        function getRandomWord() {
            const words = getWords();
            return words[Math.floor(Math.random() * words.length)];
        }

        function getThreeWordsWithTotalLetters(totalLetters) {
            const words = getWords();
            const attempts = 500;
            for (let i = 0; i < attempts; i += 1) {
                const selected = [getRandomWord(), getRandomWord(), getRandomWord()];
                if (selected.join("").length === totalLetters) {
                    return selected.join(" ");
                }
            }

            for (const w1 of words) {
                for (const w2 of words) {
                    for (const w3 of words) {
                        const selected = [w1, w2, w3];
                        if (selected.join("").length === totalLetters) {
                            return selected.join(" ");
                        }
                    }
                }
            }

            return "--- --- ---";
        }

        function getThreeWordSetWithTotalLetters(totalLetters) {
            const words = getWords();
            const attempts = 500;
            for (let i = 0; i < attempts; i += 1) {
                const selected = [getRandomWord(), getRandomWord(), getRandomWord()];
                if (selected.join("").length === totalLetters) {
                    return selected;
                }
            }

            for (const w1 of words) {
                for (const w2 of words) {
                    for (const w3 of words) {
                        const selected = [w1, w2, w3];
                        if (selected.join("").length === totalLetters) {
                            return selected;
                        }
                    }
                }
            }

            return ["---", "---", "---"];
        }

        function updateTimer() {
            if (!timerStarted) {
                return;
            }
            const elapsed = (performance.now() - startTime) / 1000;
            timeValue.textContent = elapsed.toFixed(3);
            rafId = requestAnimationFrame(updateTimer);
        }

        function stopTimer() {
            timerStarted = false;
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            finalTime = parseFloat(timeValue.textContent);
        }

        function renderProgress() {
            if (mode === "triple") {
                progressText.textContent = t("progressTriple");
                return;
            }
            if (mode === "triple-seq") {
                progressText.textContent = format(t("progressTripleSeq"), { index: sequentialIndex + 1 });
                return;
            }
            progressText.textContent = t("progressSingle");
        }

        function resetRoundState() {
            resultText.textContent = t("resultStart");
            resultText.className = "result";
            wordBox.textContent = t("readyWordBox");
            typingInput.value = "";
            timeValue.textContent = "0.000";
            stopTimer();
            sequentialWords = [];
            sequentialIndex = 0;
            renderProgress();
        }

        function showStartGate() {
            startGate.classList.remove("hidden");
        }

        function hideStartGate() {
            startGate.classList.add("hidden");
        }

        function startRound() {
            if (mode === "triple") {
                currentWord = getThreeWordsWithTotalLetters(tripleTotalLetters);
            } else if (mode === "triple-seq") {
                sequentialWords = getThreeWordSetWithTotalLetters(tripleTotalLetters);
                sequentialIndex = 0;
                currentWord = sequentialWords[sequentialIndex];
            } else {
                currentWord = getRandomWord();
            }

            wordBox.textContent = currentWord;
            typingInput.value = "";
            timeValue.textContent = "0.000";
            resultText.textContent = t("resultStartTyping");
            resultText.className = "result";
            timerStarted = true;
            startTime = performance.now();
            updateTimer();
            renderProgress();
            typingInput.focus();
        }

        function goToNextWordOrFinish() {
            if (mode === "triple-seq" && sequentialIndex < tripleWordCount - 1) {
                sequentialIndex += 1;
                currentWord = sequentialWords[sequentialIndex];
                wordBox.textContent = currentWord;
                typingInput.value = "";
                resultText.textContent = t("resultNextWord");
                resultText.className = "result";
                renderProgress();
                return;
            }

            stopTimer();
            if (mode === "triple") {
                resultText.textContent = format(t("resultDoneTriple"), { time: finalTime.toFixed(3) });
            } else if (mode === "triple-seq") {
                resultText.textContent = format(t("resultDoneTripleSeq"), { time: finalTime.toFixed(3) });
            } else {
                resultText.textContent = format(t("resultDoneSingle"), { time: finalTime.toFixed(3) });
            }
            resultText.className = "result success";
            wordBox.textContent = t("endedWordBox");
            typingInput.value = "";
            typingInput.blur();
            
            // Save round data to Firebase if user is logged in
            callSaveRound();
            
            showStartGate();
        }

        function callSaveRound() {
            let wordToSave = Array.isArray(currentWord) ? currentWord.join(" ") : currentWord;
            if (window.saveRoundDataToFirebase) {
                window.saveRoundDataToFirebase(wordToSave, finalTime, "triple", currentLanguage);
            }
        }

        function applyTexts() {
            document.title = t("pageTitle");
            gameTitle.textContent = t("gameTitle");
            playerGreeting.textContent = format(t("greeting"), { name: playerName });
            document.getElementById("startBtnText").textContent = t("startRound");
            document.getElementById("gateStartText").textContent = t("startGate");
            document.getElementById("nextBtnText").textContent = t("newWord");
            document.getElementById("homeBtnText").textContent = t("home");
            typingInput.placeholder = t("typingPlaceholder");
            timerLabel.textContent = t("timerLabel");
            timerUnit.textContent = t("timerUnit");
            themeLabel.textContent = t("themeLabel");
            colorModeLabel.textContent = t("colorModeLabel");
            langLabel.textContent = t("langLabel");
            themeOceanBtn.title = t("themeOcean");
            themeSunsetBtn.title = t("themeSunset");
            themeForestBtn.title = t("themeForest");
            themeBerryBtn.title = t("themeBerry");
            themeNeonBtn.title = t("themeNeon");
            themeVioletBtn.title = t("themeViolet");
            themeBrownBtn.title = t("themeBrown");
            themeOceanBtn.setAttribute("aria-label", t("themeOcean"));
            themeSunsetBtn.setAttribute("aria-label", t("themeSunset"));
            themeForestBtn.setAttribute("aria-label", t("themeForest"));
            themeBerryBtn.setAttribute("aria-label", t("themeBerry"));
            themeNeonBtn.setAttribute("aria-label", t("themeNeon"));
            themeVioletBtn.setAttribute("aria-label", t("themeViolet"));
            themeBrownBtn.setAttribute("aria-label", t("themeBrown"));
            colorModeDarkBtn.title = t("darkMode");
            colorModeBlurBtn.title = t("blurMode");
            colorModeLightBtn.title = t("lightMode");
            colorModeDarkBtn.setAttribute("aria-label", t("darkMode"));
            colorModeBlurBtn.setAttribute("aria-label", t("blurMode"));
            colorModeLightBtn.setAttribute("aria-label", t("lightMode"));
            langArBtn.textContent = t("langArabic");
            langEnBtn.textContent = t("langEnglish");

            const mazenElem = document.getElementById("mazenNameTxt");
            const ahmedElem = document.getElementById("ahmedNameTxt");
            if (mazenElem) mazenElem.textContent = t("mazenNameTxt");
            if (ahmedElem) ahmedElem.textContent = t("ahmedNameTxt");
            const contactLabel = document.getElementById("contactLabel");
            if (contactLabel) contactLabel.textContent = t("contactLabel");
            const versionLabel = document.getElementById("versionLabel");
            if (versionLabel) versionLabel.textContent = t("versionLabel");
            const betaLabel = document.getElementById("betaLabel");
            if (betaLabel) betaLabel.textContent = t("betaLabel");

            renderProgress();
            if (
                !timerStarted
                && (!currentWord || wordBox.textContent === t("readyWordBox") || wordBox.textContent === t("endedWordBox"))
            ) {
                resultText.textContent = t("resultStart");
            }
        }

        function setLanguage(lang) {
            currentLanguage = lang;
            document.documentElement.lang = lang;
            document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
            langArBtn.classList.toggle("active", lang === "ar");
            langEnBtn.classList.toggle("active", lang === "en");
            applyTexts();
            resetRoundState();
            showStartGate();
            saveState();
        }

        function goHome() {
            saveState();
            window.location.href = "index.html";
        }

        function normalizeInput(value) {
            if (currentLanguage === "en") {
                return value.toLowerCase();
            }
            return value;
        }

        typingInput.addEventListener("input", () => {
            const typedValue = normalizeInput(typingInput.value);
            const targetValue = normalizeInput(currentWord);

            if (typedValue === targetValue) {
                goToNextWordOrFinish();
                return;
            }

            if (!targetValue.startsWith(typedValue)) {
                resultText.textContent = t("resultWrong");
                resultText.className = "result warning";
                return;
            }

            resultText.textContent = t("resultGoodContinue");
            resultText.className = "result";
        });

        startBtn.addEventListener("click", () => {
            hideStartGate();
            startRound();
        });

        gateStartBtn.addEventListener("click", () => {
            hideStartGate();
            startRound();
        });

        nextBtn.addEventListener("click", () => {
            hideStartGate();
            startRound();
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                if (startGate.classList.contains("hidden")) {
                    startRound();
                } else {
                    hideStartGate();
                    startRound();
                }
            }
        });

        homeBtn.addEventListener("click", goHome);

        langArBtn.addEventListener("click", () => setLanguage("ar"));
        langEnBtn.addEventListener("click", () => setLanguage("en"));

        themeButtons.forEach((btn) => {
            btn.addEventListener("click", () => setTheme(btn.dataset.theme));
        });

        colorModeButtons.forEach((btn) => {
            btn.addEventListener("click", () => setColorMode(btn.dataset.colorMode));
        });

        loadState();
        setLanguage(currentLanguage);
        showStartGate();
    }

    return {
        initGamePage
    };
})();

window.TypingGame.initGamePage({ mode: "triple" });
