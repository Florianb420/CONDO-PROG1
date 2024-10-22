document.addEventListener('DOMContentLoaded', function () {
    var calendarEl = document.getElementById('calendar');
    var reservationListEl = document.getElementById('reservation-list');
    var reservations = JSON.parse(localStorage.getItem('reservations')) || []; // Load from localStorage or initialize empty array

    // Initialize FullCalendar
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        selectable: true,
        events: reservations.map(res => ({
            id: res.id,
            title: 'Condo ' + res.condo + ' - Reserved (' + res.price + ' THB)',
            start: res.startDate,
            end: res.endDate,
            color: res.condo === '528' ? 'green' : 'red' // Set color based on condo
        })),
        eventClick: function (info) {
            // Highlight the clicked reservation in the list
            highlightReservation(info.event.id);
        }
    });

    calendar.render();

    // Load the saved reservations into the list
    reservations.forEach(addReservationToList);

    // Handle reservation form submission
    document.getElementById('addReservation').addEventListener('submit', function (e) {
        e.preventDefault();

        // Get form values
        var condo = document.getElementById('condo').value;
        var startDate = document.getElementById('start-date').value;
        var endDate = document.getElementById('end-date').value;
        var price = document.getElementById('price').value;
        var eventColor = condo === '528' ? 'green' : 'red'; // Use green for Condo 528, red for Condo 527

        // Create reservation object
        var reservation = {
            id: reservations.length, // Use the array index as the ID
            condo: condo,
            startDate: startDate,
            endDate: endDate,
            price: price
        };

        // Add the reservation to the array and save it to localStorage
        reservations.push(reservation);
        localStorage.setItem('reservations', JSON.stringify(reservations));

        // Add the reservation to the list and calendar
        addReservationToList(reservation);
        calendar.addEvent({
            id: reservation.id,
            title: 'Condo ' + condo + ' - Reserved (' + price + ' THB)',
            start: startDate,
            end: endDate,
            color: eventColor
        });

        // Clear the form
        document.getElementById('addReservation').reset();
    });

    // Function to add a reservation to the list under the form
    function addReservationToList(reservation) {
        var li = document.createElement('li');
        li.textContent = `Condo ${reservation.condo}, Start: ${reservation.startDate}, End: ${reservation.endDate}, Price: ${reservation.price} THB`;
        li.setAttribute('data-id', reservation.id);
        li.classList.add('reservation-item');
        reservationListEl.appendChild(li);
    }

    // Function to highlight the clicked reservation in the list
    function highlightReservation(id) {
        // Remove highlight from all items
        var listItems = reservationListEl.querySelectorAll('li');
        listItems.forEach(function (item) {
            item.classList.remove('highlight');
        });

        // Highlight the clicked reservation
        var clickedItem = reservationListEl.querySelector(`li[data-id='${id}']`);
        if (clickedItem) {
            clickedItem.classList.add('highlight');
        }
    }
});
