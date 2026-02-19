// ===== DEBUG SETUP =====
const debugEl = document.getElementById("debug-console");
function log(msg, isError = false) {
    if (debugEl) {
        debugEl.innerHTML += `<div style="color: ${isError ? 'red' : 'lime'}; border-bottom: 1px solid #333;">${msg}</div>`;
        debugEl.scrollTop = debugEl.scrollHeight;
    }
    if (isError) console.error(msg);
    else console.log(msg);
}

log("Main.js started...");

// ===== LOADING SCREEN LOGIC =====
function hideLoader() {
    const loader = document.getElementById("loading-screen");
    if (loader) {
        gsap.to(loader, {
            opacity: 0,
            duration: 1,
            ease: "power2.inOut",
            onComplete: () => {
                if (loader.parentNode) loader.parentNode.removeChild(loader);
                // Show Scroll Instruction
                gsap.to(".scroll-instruction", { opacity: 1, duration: 1 });
            }
        });
    }
}

// ===== DISABLE RIGHT CLICK =====
document.addEventListener('contextmenu', event => event.preventDefault());

// Fade out instruction on scroll
window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
        gsap.to(".scroll-instruction", { opacity: 0, duration: 0.5, overwrite: true });
    } else {
        gsap.to(".scroll-instruction", { opacity: 1, duration: 0.5, overwrite: true });
    }
});

// ===== DEPENDENCY CHECK =====
if (typeof gsap === "undefined") log("CRITICAL ERROR: GSAP is not loaded! Check internet or script tags.", true);
if (typeof ScrollTrigger === "undefined") log("CRITICAL ERROR: ScrollTrigger is not loaded!", true);

try {
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'auto'; // Ensure browser tries to restore position
    }

    // ===== CONFIG & STATE (Define FIRST to avoid TDZ errors) =====
    const frameCount = 2100;
    const sequence = { frame: 0 };
    const images = [];

    // ===== GSAP SETUP =====
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
        gsap.registerPlugin(ScrollTrigger, Observer, ScrollToPlugin);
        // log("GSAP Registered");
    }

    // ... (rest of AntiGravity Init) ...

    // ... (Canvas Setup, Labels Setup, etc. - keep existing code) ...
    // NOTE: I am not including the entire file, just the parts that need to change or are context. 
    // But since I need to insert the Observer logic effectively, I'll place it after the introMaster definition.

    // ... (renderFrame, resizeCanvas, etc.) ...



    // ... (rest of the file: Images loop, additional animations, load event) ...

    // ===== ANTI-GRAVITY INIT =====
    if (typeof AntiGravity !== "undefined") {
        AntiGravity.init({
            smoothScroll: true,
            debug: true
        });
        // log("AntiGravity Initialized");
    } else {
        // log("WARNING: AntiGravity object missing. Check anti-gravity.js loading.", true);
    }

    // ===== CANVAS SETUP =====
    const canvas = document.getElementById("bigbang-canvas");
    if (!canvas) throw new Error("Canvas element not found");
    const ctx = canvas.getContext("2d");



    // Define renderFrame early so it can be used
    function renderFrame() {
        const index = Math.round(sequence.frame);




        // Safety checks
        if (!images) return;
        if (index < 0 || index >= images.length) return;

        const img = images[index];
        if (!img || !img.complete || img.naturalWidth === 0) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
        const x = canvas.width / 2 - (img.width * scale) / 2;
        const y = canvas.height / 2 - (img.height * scale) / 2;

        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    }

    function resizeCanvas() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        renderFrame();
    }

    // Resize immediately
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // ----- MASTER TIMELINE (SETUP FIRST) -----
    // We set this up EARLY so pinning works even if images load slow
    // log("Setting up Timeline...");

    // ----- MASTER TIMELINE & RESPONSIVE LOGIC -----
    // We use matchMedia to handle different behaviors for Desktop vs Mobile
    const mm = gsap.matchMedia();

    // Context: DESKTOP & TABLET (min-width: 768px)
    mm.add("(min-width: 768px)", () => {
        // log("Desktop/Tablet Context Active");

        // 1. Setup Master Timeline
        const introMaster = gsap.timeline({
            scrollTrigger: {
                trigger: ".intro",
                start: "top top",
                end: "+=800%", // Longer scroll distance for smooth animation
                scrub: 0.5,
                pin: true,
                anticipatePin: 1
            }
        });

        // --- PHASE 1: TEXT ANIMATION (0 to 2) ---
        introMaster.fromTo(".title", { yPercent: 120, skewY: 6, opacity: 0 }, { yPercent: 0, skewY: 0, opacity: 1, duration: 1, ease: "power4.out" }, 0);
        introMaster.fromTo(".subtitle", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }, 0.2);

        // Text Fades Out
        introMaster.to(".intro-content", { opacity: 0, scale: 1.1, duration: 1, ease: "power2.in" }, 1.5);

        // --- PHASE 2: BIG BANG SEQUENCE (Starts at 2.5) ---
        const sequenceStart = 2.5;
        const sequenceDuration = 8;

        introMaster.to(sequence, {
            frame: frameCount - 1,
            ease: "none",
            onUpdate: renderFrame,
            duration: sequenceDuration
        }, sequenceStart);

        // Sync Background & Orb
        introMaster.fromTo(".intro-bg", { scale: 1.3, y: 0 }, { scale: 1.1, y: -120, ease: "none", duration: sequenceDuration }, sequenceStart);
        introMaster.to(".light-orb", { x: -120, y: -80, scale: 1.2, ease: "none", duration: sequenceDuration }, sequenceStart);

        // --- HOLD BUFFER (Micro-buffer to prevent scroll leak) ---
        // We add a tiny buffer to keep the pin active just long enough for the Observer to catch the end state
        introMaster.to({}, { duration: 0.1 });


        // --- OBSERVER REMOVED for Normal Navigation ---
        // The specific request is to allow "normal" scrolling after the animation.
        // Since ScrollTrigger automatically unpins the section when the timeline ends,
        // the user simply scrolls down and the next section appears naturally.

        // We keep the micro-buffer just to ensure the last frame hits solidly before unpinning.



        return () => {
            // Optional cleanup if needed
            // log("Desktop Context Cleanup");
        };
    });

    // Context: MOBILE (max-width: 767px)
    mm.add("(max-width: 767px)", () => {
        // log("Mobile Context Active");

        // Simple Timeline for Mobile - No Observer Hijacking
        const introMaster = gsap.timeline({
            scrollTrigger: {
                trigger: ".intro",
                start: "top top",
                end: "+=600%", // Slightly shorter for mobile
                scrub: 0.5,
                pin: true,
                anticipatePin: 1
            }
        });

        introMaster.fromTo(".title", { yPercent: 120, skewY: 6, opacity: 0 }, { yPercent: 0, skewY: 0, opacity: 1, duration: 1, ease: "power4.out" }, 0);
        introMaster.fromTo(".subtitle", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }, 0.2);
        introMaster.to(".intro-content", { opacity: 0, scale: 1.1, duration: 1, ease: "power2.in" }, 1.5);

        const sequenceStart = 2.5;
        const sequenceDuration = 8;

        introMaster.to(sequence, {
            frame: frameCount - 1,
            ease: "none",
            onUpdate: renderFrame,
            duration: sequenceDuration
        }, sequenceStart);

        introMaster.fromTo(".intro-bg", { scale: 1.3, y: 0 }, { scale: 1.1, y: -120, ease: "none", duration: sequenceDuration }, sequenceStart);
        introMaster.to(".light-orb", { x: -120, y: -80, scale: 1.2, ease: "none", duration: sequenceDuration }, sequenceStart);

        return () => {
            // Cleanup
        };
    });

    // ----- IMAGE SEQUENCE LOADING -----
    const framePath = (i) => `assets/bigbang/ezgif-frame-${String(i).padStart(3, "0")}.jpg`;
    let loadedCount = 0;

    // log("Starting Image Load Loop...");

    for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        img.src = framePath(i);

        img.onload = () => {
            loadedCount++;

            // Sync Fix: If this image is the one we currently need, render it immediately!
            // This handles the case where the user reloads at a specific scroll position.
            if (Math.round(sequence.frame) === i - 1) { // i is 1-based, sequence is 0-based index
                renderFrame();
            }

            if (i === 1) {
                // Always try to render first frame initially as fallback
                renderFrame();
            }

            if (loadedCount === frameCount) {
                log(`All ${frameCount} frames loaded.`);
                // Force resize and refresh to sync animation with scroll position
                resizeCanvas();
                ScrollTrigger.refresh();
                hideLoader();
            }
        };

        img.onerror = () => {
            // Only log the first error to avoid flooding
            if (loadedCount === 0) log(`Error loading frame ${i}: ${img.src}`, true);

            // Prevent loader from hanging if a frame fails
            loadedCount++;
            if (loadedCount === frameCount) {
                log(`Frames loaded (with errors).`);
                hideLoader();
            }
        };

        images.push(img);
    }

    // Additional animations
    gsap.to(".light-orb", { y: "+=40", duration: 6, repeat: -1, yoyo: true, ease: "sine.inOut" });

    gsap.from(".authority h2", {
        scrollTrigger: { trigger: ".authority", start: "top 80%", end: "bottom 20%", toggleActions: "play reverse play reverse" },
        opacity: 0, y: 50, duration: 1, ease: "power2.out"
    });

    gsap.from(".prediction h2", {
        scrollTrigger: { trigger: ".prediction", start: "top center", toggleActions: "play none none reverse" },
        scale: 0.5, opacity: 0, duration: 1.5, ease: "elastic.out(1, 0.3)"
    });


    // ===== DYNAMIC PLANET LABELS =====
    const planetData = [
        { name: "Sun", quote: "Soul • Power • Authority", frame: 550, duration: 250 },
        { name: "Moon", quote: "Mind • Emotion • Comfort", frame: 880, duration: 100 },
        { name: "Mars", quote: "Energy • Action • Courage", frame: 1090, duration: 150 },
        { name: "Jupiter", quote: "Wisdom • Growth • abundance", frame: 1332, duration: 150 },
        { name: "Venus", quote: "Love • Beauty • Luxury", frame: 1580, duration: 150 },
        { name: "Saturn", quote: "Karma • Discipline • Time", frame: 1800, duration: 100 },
        { name: "Mercury", quote: "Intellect • Speech • Logic", frame: 2068, duration: 100 }
    ];

    let activeLabel = null;
    const labelsContainer = document.getElementById("labels-container");

    // Function to analyze canvas and confirm best position (Simulated/Lightweight)
    // We check 4 key points to find the DARKEST area to place white text
    function getBestLabelPosition(ctx) {
        if (!ctx) return { x: "50%", y: "85%" }; // Default bottom-center

        const w = ctx.canvas.width;
        const h = ctx.canvas.height;
        const sampleSize = 20; // 20x20 pixel sample

        // Define candidate positions (Top-Left, Top-Right, Bottom-Left, Bottom-Right)
        // We avoid strict center where explosion usually is
        const candidates = [
            { id: "tl", x: w * 0.2, y: h * 0.2, brightness: 0 },
            { id: "tr", x: w * 0.8, y: h * 0.2, brightness: 0 },
            { id: "bl", x: w * 0.2, y: h * 0.8, brightness: 0 },
            { id: "br", x: w * 0.8, y: h * 0.8, brightness: 0 }
        ];

        // Sample brightness
        try {
            candidates.forEach(pos => {
                const imageData = ctx.getImageData(pos.x, pos.y, sampleSize, sampleSize);
                let totalBright = 0;
                for (let i = 0; i < imageData.data.length; i += 4) {
                    // Simple luminance: 0.299R + 0.587G + 0.114B
                    totalBright += (0.299 * imageData.data[i] + 0.587 * imageData.data[i + 1] + 0.114 * imageData.data[i + 2]);
                }
                pos.brightness = totalBright / (imageData.data.length / 4);
            });

            // Find dark spots (lowest brightness)
            candidates.sort((a, b) => a.brightness - b.brightness);
            // Pick the darkest one
            const best = candidates[0];

            // Map candidate ID to CSS position
            const cssPos = {
                "tl": { top: "20%", left: "20%", transform: "translate(-50%, -50%)", textAlign: "left" },
                "tr": { top: "20%", left: "80%", transform: "translate(-50%, -50%)", textAlign: "right" },
                "bl": { top: "80%", left: "20%", transform: "translate(-50%, -50%)", textAlign: "left" },
                "br": { top: "80%", left: "80%", transform: "translate(-50%, -50%)", textAlign: "right" }
            };
            return cssPos[best.id];

        } catch (e) {
            // Context read error (tainted canvas?) -> Fallback
            return { top: "85%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" };
        }
    }

    // Hook into GSAP Ticker to check frames
    // We use ticker instead of onUpdate to decouple it slightly and handle entering/exiting cleanly
    gsap.ticker.add(() => {
        const currentFrame = Math.round(sequence.frame);

        // Find if we should show a planet
        const currentPlanet = planetData.find(p => currentFrame >= p.frame && currentFrame < (p.frame + p.duration));

        if (currentPlanet && activeLabel !== currentPlanet.name) {
            // NEW PLANET START
            // Force clean any existing label first (prevents overlapping)
            labelsContainer.innerHTML = '';

            const label = document.createElement("div");
            label.className = "planet-label";

            // Allow HTML for structure (Name + Quote)
            label.innerHTML = `<span class="p-name">${currentPlanet.name}</span><div class="p-quote">${currentPlanet.quote}</div>`;

            labelsContainer.appendChild(label);

            // Position dynamically
            if (ctx) {
                const pos = getBestLabelPosition(ctx);
                Object.assign(label.style, pos);
            }

            // Animate In
            gsap.fromTo(label,
                { opacity: 0, scale: 0.9, filter: "blur(5px)" },
                { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1, ease: "power2.out" }
            );

            // Add underline effect
            setTimeout(() => label.classList.add("active"), 100);

            activeLabel = currentPlanet.name;

        } else if (!currentPlanet && activeLabel) {
            // PLANET END - Only if NO planet is active
            const label = labelsContainer.querySelector(".planet-label");
            if (label) {
                // Check if we are about to transition to another planet immediately?
                // The loop handles "activeLabel !== currentPlanet.name" above for switches.
                // This block is only for "Gap" periods.
                gsap.to(label, {
                    opacity: 0, scale: 1.1, filter: "blur(10px)", duration: 0.5, onComplete: () => {
                        if (labelsContainer.contains(label)) labelsContainer.removeChild(label);
                    }
                });
            }
            activeLabel = null;
        }
    });




} catch (err) {
    log(`MAIN CRASH: ${err.message}`, true);
    console.error(err);
}


// page 2 cotent 

gsap.registerPlugin(ScrollTrigger);

async function initAnimation() {
    console.log("initAnimation: STARTING...");

    // Scroll Lock State
    let scrollLocked = false;
    window.addEventListener("wheel", (e) => {
        if (scrollLocked && e.deltaY > 0) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, { passive: false, capture: true });

    // Inject Scroll Instruction for Page 2
    const scrollHint = document.createElement("div");
    scrollHint.className = "page2-scroll-instruction";
    scrollHint.innerHTML = "-->  THE END  <--";
    const introWrapper = document.querySelector('.intro-wrapper');
    if (introWrapper) introWrapper.appendChild(scrollHint);
    // Fetch and inject "Consult Now" SVG
    try {
        const response = await fetch(`Consult Now Handwriting.svg?t=${Date.now()}`);
        let svgText = await response.text();
        // Aggressively strip styles and potential fill/stroke attributes
        svgText = svgText.replace(/style="[^"]*"/g, "")
            .replace(/fill="[^"]*"/g, "")
            .replace(/stroke="[^"]*"/g, "");

        // Wrap in Anchor Tag for WhatsApp
        // We inject the SVG, then the arrow/instruction wrapped in the link.
        // CLEANUP: Reverted to simple structure. Link is on the Arrow/Instruction.
        const contentHTML = `
            ${svgText}
            <div class="consult-extra-wrapper">
                <a href="https://wa.me/9347423987" target="_blank" style="text-decoration: none; cursor: pointer; display: block; color: inherit;">
                    <div class="consult-arrow"></div>
                    <div class="consult-instruction">Click arrow for consulting</div>
                </a>
            </div>
        `;
        document.querySelector('.consult-container').innerHTML = contentHTML;
    } catch (e) {
        console.error("Could not load Consult Now SVG", e);
    }

    // Fetch and inject "Patience" SVG
    try {
        // Use URL encoding + Cache Busting
        const response = await fetch(`Patience%20Creates%20Unshakable%20Power.svg?t=${Date.now()}`);
        const svgText = await response.text();
        document.querySelector('.quote-container').innerHTML = svgText;
    } catch (e) {
        console.error("Could not load Patience SVG", e);
    }

    const paths = document.querySelectorAll('#svg-container path');
    const curtain = document.querySelector('.svg-curtain');

    // Select the new paths we just injected
    const consultPaths = document.querySelectorAll('.consult-container path');
    const quotePaths = document.querySelectorAll('.quote-container path');

    // 1. Initial Setup
    // Setup Main Face paths
    paths.forEach(path => {
        const length = path.getTotalLength();
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;
    });

    // Setup Consult Now paths
    consultPaths.forEach(path => {
        const length = path.getTotalLength();
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;
        path.style.opacity = 0; // Hidden initially
        // Force Gold via JS to ensure visibility
        path.style.fill = "none";
        path.style.stroke = "#D4AF37";
        path.style.strokeWidth = "3px";
    });

    // Setup Patience Quote paths
    quotePaths.forEach(path => {
        const length = path.getTotalLength();
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;
        path.style.opacity = 0; // Hidden initially
    });

    // Ensure curtain starts fully covering (compatible with polygon animation)
    gsap.set(curtain, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" });

    const scrollTrack = document.querySelector(".page2-scroll-track");
    if (!scrollTrack) console.error("CRITICAL: .page2-scroll-track NOT FOUND!");
    else console.log("Scroll Track found, height:", scrollTrack.offsetHeight);

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: ".page2-scroll-track", // Use the dummy track
            start: "top top",
            end: "bottom bottom", // Animate over the full track height
            scrub: 1,
            pin: false, // Don't pin the track (it's part of flow)
            // anticipatePin: 1 // Removed
        }
    });

    // 2. Draw the SVG Paths
    tl.to(paths, {
        strokeDashoffset: 0,
        duration: 3,
        stagger: { amount: 2 },
        ease: "power1.inOut"
    });

    // 3. The Curtain Lift (Diagonal Reveal: Bottom-Right to Top-Left)
    // We animate the clip-path from a full coverage to a top-left corner point
    tl.to(curtain, {
        clipPath: "polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)",
        duration: 2,
        ease: "power2.inOut"
    }, "+=0.2"); // Small pause after drawing finishes

    // 4. Zoom the Entire Container (Image + SVG)
    // Scales both so alignment remains perfect
    tl.to("#svg-container", {
        scale: 1.5,
        duration: 2,
        ease: "power1.out"
    }, ">"); // Starts after curtain reveal

    // 5. Horizontal Move (Push Left)
    tl.to("#svg-container", {
        xPercent: 80,
        duration: 4, // "Slowly push" -> longer duration relative to others
        ease: "none" // Linear movement usually feels better for scroll-driven position changes
    }, ">"); // Starts after zoom

    // Flag to control tilt activation
    let isTiltEnabled = false;

    // 5.5 Draw "Patience Creates Unshakable Power" Quote
    // Animates BEFORE Consult Now, centered
    console.log("Animating Quote paths:", quotePaths.length);
    tl.to(quotePaths, {
        strokeDashoffset: 0,
        autoAlpha: 1, // Reveal opacity as we draw
        duration: 4, // Slower for emphasis (User requested to feel the time)
        stagger: { amount: 1 },
        ease: "power1.inOut"
    }, ">"); // Sequential: Starts strictly AFTER the horizontal move finishes

    // 6. Draw "Consult Now" SVG
    // Animates AFTER the Quote finishes
    console.log("Animating Consult Now paths:", consultPaths.length);
    tl.to(consultPaths, {
        strokeDashoffset: 0,
        autoAlpha: 1, // Reveal opacity as we draw
        duration: 3,
        stagger: { amount: 1 },
        ease: "power1.inOut",
        onComplete: () => {
            isTiltEnabled = true; // Enable tilt only after drawing finishes
            console.log("Tilt enabled");
        },
        onReverseComplete: () => {
            isTiltEnabled = false; // Disable if scrolling back up
        }
    }, ">"); // Starts after Quote finishes

    // 7. Reveal Arrow and Instruction
    // Animates AFTER the Consult Now text finishes
    // STOP at 80% opacity as per user request to ensure clickability
    tl.to(".consult-extra-wrapper", {
        autoAlpha: 0.9,
        duration: 1,
        ease: "power2.out"
    }, ">");

    // 8. Buffer to keep it visible for longer scroll distance (Reduced to 3.5s)
    tl.to({}, { duration: 5 });

    tl.to(".page2-scroll-instruction", {
        opacity: 1,
        duration: 1,
        ease: "power2.out",
        onStart: () => {
            scrollLocked = true;
        },
        onReverseComplete: () => {
            scrollLocked = false;
        }
    }, "<+2.5"); // Start fading in during the buffer

    // Mouse Move Listener for 3D Tilt (Applies to the entire container for cohesive movement)
    window.addEventListener("mousemove", (e) => {
        if (!isTiltEnabled) return;

        const x = (e.clientX / window.innerWidth - 0.5) * 20; // -10 to 10 degrees
        const y = (e.clientY / window.innerHeight - 0.5) * 20;

        // Target the consult container (Text + Arrow)
        gsap.to(".consult-container", {
            rotationY: x,
            rotationX: -y,
            duration: 0.5,
            ease: "power1.out"
        });
    });
}

// Robust Resize on Load to prevent cutting
window.addEventListener('load', () => {
    initAnimation();
    // Force one more check after everything (including CSS) is settled
    setTimeout(() => {
        if (typeof resizeCanvas === 'function') resizeCanvas();
        ScrollTrigger.refresh();
    }, 100);
});

// Ensure GSAP plugins are registered
gsap.registerPlugin(ScrollTrigger);

// 1. First Gallery (Images) - Simple Horizontal Scroll
const imageGalleryWrapper = document.querySelector(".gallery-wrapper.image-gallery");
if (imageGalleryWrapper) {
    const content = imageGalleryWrapper.querySelector(".gallery-content");

    function getScrollAmount() {
        let contentWidth = content.scrollWidth;
        let viewportWidth = imageGalleryWrapper.offsetWidth;
        return -(contentWidth - viewportWidth);
    }

    const scrollAmount = getScrollAmount();

    gsap.to(content, {
        x: () => -content.scrollWidth, // Move completely off-screen left
        ease: "none",
        scrollTrigger: {
            trigger: imageGalleryWrapper,
            start: "top top",
            end: () => "+=" + content.scrollWidth, // Use full width for duration
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true
        }
    });
}

// 2. Second Gallery (Letters) - Integrated Cinematic Reveal
const letterGalleryWrapper = document.querySelector(".gallery-wrapper.letter-gallery");
if (letterGalleryWrapper) {
    const stage = letterGalleryWrapper.querySelector(".gallery-3d-stage");
    const content = letterGalleryWrapper.querySelector(".gallery-content");
    const overlay = letterGalleryWrapper.querySelector(".intro-image-overlay");

    // Calculate horizontal scroll needed for letters
    function getLetterScrollAmount() {
        let contentWidth = content.scrollWidth;
        let viewportWidth = letterGalleryWrapper.offsetWidth;
        return -(contentWidth - viewportWidth);
    }

    const letterScrollAmount = getLetterScrollAmount();

    // Timeline for Letter Gallery
    const letterTl = gsap.timeline({
        scrollTrigger: {
            trigger: letterGalleryWrapper,
            start: "top top",
            end: () => "+=" + (Math.abs(letterScrollAmount) + 1000), // Further reduced buffer
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true
        }
    });

    // Step 1: Horizontal Scroll of Letters (Enter from Right - Mostly Visible)
    letterTl.fromTo(content, {
        x: () => window.innerWidth * 0.15 // Start mostly on-screen
    }, {
        x: letterScrollAmount, // End at normal scroll position
        ease: "none",
        duration: 1
    });

    // Step 2: The Hinge Flip (Letters Fall, Image Stands Up)
    letterTl.to(stage, {
        rotateX: 90,
        transformOrigin: "bottom center",
        duration: 2,
        ease: "power2.inOut"
    });

    // Step 3: Zoom In (To Fill Screen with the Image)
    letterTl.to(stage, {
        z: 500, // Move closer
        y: "0%", // Ensure centered
        duration: 2,
        ease: "power1.inOut"
    });
}
