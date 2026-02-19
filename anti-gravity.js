/**
 * AntiGravity Shim
 * Smooth scroll orchestration using Lenis + GSAP ScrollTrigger
 */

const AntiGravity = {
    lenis: null,

    init(options = {}) {
        console.log("AntiGravity initialized:", options);

        if (options.smoothScroll) {
            this.initSmoothScroll();
        }
    },

    initSmoothScroll() {
        if (typeof Lenis === "undefined") {
            console.warn("AntiGravity: Lenis not loaded. Falling back to native scroll.");
            return;
        }

        this.lenis = new Lenis({
            lerp: 0.08,
            smooth: true
        });

        // Sync Lenis with ScrollTrigger
        this.lenis.on("scroll", ScrollTrigger.update);

        gsap.ticker.add((time) => {
            this.lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);

        // IMPORTANT: tell ScrollTrigger to use Lenis
        ScrollTrigger.scrollerProxy(document.body, {
            scrollTop: (value) => {
                return arguments.length
                    ? this.lenis.scrollTo(value, { immediate: true })
                    : this.lenis.scroll;
            },
            getBoundingClientRect: () => ({
                top: 0,
                left: 0,
                width: window.innerWidth,
                height: window.innerHeight
            }),
            pinType: document.body.style.transform ? "transform" : "fixed"
        });

        ScrollTrigger.refresh();

        console.log("AntiGravity smooth scrolling ready");
    }
};
