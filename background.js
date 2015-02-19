
// Copyright © 2015, Jeremy Heiner (github.com/JHeiner).
// All rights reserved. See LICENSE file.

'use strict';

chrome.browserAction.onClicked.addListener( function( tab ) {
    chrome.tabs.create( { url: "view.html" } ); } );

