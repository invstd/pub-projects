document.querySelectorAll('.combobox').forEach((combobox, idx) => {
    const input = combobox.querySelector('input') || combobox.querySelector('.combobox-display');
    const isDisplayOnly = input.classList.contains('combobox-display');
    const list = combobox.querySelector('.combobox-list');
    const chevron = combobox.querySelector('.combobox-chevron');
    const chevronImg = chevron.querySelector('img');
    const itemDivs = Array.from(list.querySelectorAll(':scope > div:not(.clear-all)'));
    const clearAll = list.querySelector('.clear-all');
    const chipList = combobox.querySelector('.chip-list');
    const chipPlaceholder = combobox.querySelector('.chip-placeholder');

    // SVG for chip close icon (from Figma)
    const chipCloseSVG = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.75 3.75L8.25 8.25M8.25 3.75L3.75 8.25" stroke="#282828" stroke-width="1.5" stroke-linecap="round"/></svg>`;

    let chipsExpanded = false;

    function setChevron(down) {
        chevronImg.src = down ? 'icons/chevron-down.svg' : 'icons/chevron-up.svg';
        chevronImg.alt = down ? 'Chevron Down' : 'Chevron Up';
    }

    function truncateLabel(label) {
        return label.length > 4 ? label.slice(0, 4) + '..' : label;
    }

    function renderChips(selected) {
        if (!chipList) return;
        chipList.innerHTML = '';
        const maxChips = 2;
        const showAll = chipsExpanded;
        const chipsToShow = showAll ? selected : selected.slice(0, maxChips);
        // Toggle expanded class for vertical expansion
        const container = combobox.querySelector('.combobox-container');
        if (container) {
            if (showAll) {
                container.classList.add('combobox-expanded');
            } else {
                container.classList.remove('combobox-expanded');
            }
        }
        chipsToShow.forEach(opt => {
            const text = opt.querySelector('.item-wrapper').childNodes[0].textContent.trim();
            const chip = document.createElement('span');
            chip.className = 'chip';
            chip.innerHTML = `<span class="chip-label">${truncateLabel(text)}</span><button class="chip-remove" tabindex="-1" aria-label="Remove"><img class="chip-remove-icon" src="icons/x-close.svg" alt="Remove" width="12" height="12"></button>`;
            chip.querySelector('.chip-remove').addEventListener('mousedown', (e) => {
                e.preventDefault();
                opt.classList.remove('selected');
                const checkmark = opt.querySelector('.checkmark');
                if (checkmark) checkmark.style.display = 'none';
                updateInputValue();
            });
            chipList.appendChild(chip);
        });
        if (!showAll && selected.length > maxChips) {
            const counter = document.createElement('button');
            counter.className = 'chip-counter-btn';
            counter.type = 'button';
            counter.tabIndex = 0;
            counter.textContent = `+${selected.length - maxChips}`;
            counter.addEventListener('click', (e) => {
                e.stopPropagation();
                chipsExpanded = true;
                renderChips(selected);
                setChevron(false); // chevron up
                list.classList.remove('active'); // close dropdown
            });
            chipList.appendChild(counter);
        }
        chipPlaceholder.style.display = selected.length === 0 ? '' : 'none';
    }

    function updateInputValue() {
        const selected = itemDivs.filter(opt => opt.classList.contains('selected'));
        if (isDisplayOnly) {
            renderChips(selected);
        } else {
            if (selected.length === 1) {
                const text = selected[0].querySelector('.item-wrapper').childNodes[0].textContent.trim();
                input.value = text;
            } else if (selected.length > 1) {
                input.value = `Selected (${selected.length}/${itemDivs.length})`;
            } else {
                input.value = '';
            }
        }
        if (clearAll) {
            clearAll.style.display = selected.length > 0 ? '' : 'none';
        }
    }

    // For display-only, use click/focus to open, and blur to close
    if (isDisplayOnly) {
        input.addEventListener('click', () => {
            list.classList.add('active');
            setChevron(false);
        });
        input.addEventListener('focus', () => {
            list.classList.add('active');
            setChevron(false);
        });
        input.addEventListener('blur', () => {
            setTimeout(() => {
                list.classList.remove('active');
                setChevron(true);
            }, 100);
        });
    } else {
        input.addEventListener('focus', () => {
            list.classList.add('active');
            setChevron(false);
        });
        input.addEventListener('blur', () => {
            setTimeout(() => {
                list.classList.remove('active');
                setChevron(true);
            }, 100);
        });
    }

    chevron.addEventListener('mousedown', (e) => {
        e.preventDefault();
        if (isDisplayOnly && chipsExpanded) {
            chipsExpanded = false;
            updateInputValue();
            setChevron(true); // chevron down
            return;
        }
        const willOpen = !list.classList.contains('active');
        list.classList.toggle('active');
        setChevron(!willOpen);
        if (list.classList.contains('active')) {
            input.focus();
        }
    });

    itemDivs.forEach(option => {
        option.addEventListener('mousedown', (e) => {
            e.preventDefault();
            option.classList.toggle('selected');
            const checkmark = option.querySelector('.checkmark');
            if (checkmark) {
                if (option.classList.contains('selected')) {
                    checkmark.style.display = 'inline-flex';
                } else {
                    checkmark.style.display = 'none';
                }
            }
            updateInputValue();
        });
    });

    if (clearAll) {
        clearAll.addEventListener('mousedown', (e) => {
            e.preventDefault();
            itemDivs.forEach(option => {
                option.classList.remove('selected');
                const checkmark = option.querySelector('.checkmark');
                if (checkmark) checkmark.style.display = 'none';
            });
            if (isDisplayOnly) {
                chipsExpanded = false;
                renderChips([]);
                setChevron(true);
            } else {
                input.value = '';
            }
            clearAll.style.display = 'none';
            if (chipPlaceholder) chipPlaceholder.style.display = '';
        });
    }
    if (clearAll) {
        const anySelected = itemDivs.some(opt => opt.classList.contains('selected'));
        clearAll.style.display = anySelected ? '' : 'none';
    }
    // Set initial display value for display-only
    if (isDisplayOnly) {
        chipsExpanded = false;
        renderChips(itemDivs.filter(opt => opt.classList.contains('selected')));
        setChevron(true);
    }
}); 