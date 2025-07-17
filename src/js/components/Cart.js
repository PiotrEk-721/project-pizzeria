import { select, classNames, settings, templates } from "../settings.js";
import { utils } from "../utils.js";
import CartProduct from "./CartProduct.js";

class Cart {
  constructor(element) {
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initAction();
    // console.log("new Cart: ", thisCart);
  }
  getElements(element) {
    const thisCart = this;

    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(
      select.cart.toggleTrigger
    );
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(
      select.cart.productList
    );
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(
      select.cart.deliveryFee
    );
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(
      select.cart.subtotalPrice
    );
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(
      select.cart.totalPrice
    );
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(
      select.cart.totalNumber
    );
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(
      select.cart.address
    );
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
  }
  initAction() {
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener("click", function (event) {
      event.preventDefault();

      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener("updated", function () {
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener("remove", function (event) {
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener("submit", function (event) {
      event.preventDefault();
      thisCart.sendOrder();
    });
  }
  add(menuProduct) {
    const thisCart = this;

    const generatedHTML = templates.cartProduct(menuProduct);
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    // console.log('createDOMFromHTML_createDOMFromHTML', generatedDOM);
    thisCart.dom.productList.appendChild(generatedDOM);
    // console.log('thisCart.dom.productList.appendChild(generatedDOM);', thisCart.dom.productList.appendChild(generatedDOM));
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    console.log("thisCart.products: ", thisCart.products);
    thisCart.update();
  }
  update() {
    const thisCart = this;
    const deliveryFee = settings.cart.defaultDeliveryFee;
    let totalNumber = 0;
    let subtotalPrice = 0;

    for (let product of thisCart.products) {
      totalNumber += product.amount;
      subtotalPrice += product.price;
    }

    thisCart.totalNumber = totalNumber;
    thisCart.subtotalPrice = subtotalPrice;

    if (totalNumber > 0) {
      thisCart.totalPrice = subtotalPrice + deliveryFee;
      thisCart.deliveryFee = deliveryFee;
    } else {
      thisCart.totalPrice = 0;
      thisCart.deliveryFee = 0;
    }

    console.log("thisCart.deliveryFee:  ", thisCart.deliveryFee);
    console.log("thisCart.subtotalPrice:  ", thisCart.subtotalPrice);
    console.log("thisCart.totalPrice:  ", thisCart.totalPrice);
    console.log("thisCart.totalNumber:  ", thisCart.totalNumber);

    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    thisCart.dom.totalPrice.forEach(
      (priceElem) => (priceElem.innerHTML = thisCart.totalPrice)
    );
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
  }
  remove(cartProduct) {
    const thisCart = this;
    const index = thisCart.products.indexOf(cartProduct);

    if (index > -1) {
      thisCart.products.splice(index, 1);
    }
    cartProduct.dom.wrapper.remove();
    thisCart.update();
  }
  sendOrder() {
    const thisCart = this;
    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: thisCart.products.map((p) => p.getData()),
    };
    const url = settings.db.url + "/" + settings.db.orders;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    };

    for (let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }
    console.log("payload object", payload);

    fetch(url, options)
      .then(function (response) {
        return response.json;
      })
      .then(function (parsedResponse) {
        console.log("parsedResponse: ", parsedResponse);
      });
  }
}

export default Cart;
