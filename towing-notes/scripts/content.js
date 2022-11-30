// Copyright 2022 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// primaryTabs are visible during View, Release, Edit
const primaryTabs = document.querySelector(".primary-tabs");
console.log('towing-notes active')
// `document.querySelector` may return null if the selector doesn't match anything.
if (primaryTabs) {
  
  const activeTabText = primaryTabs.querySelector('.active').textContent;
  
  // change style if on 'View'
  if(activeTabText == 'View(active tab)' || activeTabText == 'Release(active tab)'){
    // apply css style
    document.querySelector(".field-type-image").classList.add("rts-images");
    console.log('adding style class to div');
    
  }
  
  if(activeTabText == 'View(active tab)'){
    buildNote();
    // move images to bottom of table
    let imageRow = document.querySelector('#vehicle_information').querySelector('table tr:nth-child(1)');
    let imageParent = imageRow.parentNode;
    imageParent.insertBefore(imageRow, imageParent.lastChild);
  }
  
} else {
  console.log('no primary tabs');
}

function getRtsKey(key){
  chrome.storage.local.get([ key ], function(result) {
    console.log('Value currently is ' + result.key);
  });
}
function setRtsKey(key, value){
  chrome.storage.local.set({key: value}, function() {
    console.log('Value is set to ' + value);
  });
}

function fetchValue(id, tr, child){
  let value = null;
  value = document.querySelector('#'+id).querySelector('table tr:nth-child('+tr+') td:nth-child('+child+')').textContent;
  return value;
}

function prepTime(time){
  var newTime = time.replace(/[@]/g, '').replace(/  +/g, ' ');
  return newTime + ':00';
}

function calcDiff(notice, towTime){
  let diff = Math.abs(new Date(towTime) - new Date(notice));
  let minutes = Math.floor((diff/1000)/60);
  return minutes;
}

function buildNote(){
  // Get Towing Description Items ID = #towing_description
    // Property and location
    
    let firstNotice = prepTime(fetchValue('towing_description', 6, 2));
    let towTime = prepTime(fetchValue('towing_description', 1, 4));
    
    const RtsJob = {
      invoice     : fetchValue('charge_information', 1, 2),
      hat         : fetchValue('towing_information', 5, 2),
      violation     : fetchValue('towing_description', 2, 2),
      first_Notice  : firstNotice,
      duration  : calcDiff(firstNotice, towTime),
      tow_Time      : towTime,
      notes     : fetchValue('towing_description', 5, 4),
      year      : fetchValue('vehicle_information', 3, 2),
      vehicle   : fetchValue('vehicle_information', 1, 4),
      color     : fetchValue('vehicle_information', 3, 4),
      vin       : fetchValue('vehicle_information', 2, 4),
      case      : fetchValue('towing_information', 2, 2),
      
      tow_notes : fetchValue('towing_information', 3, 2)
    }
    // load template to insert above charge info
    let template = loadTemplate();
    let sideColumn = document.querySelector('.column-side div div');
    sideColumn.insertBefore(template, sideColumn.firstChild);
    
    // insert all object data into the sideColumn

    // Find a <table> element with id="myTable":
    var rtsTable = document.getElementById("rtsNotesTable");
    
    var i = 0;
    for (let [key, value] of Object.entries(RtsJob)) {

      var row = rtsTable.insertRow( i );
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);
      
      cell2.classList.add("rts-field-"+key);
      cell1.innerHTML = key;
      cell2.innerHTML = value;
      
      i++;
    }
    
}

function loadTemplate(){
  var div = document.createElement('div');
  div.innerHTML = `<fieldset class="fieldset titled collapsible form-wrapper collapse-processed" id="rts_notes">
    <legend><span class="fieldset-legend">
      <a class="fieldset-title" href="#">RTS Notes</a><span class="summary"></span></span>
    </legend>
    <div class="fieldset-wrapper fieldset-content clearfix">
      
    <table id="rtsNotesTable" class="table-form">
    <tbody id="rts_notes_table" class="rts-aside">
      
    </tbody>
    </table>
  
  </div>
  </fieldset>`;
  
  // Change this to div.childNodes to support multiple top-level nodes.
  return div.firstChild;
  
}