import type { Faq, Feature, ProductColors, Testimonial } from './types';

/* ---------- category detection ---------- */
export function detectCategory(title: string): string {
  const t = title || '';
  if (/ساعة|سمارت|ذكية|watch/i.test(t)) return 'watch';
  if (/عطر|بارفان|مسك|perfume/i.test(t)) return 'perfume';
  if (/حذاء|سنيكرز|شوز|نعال|shoe/i.test(t)) return 'shoes';
  if (/سماعة|ايربودز|هاتف|شاحن|جراب|غطاء|phone|earbud/i.test(t)) return 'phone';
  if (/كريم|سيروم|بشرة|شعر|مكياج|تجميل|غسول|زيت|serum|cream/i.test(t)) return 'beauty';
  if (/نظارة|محفظة|حقيبة|glasses|wallet/i.test(t)) return 'accessory';
  if (/ملابس|قميص|حجاب|عباية|جاكيت|بنطلون|فستان|هودي/i.test(t)) return 'fashion';
  if (/مطبخ|منزل|بيت|مصباح|ديكور|تنظيم|مكنسة|قلاية|خلاط/i.test(t)) return 'home';
  if (/رياضة|لياقة|تخسيس|فيتامين|صحة|بروتين/i.test(t)) return 'health';
  if (/لعبة|أطفال|طفل|رضيع/i.test(t)) return 'kids';
  return 'general';
}

export const CATEGORY_LABELS: Record<string, string> = {
  watch: 'ساعات وإلكترونيات',
  perfume: 'عطور',
  shoes: 'أحذية',
  phone: 'هواتف وإكسسوارات',
  beauty: 'تجميل وعناية',
  accessory: 'إكسسوارات',
  fashion: 'ملابس وأزياء',
  home: 'المنزل والمطبخ',
  health: 'صحة ولياقة',
  kids: 'أطفال',
  general: 'عام',
};

interface CatTpl {
  subtitles: string[];
  descs: string[];
  features: Feature[];
  faqExtra: Faq;
}

const T: Record<string, CatTpl> = {
  watch: {
    subtitles: ['أناقة وتكنولوجيا في معصمك', 'ساعتك الذكية الجديدة بمواصفات رائدة', 'تابع صحتك ونشاطك بذكاء طوال اليوم'],
    descs: [
      '{title} تجمع بين التصميم الأنيق والتقنيات الحديثة: شاشة عالية الوضوح، تتبع للرياضة والنوم ونبض القلب، وبطارية تدوم لأيام. متوافقة مع أندرويد وآيفون، ومقاومة لرذاذ الماء — رفيقك المثالي في العمل والرياضة.',
      'لماذا يختارها الجزائريون؟ لأنها تقدم تجربة الساعات العالمية بسعر في المتناول، مع ضمان الجودة والتوصيل السريع لباب دارك والدفع عند الاستلام.',
    ],
    features: [
      { title: 'شاشة فائقة الوضوح', desc: 'شاشة لمس ساطعة وواضحة حتى تحت أشعة الشمس مع خلفيات متنوعة.' },
      { title: 'تتبع صحي متكامل', desc: 'قياس نبض القلب، الأكسجين في الدم، النوم، والخطوات والسعرات.' },
      { title: 'بطارية طويلة المدى', desc: 'شحنة واحدة تكفي لعدة أيام من الاستخدام المتواصل.' },
      { title: 'مقاومة للماء والغبار', desc: 'استعملها في الرياضة والمطر براحة بال تامة.' },
    ],
    faqExtra: { q: 'هل الساعة متوافقة مع هاتفي؟', a: 'نعم، تعمل مع جميع هواتف أندرويد وآيفون عبر تطبيق مجاني، وطريقة الربط سهلة وتستغرق أقل من دقيقتين.' },
  },
  perfume: {
    subtitles: ['عطر يليق بك ويدوم طوال اليوم', 'فوحان استثنائي وثبات يدوم 12 ساعة', 'اكتشف عطرك المميز بسعر لا يقاوم'],
    descs: [
      '{title} تركيبة فرنسية فاخرة بمكونات أصلية: افتتاحية منعشة، قلب دافئ، وقاعدة عميقة تدوم من الصباح حتى المساء. زجاجة أنيقة بحجم عملي تناسب الجيب والحقيبة.',
      'عطر واحد يكفي ليترك انطباعاً لا ينسى. اطلب الآن واستلم طلبك لباب الدار مع الدفع عند الاستلام وإمكانية المعاينة.',
    ],
    features: [
      { title: 'ثبات يدوم طوال اليوم', desc: 'تركيز عالٍ يضمن بقاء الرائحة على الملابس لساعات طويلة.' },
      { title: 'مكونات أصلية فاخرة', desc: 'زيوت عطرية فرنسية مختارة بعناية لجودة مضمونة.' },
      { title: 'زجاجة أنيقة وعملية', desc: 'تصميم راقٍ يليق بالهدايا والاستعمال اليومي.' },
      { title: 'مناسب للجنسين', desc: 'تركيبة متوازنة تناسب جميع الأذواق والمناسبات.' },
    ],
    faqExtra: { q: 'هل العطر أصلي ويدوم فعلاً؟', a: 'نعم، نضمن التركيز العالي والثبات. إذا لم يعجبك العطر يمكنك رفض الاستلام عند المعاينة بدون أي التزام.' },
  },
  shoes: {
    subtitles: ['راحة تدوم طوال اليوم وأناقة تلفت الأنظار', 'خطوات خفيفة بتصميم عصري وخامات ممتازة', 'الحذاء الذي يجمع بين الرياضة والأناقة'],
    descs: [
      '{title} مصمم بخامات عالية الجودة ونعل طبي مريح يمتص الصدمات، مناسب للاستعمال اليومي والرياضة والخرجات. خياطة متينة وتشطيب راقٍ يتحمل الاستعمال المكثف.',
      'اختر مقاسك ولونك المفضل من الخيارات المتاحة، وسيصلك طلبك حتى باب الدار مع الدفع عند الاستلام.',
    ],
    features: [
      { title: 'نعل طبي مريح', desc: 'تصميم يمتص الصدمات ويمنح راحة استثنائية للمشي الطويل.' },
      { title: 'خامات تسمح بالتهوية', desc: 'قماش يسمح بمرور الهواء ليبقي قدميك منتعشتين.' },
      { title: 'خياطة متينة', desc: 'تشطيب عالي الجودة يتحمل الاستعمال اليومي المكثف.' },
      { title: 'تصميم عصري', desc: 'شكل أنيق يناسب جميع الإطلالات الكاجوال والرياضية.' },
    ],
    faqExtra: { q: 'كيف أختار المقاس المناسب؟', a: 'المقاسات مطابقة للمعايير الأوروبية المعتادة. إذا كنت بين مقاسين ننصحك باختيار المقاس الأكبر.' },
  },
  phone: {
    subtitles: ['إكسسوار هاتفك الأساسي بجودة مضمونة', 'أداء ممتاز وتوافق واسع مع جميع الهواتف', 'الحل العملي الذي كنت تبحث عنه لهاتفك'],
    descs: [
      '{title} بجودة أصلية وأداء موثوق: خامات متينة، توافق واسع مع مختلف الأجهزة، وتجربة استخدام سلسة من أول يوم. منتج مجرّب ويحظى بتقييمات ممتازة من زبائننا.',
      'اطلب الآن واستفد من التوصيل السريع لـ 58 ولاية مع الدفع عند الاستلام وضمان الاستبدال.',
    ],
    features: [
      { title: 'جودة أصلية مضمونة', desc: 'منتج مختار بعناية ومفحوص قبل الشحن.' },
      { title: 'توافق واسع', desc: 'يعمل مع أغلب الهواتف والأجهزة الحديثة.' },
      { title: 'سهولة الاستخدام', desc: 'تركيب وتشغيل سريع بدون تعقيدات.' },
      { title: 'متانة عالية', desc: 'خامات قوية تدوم طويلاً في الاستعمال اليومي.' },
    ],
    faqExtra: { q: 'هل يتوافق مع هاتفي؟', a: 'المنتج متوافق مع أغلب الأجهزة الحديثة. اذكر موديل هاتفك في ملاحظات الطلب وسنتأكد قبل الشحن.' },
  },
  beauty: {
    subtitles: ['سر الجمال الطبيعي لبشرة مشرقة', 'عناية مركزة بنتائج تظهر من أول أسبوع', 'وداعاً لمشاكل البشرة مع التركيبة الفعالة'],
    descs: [
      '{title} بتركيبة فعالة وآمنة تناسب جميع أنواع البشرة: مكونات طبيعية مختارة بعناية تمنحك إشراقة ونعومة ملحوظة. سهل الاستعمال ضمن روتينك اليومي صباحاً ومساءً.',
      'آلاف الزبائن في الجزائر جربوه ولاحظوا الفرق. اطلبيه الآن مع الدفع عند الاستلام والتوصيل لباب الدار.',
    ],
    features: [
      { title: 'مكونات طبيعية وآمنة', desc: 'تركيبة لطيفة خالية من المواد الضارة.' },
      { title: 'نتائج سريعة', desc: 'فرق ملحوظ خلال أيام من الاستعمال المنتظم.' },
      { title: 'يناسب كل البشرة', desc: 'مختبر على البشرة الحساسة والعادية والجافة.' },
      { title: 'سهل الاستعمال', desc: 'خطوات بسيطة تندمج في روتينك اليومي.' },
    ],
    faqExtra: { q: 'هل يناسب البشرة الحساسة؟', a: 'نعم، التركيبة لطيفة ومختبرة. ننصح دائماً بتجربة كمية صغيرة أولاً كما هو معتاد مع أي منتج جديد.' },
  },
  accessory: {
    subtitles: ['لمسة أناقة تكمل إطلالتك', 'جودة فاخرة وتفاصيل مدروسة', 'إكسسوار عملي بتصميم راقٍ'],
    descs: [
      '{title} قطعة مختارة بعناية لعشاق التفاصيل: خامات فاخرة، تشطيب دقيق، وتصميم عصري يناسب جميع المناسبات. هدية مثالية لنفسك أو لمن تحب.',
      'الكمية محدودة والطلب متزايد — احجز قطعتك الآن مع الدفع عند الاستلام.',
    ],
    features: [
      { title: 'خامات فاخرة', desc: 'جودة عالية تدوم وتحافظ على مظهرها.' },
      { title: 'تصميم عصري', desc: 'شكل أنيق يواكب آخر الصيحات.' },
      { title: 'تشطيب دقيق', desc: 'اهتمام بأدق التفاصيل في كل قطعة.' },
      { title: 'مثالي كهدية', desc: 'تغليف أنيق يليق بالإهداء.' },
    ],
    faqExtra: { q: 'هل يأتي بتغليف هدايا؟', a: 'نعم، يصلك المنتج بتغليف أنيق يحافظ عليه ويليق بالإهداء مباشرة.' },
  },
  fashion: {
    subtitles: ['موضة عصرية بجودة تستحقها', 'إطلالة مميزة بقطعة واحدة', 'راحة وأناقة في كل تفصيلة'],
    descs: [
      '{title} بخامة ممتازة وخياطة متقنة: ملمس مريح، ألوان ثابتة لا تبهت، وقصّة عصرية تناسب الجميع. قطعة أساسية في خزانتك لكل المواسم.',
      'اختر مقاسك ولونك من الخيارات المتاحة وسيصلك طلبك حتى باب الدار مع الدفع عند الاستلام.',
    ],
    features: [
      { title: 'خامة ممتازة', desc: 'قماش عالي الجودة مريح في اللبس والغسيل.' },
      { title: 'ألوان ثابتة', desc: 'صباغة عالية الجودة لا تبهت مع الغسيل.' },
      { title: 'خياطة متقنة', desc: 'تشطيب نظيف يتحمل الاستعمال المتكرر.' },
      { title: 'قصّة عصرية', desc: 'تصميم يواكب الموضة ويناسب الجميع.' },
    ],
    faqExtra: { q: 'هل المقاسات مضبوطة؟', a: 'نعم، المقاسات مطابقة للجداول المعتادة. عند التأكيد الهاتفي يمكنك مراجعة المقاس مع فريقنا.' },
  },
  home: {
    subtitles: ['بيت أجمل وحياة أسهل', 'الحل الذكي لكل بيت عصري', 'جودة تستحقها عائلتك'],
    descs: [
      '{title} صمم ليجعل حياتك اليومية أسهل: عملي، متين، وسهل الاستعمال والتنظيف. منتج أثبت فعاليته في آلاف البيوت الجزائرية.',
      'اطلب الآن واستلم طلبك لباب الدار مع الدفع عند الاستلام وإمكانية المعاينة قبل الدفع.',
    ],
    features: [
      { title: 'عملي وسهل الاستعمال', desc: 'مصمم للاستعمال اليومي بدون تعقيد.' },
      { title: 'خامات متينة', desc: 'جودة عالية تدوم لسنوات.' },
      { title: 'سهل التنظيف', desc: 'صيانة بسيطة تحافظ على المنتج كالجديد.' },
      { title: 'قيمة ممتازة', desc: 'سعر منافس مقابل جودة عالية.' },
    ],
    faqExtra: { q: 'هل التركيب صعب؟', a: 'إطلاقاً، التركيب سهل ويتم في دقائق بدون أدوات خاصة، مع دليل مصور مرفق.' },
  },
  health: {
    subtitles: ['صحتك أولاً مع الحل الطبيعي', 'نشاط وحيوية كل يوم', 'استثمر في صحتك اليوم'],
    descs: [
      '{title} لدعم نمط حياتك الصحي: تركيبة مدروسة ومكونات عالية الجودة تساعدك على تحقيق أهدافك الرياضية والصحية ضمن روتين متوازن.',
      'التوصيل سريع وسرّي لباب الدار مع الدفع عند الاستلام.',
    ],
    features: [
      { title: 'مكونات عالية الجودة', desc: 'تركيبة مدروسة بعناية لنتائج أفضل.' },
      { title: 'يدعم روتينك اليومي', desc: 'سهل الدمج في نمط حياتك.' },
      { title: 'آمن عند الاستعمال الصحيح', desc: 'اتبع التعليمات المرفقة دائماً.' },
      { title: 'تغليف محكم', desc: 'يحافظ على جودة المنتج وفعاليته.' },
    ],
    faqExtra: { q: 'كيف أستعمله؟', a: 'التعليمات الكاملة مرفقة مع المنتج. ننصح باستشارة مختص إذا كنت تعاني من حالة صحية خاصة.' },
  },
  kids: {
    subtitles: ['سعادة أطفالك تبدأ من هنا', 'آمن، ممتع، وتعليمي', 'الخيار المفضل للأمهات الجزائريات'],
    descs: [
      '{title} مصمم خصيصاً للأطفال: آمن تماماً، بمواد غير سامة وحواف ناعمة، يجمع بين المتعة والفائدة التعليمية. سيحبه أطفالك من أول نظرة.',
      'اطلبه الآن مع الدفع عند الاستلام والتوصيل السريع لباب الدار.',
    ],
    features: [
      { title: 'آمن 100% للأطفال', desc: 'مواد غير سامة وحواف ناعمة.' },
      { title: 'ممتع وتعليمي', desc: 'ينمي مهارات الطفل أثناء اللعب.' },
      { title: 'متين ويتحمل', desc: 'مصمم ليتحمل لعب الأطفال اليومي.' },
      { title: 'سهل التنظيف', desc: 'خامات عملية للأمهات.' },
    ],
    faqExtra: { q: 'ما هو العمر المناسب؟', a: 'مناسب للأعمار المذكورة في الوصف. المواد آمنة وخالية من القطع الصغيرة الخطرة.' },
  },
  general: {
    subtitles: ['جودة مضمونة بسعر منافس', 'المنتج الذي يستحق التجربة', 'اطلب الآن واستلم لباب الدار'],
    descs: [
      '{title} منتج مختار بعناية ليلبي توقعاتك: جودة عالية، سعر منافس، وتجربة شراء مريحة مع الدفع عند الاستلام. جربه الآلاف قبلك وكانت تقييماتهم ممتازة.',
      'التوصيل متوفر لـ 58 ولاية مع إمكانية المعاينة قبل الدفع. الكمية محدودة — اطلب الآن.',
    ],
    features: [
      { title: 'جودة مضمونة', desc: 'منتج مفحوص ومختار بعناية.' },
      { title: 'سعر منافس', desc: 'أفضل قيمة مقابل السعر.' },
      { title: 'توصيل سريع', desc: 'نغطي 58 ولاية بأفضل شركات التوصيل.' },
      { title: 'الدفع عند الاستلام', desc: 'عاين طلبك أولاً ثم ادفع براحتك.' },
    ],
    faqExtra: { q: 'هل يمكنني معاينة المنتج قبل الدفع؟', a: 'نعم، يمكنك معاينة الطرد عند الاستلام، وإذا لم يعجبك يمكنك الرفض بدون أي التزام.' },
  },
};

const NAMES: Array<[string, string]> = [
  ['أمين بن علي', 'الجزائر'], ['يوسف حمداني', 'وهران'], ['محمد لمين زروقي', 'سطيف'],
  ['ريان بوزيد', 'قسنطينة'], ['فاطمة الزهراء', 'البليدة'], ['خديجة مرابط', 'عنابة'],
  ['أسماء شريف', 'تلمسان'], ['سارة بلقاسم', 'بجاية'], ['عبد الرؤوف مسعودي', 'البويرة'],
  ['إلياس قادري', 'مستغانم'], ['نور الهدى', 'ورقلة'], ['وليد سعدي', 'جيجل'],
];

const REVIEW_TEXTS = [
  'وصلني الطلب في يومين فقط، التغليف ممتاز والجودة فاقت توقعاتي. تجربة شراء رائعة وأنصح به بقوة.',
  'كنت متردداً في البداية لكن المعاينة قبل الدفع طمأنتني. المنتج أصلي والتعامل راقٍ. شكراً لكم.',
  'ثالث مرة نطلب من هذا المتجر وما خاب ظني أبداً. توصيل سريع وخدمة زبائن محترمة. بارك الله فيكم.',
  'الجودة ممتازة والسعر مناسب جداً مقارنة بالسوق. وصلني لباب الدار في ولايتي بدون أي مشكل.',
  'طلبت هدية لأمي ووصلت بتغليف جميل وفي الوقت المحدد. فرحت بها كثيراً. متجر يستحق الثقة.',
  'فريق التأكيد اتصل بي بسرعة والطلب وصل كما في الصور تماماً. أول تجربة ولن تكون الأخيرة إن شاء الله.',
];

export interface GeneratedContent {
  subtitle: string;
  description: string;
  features: Feature[];
  testimonials: Testimonial[];
  faqs: Faq[];
}

export type RegenSection = 'subtitle' | 'description' | 'features' | 'testimonials' | 'faqs';

export function generateContent(input: { title: string; price: number; category?: string; salt?: number }): GeneratedContent {
  const { title, price } = input;
  const cat = input.category && T[input.category] ? input.category : detectCategory(title);
  const tpl = T[cat];
  const pick = <X,>(arr: X[], seed: number): X => arr[Math.abs(seed) % arr.length];
  const seed = title.length + Math.floor(price || 0) + (input.salt || 0);
  const subtitle = pick(tpl.subtitles, seed);
  const description = tpl.descs.map((d) => d.split('{title}').join(title)).join('\n\n');
  const testimonials: Testimonial[] = [0, 1, 2].map((i) => {
    const [name, wilaya] = NAMES[(seed + i * 4) % NAMES.length];
    return { name, wilaya, rating: i === 2 ? 4 : 5, text: REVIEW_TEXTS[(seed + i * 2) % REVIEW_TEXTS.length] };
  });
  const faqs: Faq[] = [
    tpl.faqExtra,
    { q: 'كم تستغرق مدة التوصيل؟', a: 'التوصيل يستغرق عادة من 24 إلى 72 ساعة حسب الولاية. الولايات الكبرى أسرع، وولايات الجنوب قد تأخذ وقتاً أطول قليلاً.' },
    { q: 'كيف أدفع ثمن الطلب؟', a: 'الدفع نقداً عند الاستلام. تعاين طلبك أولاً ثم تدفع المبلغ الإجمالي (سعر المنتج + سعر التوصيل) لعامل التوصيل.' },
    { q: 'ماذا لو وصلني المنتج فيه مشكل؟', a: 'يمكنك رفض الاستلام عند المعاينة مباشرة. وإذا اكتشفت المشكل لاحقاً تواصل معنا وسنجد لك الحل المناسب.' },
  ];
  return { subtitle, description, features: tpl.features, testimonials, faqs };
}

export function regenerateSection(input: { title: string; price: number; category: string; section: RegenSection; current: GeneratedContent }): GeneratedContent {
  const salt = Math.floor(Math.random() * 100000);
  const fresh = generateContent({ title: input.title, price: input.price, category: input.category, salt });
  switch (input.section) {
    case 'subtitle': return { ...input.current, subtitle: fresh.subtitle };
    case 'description': return { ...input.current, description: fresh.description };
    case 'features': return { ...input.current, features: fresh.features };
    case 'testimonials': return { ...input.current, testimonials: fresh.testimonials };
    case 'faqs': return { ...input.current, faqs: fresh.faqs };
  }
}

/* ---------- color extraction ---------- */
function toHex(r: number, g: number, b: number): string {
  const h = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return [h * 360, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
}

function dominantRgb(imgSrc: string): Promise<[number, number, number] | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const size = 64;
        const c = document.createElement('canvas');
        c.width = size; c.height = size;
        const ctx = c.getContext('2d');
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, size, size);
        const d = ctx.getImageData(0, 0, size, size).data;
        const bins = new Map<string, { r: number; g: number; b: number; n: number }>();
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i + 1], b = d[i + 2], a = d[i + 3];
          if (a < 128) continue;
          const key = `${r >> 5},${g >> 5},${b >> 5}`;
          const e = bins.get(key) || { r: 0, g: 0, b: 0, n: 0 };
          e.r += r; e.g += g; e.b += b; e.n += 1;
          bins.set(key, e);
        }
        let br = 13, bg = 148, bb = 136, best = -1;
        bins.forEach((e) => {
          const r = e.r / e.n, g = e.g / e.n, b = e.b / e.n;
          const [, sat, light] = rgbToHsl(r, g, b);
          if (light > 0.92 || light < 0.06) return;
          const score = sat * 2 + Math.log(1 + e.n) / 8 + (light > 0.25 && light < 0.7 ? 0.4 : 0);
          if (score > best) { best = score; br = r; bg = g; bb = b; }
        });
        resolve([br, bg, bb]);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = imgSrc;
  });
}

function paletteFrom(br: number, bg: number, bb: number): ProductColors {
  const [h, rawSat] = rgbToHsl(br, bg, bb);
  const sat = Math.max(rawSat, 0.55);
  const [pr, pg, pb] = hslToRgb(h, sat, 0.42);
  const primary = toHex(pr, pg, pb);
  const [sr, sg, sb] = hslToRgb(h, Math.min(sat, 0.35), 0.95);
  const secondary = toHex(sr, sg, sb);
  const compH = ((h + 180) % 360 + 360) % 360;
  const [ar, ag, ab] = hslToRgb(compH, 0.85, 0.5);
  const accent = toHex(ar, ag, ab);
  return { primary, secondary, accent };
}

export async function extractColors(imgSrc: string): Promise<ProductColors> {
  const fallback: ProductColors = { primary: '#0d9488', secondary: '#f0fdfa', accent: '#f59e0b' };
  const dom = await dominantRgb(imgSrc);
  if (!dom) return fallback;
  return paletteFrom(dom[0], dom[1], dom[2]);
}

export async function extractColorsMulti(sources: string[]): Promise<ProductColors> {
  const fallback: ProductColors = { primary: '#0d9488', secondary: '#f0fdfa', accent: '#f59e0b' };
  if (!sources.length) return fallback;
  const doms = (await Promise.all(sources.map(dominantRgb))).filter((x): x is [number, number, number] => x != null);
  if (!doms.length) return fallback;
  const avg = (fn: (c: [number, number, number]) => number) => doms.reduce((s, c) => s + fn(c), 0) / doms.length;
  return paletteFrom(avg((c) => c[0]), avg((c) => c[1]), avg((c) => c[2]));
}
