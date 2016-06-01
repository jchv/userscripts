// ==UserScript==
// @name         JIRA Click to Issue
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Force issues to open full-page.
// @author       John
// @match        https://benzinga.atlassian.net/*
// @grant        none
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.js
// ==/UserScript==

(function() {
    $(document).on("click", ".js-key-link", function (e) {
        window.location.href = this.href;
        return false;
    });
})();
