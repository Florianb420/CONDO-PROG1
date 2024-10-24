
document.addEventListener('DOMContentLoaded', function () {
    var calendarEl = document.getElementById('calendar');
    var reservationListEl = document.getElementById('reservation-list');

    // Firebase database reference
    var reservationsRef = firebase.database().ref('reservations');

    // Initialize FullCalendar
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        selectable: true,
        events: [], // Load events from Firebase later
        eventClick: function (info) {
            highlightReservation(info.event.id); // Highlight the clicked reservation in the list
        }
    });

    // Render the calendar
    calendar.render();

    // Load reservations from Firebase and add them to the calendar and list
    reservationsRef.on('value', function (snapshot) {
        const reservations = snapshot.val();
        reservationListEl.innerHTML = ''; // Clear the list
        calendar.getEvents().forEach(event => event.remove()); // Clear all events from the calendar

        if (reservations) {
            Object.keys(reservations).forEach(function (id) {
                const reservation = reservations[id];
                addReservationToList({ ...reservation, id }); // Add to list
                calendar.addEvent({
                    id: id,
                    title: 'Condo ' + reservation.condo + ' - Reserved (' + reservation.price + ' THB)',
                    start: reservation.startDate,
                    end: reservation.endDate,
                    color: reservation.condo === '528' ? 'green' : 'red'
                });
            });
        }
    });

    // Handle reservation form submission
    document.getElementById('addReservation').addEventListener('submit', function (e) {
        e.preventDefault();

        // Get form values
        var condo = document.getElementById('condo').value;
        var startDate = document.getElementById('start-date').value;
        var endDate = document.getElementById('end-date').value;
        var price = document.getElementById('price').value;

        // Save reservation to Firebase
        var newReservationRef = reservationsRef.push(); // Create a new reservation reference in Firebase
        newReservationRef.set({
            condo: condo,
            startDate: startDate,
            endDate: endDate,
            price: price
        });

        // Clear the form after submission
        document.getElementById('addReservation').reset();
    });

    // Function to add a reservation to the list under the form with delete button
    function addReservationToList(reservation) {
        var li = document.createElement('li');
        li.textContent = `Condo ${reservation.condo}, Start: ${reservation.startDate}, End: ${reservation.endDate}, Price: ${reservation.price} THB`;
        li.setAttribute('data-id', reservation.id);

        // Create delete button
        var deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', function () {
            deleteReservation(reservation.id);
        });
        
        li.appendChild(deleteBtn); // Add delete button to list item
        reservationListEl.appendChild(li);
    }

    // Function to highlight the clicked reservation in the list
    function highlightReservation(id) {
        var listItems = reservationListEl.querySelectorAll('li');
        listItems.forEach(function (item) {
            item.classList.remove('highlight');
        });
        var clickedItem = reservationListEl.querySelector(`li[data-id='${id}']`);
        if (clickedItem) {
            clickedItem.classList.add('highlight');
        }
    }

    // Function to delete a reservation from Firebase and FullCalendar
    function deleteReservation(id) {
        reservationsRef.child(id).remove(); // Remove from Firebase
        var event = calendar.getEventById(id);
        if (event) {
            event.remove(); // Remove from calendar
        }
        var li = reservationListEl.querySelector(`li[data-id='${id}']`);
        if (li) {
            li.remove(); // Remove from reservation list
        }
    }
});
