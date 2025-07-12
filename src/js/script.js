/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  ("use strict");

  const select = {
    templateOf: {
      menuProduct: "#template-menu-product",
      cartProduct: "#template-cart-product",
    },
    containerOf: {
      menu: "#product-list",
      cart: "#cart",
    },
    all: {
      menuProducts: "#product-list > .product",
      menuProductsActive: "#product-list > .product.active",
      formInputs: "input, select",
    },
    menuProduct: {
      clickable: ".product__header",
      form: ".product__order",
      priceElem: ".product__total-price .price",
      imageWrapper: ".product__images",
      amountWidget: ".widget-amount",
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: "input.amount",
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },

    cart: {
      productList: ".cart__order-summary",
      toggleTrigger: ".cart__summary",
      totalNumber: `.cart__total-number`,
      totalPrice:
        ".cart__total-price strong, .cart__order-total .cart__order-price-sum strong",
      subtotalPrice: ".cart__order-subtotal .cart__order-price-sum strong",
      deliveryFee: ".cart__order-delivery .cart__order-price-sum strong",
      form: ".cart__order",
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: ".widget-amount",
      price: ".cart__product-price",
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: "active",
      imageVisible: "active",
    },
    cart: {
      wrapperActive: "active",
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(
      document.querySelector(select.templateOf.menuProduct).innerHTML
    ),
    cartProduct: Handlebars.compile(
      document.querySelector(select.templateOf.cartProduct).innerHTML
    ),
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      thisProduct.prepareCartProduct();
    }
    renderInMenu() {
      const thisProduct = this;
      const generatedHTML = templates.menuProduct(thisProduct.data);
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      const menuContainer = document.querySelector(select.containerOf.menu);
      menuContainer.appendChild(thisProduct.element);
    }
    getElements() {
      const thisProduct = this;

      thisProduct.dom = {};
      thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(
        select.menuProduct.clickable
      );
      thisProduct.dom.form = thisProduct.element.querySelector(
        select.menuProduct.form
      );
      thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(
        select.all.formInputs
      );
      thisProduct.dom.cartButton = thisProduct.element.querySelector(
        select.menuProduct.cartButton
      );
      thisProduct.dom.priceElem = thisProduct.element.querySelector(
        select.menuProduct.priceElem
      );
      thisProduct.dom.imageWrapper = thisProduct.element.querySelector(
        select.menuProduct.imageWrapper
      );
      thisProduct.dom.amountWidgetElem = thisProduct.element.querySelector(
        select.menuProduct.amountWidget
      );
    }
    initAccordion() {
      const thisProduct = this;
      const clickableTrigger = thisProduct.element.querySelector(
        select.menuProduct.clickable
      );

      clickableTrigger.addEventListener("click", function (event) {
        event.preventDefault();
        const activeProduct = document.querySelector(
          select.all.menuProductsActive
        );
        if (activeProduct && activeProduct !== thisProduct.element) {
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }
        thisProduct.element.classList.toggle(
          classNames.menuProduct.wrapperActive
        );
      });
    }
    initOrderForm() {
      const thisProduct = this;
      thisProduct.dom.form.addEventListener("submit", function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.dom.formInputs) {
        input.addEventListener("change", function () {
          thisProduct.processOrder();
        });
      }

      thisProduct.dom.cartButton.addEventListener("click", function (event) {
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }
    processOrder() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.dom.form);

      let price = thisProduct.data.price;

      for (let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];

        for (let optionId in param.options) {
          const option = param.options[optionId];

          //formData[paramId]?.incudes(optionId)
          const optionSelected =
            formData[paramId] && formData[paramId].includes(optionId);
          if (optionSelected) {
            if (!option.default) {
              price += option.price;
            }
          } else {
            if (option.default) {
              price -= option.price;
            }
          }
          const optionImage = thisProduct.dom.imageWrapper.querySelector(
            `.${paramId}-${optionId}`
          );
          if (optionImage) {
            if (optionSelected) {
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            } else {
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }

      const amount = thisProduct.amountWidget.value;
      const totalPrice = price * amount;

      thisProduct.dom.priceElem.innerHTML = totalPrice;
      thisProduct.priceSingle = price;
    }
    initAmountWidget() {
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(
        thisProduct.dom.amountWidgetElem
      );
      thisProduct.dom.amountWidgetElem.addEventListener("updated", function () {
        thisProduct.processOrder();
      });
    }
    addToCart() {
      const thisProduct = this;
      const productSummary = thisProduct.prepareCartProduct();

      // app.cart.add(thisProduct);
      app.cart.add(productSummary);
    }
    prepareCartProduct() {
      const thisProduct = this;
      const amount = thisProduct.amountWidget.value;
      const priceSingle = thisProduct.priceSingle;
      const price = amount * priceSingle;

      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: amount,
        priceSingle: priceSingle,
        price: price,
        params: thisProduct.prepareCartProductParams(),
      };

      return productSummary;
    }
    prepareCartProductParams() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.dom.form);

      const params = {};
      
      for (let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];

        params[paramId] = {
          label: param.label,
          options: {},
        }
        for (let optionId in param.options) {
          const option = param.options[optionId];
          const optionSelected =
            formData[paramId] && formData[paramId].includes(optionId);
          if (optionSelected) {
            params[paramId].options = option.label;
          }
        }
      }
      console.log('prepareCartProductParams → ', params);
      return params;
    }
  }

  class AmountWidget {
    constructor(element) {
      const thisWidget = this;

      console.log("AmountWidget:v", thisWidget);
      console.log("constructor argument: ", element);

      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();
    }
    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(
        select.widgets.amount.input
      );
      thisWidget.linkDecrease = thisWidget.element.querySelector(
        select.widgets.amount.linkDecrease
      );
      thisWidget.linkIncrease = thisWidget.element.querySelector(
        select.widgets.amount.linkIncrease
      );
    }
    setValue(value) {
      const thisWidget = this;
      const newValue = parseInt(value);

      if (isNaN(newValue)) {
        thisWidget.value = settings.amountWidget.defaultValue;
      } else {
        if (thisWidget.value !== newValue) {
          if (newValue >= settings.amountWidget.defaultMin) {
            if (newValue <= settings.amountWidget.defaultMax) {
              thisWidget.value = newValue;
            } else {
              thisWidget.value = settings.amountWidget.defaultMax;
            }
          } else {
            thisWidget.value = settings.amountWidget.defaultMin;
          }
        }
      }

      thisWidget.input.value = thisWidget.value;
    }
    initActions() {
      const thisWidget = this;
      const inputTrigger = thisWidget.element.querySelector(
        select.widgets.amount.input
      );
      const linkDecreaseTrigger = thisWidget.element.querySelector(
        select.widgets.amount.linkDecrease
      );
      const linkIncreaseTrigger = thisWidget.element.querySelector(
        select.widgets.amount.linkIncrease
      );
      inputTrigger.addEventListener("change", function () {
        thisWidget.setValue(thisWidget.input.value);
        thisWidget.announce();
      });
      linkDecreaseTrigger.addEventListener("click", function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
        thisWidget.announce();
      });
      linkIncreaseTrigger.addEventListener("click", function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
        thisWidget.announce();
      });
    }
    announce() {
      const thisWidget = this;

      const event = new Event("updated");
      thisWidget.element.dispatchEvent(event);
    }
  }

  class Cart {
    constructor(element) {
      const thisCart = this;

      thisCart.product = [];

      thisCart.getElements(element);
      thisCart.initAction();
      console.log("new Cart: ", thisCart);
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
    }
    initAction() {
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener("click", function (event) {
        event.preventDefault();

        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
    }
    add(menuProduct) {
      const thisCart = this;

      const generatedHTML = templates.cartProduct(menuProduct);
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      // console.log('createDOMFromHTML_createDOMFromHTML', generatedDOM);
      thisCart.dom.productList.appendChild(generatedDOM);
      // console.log('thisCart.dom.productList.appendChild(generatedDOM);', thisCart.dom.productList.appendChild(generatedDOM));
    }
  }

  const app = {
    initMenu: function () {
      const thisApp = this;
      // console.log('thisApp.data: ', thisApp.data);
      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },
    initData: function () {
      const thisApp = this;

      thisApp.data = dataSource;
      // console.log('thisApp.data: ', thisApp.data);
    },
    initCart: function () {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },
    init: function () {
      const thisApp = this;
      console.log("*** App starting ***");
      console.log("thisApp:", thisApp);
      console.log("classNames:", classNames);
      console.log("settings:", settings);
      console.log("templates:", templates);

      thisApp.initData();
      thisApp.initCart();
      thisApp.initMenu();
    },
  };

  app.init();
}
