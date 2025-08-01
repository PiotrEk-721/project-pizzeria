import { settings, select, classNames } from "./settings.js";
import Home from "./components/Home.js";
import Product from "./components/Product.js";
import Cart from "./components/Cart.js";
import Booking from "./components/Booking.js";

const app = {
  initPages: function () {
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.hash.replace("#/", "");

    let pageMatchingHash = thisApp.pages[0].id;

    for (let page of thisApp.pages) {
      if (page.id == idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePage(pageMatchingHash);

    for (let link of thisApp.navLinks) {
      link.addEventListener("click", function (event) {
        const clickedElement = this;
        event.preventDefault();

        /* get page id from href attribute */
        const id = clickedElement.getAttribute("href").replace("#", "");

        /* run thisApp.activatedPage with that id */
        thisApp.activatePage(id);

        /* change URL hash */
        window.location.hash = "#/" + id;
      });
    }
  },
  activatePage: function (pageId) {
    const thisApp = this;

    /* add class "active" to matching pages, remove from non-matching */
    for (let page of thisApp.pages) {
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }

    /* add class "active" to matching links, remove from non-matching */
    for (let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute("href") == "#" + pageId
      );
    }
  },
  initMenu: function () {
    const thisApp = this;
    // console.log('thisApp.data: ', thisApp.data);
    for (let productData in thisApp.data.products) {
      // new Product(productData, thisApp.data.products[productData]);
      new Product(
        thisApp.data.products[productData].id,
        thisApp.data.products[productData]
      );
    }
  },
  initData: function () {
    const thisApp = this;
    const url = settings.db.url + "/" + settings.db.products;

    fetch(url)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parsedResponse) {
        // console.log("parsedResponse: ", parsedResponse);

        /* save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;

        /* execute initMenu method */
        thisApp.initMenu();
      });

    thisApp.data = {};
    // thisApp.data = dataSource;
    // console.log('thisApp.data: ', thisApp.data);
  },
  initHome: function () {
    const thisApp = this;

    // const homePageContainer = document.querySelector(select.containerOf.home);
    for (let homeData in thisApp.data.homePageAssets) {
      console.log('thisApp.data.homePageAssets[homeData].id,', thisApp.data.homePageAssets[homeData].id);
      console.log('thisApp.data.homePageAssets[homeData]', thisApp.data.homePageAssets[homeData]);
      new Home(
        thisApp.data.homePageAssets[homeData].id,
        thisApp.data.homePageAssets[homeData]
      );
    }
  },
  initCart: function () {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener("add-to-cart", function (event) {
      app.cart.add(event.detail.product);
    });
  },
  initBooking: function () {
    const thisApp = this;

    const bookingWidgetContainer = document.querySelector(
      select.containerOf.booking
    );
    thisApp.booking = new Booking(bookingWidgetContainer);
  },
  init: function () {
    const thisApp = this;
    // console.log("*** App starting ***");
    // console.log("thisApp:", thisApp);
    // console.log("classNames:", classNames);
    // console.log("settings:", settings);
    // console.log("templates:", templates);

    thisApp.initPages();
    thisApp.initData();
    thisApp.initHome();
    thisApp.initCart();
    thisApp.initBooking();
  },
};

app.init();
