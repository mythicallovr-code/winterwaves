const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");
const previousMonth = document.getElementById("previousMonth");
const nextMonth = document.getElementById("nextMonth");

const bookingDetails = document.getElementById("bookingDetails");
const selectedDates = document.getElementById("selectedDates");
const bookButton = document.getElementById("bookButton");
const message = document.getElementById("message");

let currentDate = new Date();
let checkIn = null;
let checkOut = null;


// Get saved bookings from THIS browser/computer
let bookedDates = JSON.parse(
    localStorage.getItem("winterWavesBookings")
) || [];


// Convert date to YYYY-MM-DD
function dateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}


// Check if date is already booked
function isBooked(date) {
    return bookedDates.includes(dateKey(date));
}


// Display calendar
function renderCalendar() {

    calendar.innerHTML = "";

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    monthYear.textContent = new Date(year, month).toLocaleDateString(
        "en-US",
        {
            month: "long",
            year: "numeric"
        }
    );


    // Empty spaces before first day
    for (let i = 0; i < firstDay; i++) {

        const emptyDay = document.createElement("div");

        emptyDay.classList.add("day", "empty");

        calendar.appendChild(emptyDay);
    }


    // Create calendar days
    for (let day = 1; day <= daysInMonth; day++) {

        const date = new Date(year, month, day);

        const dayElement = document.createElement("div");

        dayElement.classList.add("day");

        dayElement.textContent = day;


        if (isBooked(date)) {

            dayElement.classList.add("booked");

        } else {

            dayElement.classList.add("available");

            dayElement.addEventListener("click", function () {
                selectDate(date);
            });

        }

        calendar.appendChild(dayElement);
    }

    updateCalendarSelection();
}


// Select check-in/check-out
function selectDate(date) {

    // Don't allow selecting booked dates
    if (isBooked(date)) {
        return;
    }


    // First click = check-in
    if (!checkIn || checkOut) {

        checkIn = date;
        checkOut = null;

    }

    // Second click = check-out
    else {

        // Make sure check-out is after check-in
        if (date > checkIn) {

            // Check whether any date between them is booked
            let current = new Date(checkIn);

            let blocked = false;

            while (current <= date) {

                if (isBooked(current)) {
                    blocked = true;
                    break;
                }

                current.setDate(current.getDate() + 1);
            }


            if (blocked) {

                alert(
                    "Some of these dates are already booked. Please choose different dates."
                );

                return;
            }

            checkOut = date;

        } else {

            checkIn = date;
            checkOut = null;
        }
    }


    updateCalendarSelection();
}


// Highlight selected dates
function updateCalendarSelection() {

    const allDays = document.querySelectorAll(".day:not(.empty)");

    allDays.forEach(dayElement => {

        const dayNumber = Number(dayElement.textContent);

        const date = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            dayNumber
        );


        dayElement.classList.remove(
            "selected",
            "in-range"
        );


        if (
            checkIn &&
            date.getTime() === checkIn.getTime()
        ) {

            dayElement.classList.add("selected");
        }


        if (
            checkOut &&
            date.getTime() === checkOut.getTime()
        ) {

            dayElement.classList.add("selected");
        }


        if (
            checkIn &&
            checkOut &&
            date > checkIn &&
            date < checkOut
        ) {

            dayElement.classList.add("in-range");
        }

    });


    updateBookingDetails();
}


// Show booking details
function updateBookingDetails() {

    if (!checkIn) {

        bookingDetails.style.display = "none";

        return;
    }


    bookingDetails.style.display = "block";


    if (!checkOut) {

        selectedDates.textContent =
            "Check-in selected: " +
            formatDate(checkIn) +
            ". Now select your check-out date.";

    } else {

        const days = calculateDays(checkIn, checkOut);

        const total = days * 2400;

        selectedDates.textContent =
            `Check-in: ${formatDate(checkIn)} | ` +
            `Check-out: ${formatDate(checkOut)} | ` +
            `${days} day(s) — ₹${total.toLocaleString("en-IN")}`;
    }
}


// Calculate number of days
function calculateDays(start, end) {

    const difference =
        end.getTime() - start.getTime();

    return Math.round(
        difference / (1000 * 60 * 60 * 24)
    );
}


// Format date
function formatDate(date) {

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}


// Previous month
previousMonth.addEventListener("click", function () {

    currentDate.setMonth(
        currentDate.getMonth() - 1
    );

    renderCalendar();
});


// Next month
nextMonth.addEventListener("click", function () {

    currentDate.setMonth(
        currentDate.getMonth() + 1
    );

    renderCalendar();
});


// BOOK NOW
bookButton.addEventListener("click", function () {

    const name =
        document.getElementById("guestName").value.trim();

    const guests =
        document.getElementById("guestNumber").value;

    const phone =
        document.getElementById("phoneNumber").value.trim();


    if (!checkIn || !checkOut) {

        message.textContent =
            "Please select both check-in and check-out dates.";

        return;
    }


    if (!name || !guests || !phone) {

        message.textContent =
            "Please fill in all the details.";

        return;
    }


    // Add every date of the booking
    let current = new Date(checkIn);

    while (current < checkOut) {

        const key = dateKey(current);

        if (!bookedDates.includes(key)) {
            bookedDates.push(key);
        }

        current.setDate(
            current.getDate() + 1
        );
    }


    // Save bookings in this browser
    localStorage.setItem(
        "winterWavesBookings",
        JSON.stringify(bookedDates)
    );


    message.textContent =
        "Your booking has been confirmed!";


    // Clear selection
    checkIn = null;
    checkOut = null;


    // Rebuild calendar
    renderCalendar();

});


// Start calendar
renderCalendar();