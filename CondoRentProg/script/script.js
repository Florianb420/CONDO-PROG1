document.addEventListener('DOMContentLoaded', function () {
    // Reference to Firebase Authentication
    const auth = firebase.auth();

    // Reference to Firebase Database
    const reservationsRef = firebase.database().ref('reservations'); // Move this here to ensure it's in scope

    // Initialize variables for DOM elements
    var calendarEl = document.getElementById('calendar');
    var condo528ListEl = document.createElement('ul');
    var condo527ListEl = document.createElement('ul');
    var condo528TotalEl = document.createElement('div');
    var condo527TotalEl = document.createElement('div');
    var condo528PaidTotalEl = document.createElement('div');
    var condo527PaidTotalEl = document.createElement('div');

    condo528ListEl.classList.add('reservation-list');
    condo527ListEl.classList.add('reservation-list');

    document.getElementById('reservation-list').appendChild(document.createElement('h3')).textContent = "Condo 528 Reservations";
    document.getElementById('reservation-list').appendChild(condo528ListEl);
    document.getElementById('reservation-list').appendChild(condo528TotalEl);
    document.getElementById('reservation-list').appendChild(condo528PaidTotalEl);

    document.getElementById('reservation-list').appendChild(document.createElement('h3')).textContent = "Condo 527 Reservations";
    document.getElementById('reservation-list').appendChild(condo527ListEl);
    document.getElementById('reservation-list').appendChild(condo527TotalEl);
    document.getElementById('reservation-list').appendChild(condo527PaidTotalEl);

    // Function to load reservations
    function loadReservations() {
        reservationsRef.on('value', function (snapshot) {
            const reservations = snapshot.val();
            condo528ListEl.innerHTML = '';
            condo527ListEl.innerHTML = '';
            calendar.getEvents().forEach(event => event.remove());

            let total528 = 0;
            let paidTotal528 = 0;
            let total527 = 0;
            let paidTotal527 = 0;

            if (reservations) {
                Object.keys(reservations).forEach(function (id) {
                    const reservation = reservations[id];
                    console.log(reservation); // Add this for debugging
                    const price = parseFloat(reservation.price) || 0;

                    if (reservation.condo === '528') {
                        addReservationToList(condo528ListEl, reservation, id);
                        total528 += price;
                        if (reservation.paid) {
                            paidTotal528 += price;
                        }
                    } else if (reservation.condo === '527') {
                        addReservationToList(condo527ListEl, reservation, id);
                        total527 += price;
                        if (reservation.paid) {
                            paidTotal527 += price;
                        }
                    }
                    calendar.addEvent({
                        id: id,
                        title: `Condo ${reservation.condo} - Reserved (${reservation.price} THB)`,
                        start: reservation.startDate,
                        end: reservation.endDate,
                        color: reservation.condo === '528' ? 'green' : 'red'
                    });
                });
            }
            condo528TotalEl.textContent = `Total for Condo 528: ${total528} THB`;
            condo528PaidTotalEl.textContent = `Total Paid for Condo 528: ${paidTotal528} THB`;
            condo527TotalEl.textContent = `Total for Condo 527: ${total527} THB`;
            condo527PaidTotalEl.textContent = `Total Paid for Condo 527: ${paidTotal527} THB`;
        });
    }

    auth.onAuthStateChanged(user => {
        if (user) {
            // User is logged in, show app content
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('app-content').style.display = 'block';

            // Load reservations for the user
            loadReservations();
        } else {
            // User is not logged in, show login form
            document.getElementById('login-form').style.display = 'block';
            document.getElementById('app-content').style.display = 'none';
        }
    });

    // Logout functionality
    document.getElementById('logout-btn').addEventListener('click', function () {
        auth.signOut()
            .then(() => {
                alert('Logged out!');
            })
            .catch(error => {
                alert('Logout failed: ' + error.message);
            });
    });

    // Login functionality
    document.querySelector('#login-form form').addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent default form submission

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                alert('Logged in successfully!');
            })
            .catch(error => {
                alert('Login failed: ' + error.message);
            });
    });

    // Initialize the calendar
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        selectable: true,
        events: [],
        eventClick: function (info) {
            highlightReservation(info.event.id);
        }
    });
    calendar.render();

    document.getElementById('addReservation').addEventListener('submit', function (e) {
        e.preventDefault();

        var condo = document.getElementById('condo').value;
        var startDate = document.getElementById('start-date').value;
        var endDate = document.getElementById('end-date').value;
        var price = parseFloat(document.getElementById('price').value);

        var newReservationRef = reservationsRef.push();
        newReservationRef.set({
            condo: condo,
            startDate: startDate,
            endDate: endDate,
            price: price,
            paid: false
        });
        document.getElementById('addReservation').reset();
    });

    function addReservationToList(listElement, reservation, id) {
        var li = document.createElement('li');
        li.textContent = `Condo ${reservation.condo}, Start: ${reservation.startDate}, End: ${reservation.endDate}, Price: ${reservation.price} THB`;
        li.setAttribute('data-id', id);

        // Highlight if marked as paid
        if (reservation.paid) {
            li.style.backgroundColor = 'yellow';
        }

        var deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', function () {
            deleteReservation(id);
        });

        var paidBtn = document.createElement('button');
        paidBtn.textContent = reservation.paid ? 'Paid' : 'Mark as Paid';
        paidBtn.disabled = reservation.paid;
        paidBtn.addEventListener('click', function () {
            markAsPaid(id, li, paidBtn);
        });

        li.appendChild(deleteBtn);
        li.appendChild(paidBtn);
        listElement.appendChild(li);
    }

    function highlightReservation(id) {
        var listItems = document.querySelectorAll('.reservation-list li');
        listItems.forEach(function (item) {
            item.classList.remove('highlight');
        });
        var clickedItem = document.querySelector(`li[data-id='${id}']`);
        if (clickedItem) {
            clickedItem.classList.add('highlight');
        }
    }

    function deleteReservation(id) {
        reservationsRef.child(id).remove();
        var event = calendar.getEventById(id);
        if (event) event.remove();
        var li = document.querySelector(`li[data-id='${id}']`);
        if (li) li.remove();
    }

    function markAsPaid(id, listItem, paidButton) {
        reservationsRef.child(id).update({ paid: true });
        listItem.style.backgroundColor = 'yellow';
        paidButton.textContent = 'Paid';
        paidButton.disabled = true;

        // Update totals in the DOM
        reservationsRef.once('value', function (snapshot) {
            const reservations = snapshot.val();
            let paidTotal528 = 0;
            let paidTotal527 = 0;

            if (reservations) {
                Object.values(reservations).forEach(function (reservation) {
                    const price = parseFloat(reservation.price) || 0;
                    if (reservation.paid) {
                        if (reservation.condo === '528') {
                            paidTotal528 += price;
                        } else if (reservation.condo === '527') {
                            paidTotal527 += price;
                        }
                    }
                });
            }
            condo528PaidTotalEl.textContent = `Total Paid for Condo 528: ${paidTotal528} THB`;
            condo527PaidTotalEl.textContent = `Total Paid for Condo 527: ${paidTotal527} THB`;
        });
    }
});
