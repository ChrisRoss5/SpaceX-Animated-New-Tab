"use strict";
document.addEventListener("DOMContentLoaded", () => {
    const recentlyClosed = document.getElementById("recently-closed");
    const video = document.querySelector("video");
    const videoSpeed = document.getElementById("video-speed");
    const shortcuts = document.querySelectorAll("#chrome-shortcuts > a");
    // Listeners
    recentlyClosed.onmouseover = () => (recentlyClosed.style.maxHeight = recentlyClosed.scrollHeight + "px");
    recentlyClosed.onmouseout = () => (recentlyClosed.style.maxHeight = "30px");
    shortcuts.forEach((a) => (a.onclick = () => chrome.tabs.update({ url: a.id })));
    window.onwheel = (e) => {
        const { playbackRate } = video;
        const faster = e.deltaY < 0;
        if (e.altKey || e.ctrlKey)
            return;
        let rate = 0.1;
        if ((playbackRate == 8 && faster) || playbackRate > 8)
            rate = 1;
        else if ((playbackRate == 2 && faster) || playbackRate > 2)
            rate = 0.5;
        const n = playbackRate + (faster ? rate : -rate);
        const speed = Math.min(Math.max(0, n), 16).toFixed(1);
        video.playbackRate = parseFloat(speed);
        videoSpeed.textContent = speed;
        videoSpeed.style.animation = "";
        videoSpeed.offsetWidth; // nosonar; Trigger reflow
        videoSpeed.style.animation = "show-video-speed 1500ms";
        chrome.storage.local.set({ playbackRate: parseFloat(speed) });
    };
    // Saved playback speed & recent tabs
    chrome.storage.local.get(["recentTabs", "playbackRate"], (result) => {
        if (![1, undefined].includes(result.playbackRate))
            video.playbackRate = videoSpeed.textContent = result.playbackRate;
        if (!result.recentTabs)
            return;
        result.recentTabs.forEach((tab) => {
            const newTab = document.createElement("a");
            const tabIcon = document.createElement("img");
            const tabText = document.createElement("div");
            newTab.href = tab.url || "(unknown)";
            tabIcon.src = tab.favIconUrl || "assets/new-tab.png";
            tabText.className = "tab-title";
            tabText.textContent = tab.title || "(unknown)";
            recentlyClosed.appendChild(newTab).append(tabIcon, tabText);
            infiniteTextScroll(tabText);
        });
    });
});
function infiniteTextScroll(el, toRight = true, timeout = 1000, n = 0) {
    setTimeout(() => {
        const scrollLeft = el.scrollLeft;
        // Increasing scrollLeft addition because different ratios discard small ones
        while (el.scrollLeft == scrollLeft && n++ < 10) {
            el.scrollLeft += toRight ? n : -n; // Addition rises to 10 until applied
            if (el.scrollWidth <= el.clientWidth || (!el.scrollLeft && !toRight))
                return infiniteTextScroll(el, true); // Left hit
            if (el.scrollWidth - el.clientWidth <= el.scrollLeft)
                return infiniteTextScroll(el, false); // Right hit
        }
        infiniteTextScroll(el, toRight, 25); // Continue scrolling
    }, timeout);
}
