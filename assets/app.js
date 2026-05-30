/* ============================================================
   Общий скрипт: навигация между темами, смена темы, кнопка "наверх".
   Источник истины о порядке тем — массив TOPICS ниже.
   Каждая страница задаёт в <body> атрибуты:
     data-page  = "notes" | "solutions" | "index"
     data-topic = идентификатор папки (например "PS6")
   ============================================================ */
(function () {
    "use strict";

    var TOPICS = [
        { id: "PS2",   folder: "PS2",   notes: "probability-rules-notes.html",      sol: "probability-rules-solutions.html",      label: "Тема 2",    title: "Probability Rules",            ru: "Правила вероятности" },
        { id: "PS3",   folder: "PS3",   notes: "random-variables-notes.html",       sol: "random-variables-solutions.html",       label: "Тема 3",    title: "Random Variables",             ru: "Случайные величины" },
        { id: "PS4",   folder: "PS4",   notes: "binomial-distribution-notes.html",  sol: "binomial-distribution-solutions.html",  label: "Тема 4",    title: "Binomial Distribution",        ru: "Биномиальное распределение" },
        { id: "PS5",   folder: "PS5",   notes: "poisson-distribution-notes.html",   sol: "poisson-distribution-solutions.html",   label: "Тема 5",    title: "Poisson Distribution",         ru: "Распределение Пуассона" },
        { id: "PS6",   folder: "PS6",   notes: "normal-distribution-notes.html",    sol: "normal-distribution-solutions.html",    label: "Тема 6",    title: "Normal Distribution",          ru: "Нормальное распределение" },
        { id: "PS7-8", folder: "PS7-8", notes: "clt-confidence-intervals-notes.html", sol: "clt-confidence-intervals-solutions.html", label: "Темы 7–8", title: "CLT & Confidence Intervals", ru: "ЦПТ и доверительные интервалы" },
        { id: "PS9",   folder: "PS9",   notes: "chi-squared-tests-notes.html",      sol: "chi-squared-tests-solutions.html",      label: "Тема 9",    title: "Chi-squared Tests",            ru: "Критерий хи-квадрат" },
        { id: "PS10",  folder: "PS10",  notes: "correlation-regression-notes.html", sol: "correlation-regression-solutions.html", label: "Тема 10",   title: "Correlation & Regression",     ru: "Корреляция и регрессия" }
    ];

    var THEME_KEY = "ps-theme";
    var root = document.documentElement;
    var body = document.body;
    var pageType = (body.getAttribute("data-page") || "").toLowerCase();
    var topicId = body.getAttribute("data-topic") || "";

    /* ---------- Тема ---------- */
    function currentTheme() {
        return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    }
    function applyTheme(t) {
        if (t === "dark") root.setAttribute("data-theme", "dark");
        else root.removeAttribute("data-theme");
        try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
        refreshThemeIcon();
    }
    function toggleTheme() {
        applyTheme(currentTheme() === "dark" ? "light" : "dark");
    }

    var SUN = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle class="sun-core" cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.5" y1="4.5" x2="6.6" y2="6.6"/><line x1="17.4" y1="17.4" x2="19.5" y2="19.5"/><line x1="4.5" y1="19.5" x2="6.6" y2="17.4"/><line x1="17.4" y1="6.6" x2="19.5" y2="4.5"/></svg>';
    var MOON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
    var UP = '<svg viewBox="0 0 24 24" aria-hidden="true"><line x1="12" y1="19" x2="12" y2="6"/><polyline points="6 12 12 6 18 12"/></svg>';

    var themeBtn, topBtn;
    function refreshThemeIcon() {
        if (!themeBtn) return;
        var dark = currentTheme() === "dark";
        themeBtn.innerHTML = dark ? SUN : MOON;
        themeBtn.setAttribute("aria-label", dark ? "Светлая тема" : "Тёмная тема");
        themeBtn.title = dark ? "Светлая тема" : "Тёмная тема";
    }

    /* ---------- Плавающие кнопки ---------- */
    function buildFab() {
        var fab = document.createElement("div");
        fab.className = "ps-fab";

        themeBtn = document.createElement("button");
        themeBtn.type = "button";
        themeBtn.className = "ps-fab-btn ps-theme";
        themeBtn.addEventListener("click", toggleTheme);

        topBtn = document.createElement("button");
        topBtn.type = "button";
        topBtn.className = "ps-fab-btn ps-top";
        topBtn.innerHTML = UP;
        topBtn.setAttribute("aria-label", "Наверх");
        topBtn.title = "Наверх";
        topBtn.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });

        fab.appendChild(themeBtn);
        fab.appendChild(topBtn);
        body.appendChild(fab);
        refreshThemeIcon();

        var onScroll = function () {
            if (window.pageYOffset > 300) topBtn.classList.add("show");
            else topBtn.classList.remove("show");
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
    }

    /* ---------- Навигация между темами ---------- */
    function indexOfTopic() {
        for (var i = 0; i < TOPICS.length; i++) {
            if (TOPICS[i].id === topicId) return i;
        }
        return -1;
    }

    function fileFor(topic) {
        return pageType === "solutions" ? topic.sol : topic.notes;
    }

    function makeNav(position) {
        var i = indexOfTopic();
        if (i < 0) return null;

        var nav = document.createElement("nav");
        nav.className = "ps-nav" + (position === "bottom" ? " bottom" : "");
        nav.setAttribute("aria-label", "Навигация по темам");

        // предыдущая
        if (i > 0) {
            nav.appendChild(navLink(TOPICS[i - 1], "ps-prev", "← Предыдущая"));
        } else {
            nav.appendChild(disabled());
        }

        // на главную
        var home = document.createElement("a");
        home.className = "ps-home";
        home.href = "../index.html";
        home.innerHTML = '<span class="ps-title">На главную</span>';
        nav.appendChild(home);

        // следующая
        if (i < TOPICS.length - 1) {
            nav.appendChild(navLink(TOPICS[i + 1], "ps-next", "Следующая →"));
        } else {
            nav.appendChild(disabled());
        }
        return nav;
    }

    function navLink(topic, cls, dirText) {
        var a = document.createElement("a");
        a.className = cls;
        a.href = "../" + topic.folder + "/" + fileFor(topic);
        a.innerHTML =
            '<span class="ps-dir">' + dirText + "</span>" +
            '<span class="ps-title">' + topic.label + " · " + topic.title + "</span>";
        return a;
    }

    function disabled() {
        var s = document.createElement("span");
        s.className = "disabled";
        return s;
    }

    function buildNav() {
        if (pageType !== "notes" && pageType !== "solutions") return;
        var main = document.querySelector("main");
        if (!main) return;
        var top = makeNav("top");
        if (top) main.insertBefore(top, main.firstChild);
        var bottom = makeNav("bottom");
        if (bottom) main.appendChild(bottom);
    }

    /* ---------- init ---------- */
    buildFab();
    buildNav();
})();
