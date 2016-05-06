// ==UserScript==
// @name         GitHub JIRA Issue Links
// @namespace    https://jchadwick.net/
// @version      0.1
// @description  Provide links back to JIRA issues from GitHub.
// @author       john
// @match        https://github.com/*
// @grant        none
// @require      https://ajax.googleapis.com/ajax/libs/jquery/2.2.3/jquery.js
// ==/UserScript==

(function() {
    var projects = [];
    var jiraroot = "";

    function hText(text) {
        return document.createTextNode(text);
    }

    function hElem(tag, attrs, children) {
        var e = document.createElement(tag);
        for (var key in attrs) e.setAttribute(key, attrs[key]);
        for (var i = 0; i < children.length; ++i) e.appendChild(children[i]);
        return e;
    }

    // Settings window
    var settingsModal = hElem("form", {class: "select-menu-modal-holder", style: "display: block; position: fixed; bottom: 10px; left: 20px;"}, [
        hElem("div", {class: "select-menu-modal"}, [
            hElem("div", {class: "select-menu-header"}, [
                hElem("span", {class: "select-menu-title"}, [hText("Set JIRA configuration")])
            ]),
            hElem("div", {class: "select-menu-list"}, [
                hElem("a", {class: "select-menu-item select-menu-action", style: "padding: 8px"}, [
                    hElem("div", {class: "select-menu-item-text"}, [
                        hText("Instance URL"), hElem("input", {type: "text", style: "margin-left: 5px", id: "jira-instance-url", placeholder: "https://xxx.atlassian.net"}, []),
                    ]),
                ]),
                hElem("a", {class: "select-menu-item select-menu-action", style: "padding: 8px"}, [
                    hElem("div", {class: "select-menu-item-text"}, [
                        hText("Project IDs"), hElem("input", {type: "text", style: "margin-left: 5px", id: "jira-projects", placeholder: "PBE PFE MAR"}, []),
                    ]),
                ]),
                hElem("a", {class: "select-menu-item select-menu-action", style: "padding: 8px"}, [
                    hElem("div", {class: "select-menu-item-text"}, [
                        hElem("input", {type: "submit", style: "margin-left: 5px", id: "submit", value: "Save"}, []),
                    ]),
                ]),
            ]),
        ])
    ]);

    // Change settings link
    var changeSettingsLink = hElem("li", {class: "header-nav-item"}, [
        hElem("a", {href: "", class: "header-nav-link"}, [hText("JIRA link")]),
    ]);

    function linkify(parent, node) {
        var i;
        if (node.nodeType == 3) {
            var issuelink = "<a class=\"jira-issue-link\" href=" + JSON.stringify(jiraroot + "/browse/$&") + ">$&</a>";
            for (i = 0; i < projects.length; i++) {
                var project = projects[i];
                var regexp = new RegExp(project + "-\\d+", 'i');

                if (node.textContent.search(regexp) === -1)
                    continue;

                var newnode = document.createElement('span');
                newnode.innerHTML = node.textContent.replace(regexp, issuelink);
                parent.replaceChild(newnode, node);
            }
        } else {
            // Do not linkify jira issue links.
            if (node.className === "jira-issue-link") {
                return;
            }
            for (i = 0; i < node.childNodes.length; i++) {
                linkify(node, node.childNodes[i]);
            }
        }
    }

    function linkifyRoot() {
        setTimeout(function() { linkify(null, document.body); }, 100);
    }

    function start() {
        settings = JSON.parse(localStorage.getItem("jira-settings"));

        projects = settings["projects"];
        jiraroot = settings["instance-url"];

        linkifyRoot();
        var observer = new MutationObserver(function(mutations) {
            linkifyRoot();
        });
        observer.observe(document.body, { childList: true, subtree: true });

        var menu = document.querySelector(".header-nav");
        menu.appendChild(changeSettingsLink);

        changeSettingsLink.onclick = function(e) {
            e.preventDefault();

            showSettings(function() { window.location.reload(); });

            return false;
        };
    }

    function showSettings(then) {
        // Get settings
        var settings = {"projects": [], "instance-url": ""};
        if (localStorage.getItem("jira-settings") !== null)
            settings = JSON.parse(localStorage.getItem("jira-settings"));

        // Show modal
        document.body.appendChild(settingsModal);
        document.querySelector("#jira-instance-url").value = settings["instance-url"];
        document.querySelector("#jira-projects").value = settings["projects"].join(" ");

        settingsModal.onsubmit = function(e) {
            e.preventDefault();

            var instanceUrl = document.querySelector("#jira-instance-url").value;
            var projects = document.querySelector("#jira-projects").value.split(" ");

            localStorage.setItem("jira-settings", JSON.stringify({
                "instance-url": instanceUrl,
                "projects": projects,
            }));

            document.body.removeChild(settingsModal);
            then();
        };
    }

    // Initial setup
    if (localStorage.getItem("jira-settings") === null)
        showSettings(start);
    else
        start();
})();
