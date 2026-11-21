export type Lang = 'ar' | 'en';

export interface LocalizedText {
  ar: string;
  en: string;
}

type Dictionary = Record<string, LocalizedText>;

// Every UI string lives here once, with both languages side by side.
export const TRANSLATIONS = {
  // common
  'common.loading': { en: 'Loading...', ar: 'جارٍ التحميل...' },
  'common.all': { en: 'All', ar: 'الكل' },
  'common.save': { en: 'Save', ar: 'حفظ' },
  'common.cancel': { en: 'Cancel', ar: 'إلغاء' },
  'common.edit': { en: 'Edit', ar: 'تعديل' },
  'common.delete': { en: 'Delete', ar: 'حذف' },
  'common.view': { en: 'View', ar: 'عرض' },
  'common.actions': { en: 'Actions', ar: 'الإجراءات' },
  'common.total': { en: 'Total', ar: 'الإجمالي' },
  'common.name': { en: 'Name', ar: 'الاسم' },
  'common.price': { en: 'Price', ar: 'السعر' },
  'common.quantity': { en: 'Quantity', ar: 'الكمية' },
  'common.category': { en: 'Category', ar: 'التصنيف' },
  'common.status': { en: 'Status', ar: 'الحالة' },
  'common.arabic': { en: 'Arabic', ar: 'العربية' },
  'common.english': { en: 'English', ar: 'الإنجليزية' },
  'lang.switch': { en: 'Switch language', ar: 'تغيير اللغة' },
  'lang.other': { en: 'العربية', ar: 'English' },
  'currency.EGP': { en: 'EGP', ar: 'ج.م' },

  // errors
  'err.network': { en: 'Cannot reach the server. Check that the backend is running.', ar: 'تعذر الوصول إلى الخادم. تأكد من تشغيل الـ backend.' },
  'err.generic': { en: 'Something went wrong. Please try again.', ar: 'حدث خطأ ما. حاول مرة أخرى.' },
  'err.itemNotFound': { en: 'This item was not found.', ar: 'لم يتم العثور على هذا المنتج.' },
  'err.stock': { en: 'Not enough stock for {name}', ar: 'الكمية المتاحة من {name} غير كافية' },
  'err.invalidLogin': { en: 'Invalid username or password', ar: 'اسم المستخدم أو كلمة المرور غير صحيحة' },
  'err.categoryHasItems': { en: 'Category still has items', ar: 'التصنيف ما زال يحتوي على منتجات' },
  'err.categoryMissing': { en: 'Category does not exist', ar: 'التصنيف غير موجود' },
  'err.itemNotFoundAdmin': { en: 'Item not found', ar: 'المنتج غير موجود' },
  'err.orderNotFound': { en: 'Order not found', ar: 'الطلب غير موجود' },
  'err.payUnavailable': { en: 'Online payment is not available right now.', ar: 'الدفع أونلاين غير متاح حاليًا.' },
  'err.payStart': { en: 'Could not start the online payment. Please try again or pay on delivery.', ar: 'تعذر بدء الدفع أونلاين. حاول مرة أخرى أو اختر الدفع عند الاستلام.' },
  'err.categoryNotFound': { en: 'Category not found', ar: 'التصنيف غير موجود' },

  // public layout
  'nav.home': { en: 'Home', ar: 'الرئيسية' },
  'nav.favorites': { en: 'Favorites', ar: 'المفضلة' },
  'nav.cart': { en: 'Cart', ar: 'السلة' },
  'brand.store': { en: 'My Store', ar: 'متجري' },
  'footer.note': { en: 'Orders are confirmed and delivered by phone call.', ar: 'يتم تأكيد الطلبات وتوصيلها عن طريق مكالمة هاتفية.' },
  'footer.manager': { en: 'Manager login', ar: 'دخول المدير' },

  // home
  'home.title': { en: 'Find something you will love', ar: 'اكتشف ما سيعجبك' },
  'home.subtitle': { en: 'Browse our collection, save your favorites, and order in a minute. We call you to confirm delivery.', ar: 'تصفح مجموعتنا، واحفظ المفضلة لديك، واطلب في دقيقة. سنتصل بك لتأكيد التوصيل.' },
  'home.loading': { en: 'Loading items...', ar: 'جارٍ تحميل المنتجات...' },
  'home.empty': { en: 'No items found in this category yet.', ar: 'لا توجد منتجات في هذا التصنيف بعد.' },

  // item card / details
  'item.add': { en: 'Add to cart', ar: 'أضف إلى السلة' },
  'item.added': { en: 'Added ✓', ar: 'تمت الإضافة ✓' },
  'item.addedToCart': { en: 'Added to cart ✓', ar: 'تمت الإضافة إلى السلة ✓' },
  'item.favToggle': { en: 'Add or remove from favorites', ar: 'إضافة أو إزالة من المفضلة' },
  'item.back': { en: 'Back to shop', ar: 'العودة إلى المتجر' },
  'item.decrease': { en: 'Decrease quantity', ar: 'تقليل الكمية' },
  'item.increase': { en: 'Increase quantity', ar: 'زيادة الكمية' },

  // favorites
  'fav.title': { en: 'Your favorites', ar: 'مفضلتك' },
  'fav.empty': { en: 'You have no favorite items yet.', ar: 'لا توجد منتجات مفضلة بعد.' },
  'fav.browse': { en: 'Browse the shop', ar: 'تصفح المتجر' },

  // cart
  'cart.title': { en: 'Your cart', ar: 'سلة التسوق' },
  'cart.empty': { en: 'Your cart is empty.', ar: 'سلتك فارغة.' },
  'cart.start': { en: 'Start shopping', ar: 'ابدأ التسوق' },
  'cart.summary': { en: 'Summary', ar: 'الملخص' },
  'cart.payNote': { en: 'Payment and delivery are arranged by phone call after you place the order.', ar: 'يتم الاتفاق على الدفع والتوصيل عبر مكالمة هاتفية بعد إتمام الطلب.' },
  'cart.checkout': { en: 'Continue to checkout', ar: 'متابعة إلى إتمام الطلب' },
  'cart.keep': { en: 'Keep shopping', ar: 'متابعة التسوق' },
  'cart.removeItem': { en: 'Remove item', ar: 'إزالة المنتج' },

  // checkout
  'checkout.title': { en: 'Checkout', ar: 'إتمام الطلب' },
  'checkout.thanks': { en: 'Thank you, your order is placed', ar: 'شكرًا لك، تم تسجيل طلبك' },
  'checkout.orderNumber': { en: 'Order number', ar: 'رقم الطلب' },
  'checkout.callSoon': { en: 'We will call you soon to confirm payment and delivery.', ar: 'سنتصل بك قريبًا لتأكيد الدفع والتوصيل.' },
  'checkout.back': { en: 'Back to the shop', ar: 'العودة إلى المتجر' },
  'checkout.details': { en: 'Your details', ar: 'بياناتك' },
  'checkout.fullName': { en: 'Full name', ar: 'الاسم بالكامل' },
  'checkout.phone': { en: 'Phone number', ar: 'رقم الهاتف' },
  'checkout.email': { en: 'Email address', ar: 'البريد الإلكتروني' },
  'checkout.emailErr': { en: 'Enter a valid email address.', ar: 'أدخل بريدًا إلكترونيًا صحيحًا.' },
  'checkout.emailNote': { en: 'We will email your order confirmation here.', ar: 'سنرسل تأكيد الطلب إلى هذا البريد.' },
  'checkout.address': { en: 'Address', ar: 'العنوان' },
  'checkout.nameErr': { en: 'Please enter your name.', ar: 'من فضلك أدخل اسمك.' },
  'checkout.phoneErr': { en: 'Enter a valid phone number (digits, +, spaces or dashes).', ar: 'أدخل رقم هاتف صحيحًا (أرقام أو + أو مسافات أو شرطات).' },
  'checkout.addressErr': { en: 'Please enter your address.', ar: 'من فضلك أدخل عنوانك.' },
  'checkout.placing': { en: 'Placing order...', ar: 'جارٍ إرسال الطلب...' },
  'checkout.place': { en: 'Place order', ar: 'تأكيد الطلب' },
  'checkout.summary': { en: 'Order summary', ar: 'ملخص الطلب' },
  'checkout.editCart': { en: 'Edit cart', ar: 'تعديل السلة' },

  // payment
  'pay.method': { en: 'Payment method', ar: 'طريقة الدفع' },
  'pay.cod': { en: 'Cash on delivery', ar: 'الدفع عند الاستلام' },
  'pay.codHint': { en: 'Pay when your order arrives. We call you to confirm.', ar: 'ادفع عند وصول طلبك. سنتصل بك للتأكيد.' },
  'pay.stripe': { en: 'Pay online by card', ar: 'الدفع أونلاين بالبطاقة' },
  'pay.stripeHint': { en: 'Secure payment on the Stripe page.', ar: 'دفع آمن عبر صفحة Stripe.' },
  'pay.testMode': { en: 'Test mode: payment is simulated and no card is charged.', ar: 'وضع تجريبي: الدفع محاكاة ولن يتم خصم أي مبلغ.' },
  'pay.redirecting': { en: 'Redirecting to the secure payment page...', ar: 'جارٍ التحويل إلى صفحة الدفع الآمنة...' },
  'pay.verifying': { en: 'Confirming your payment...', ar: 'جارٍ تأكيد الدفع...' },
  'pay.paidOk': { en: 'Your payment was received. We will call you soon to confirm delivery.', ar: 'تم استلام دفعتك. سنتصل بك قريبًا لتأكيد التوصيل.' },
  'pay.pending': { en: 'Your payment is still being processed. Please check again in a moment.', ar: 'ما زالت عملية الدفع قيد المعالجة. تحقق مرة أخرى بعد قليل.' },
  'pay.checkAgain': { en: 'Check again', ar: 'تحقق مرة أخرى' },
  'pay.cancelledTitle': { en: 'Payment cancelled', ar: 'تم إلغاء الدفع' },
  'pay.cancelledText': { en: 'Nothing was charged and your cart is still saved.', ar: 'لم يتم خصم أي مبلغ وسلتك ما زالت محفوظة.' },
  'pay.failed': { en: 'The payment was not completed. Nothing was charged.', ar: 'لم تكتمل عملية الدفع. لم يتم خصم أي مبلغ.' },
  'pay.backToCart': { en: 'Back to cart', ar: 'العودة إلى السلة' },
  'pay.status.paid': { en: 'Paid', ar: 'مدفوع' },
  'pay.status.pending': { en: 'Pending', ar: 'قيد الانتظار' },
  'pay.status.failed': { en: 'Failed', ar: 'فشل' },
  'pay.online': { en: 'Online (Stripe)', ar: 'أونلاين (Stripe)' },
  'orders.payment': { en: 'Payment', ar: 'الدفع' },
  'order.paymentMethod': { en: 'Payment method', ar: 'طريقة الدفع' },
  'order.stripeSession': { en: 'Stripe session', ar: 'جلسة Stripe' },

  // admin layout
  'admin.brand': { en: 'Store admin', ar: 'إدارة المتجر' },
  'admin.dashboard': { en: 'Dashboard', ar: 'لوحة التحكم' },
  'admin.categories': { en: 'Categories', ar: 'التصنيفات' },
  'admin.items': { en: 'Items', ar: 'المنتجات' },
  'admin.orders': { en: 'Orders', ar: 'الطلبات' },
  'admin.viewShop': { en: 'View shop', ar: 'عرض المتجر' },
  'admin.logout': { en: 'Log out', ar: 'تسجيل الخروج' },

  // login
  'login.title': { en: 'Manager login', ar: 'دخول المدير' },
  'login.subtitle': { en: 'Sign in to manage your store.', ar: 'سجّل الدخول لإدارة متجرك.' },
  'login.username': { en: 'Username', ar: 'اسم المستخدم' },
  'login.password': { en: 'Password', ar: 'كلمة المرور' },
  'login.required': { en: 'Enter your username and password.', ar: 'أدخل اسم المستخدم وكلمة المرور.' },
  'login.signingIn': { en: 'Signing in...', ar: 'جارٍ تسجيل الدخول...' },
  'login.signIn': { en: 'Sign in', ar: 'تسجيل الدخول' },

  // dashboard
  'dash.opened': { en: 'Opened orders', ar: 'الطلبات المفتوحة' },
  'dash.items': { en: 'Items', ar: 'المنتجات' },
  'dash.categories': { en: 'Categories', ar: 'التصنيفات' },
  'dash.lowStockLabel': { en: 'Low stock (5 or less)', ar: 'مخزون منخفض (5 أو أقل)' },
  'dash.latest': { en: 'Latest opened orders', ar: 'أحدث الطلبات المفتوحة' },
  'dash.noOpened': { en: 'No opened orders.', ar: 'لا توجد طلبات مفتوحة.' },
  'dash.lowStock': { en: 'Low stock', ar: 'مخزون منخفض' },
  'dash.out': { en: 'Out of stock', ar: 'نفد من المخزون' },
  'dash.left': { en: '{n} left', ar: 'متبقي {n}' },
  'dash.wellStocked': { en: 'All items are well stocked.', ar: 'جميع المنتجات متوفرة بكميات جيدة.' },

  // admin categories
  'cat.title': { en: 'Categories', ar: 'التصنيفات' },
  'cat.nameAr': { en: 'Name in Arabic', ar: 'الاسم بالعربية' },
  'cat.nameEn': { en: 'Name in English', ar: 'الاسم بالإنجليزية' },
  'cat.add': { en: 'Add category', ar: 'إضافة تصنيف' },
  'cat.empty': { en: 'No categories yet. Add your first one above.', ar: 'لا توجد تصنيفات بعد. أضف أول تصنيف بالأعلى.' },
  'cat.required': { en: 'Category name is required in both Arabic and English.', ar: 'اسم التصنيف مطلوب بالعربية والإنجليزية.' },
  'cat.confirmDelete': { en: 'Delete the category "{name}"?', ar: 'هل تريد حذف التصنيف "{name}"؟' },

  // admin items
  'items.add': { en: 'Add item', ar: 'إضافة منتج' },
  'items.allCategories': { en: 'All categories', ar: 'كل التصنيفات' },
  'items.item': { en: 'Item', ar: 'المنتج' },
  'items.empty': { en: 'No items found.', ar: 'لا توجد منتجات.' },
  'items.confirmDelete': { en: 'Delete the item "{name}"?', ar: 'هل تريد حذف المنتج "{name}"؟' },

  // item form
  'form.editItem': { en: 'Edit item', ar: 'تعديل المنتج' },
  'form.addItem': { en: 'Add item', ar: 'إضافة منتج' },
  'form.back': { en: 'Back to items', ar: 'العودة إلى المنتجات' },
  'form.needCategory': { en: 'You need at least one category first.', ar: 'تحتاج إلى تصنيف واحد على الأقل أولًا.' },
  'form.createCategory': { en: 'Create a category', ar: 'إنشاء تصنيف' },
  'form.nameAr': { en: 'Name (Arabic)', ar: 'الاسم (بالعربية)' },
  'form.nameEn': { en: 'Name (English)', ar: 'الاسم (بالإنجليزية)' },
  'form.descAr': { en: 'Description (Arabic)', ar: 'الوصف (بالعربية)' },
  'form.descEn': { en: 'Description (English)', ar: 'الوصف (بالإنجليزية)' },
  'form.nameErr': { en: 'Name is required.', ar: 'الاسم مطلوب.' },
  'form.descErr': { en: 'Description is required.', ar: 'الوصف مطلوب.' },
  'form.priceErr': { en: 'Enter a price of 0 or more.', ar: 'أدخل سعرًا يساوي 0 أو أكثر.' },
  'form.stock': { en: 'Quantity in stock', ar: 'الكمية في المخزون' },
  'form.stockErr': { en: 'Enter a whole number of 0 or more.', ar: 'أدخل عددًا صحيحًا يساوي 0 أو أكثر.' },
  'form.chooseCategory': { en: 'Choose a category', ar: 'اختر تصنيفًا' },
  'form.categoryErr': { en: 'Choose a category.', ar: 'اختر تصنيفًا.' },
  'form.image': { en: 'Image (jpg, png or webp, up to 2 MB)', ar: 'الصورة (jpg أو png أو webp، حتى 2 ميجابايت)' },
  'form.preview': { en: 'Item image preview', ar: 'معاينة صورة المنتج' },
  'form.saving': { en: 'Saving...', ar: 'جارٍ الحفظ...' },
  'form.save': { en: 'Save item', ar: 'حفظ المنتج' },
  'form.notFound': { en: 'Item not found.', ar: 'المنتج غير موجود.' },
  'form.badType': { en: 'Only jpg, png or webp images are allowed.', ar: 'يُسمح فقط بصور jpg أو png أو webp.' },
  'form.tooBig': { en: 'The image must be 2 MB or smaller.', ar: 'يجب ألا يزيد حجم الصورة عن 2 ميجابايت.' },

  // admin orders
  'orders.title': { en: 'Orders', ar: 'الطلبات' },
  'orders.date': { en: 'Date', ar: 'التاريخ' },
  'orders.customer': { en: 'Customer', ar: 'العميل' },
  'orders.phone': { en: 'Phone', ar: 'الهاتف' },
  'orders.details': { en: 'Details', ar: 'التفاصيل' },
  'orders.empty': { en: 'No orders found.', ar: 'لا توجد طلبات.' },
  'status.opened': { en: 'Opened', ar: 'مفتوح' },
  'status.closed': { en: 'Closed', ar: 'مغلق' },

  // order details
  'order.title': { en: 'Order details', ar: 'تفاصيل الطلب' },
  'order.back': { en: 'Back to orders', ar: 'العودة إلى الطلبات' },
  'order.customer': { en: 'Customer', ar: 'العميل' },
  'order.email': { en: 'Email', ar: 'البريد الإلكتروني' },
  'order.address': { en: 'Address', ar: 'العنوان' },
  'order.placedOn': { en: 'Placed on', ar: 'تاريخ الطلب' },
  'order.markClosed': { en: 'Mark as closed', ar: 'تحديد كمغلق' },
  'order.reopen': { en: 'Reopen order', ar: 'إعادة فتح الطلب' },
  'order.subtotal': { en: 'Subtotal', ar: 'المجموع الفرعي' },
  'order.notes': { en: 'Notes', ar: 'الملاحظات' },
  'order.notePlaceholder': { en: 'Write a note, for example: called the customer, delivery tomorrow at 5 pm', ar: 'اكتب ملاحظة، مثلًا: تم الاتصال بالعميل، التوصيل غدًا الساعة 5 مساءً' },
  'order.adding': { en: 'Adding...', ar: 'جارٍ الإضافة...' },
  'order.addNote': { en: 'Add note', ar: 'إضافة ملاحظة' },
  'order.noNotes': { en: 'No notes yet.', ar: 'لا توجد ملاحظات بعد.' },
  'order.closed': { en: 'Order closed.', ar: 'تم إغلاق الطلب.' },
  'order.reopened': { en: 'Order reopened.', ar: 'تمت إعادة فتح الطلب.' },
  'order.noteAdded': { en: 'Note added.', ar: 'تمت إضافة الملاحظة.' },
  'order.noteFirst': { en: 'Write a note first.', ar: 'اكتب ملاحظة أولًا.' },
} satisfies Dictionary;

export type TranslationKey = keyof typeof TRANSLATIONS;
