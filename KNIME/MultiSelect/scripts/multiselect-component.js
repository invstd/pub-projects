document.querySelectorAll('.multiselect').forEach((multiselect, idx) => {
    const input = multiselect.querySelector('input');
    const list = multiselect.querySelector('.multiselect-list');
    const chevron = multiselect.querySelector('.multiselect-chevron');
    const chevronImg = chevron.querySelector('img');
    const itemDivs = Array.from(list.querySelectorAll(':scope > div:not(.clear-all):not(.filter-container)'));
    const clearAll = list.querySelector('.clear-all');
    const filterInput = list.querySelector('.filter-input');
    const addBtn = multiselect.querySelector('.filter-add-btn');
    const clearBtn = multiselect.querySelector('.filter-clear-btn');

    let isDropdownOpen = false;

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

    function updateInputValue() {
        const selectedAll = itemDivs.filter(opt => opt.classList.contains('selected'));
        const selectedVisible = itemDivs.filter(opt => opt.classList.contains('selected') && opt.style.display !== 'none');
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
            input.value = '';
            clearAll.style.display = 'none';
            if (filterInput) {
                filterInput.value = '';
                filterItems('');
            }
        });
    }

    // Set initial display value
    const anySelected = itemDivs.some(opt => opt.classList.contains('selected'));
    if (clearAll) {
        clearAll.style.display = anySelected ? '' : 'none';
    }

    // Add document click listener to close dropdown when clicking outside
    document.addEventListener('mousedown', (event) => {
        if (!multiselect.contains(event.target)) {
            closeDropdown();
        }
    });

    // Allow clicking on .multiselect-container (except input, filter input, or add button) to toggle the dropdown
    const container = multiselect.querySelector('.multiselect-container');
    if (container) {
        container.addEventListener('mousedown', (e) => {
            const isInput = e.target === input;
            const isFilterInput = filterInput && e.target === filterInput;
            const isAddBtn = addBtn && (e.target === addBtn || addBtn.contains(e.target));
            const isChevron = chevron.contains(e.target);
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
}); 