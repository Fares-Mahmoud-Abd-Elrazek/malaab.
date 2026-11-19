document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#navbar .navbar-brand").style.color = "#fff";
    const links = Array.from(document.querySelectorAll("#navbar .navbar-nav .nav-link"));
    const sections = links
        .map((link) => document.querySelector(link.getAttribute("href")))
        .filter((section) => section !== null);

    const setActiveSection = (activeSectionId) => {
        links.forEach((link) => {
            const isActive = link.hash === `#${activeSectionId}`;
            link.classList.toggle("active", isActive);

            if (isActive) {
                link.setAttribute("aria-current", "location");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    };

    links.forEach((link) => {
        link.style.color = "#fff";
        link.addEventListener("mouseenter", () => {
            link.style.backgroundColor = "#04ff36";
        });
        link.addEventListener("mouseleave", () => {
            link.style.backgroundColor = "";
        });
        link.addEventListener("focus", () => {
            link.style.backgroundColor = "#04ff36";
        });
        link.addEventListener("blur", () => {
            link.style.backgroundColor = "";
        });
    });

    if (sections.length === 0) {
        return;
    }

    setActiveSection(sections[0].id);

    const updateActiveSection = () => {
        const activationLine = window.innerHeight * 0.4;
        let activeSection = sections[0];

        for (const section of sections) {
            if (section.getBoundingClientRect().top <= activationLine) {
                activeSection = section;
            } else {
                break;
            }
        }

        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1) {
            activeSection = sections[sections.length - 1];
        }

        setActiveSection(activeSection.id);
    };

    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    updateActiveSection();

    const filterForm = document.querySelector("#pitchFilterForm");
    if (filterForm) {
        const pitchCards = Array.from(document.querySelectorAll(".pitch-listing-card"));
        const maxPriceInput = filterForm.querySelector("#maxPitchPrice");
        const maxPriceLabel = filterForm.querySelector("#maxPitchPriceLabel");
        const areaFilter = filterForm.querySelector("#pitchAreaFilter");
        const emptyMessage = document.querySelector("#pitchListingEmpty");

        maxPriceInput.addEventListener("input", () => {
            maxPriceLabel.textContent = `EGP ${maxPriceInput.value}`;
        });

        filterForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const selectedSports = Array.from(
                filterForm.querySelectorAll('input[name="sport"]:checked')
            ).map((input) => input.value);
            const selectedArea = areaFilter.value;
            const maxPrice = Number(maxPriceInput.value);
            let visibleCount = 0;

            pitchCards.forEach((card) => {
                const matchesSport = selectedSports.length === 0 || selectedSports.includes(card.dataset.sport);
                const matchesArea = selectedArea === "all" || selectedArea === card.dataset.area;
                const matchesPrice = Number(card.dataset.price) <= maxPrice;
                card.hidden = !(matchesSport && matchesArea && matchesPrice);

                if (!card.hidden) {
                    visibleCount += 1;
                }
            });

            emptyMessage.hidden = visibleCount > 0;
        });
    }

    const bookingForm = document.querySelector("#bookingForm");
    if (!bookingForm) {
        return;
    }

    const bookingDate = bookingForm.querySelector("#bookingDate");
    const durationSelect = bookingForm.querySelector("#bookingDuration");
    const rateText = bookingForm.querySelector("#bookingRateText");
    const subtotalText = bookingForm.querySelector("#bookingSubtotal");
    const totalText = bookingForm.querySelector("#bookingTotal");
    const bookingStatus = bookingForm.querySelector("#bookingStatus");
    const pitchBreadcrumb = document.querySelector("#pitchBreadcrumb");
    const pitchDiagram = document.querySelector("#pitchDiagram");
    const pitchDetailTitle = document.querySelector("#pitchDetailTitle");
    const pitchDetailMeta = document.querySelector("#pitchDetailMeta");
    const pitchDetailFeatures = document.querySelector("#pitchDetailFeatures");
    const pitchDetailDescription = document.querySelector("#pitchDetailDescription");
    const bookingSection = document.querySelector("#bookings");
    let hourlyRate = Number(bookingForm.dataset.hourlyRate);
    const timeSlots = Array.from(bookingForm.querySelectorAll(".time-slot:not(:disabled)"));
    let selectedTime = bookingForm.querySelector(".time-slot.is-selected");

    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    bookingDate.min = today.toISOString().slice(0, 10);

    const updateBookingTotal = () => {
        const hours = Number(durationSelect.value);
        const total = hourlyRate * hours;
        rateText.textContent = `EGP ${hourlyRate} × ${hours} ${hours === 1 ? "hour" : "hours"}`;
        subtotalText.textContent = `EGP ${total}`;
        totalText.textContent = `EGP ${total}`;
    };

    timeSlots.forEach((timeSlot) => {
        timeSlot.addEventListener("click", () => {
            selectedTime = timeSlot;
            timeSlots.forEach((slot) => {
                const isSelected = slot === selectedTime;
                slot.classList.toggle("is-selected", isSelected);
                slot.setAttribute("aria-pressed", String(isSelected));
            });
            bookingStatus.textContent = "";
        });
    });

    durationSelect.addEventListener("change", updateBookingTotal);
    updateBookingTotal();

    document.querySelectorAll("[data-select-pitch]").forEach((button) => {
        button.addEventListener("click", () => {
            const { pitchName, pitchArea, pitchSport, pitchPrice, pitchFeatures, pitchDescription } = button.dataset;
            pitchBreadcrumb.textContent = `Pitches / ${pitchName}`;
            pitchDiagram.setAttribute("aria-label", `Court layout for ${pitchName}`);
            pitchDetailTitle.textContent = pitchName;
            pitchDetailMeta.textContent = `${pitchArea} · ${pitchSport}`;
            pitchDetailDescription.textContent = pitchDescription;
            pitchDetailFeatures.replaceChildren(
                ...pitchFeatures.split(",").map((feature) => {
                    const item = document.createElement("li");
                    item.textContent = feature.trim();
                    return item;
                })
            );
            hourlyRate = Number(pitchPrice);
            bookingForm.dataset.hourlyRate = String(hourlyRate);
            bookingStatus.textContent = "";
            updateBookingTotal();
            bookingSection.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });

    bookingForm.addEventListener("submit", (event) => {
        event.preventDefault();
        bookingStatus.textContent = selectedTime
            ? "Demo only — no booking has been submitted."
            : "Choose an available time slot.";
    });
});