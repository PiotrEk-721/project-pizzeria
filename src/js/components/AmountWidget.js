import { select, settings } from "../settings.js";

class AmountWidget {
  constructor(element) {
    const thisWidget = this;

    // console.log("AmountWidget:v", thisWidget);
    // console.log("constructor argument: ", element);

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

    const event = new CustomEvent("updated", {
      bubbles: true,
    });
    thisWidget.element.dispatchEvent(event);
  }
}

export default AmountWidget;