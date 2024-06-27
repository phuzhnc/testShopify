import {register} from "@shopify/web-pixels-extension";

register(({analytics, browser, init, settings}) => {
  // Bootstrap and insert pixel script tag here
  function initAmazonAdPixel() {
    console.log('INIT AMAZON ADS PIXEL')
    // Amazon Ads Pixel
    !function (w, d, s, t, a) {
      if (w.amzn) return;
      w.amzn = a = function () {
        w.amzn.q.push([arguments, (new Date).getTime()])
      };
      a.q = [];
      a.version = "0.0";
      s = d.createElement("script");
      s.src = "https://c.amazon-adsystem.com/aat/amzn.js";
      s.id = "amzn-pixel";
      s.async = true;
      t = d.getElementsByTagName("script")[0];
      t.parentNode.insertBefore(s, t)
    }(window, document);

    amzn("setRegion", "NA");
    amzn("addTag", "68579884-2cab-4909-ac0f-4f575a66d2ce");

    const noScript = document.createElement('noscript');
    const imageEl = document.createElement('img');
    imageEl.src = "https://s.amazon-adsystem.com/iu3?pid=68579884-2cab-4909-ac0f-4f575a66d2ce&event=PageView";
    imageEl.width = 1;
    imageEl.heigth = 1;
    imageEl.border = 1;


    noScript.appendChild(imageEl);
    document.head.appendChild(noScript);

    // Amazon Ads Pixel - end

    function shouldPushPurchase(orderId) {
      const pushedOrderId = browser.sessionStorage.getItem('amzn-pushed-order');
      browser.sessionStorage.setItem('amzn-pushed-order', orderId);
      return !pushedOrderId || pushedOrdeId !== orderId;
    }

    function pushPurchase(checkout) {
      let discountsCodes = [], discountsTotal = 0.0;

      for (const {title, value} in checkout.discountApplications) {
        discountsCodes.push(title);
        discountsTotal += parseFloat(value.percentage / 100);
      }


      amzn('trackEvent', 'order_completed', {
        transaction_id: checkout.order.id,
        shipping_price: checkout.shippingLine.price.amount,
        taxes: checkout.totalTax.amount,
        subtotal_price: checkout.subtotalPrice.amount,
        total_price: checkout.totalPrice.amount,
        coupon_code: discountsCodes.join(','),
        discount: discountsTotal
      });
    }

    function pushProducts(checkout) {
      for (const item in checkout.lineItems) {
        amzn('trackEvent', 'purchase_line_item', {
          transaction_id: checkout.order.id,
          product_quantity: item.quantity,
          product_sku: item.variant.sku,
          product_name: item.variant.product.title,
          product_category: item.variant.product.type,
          product_color: item.variant.title,
          price: item.price.amount,
        });
      }
    }

    analytics.subscribe('checkout_completed', event => {
      // Example for accessing event data
      const checkout = event.data.checkout;
      browser.localStorage
      if (shouldPushPurchase(checkout.order.id)) {
        pushPurchase(checkout);
        pushProducts(checkout);
      }
    });

    analytics.subscribe('page_viewed', event => {
      amzn("trackEvent", `PageView - ${window.document.title}`, {
        path: window.location.pathname
      });
    });
  }

  browser.cookie.get('privacy-cookie').then(cookie => {
    const {advertising_amazonDisplay = false} = JSON.parse(decodeURIComponent(cookie));
    if (advertising_amazonDisplay) {
      initAmazonAdPixel();
    }
  });
});

