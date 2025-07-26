import { templates, select, settings, classNames } from "../settings.js";
import utils from "../utils.js";
import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";

class Booking {
  constructor(wrapper) {
    const thisBooking = this;

    thisBooking.chosingTable = null;

    thisBooking.render(wrapper);
    thisBooking.initWidgets();
    thisBooking.getData();
  }
  getData() {
    const thisBooking = this;

    const startDateParam =
      settings.db.dateStartParamKey +
      "=" +
      utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam =
      settings.db.dateEndParamKey +
      "=" +
      utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [startDateParam, endDateParam],
      eventsCurrent: [settings.db.notRepeatParam, startDateParam, endDateParam],
      eventRepeat: [settings.db.repeatParam, endDateParam],
    };

    // console.log("getData params", params);

    const urls = {
      booking:
        settings.db.url +
        "/" +
        settings.db.bookings +
        "?" +
        params.booking.join("&"),
      eventsCurrent:
        settings.db.url +
        "/" +
        settings.db.events +
        "?" +
        params.eventsCurrent.join("&"),
      eventRepeat:
        settings.db.url +
        "/" +
        settings.db.events +
        "?" +
        params.eventRepeat.join("&"),
    };

    // console.log("getData urls", urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventRepeat),
    ])
      .then(function (allResponses) {
        const bookingResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventRepeatResponse = allResponses[2];
        return Promise.all([
          bookingResponse.json(),
          eventsCurrentResponse.json(),
          eventRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventRepeat]) {
        // console.log(bookings);
        // console.log(eventsCurrent);
        // console.log(eventRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventRepeat);
      });
  }
  parseData(bookings, eventsCurrent, eventRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventRepeat) {
      if (item.repeat == "daily") {
        for (
          let loopDate = minDate;
          loopDate <= maxDate;
          loopDate = utils.addDays(loopDate, 1)
        ) {
          thisBooking.makeBooked(
            utils.dateToStr(loopDate),
            item.hour,
            item.duration,
            item.table
          );
        }
      }
    }
    console.log("thisBooking.booked", thisBooking.booked);

    thisBooking.updateDOM();
  }
  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == "undefined") {
      thisBooking.booked[date] = {};
    }

    const startHour =
      typeof hour === "number" ? hour : utils.hourToNumber(hour);

    for (
      let hourBlock = startHour;
      hourBlock < startHour + duration;
      hourBlock += 0.5
    ) {
      // console.log('loop', hourBlock);

      if (typeof thisBooking.booked[date][hourBlock] == "undefined") {
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
  }
  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] == "undefined" ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] ==
        "undefined"
    ) {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (
        !allAvailable &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }
  render(element) {
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(
      select.booking.form
    );
    thisBooking.dom.form.phoneInput = thisBooking.dom.form.querySelector(
      select.booking.formInputs.phoneInput
    );
    thisBooking.dom.form.addressInput = thisBooking.dom.form.querySelector(
      select.booking.formInputs.addressInput
    );
    thisBooking.dom.form.startersCheckboxes =
      thisBooking.dom.form.querySelectorAll(
        select.booking.formInputs.startersCheckboxes
      );
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.peopleAmount
    );
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.hoursAmount
    );
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.datePicker.wrapper
    );
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.hourPicker.wrapper
    );
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(
      select.booking.tables
    );
    thisBooking.dom.tablesWrapper = thisBooking.dom.wrapper.querySelector(
      select.booking.tablesWrapper
    );
    thisBooking.dom.popUp = thisBooking.dom.wrapper.querySelector(
      select.booking.popUp
    );
  }
  resetTableSelection() {
    const thisBooking = this;

    for (let table of thisBooking.dom.tables) {
      table.classList.remove(classNames.booking.tableSelected);
    }

    thisBooking.selectedTable = null;
  }
  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmountWidget = new AmountWidget(
      thisBooking.dom.peopleAmount
    );
    thisBooking.hoursAmountWidget = new AmountWidget(
      thisBooking.dom.hoursAmount
    );

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.peopleAmount.addEventListener("updated", function () {
      thisBooking.updateDOM();
      thisBooking.resetTableSelection();
    });
    thisBooking.dom.hoursAmount.addEventListener("updated", function () {
      thisBooking.updateDOM();
      thisBooking.resetTableSelection();
    });
    thisBooking.dom.datePicker.addEventListener("updated", function () {
      thisBooking.updateDOM();
      thisBooking.resetTableSelection();
    });
    thisBooking.dom.hourPicker.addEventListener("updated", function () {
      thisBooking.updateDOM();
      thisBooking.resetTableSelection();
    });
    thisBooking.dom.wrapper.addEventListener("updated", function () {
      thisBooking.updateDOM();
    });
    thisBooking.dom.tablesWrapper.addEventListener("click", function (event) {
      const clickedTable = event.target.closest(select.booking.table);

      if (
        !clickedTable ||
        !thisBooking.dom.tablesWrapper.contains(clickedTable)
      ) {
        return;
      }

      if (clickedTable.classList.contains(classNames.booking.tableBooked)) {
        if (thisBooking.dom.popUp) {
          thisBooking.dom.popUp.classList.remove(
            classNames.booking.popUpHidden
          );

          setTimeout(() => {
            thisBooking.dom.popUp.classList.add(classNames.booking.popUpHidden);
          }, 1000);
        }

        return;
      }

      if (clickedTable.classList.contains(classNames.booking.tableSelected)) {
        clickedTable.classList.remove(classNames.booking.tableSelected);
        thisBooking.selectedTable = null;
        return;
      }

      thisBooking.selectedTable = clickedTable.getAttribute(
        settings.booking.tableIdAttribute
      );

      for (let table of thisBooking.dom.tables) {
        table.classList.remove(classNames.booking.tableSelected);
      }

      clickedTable.classList.add(classNames.booking.tableSelected);
    });
    thisBooking.dom.form.addEventListener("submit", function (event) {
      event.preventDefault();
      thisBooking.sendBooking();
    });
  }
  sendBooking() {
    const thisBooking = this;
    const selectStarters = [];

    for (let input of thisBooking.dom.form.startersCheckboxes) {
      if (input.checked) {
        selectStarters.push(input.value);
      }
    }

    const payload = {
      date: thisBooking.date,
      hour: thisBooking.hour,
      table: thisBooking.selectedTable
        ? parseInt(thisBooking.selectedTable)
        : null,
      duration: thisBooking.hoursAmountWidget.value,
      ppl: thisBooking.peopleAmountWidget.value,
      starters: selectStarters,
      phone: thisBooking.dom.form.phoneInput.value,
      address: thisBooking.dom.form.addressInput.value,
    };
    const url = settings.db.url + "/" + settings.db.bookings;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    };

    console.log("payload object", payload);

    fetch(url, options)
      .then(function (response) {
        return response.json();
      })
      .then(function (parsedResponse) {
        console.log("parsedResponse: ", parsedResponse);

        thisBooking.makeBooked(
          thisBooking.date,
          thisBooking.hour,
          thisBooking.hoursAmountWidget.value,
          thisBooking.selectedTable
        );

        thisBooking.updateDOM();
      });
  }
}

export default Booking;
