document.addEventListener('DOMContentLoaded', function () {
    const monthYear = document.getElementById('monthYear');
    let dayContainer = document.getElementById('days');
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');
    const popup = document.getElementById('popup');
    const popupDate = document.getElementById('popup-date');
    const popupTime = document.getElementById('popup-time');
    const closePopup = document.getElementById('close-popup');
    const notesInput = document.getElementById('notes-input');
    const saveNotesBtn = document.getElementById('save-notes');
    const reminderIcon = document.getElementById('reminderIcon');
    const reminderPopup = document.getElementById('reminderPopup');
    const reminderClose = document.getElementById('reminderClose');
    const saveReminderBtn = document.getElementById('saveReminder');
    const showAllNotesBtn = document.getElementById('showAllNotes');
    const allNotesPopup = document.getElementById('allNotesPopup');
    const closeAllNotesPopup = document.getElementById('closeAllNotesPopup');
    const allNotesList = document.getElementById('allNotesList');

    const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
        "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    const dayNames = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

    const holidays = [
        { day: 1, month: 0, name: "Yılbaşı" },
        { day: 23, month: 3, name: "Ulusal Egemenlik ve Çocuk Bayramı" },
        { day: 19, month: 4, name: "Atatürk’ü Anma, Gençlik ve Spor Bayramı" },
        { day: 15, month: 6, name: "Demokrasi ve Milli Birlik Günü" },
        { day: 30, month: 7, name: "Zafer Bayramı" },
        { day: 29, month: 9, name: "Cumhuriyet Bayramı" },
        { day: 3, month: 6, name: "Benim canım aşkımın doğum günü 🥳" }
    ];

    let date = new Date();
    let selectedDay = null;
    let direction = null;

    let selectedYear, selectedMonth, selectedDayNumber;

    function renderCalendar() {
        const year = date.getFullYear();
        const month = date.getMonth();

        monthYear.textContent = `${monthNames[month]} ${year}`;

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const startDay = (firstDayOfMonth + 6) % 7; // Pazartesi başlangıç için

        const newDaysContainer = document.createElement('div');
        newDaysContainer.className = 'days';

        for (let i = 0; i < startDay; i++) {
            newDaysContainer.appendChild(document.createElement('div'));
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.textContent = i;
            dayDiv.classList.add('day');

            if (i === 3 && month === 6) {
                dayDiv.classList.add('pink-day');
            }

            if (holidays.some(h => h.day === i && h.month === month)) {
                dayDiv.classList.add('holiday');
            }

            // ** Emoji gösterme eklendi **
            const emoji = localStorage.getItem(`emoji-${year}-${month}-${i}`);
            if (emoji) {
                const emojiSpan = document.createElement('span');
                emojiSpan.textContent = emoji;
                emojiSpan.style.marginLeft = '5px';
                dayDiv.appendChild(emojiSpan);
            }

            dayDiv.addEventListener('click', () => {
                selectDay(dayDiv, i, year, month);
            });

            newDaysContainer.appendChild(dayDiv);
        }

        if (direction) {
            const oldDaysContainer = dayContainer;
            oldDaysContainer.classList.add(direction === 'next' ? 'slide-out-left' : 'slide-out-right');
            newDaysContainer.classList.add(direction === 'next' ? 'slide-in-right' : 'slide-in-left');

            setTimeout(() => {
                oldDaysContainer.remove();
                newDaysContainer.id = 'days';
                dayContainer = newDaysContainer;
                document.querySelector('.calendar').appendChild(newDaysContainer);
            }, 150);
        } else {
            newDaysContainer.id = 'days';
            document.querySelector('.calendar').querySelector('#days')?.remove();
            document.querySelector('.calendar').appendChild(newDaysContainer);
            dayContainer = newDaysContainer;
        }

        direction = null;
    }

    function selectDay(element, dayNumber, year, month) {
        if (selectedDay) selectedDay.classList.remove('selected');
        selectedDay = element;
        selectedDay.classList.add('selected');

        selectedYear = year;
        selectedMonth = month;
        selectedDayNumber = dayNumber;

        showPopup(dayNumber, month, year);
    }

    function showPopup(day, month, year) {
        const selectedDate = new Date(year, month, day);
        const dayName = dayNames[selectedDate.getDay()];
        const fullDate = `${day} ${monthNames[month]} ${year} - ${dayName}`;
        const now = new Date();
        const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

        popupDate.textContent = fullDate;
        popupTime.textContent = `Saat: ${time}`;

        const holiday = holidays.find(h => h.day === day && h.month === month);
        const reminderText = localStorage.getItem(`reminder-${year}-${month}-${day}`);
        const popupHoliday = document.getElementById('popup-holiday');

        if (holiday || reminderText) {
            popupHoliday.style.display = "block";
            if (holiday && reminderText) {
                popupHoliday.textContent = `🎉 ${holiday.name} | 🔔 ${reminderText}`;
            } else if (holiday) {
                popupHoliday.textContent = `🎉 ${holiday.name}`;
            } else {
                popupHoliday.textContent = `🔔 ${reminderText}`;
            }
        } else {
            popupHoliday.style.display = "none";
        }

        const noteKey = `note-${year}-${month}-${day}`;
        const savedNote = localStorage.getItem(noteKey) || '';
        notesInput.value = savedNote;

        // ** Popup içinde emoji için input eklendi **
        let emojiInput = document.getElementById('emoji-input');
        if (!emojiInput) {
            emojiInput = document.createElement('input');
            emojiInput.id = 'emoji-input';
            emojiInput.placeholder = 'Emoji girin (örneğin: 🎂)';
            emojiInput.style.marginTop = '10px';
            emojiInput.style.width = '100%';
            popup.querySelector('.popup-content').appendChild(emojiInput);
        }
        const savedEmoji = localStorage.getItem(`emoji-${year}-${month}-${day}`) || '';
        emojiInput.value = savedEmoji;

        popup.style.display = "block";
    }

    closePopup.addEventListener('click', () => {
        popup.style.display = "none";
    });

    saveNotesBtn.addEventListener('click', () => {
        const key = `note-${selectedYear}-${selectedMonth}-${selectedDayNumber}`;
        localStorage.setItem(key, notesInput.value);

        // ** Emoji kaydetme kısmı eklendi **
        const emojiInput = document.getElementById('emoji-input');
        if (emojiInput) {
            const emojiKey = `emoji-${selectedYear}-${selectedMonth}-${selectedDayNumber}`;
            if (emojiInput.value.trim() === '') {
                localStorage.removeItem(emojiKey);
            } else {
                localStorage.setItem(emojiKey, emojiInput.value.trim());
            }
        }

        popup.style.display = "none";
        renderCalendar();
    });

    reminderIcon.addEventListener('click', () => {
        reminderPopup.style.display = "block";
    });

    reminderClose.addEventListener('click', () => {
        reminderPopup.style.display = "none";
    });

    saveReminderBtn.addEventListener('click', () => {
        const dateInput = document.getElementById('reminderDate').value;
        const nameInput = document.getElementById('reminderName').value;

        const parts = dateInput.split('/');
        if (parts.length !== 3) return alert('Lütfen GG/AA/YY formatında tarih giriniz.');
        const [day, month, yearSuffix] = parts;
        const year = 2000 + parseInt(yearSuffix);

        const key = `reminder-${year}-${parseInt(month) - 1}-${parseInt(day)}`;
        localStorage.setItem(key, nameInput);
        reminderPopup.style.display = "none";
        renderCalendar();
    });

    showAllNotesBtn.addEventListener('click', () => {
        allNotesList.innerHTML = '';
        let foundAny = false;

        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('note-')) {
                const note = localStorage.getItem(key);
                if (note && note.trim() !== '') {
                    foundAny = true;
                    const [_, year, month, day] = key.split('-');
                    const formattedDate = `${day.padStart(2, '0')}.${(parseInt(month) + 1).toString().padStart(2, '0')}.${year}`;
                    const div = document.createElement('div');
                    div.classList.add('note-entry');

                    // Not metnini göstermek için:
                    const noteText = document.createElement('span');
                    noteText.textContent = `${formattedDate}: ${note}`;

                    // ** Emoji gösterimi eklendi **
                    const emoji = localStorage.getItem(`emoji-${year}-${month}-${day}`) || '';
                    if (emoji) {
                        noteText.textContent += ` ${emoji}`;
                    }

                    div.appendChild(noteText);

                    // Düzenleme butonu
                    const editBtn = document.createElement('button');
                    editBtn.textContent = 'Düzenle';
                    editBtn.classList.add('edit-note-btn');
                    editBtn.style.marginLeft = '10px';
                    editBtn.addEventListener('click', () => {
                        // Popup'ta düzenleme için notu aç
                        popup.style.display = 'block';
                        notesInput.value = note;
                        selectedYear = parseInt(year);
                        selectedMonth = parseInt(month);
                        selectedDayNumber = parseInt(day);
                        popupDate.textContent = `${day} ${monthNames[selectedMonth]} ${selectedYear} - ${dayNames[new Date(selectedYear, selectedMonth, selectedDayNumber).getDay()]}`;
                        popupTime.textContent = `Saat: --:--`; // Zamanı sıfırla

                        // Emoji inputu da güncelle
                        let emojiInput = document.getElementById('emoji-input');
                        if (!emojiInput) {
                            emojiInput = document.createElement('input');
                            emojiInput.id = 'emoji-input';
                            emojiInput.placeholder = 'Emoji girin (örneğin: 🎂)';
                            emojiInput.style.marginTop = '10px';
                            emojiInput.style.width = '100%';
                            popup.querySelector('.popup-content').appendChild(emojiInput);
                        }
                        emojiInput.value = localStorage.getItem(`emoji-${selectedYear}-${selectedMonth}-${selectedDayNumber}`) || '';

                        allNotesPopup.style.display = 'none';
                    });

                    div.appendChild(editBtn);
                    allNotesList.appendChild(div);
                }
            }
        });

        if (!foundAny) {
            allNotesList.textContent = "Kayıtlı not bulunamadı.";
        }

        allNotesPopup.style.display = 'block';
    });

    closeAllNotesPopup.addEventListener('click', () => {
        allNotesPopup.style.display = 'none';
    });

    prevBtn.addEventListener('click', () => {
        direction = 'prev';
        date.setMonth(date.getMonth() - 1);
        renderCalendar();
    });

    nextBtn.addEventListener('click', () => {
        direction = 'next';
        date.setMonth(date.getMonth() + 1);
        renderCalendar();
    });

 const picker = new EmojiButton({
    theme: 'auto',
    position: 'top-start'
});

document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'emoji-btn') {
        picker.togglePicker(e.target);
    }
});

picker.on('emoji', emoji => {
    const emojiInput = document.getElementById('emoji-input');
    if (emojiInput) {
        emojiInput.value = emoji;
    }
});

    renderCalendar();
});