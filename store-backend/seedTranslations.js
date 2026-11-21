// Arabic translations for the built-in sample data.
// Used by seedData.js (new installs) and migrateI18n.js (existing databases).

const categories = {
    Shoes: 'أحذية',
    Bags: 'حقائب',
    Accessories: 'إكسسوارات',
    Electronics: 'إلكترونيات',
};

const items = {
    'Running Shoes': {
        descriptionEn: 'Lightweight running shoes with a cushioned sole and a breathable upper. Comfortable for daily runs and long walks.',
        name: 'حذاء جري',
        description: 'حذاء جري خفيف الوزن بنعل مبطن وجزء علوي يسمح بمرور الهواء. مريح للجري اليومي والمشي لمسافات طويلة.',
    },
    'Classic Sneakers': {
        descriptionEn: 'Timeless low-top sneakers in a clean cream finish. Easy to match with any outfit, from jeans to shorts.',
        name: 'حذاء رياضي كلاسيكي',
        description: 'حذاء رياضي منخفض الرقبة بتصميم خالد ولون كريمي أنيق. يناسب أي إطلالة، من الجينز إلى الشورت.',
    },
    'Leather Sandals': {
        descriptionEn: 'Soft leather slides with a contoured footbed. Cool and comfortable for hot summer days.',
        name: 'صندل جلد',
        description: 'صندل جلدي ناعم بنعل مريح يناسب شكل القدم. بارد ومريح في أيام الصيف الحارة.',
    },
    'Canvas Backpack': {
        descriptionEn: 'Durable canvas backpack with a roomy main compartment, a front pocket and padded shoulder straps.',
        name: 'حقيبة ظهر قماش',
        description: 'حقيبة ظهر قماشية متينة بجيب رئيسي واسع وجيب أمامي وأحزمة كتف مبطنة.',
    },
    'Leather Handbag': {
        descriptionEn: 'Elegant handbag with a magnetic flap closure and a sturdy top handle. Fits a phone, wallet and daily essentials.',
        name: 'حقيبة يد جلد',
        description: 'حقيبة يد أنيقة بإغلاق مغناطيسي ومقبض علوي قوي. تتسع للهاتف والمحفظة وأغراضك اليومية.',
    },
    'Travel Duffel Bag': {
        descriptionEn: 'Spacious duffel bag for trips and the gym, with a zipped top, an outer pocket and a strong carry handle.',
        name: 'حقيبة سفر دفل',
        description: 'حقيبة دفل واسعة للرحلات والنادي الرياضي، بسحاب علوي وجيب خارجي ومقبض حمل قوي.',
    },
    'Classic Watch': {
        descriptionEn: 'Analog watch with a gold-tone case, a clean white dial and a dark leather strap.',
        name: 'ساعة كلاسيكية',
        description: 'ساعة تناظرية بعلبة ذهبية اللون وميناء أبيض نظيف وسوار جلدي داكن.',
    },
    Sunglasses: {
        descriptionEn: 'Stylish sunglasses with dark lenses and a lightweight frame for everyday use.',
        name: 'نظارة شمسية',
        description: 'نظارة شمسية أنيقة بعدسات داكنة وإطار خفيف الوزن للاستخدام اليومي.',
    },
    'Leather Wallet': {
        descriptionEn: 'Slim wallet in brown leather with card slots, a bill compartment and a snap closure.',
        name: 'محفظة جلد',
        description: 'محفظة نحيفة من الجلد البني بفتحات للبطاقات وجيب للأوراق النقدية وإغلاق بزر.',
    },
    'Wireless Headphones': {
        descriptionEn: 'Over-ear wireless headphones with soft ear cushions, deep sound and long battery life.',
        name: 'سماعات لاسلكية',
        description: 'سماعات لاسلكية فوق الأذن بوسائد ناعمة وصوت عميق وبطارية تدوم طويلاً.',
    },
    'Portable Speaker': {
        descriptionEn: 'Compact Bluetooth speaker with clear sound, easy controls and a handy carry loop.',
        name: 'سماعة محمولة',
        description: 'سماعة بلوتوث صغيرة بصوت واضح وأزرار تحكم سهلة وحلقة حمل عملية.',
    },
    'Power Bank 10000mAh': {
        descriptionEn: 'Slim 10000mAh power bank with a four-light charge indicator. Keeps your phone charged all day.',
        name: 'باور بانك 10000 مللي أمبير',
        description: 'باور بانك نحيف بسعة 10000 مللي أمبير ومؤشر شحن بأربعة أضواء. يبقي هاتفك مشحونًا طوال اليوم.',
    },
};

module.exports = { categories, items };
