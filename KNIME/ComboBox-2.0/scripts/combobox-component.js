document.querySelectorAll('.combobox').forEach((combobox, idx) => {
    const input = combobox.querySelector('input');
    const list = combobox.querySelector('.combobox-list');
    const chevron = combobox.querySelector('.combobox-chevron');
    const chevronImg = chevron.querySelector('img');
    const itemDivs = Array.from(list.querySelectorAll(':scope > div:not(.clear-all):not(.filter-container)'));
    const clearAll = list.querySelector('.clear-all');
    const filterInput = list.querySelector('.filter-input');
    const addBtn = combobox.querySelector('.filter-add-btn');
    const clearBtn = combobox.querySelector('.filter-clear-btn');
    const chipList = combobox.querySelector('.chip-list');
    const chipPlaceholder = combobox.querySelector('.chip-placeholder');
    const chipListExpanded = combobox.querySelector('.chip-list-expanded');
    const chipCounterBtn = combobox.querySelector('.chip-counter-btn');

    let isDropdownOpen = false;
    let chipsExpanded = false;

    function setChevron(down) {
        chevronImg.src = down ? 'icons/chevron-down.svg' : 'icons/chevron-up.svg';
        chevronImg.alt = down ? 'Chevron Down' : 'Chevron Up';
    }

    function sortItems() {
        const selectedItems = itemDivs.filter(item => item.classList.contains('selected'));
        const unselectedItems = itemDivs.filter(item => !item.classList.contains('selected'));
        
        // Sort selected items alphabetically
        selectedItems.sort((a, b) => {
            const textA = a.querySelector('.item-wrapper').childNodes[0].textContent.toLowerCase();
            const textB = b.querySelector('.item-wrapper').childNodes[0].textContent.toLowerCase();
            return textA.localeCompare(textB);
        });
        
        // Sort unselected items alphabetically
        unselectedItems.sort((a, b) => {
            const textA = a.querySelector('.item-wrapper').childNodes[0].textContent.toLowerCase();
            const textB = b.querySelector('.item-wrapper').childNodes[0].textContent.toLowerCase();
            return textA.localeCompare(textB);
        });
        
        // Reorder items in the DOM: selected first, then unselected
        const filterContainer = list.querySelector('.filter-container');
        const clearAllElement = list.querySelector('.clear-all');
        
        // Remove all items except filter and clear-all
        itemDivs.forEach(item => item.remove());
        
        // Add selected items first
        selectedItems.forEach(item => {
            list.insertBefore(item, clearAllElement);
        });
        
        // Add unselected items
        unselectedItems.forEach(item => {
            list.insertBefore(item, clearAllElement);
        });
    }

    function filterItems(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        itemDivs.forEach(item => {
            const text = item.querySelector('.item-wrapper').childNodes[0].textContent.toLowerCase();
            if (text.includes(term)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    }

    function truncateLabel(label) {
        return label.length > 4 ? label.slice(0, 4) + '..' : label;
    }

    function renderChips(selected) {
        if (!chipList) return;
        chipList.innerHTML = '';
        chipList.style.display = selected.length === 0 ? 'none' : 'flex';
        const maxChips = 2;
        const chipsToShow = selected.slice(0, maxChips);
        chipsToShow.forEach(opt => {
            const text = opt.querySelector('.item-wrapper').childNodes[0].textContent.trim();
            const chip = document.createElement('span');
            chip.className = 'chip';
            chip.innerHTML = `<span class=\"chip-label\">${truncateLabel(text)}</span><button class=\"chip-remove\" tabindex=\"-1\" aria-label=\"Remove\"><img class=\"chip-remove-icon\" src=\"icons/x-close.svg\" alt=\"Remove\" width=\"12\" height=\"12\"></button>`;
            chip.querySelector('.chip-remove').addEventListener('mousedown', (e) => {
                e.preventDefault();
                opt.classList.remove('selected');
                const checkmark = opt.querySelector('.checkmark');
                if (checkmark) checkmark.style.display = 'none';
                updateInputValue();
            });
            chipList.appendChild(chip);
        });
        // Handle static counter button
        if (chipCounterBtn) {
            // Always set up the toggle handler
            chipCounterBtn.onclick = (e) => {
                e.stopPropagation();
                if (chipListExpanded) {
                    if (chipListExpanded.style.display === 'flex') {
                        chipListExpanded.style.display = 'none';
                        updateCounterBtn();
                    } else {
                        chipListExpanded.innerHTML = '';
                        chipListExpanded.style.display = 'flex';
                        chipCounterBtn.innerHTML = '<img src="icons/arrow-up.svg" alt="Collapse" width="14" height="14">';
                        selected.forEach(opt => {
                            const text = opt.querySelector('.item-wrapper').childNodes[0].textContent.trim();
                            const chip = document.createElement('span');
                            chip.className = 'chip';
                            chip.innerHTML = `<span class=\"chip-label\">${text}</span><button class=\"chip-remove\" tabindex=\"-1\" aria-label=\"Remove\"><img class=\"chip-remove-icon\" src=\"icons/x-close.svg\" alt=\"Remove\" width=\"12\" height=\"12\"></button>`;
                            chip.querySelector('.chip-remove').addEventListener('mousedown', (evt) => {
                                evt.preventDefault();
                                opt.classList.remove('selected');
                                const checkmark = opt.querySelector('.checkmark');
                                if (checkmark) checkmark.style.display = 'none';
                                updateInputValue();
                                // Update main chip-list and bag of chips to reflect removal
                                const selectedNow = itemDivs.filter(opt => opt.classList.contains('selected'));
                                renderChips(selectedNow);
                                updateCounterBtn();
                                // Re-render the bag of chips in place
                                if (chipListExpanded && chipListExpanded.style.display === 'flex') {
                                    chipListExpanded.innerHTML = '';
                                    selectedNow.forEach(opt2 => {
                                        const text2 = opt2.querySelector('.item-wrapper').childNodes[0].textContent.trim();
                                        const chip2 = document.createElement('span');
                                        chip2.className = 'chip';
                                        chip2.innerHTML = `<span class=\"chip-label\">${text2}</span><button class=\"chip-remove\" tabindex=\"-1\" aria-label=\"Remove\"><img class=\"chip-remove-icon\" src=\"icons/x-close.svg\" alt=\"Remove\" width=\"12\" height=\"12\"></button>`;
                                        chip2.querySelector('.chip-remove').addEventListener('mousedown', (evt2) => {
                                            evt2.preventDefault();
                                            opt2.classList.remove('selected');
                                            const checkmark2 = opt2.querySelector('.checkmark');
                                            if (checkmark2) checkmark2.style.display = 'none';
                                            updateInputValue();
                                            renderChips(itemDivs.filter(opt => opt.classList.contains('selected')));
                                            updateCounterBtn();
                                            // Recursively update the bag of chips
                                            if (chipListExpanded && chipListExpanded.style.display === 'flex') {
                                                chipListExpanded.innerHTML = '';
                                                const selectedNow2 = itemDivs.filter(opt => opt.classList.contains('selected'));
                                                selectedNow2.forEach(opt3 => {
                                                    const text3 = opt3.querySelector('.item-wrapper').childNodes[0].textContent.trim();
                                                    const chip3 = document.createElement('span');
                                                    chip3.className = 'chip';
                                                    chip3.innerHTML = `<span class=\"chip-label\">${text3}</span><button class=\"chip-remove\" tabindex=\"-1\" aria-label=\"Remove\"><img class=\"chip-remove-icon\" src=\"icons/x-close.svg\" alt=\"Remove\" width=\"12\" height=\"12\"></button>`;
                                                    chip3.querySelector('.chip-remove').addEventListener('mousedown', (evt3) => {
                                                        evt3.preventDefault();
                                                        opt3.classList.remove('selected');
                                                        const checkmark3 = opt3.querySelector('.checkmark');
                                                        if (checkmark3) checkmark3.style.display = 'none';
                                                        updateInputValue();
                                                        renderChips(itemDivs.filter(opt => opt.classList.contains('selected')));
                                                        updateCounterBtn();
                                                        if (chipListExpanded && chipListExpanded.style.display === 'flex') {
                                                            chipListExpanded.innerHTML = '';
                                                            const selectedNow3 = itemDivs.filter(opt => opt.classList.contains('selected'));
                                                            selectedNow3.forEach(opt4 => {
                                                                const text4 = opt4.querySelector('.item-wrapper').childNodes[0].textContent.trim();
                                                                const chip4 = document.createElement('span');
                                                                chip4.className = 'chip';
                                                                chip4.innerHTML = `<span class=\"chip-label\">${text4}</span><button class=\"chip-remove\" tabindex=\"-1\" aria-label=\"Remove\"><img class=\"chip-remove-icon\" src=\"icons/x-close.svg\" alt=\"Remove\" width=\"12\" height=\"12\"></button>`;
                                                                chip4.querySelector('.chip-remove').addEventListener('mousedown', (evt4) => {
                                                                    evt4.preventDefault();
                                                                    opt4.classList.remove('selected');
                                                                    const checkmark4 = opt4.querySelector('.checkmark');
                                                                    if (checkmark4) checkmark4.style.display = 'none';
                                                                    updateInputValue();
                                                                    renderChips(itemDivs.filter(opt => opt.classList.contains('selected')));
                                                                    updateCounterBtn();
                                                                    if (chipListExpanded && chipListExpanded.style.display === 'flex') {
                                                                        chipListExpanded.innerHTML = '';
                                                                        const selectedNow4 = itemDivs.filter(opt => opt.classList.contains('selected'));
                                                                        selectedNow4.forEach(opt5 => {
                                                                            const text5 = opt5.querySelector('.item-wrapper').childNodes[0].textContent.trim();
                                                                            const chip5 = document.createElement('span');
                                                                            chip5.className = 'chip';
                                                                            chip5.innerHTML = `<span class=\"chip-label\">${text5}</span><button class=\"chip-remove\" tabindex=\"-1\" aria-label=\"Remove\"><img class=\"chip-remove-icon\" src=\"icons/x-close.svg\" alt=\"Remove\" width=\"12\" height=\"12\"></button>`;
                                                                            chip5.querySelector('.chip-remove').addEventListener('mousedown', (evt5) => {
                                                                                evt5.preventDefault();
                                                                                opt5.classList.remove('selected');
                                                                                const checkmark5 = opt5.querySelector('.checkmark');
                                                                                if (checkmark5) checkmark5.style.display = 'none';
                                                                                updateInputValue();
                                                                                renderChips(itemDivs.filter(opt => opt.classList.contains('selected')));
                                                                                updateCounterBtn();
                                                                                if (chipListExpanded && chipListExpanded.style.display === 'flex') {
                                                                                    chipListExpanded.innerHTML = '';
                                                                                    const selectedNow5 = itemDivs.filter(opt => opt.classList.contains('selected'));
                                                                                    selectedNow5.forEach(opt6 => {
                                                                                        const text6 = opt6.querySelector('.item-wrapper').childNodes[0].textContent.trim();
                                                                                        const chip6 = document.createElement('span');
                                                                                        chip6.className = 'chip';
                                                                                        chip6.innerHTML = `<span class=\"chip-label\">${text6}</span><button class=\"chip-remove\" tabindex=\"-1\" aria-label=\"Remove\"><img class=\"chip-remove-icon\" src=\"icons/x-close.svg\" alt=\"Remove\" width=\"12\" height=\"12\"></button>`;
                                                                                        chip6.querySelector('.chip-remove').addEventListener('mousedown', (evt6) => {
                                                                                            evt6.preventDefault();
                                                                                            opt6.classList.remove('selected');
                                                                                            const checkmark6 = opt6.querySelector('.checkmark');
                                                                                            if (checkmark6) checkmark6.style.display = 'none';
                                                                                            updateInputValue();
                                                                                            renderChips(itemDivs.filter(opt => opt.classList.contains('selected')));
                                                                                            updateCounterBtn();
                                                                                            if (chipListExpanded && chipListExpanded.style.display === 'flex') {
                                                                                                chipListExpanded.innerHTML = '';
                                                                                                const selectedNow6 = itemDivs.filter(opt => opt.classList.contains('selected'));
                                                                                                selectedNow6.forEach(opt7 => {
                                                                                                    const text7 = opt7.querySelector('.item-wrapper').childNodes[0].textContent.trim();
                                                                                                    const chip7 = document.createElement('span');
                                                                                                    chip7.className = 'chip';
                                                                                                    chip7.innerHTML = `<span class=\"chip-label\">${text7}</span><button class=\"chip-remove\" tabindex=\"-1\" aria-label=\"Remove\"><img class=\"chip-remove-icon\" src=\"icons/x-close.svg\" alt=\"Remove\" width=\"12\" height=\"12\"></button>`;
                                                                                                    chip7.querySelector('.chip-remove').addEventListener('mousedown', (evt7) => {
                                                                                                        evt7.preventDefault();
                                                                                                        opt7.classList.remove('selected');
                                                                                                        const checkmark7 = opt7.querySelector('.checkmark');
                                                                                                        if (checkmark7) checkmark7.style.display = 'none';
                                                                                                        updateInputValue();
                                                                                                        renderChips(itemDivs.filter(opt => opt.classList.contains('selected')));
                                                                                                        updateCounterBtn();
                                                                                                        if (chipListExpanded && chipListExpanded.style.display === 'flex') {
                                                                                                            chipListExpanded.innerHTML = '';
                                                                                                            // ... and so on ...
                                                                                                        }
                                                                                                    });
                                                                                                    chipListExpanded.appendChild(chip7);
                                                                                                });
                                                                                            }
                                                                                        });
                                                                                        chipListExpanded.appendChild(chip6);
                                                                                    });
                                                                                }
                                                                            });
                                                                            chipListExpanded.appendChild(chip5);
                                                                        });
                                                                    }
                                                                });
                                                                chipListExpanded.appendChild(chip4);
                                                            });
                                                        }
                                                    });
                                                    chipListExpanded.appendChild(chip3);
                                                });
                                            }
                                        });
                                        chipListExpanded.appendChild(chip2);
                                    });
                                }
                            });
                            chipListExpanded.appendChild(chip);
                        });
                    }
                }
            };
            function updateCounterBtn() {
                if (selected.length > maxChips) {
                    if (chipListExpanded && chipListExpanded.style.display === 'flex') {
                        chipCounterBtn.innerHTML = '<img src="icons/arrow-up.svg" alt="Collapse" width="14" height="14">';
                    } else {
                        chipCounterBtn.textContent = `+${selected.length - maxChips}`;
                    }
                    chipCounterBtn.style.display = 'flex';
                } else {
                    chipCounterBtn.style.display = 'none';
                    chipCounterBtn.textContent = '';
                }
            }
            updateCounterBtn();
        }
        if (selected.length === 0) {
            input.style.display = '';
            chipPlaceholder.style.display = 'none';
        } else {
            input.style.display = 'none';
            chipPlaceholder.style.display = 'none';
        }
    }

    function updateInputValue() {
        const selectedAll = itemDivs.filter(opt => opt.classList.contains('selected'));
        renderChips(selectedAll);
        if (selectedAll.length === 1) {
            const text = selectedAll[0].querySelector('.item-wrapper').childNodes[0].textContent.trim();
            input.value = text;
        } else if (selectedAll.length > 1) {
            input.value = `Selected (${selectedAll.length}/${itemDivs.length})`;
        } else {
            input.value = '';
        }
        if (clearAll) {
            clearAll.style.display = selectedAll.length > 0 ? '' : 'none';
        }
    }

    function openDropdown() {
        // Hide chip-list-expanded if open
        if (chipListExpanded && chipListExpanded.style.display === 'flex') {
            chipListExpanded.style.display = 'none';
            if (chipCounterBtn && chipCounterBtn.textContent === '') {
                chipCounterBtn.textContent = `+${itemDivs.filter(opt => opt.classList.contains('selected')).length - 2}`;
            }
        }
        list.classList.add('active');
        setChevron(false);
        isDropdownOpen = true;
        sortItems(); // Sort items when dropdown opens
        setTimeout(() => {
            if (filterInput) {
                filterInput.focus();
                // Update clear and add button visibility
                if (filterInput.value.trim()) {
                    if (clearBtn) clearBtn.style.display = '';
                    if (addBtn && shouldShowAddBtn(filterInput.value)) {
                        addBtn.style.display = '';
                    } else if (addBtn) {
                        addBtn.style.display = 'none';
                    }
                } else {
                    if (clearBtn) clearBtn.style.display = 'none';
                    if (addBtn) addBtn.style.display = 'none';
                }
            }
        }, 50);
    }

    function closeDropdown() {
        list.classList.remove('active');
        setChevron(true);
        isDropdownOpen = false;
        if (clearBtn) clearBtn.style.display = 'none';
    }

    input.addEventListener('focus', (e) => {
        if (!isDropdownOpen) {
            openDropdown();
        }
    });

    input.addEventListener('blur', (e) => {
        // Check if the focus is moving to the filter input or dropdown
        const relatedTarget = e.relatedTarget;
        if (relatedTarget && (relatedTarget.classList.contains('filter-input') || list.contains(relatedTarget))) {
            return; // Don't close if focus is moving within the dropdown
        }
        
        setTimeout(() => {
            if (!list.contains(document.activeElement)) {
                closeDropdown();
            }
        }, 100);
    });

    chevron.addEventListener('mousedown', (e) => {
        e.preventDefault();
        // Hide chip-list-expanded if open
        if (chipListExpanded && chipListExpanded.style.display === 'flex') {
            chipListExpanded.style.display = 'none';
            if (chipCounterBtn) {
                const selected = itemDivs.filter(opt => opt.classList.contains('selected'));
                if (selected.length > 2) {
                    chipCounterBtn.textContent = `+${selected.length - 2}`;
                } else {
                    chipCounterBtn.style.display = 'none';
                    chipCounterBtn.textContent = '';
                }
            }
        }
        if (isDropdownOpen) {
            closeDropdown();
        } else {
            openDropdown();
        }
    });

    function shouldShowAddBtn(value) {
        const term = value.toLowerCase().trim();
        if (!term) return false;
        // Check if any item matches the term (case-insensitive)
        return !itemDivs.some(item => item.querySelector('.item-wrapper').childNodes[0].textContent.toLowerCase() === term);
    }

    if (filterInput && addBtn && clearBtn) {
        filterInput.addEventListener('input', (e) => {
            filterItems(e.target.value);
            if (e.target.value.trim() && shouldShowAddBtn(e.target.value)) {
                addBtn.style.display = '';
            } else {
                addBtn.style.display = 'none';
            }
            if (e.target.value.trim()) {
                clearBtn.style.display = '';
            } else {
                clearBtn.style.display = 'none';
            }
        });

        clearBtn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            filterInput.value = '';
            filterItems('');
            clearBtn.style.display = 'none';
            addBtn.style.display = 'none';
        });

        addBtn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const value = filterInput.value.trim();
            if (!value) return;
            // Create new item div
            const newDiv = document.createElement('div');
            newDiv.innerHTML = `<div class=\"item-wrapper\">${value} <span class=\"checkmark\" style=\"display:inline-flex\"><img src=\"icons/checkmark.svg\" alt=\"Selected\" width=\"12\" height=\"12\"></span></div>`;
            newDiv.classList.add('selected');
            // Insert at the top (after filter-container, before all other items)
            const filterContainer = list.querySelector('.filter-container');
            list.insertBefore(newDiv, filterContainer.nextSibling);
            // Add to itemDivs array
            itemDivs.push(newDiv);
            // Add event listener for selection toggle
            newDiv.addEventListener('mousedown', (evt) => {
                evt.preventDefault();
                newDiv.classList.toggle('selected');
                const checkmark = newDiv.querySelector('.checkmark');
                if (checkmark) {
                    if (newDiv.classList.contains('selected')) {
                        checkmark.style.display = 'inline-flex';
                    } else {
                        checkmark.style.display = 'none';
                    }
                }
                updateInputValue();
                if (filterInput) {
                    filterInput.value = '';
                    filterItems('');
                    addBtn.style.display = 'none';
                    clearBtn.style.display = 'none';
                }
            });
            // Update input value and clear filter
            updateInputValue();
            filterInput.value = '';
            filterItems('');
            addBtn.style.display = 'none';
            clearBtn.style.display = 'none';
        });
    }

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
            // Clear filter input and reset filter after selection
            if (filterInput) {
                filterInput.value = '';
                filterItems('');
            }
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
            updateInputValue(); // <-- update chips, input, and clearAll visibility
            // Collapse expanded chip list if open
            if (chipListExpanded && chipListExpanded.style.display === 'flex') {
                chipListExpanded.style.display = 'none';
            }
            // Reset chip counter button
            if (chipCounterBtn) {
                chipCounterBtn.style.display = 'none';
                chipCounterBtn.textContent = '';
            }
            if (filterInput) {
                filterInput.value = '';
                filterItems('');
            }
        });
    }

    // Set initial display value
    const anySelected = itemDivs.some(opt => opt.classList.contains('selected'));
    renderChips(itemDivs.filter(opt => opt.classList.contains('selected')));
    if (clearAll) {
        clearAll.style.display = anySelected ? '' : 'none';
    }

    // Allow clicking on .combobox-container (except input, filter input, or add button) to toggle the dropdown
    const container = combobox.querySelector('.combobox-container');
    if (container) {
        container.addEventListener('mousedown', (e) => {
            const isInput = e.target === input;
            const isFilterInput = filterInput && e.target === filterInput;
            const isAddBtn = addBtn && (e.target === addBtn || addBtn.contains(e.target));
            const isChevron = chevron.contains(e.target);
            const isChipCounter = e.target.closest && e.target.closest('.chip-counter-btn');
            if (isChipCounter) return; // Prevent dropdown toggle when clicking counter
            if (!isInput && !isFilterInput && !isAddBtn && !isChevron) {
                e.preventDefault();
                if (isDropdownOpen) {
                    closeDropdown();
                } else {
                    openDropdown();
                }
            }
        });
    }

    // Restore document click handler to close dropdown when clicking outside, but do not affect chip-list-expanded
    document.addEventListener('mousedown', (event) => {
        if (!combobox.contains(event.target)) {
            closeDropdown();
        }
    });
}); 