const nodemailer = require('nodemailer');
const { toLocalized } = require('./i18n');

// Local testing with Mailpit (built into Laragon): SMTP on 1025, inbox at http://localhost:8025
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || '127.0.0.1',
    port: Number(process.env.SMTP_PORT) || 1025,
    secure: false,
});

const FROM = process.env.MAIL_FROM || '"My Store" <no-reply@mystore.local>';
const PUBLIC_URL = (process.env.PUBLIC_URL || 'http://localhost:3000').replace(/\/$/, '');
const DELIVERY_HOURS = Number(process.env.DELIVERY_HOURS) || 24;
const CURRENCY = { ar: 'ج.م', en: 'EGP' };

const TEXT = {
    ar: {
        dir: 'rtl',
        align: 'right',
        opposite: 'left',
        subject: (id) => 'تأكيد طلبك رقم #' + id,
        brand: 'متجري',
        thanks: 'شكرًا لطلبك!',
        hello: 'مرحبًا',
        dear: 'عميلنا العزيز',
        intro: 'يسعدنا إبلاغك بأننا استلمنا طلبك وسنتصل بك قريبًا لتأكيد الدفع والتوصيل.',
        introPaid: 'استلمنا دفعتك بنجاح وطلبك قيد التجهيز. سنتصل بك قريبًا لتأكيد التوصيل.',
        payment: 'طريقة الدفع',
        paidOnline: 'تم الدفع أونلاين ✓',
        cod: 'الدفع عند الاستلام',
        orderNumber: 'رقم الطلب',
        delivery: 'وقت التوصيل المتوقع',
        deliveryValue: (h) => 'خلال ' + h + ' ساعة',
        address: 'العنوان',
        details: 'تفاصيل الطلب',
        image: 'الصورة',
        product: 'المنتج',
        qty: 'الكمية',
        price: 'السعر',
        total: 'الإجمالي الكلي',
        footer: 'إذا كان لديك أي استفسار لا تتردد في التواصل معنا.',
    },
    en: {
        dir: 'ltr',
        align: 'left',
        opposite: 'right',
        subject: (id) => 'Your order confirmation #' + id,
        brand: 'My Store',
        thanks: 'Thank you for your order!',
        hello: 'Hello',
        dear: 'valued customer',
        intro: 'We received your order and will call you soon to confirm payment and delivery.',
        introPaid: 'We received your payment and your order is being prepared. We will call you soon to confirm delivery.',
        payment: 'Payment',
        paidOnline: 'Paid online ✓',
        cod: 'Cash on delivery',
        orderNumber: 'Order number',
        delivery: 'Expected delivery',
        deliveryValue: (h) => 'within ' + h + ' hours',
        address: 'Address',
        details: 'Order details',
        image: 'Image',
        product: 'Product',
        qty: 'Qty',
        price: 'Price',
        total: 'Total',
        footer: 'If you have any questions, feel free to contact us.',
    },
};

// Customer-typed values go into HTML, so they must be escaped.
function esc(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function money(amount, lang) {
    return Number(amount || 0).toFixed(2) + ' ' + CURRENCY[lang];
}

function buildHtml(order, lang) {
    const t = TEXT[lang];
    const orderId = String(order._id);

    const rows = order.items
        .map((line) => {
            const name = toLocalized(line.name)[lang];
            const image = line.image ? PUBLIC_URL + '/' + String(line.image).replace(/^\//, '') : '';
            return `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 10px; text-align: center;">
            ${image ? `<img src="${esc(image)}" alt="${esc(name)}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;" />` : ''}
          </td>
          <td style="padding: 10px; font-weight: bold; color: #333;">${esc(name)}</td>
          <td style="padding: 10px; text-align: center; color: #666;">x${esc(line.quantity)}</td>
          <td style="padding: 10px; text-align: ${t.opposite}; font-weight: bold; color: #0b8a6c;">${money(line.price * line.quantity, lang)}</td>
        </tr>`;
        })
        .join('');

    return `
    <div style="font-family: Arial, sans-serif; direction: ${t.dir}; text-align: ${t.align}; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #0f172a; padding: 20px; text-align: center;">
        <h1 style="color: #34d3a8; margin: 0; font-size: 24px;">${esc(t.brand)}</h1>
        <p style="color: #94a3b8; margin-top: 5px; font-size: 14px;">${t.thanks}</p>
      </div>
      <div style="padding: 20px;">
        <p style="font-size: 16px; color: #1e293b;">${t.hello} <b>${esc(order.customer.name) || t.dear}</b>,</p>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">${order.paymentStatus === 'paid' ? t.introPaid : t.intro}</p>
        <div style="background-color: #f8fafc; border-radius: 12px; padding: 15px; margin: 20px 0;">
          <p style="margin: 5px 0; color: #334155;"><b>${t.orderNumber}:</b> <span style="color: #0b8a6c;">#${esc(orderId)}</span></p>
          <p style="margin: 5px 0; color: #334155;"><b>${t.delivery}:</b> <span style="color: #10b981; font-weight: bold;">${t.deliveryValue(DELIVERY_HOURS)}</span></p>
          <p style="margin: 5px 0; color: #334155;"><b>${t.payment}:</b> ${order.paymentStatus === 'paid' ? t.paidOnline : t.cod}</p>
          <p style="margin: 5px 0; color: #334155;"><b>${t.address}:</b> ${esc(order.customer.address)}</p>
        </div>
        <h3 style="color: #0f172a; border-bottom: 2px solid #0b8a6c; padding-bottom: 8px;">${t.details}:</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background-color: #f1f5f9; color: #475569; font-size: 12px;">
              <th style="padding: 8px;">${t.image}</th>
              <th style="padding: 8px; text-align: ${t.align};">${t.product}</th>
              <th style="padding: 8px; text-align: center;">${t.qty}</th>
              <th style="padding: 8px; text-align: ${t.opposite};">${t.price}</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #f1f5f9;">
          <h2 style="color: #0f172a; margin: 0;">${t.total}: <span style="color: #0b8a6c;">${money(order.total, lang)}</span></h2>
        </div>
      </div>
      <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        ${t.footer}
      </div>
    </div>`;
}

// Never throws: a mail problem must not break a placed order.
async function sendOrderConfirmationEmail(customerEmail, order, lang) {
    try {
        const language = lang === 'en' ? 'en' : 'ar';
        await transporter.sendMail({
            from: FROM,
            to: customerEmail,
            subject: TEXT[language].subject(order._id),
            html: buildHtml(order, language),
        });
        console.log('Order confirmation email sent to ' + customerEmail);
    } catch (error) {
        console.error('Error sending order email:', error.message);
    }
}

module.exports = { sendOrderConfirmationEmail, buildHtml };
