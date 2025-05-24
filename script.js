
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Store the current node path globally when a node is selected
let currentNodePath = null;
const RootPath = "A12DB/A12DB/A12Users/A12Default/Default/Structure";


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBOZcfwojFyJV6mKAPTjbdDOagMd2WIGZM",
  authDomain: "costsurveymi1.firebaseapp.com",
  databaseURL: "https://costsurveymi1-default-rtdb.firebaseio.com",
  projectId: "costsurveymi1",
  storageBucket: "costsurveymi1.firebasestorage.app",
  messagingSenderId: "375098525116",
  appId: "1:375098525116:web:c305377a14e37c41c757b9",
  measurementId: "G-RE6C26MQ95"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

//document.getElementById("hierarchy").innerHTML = "<button onclick='showSubitems()'>Select Item</button>";

// After fetching data from Firebase
get(ref(db, RootPath)).then((snapshot) => {
    if (snapshot.exists()) {
        const data = snapshot.val();
        // Add the visual root node with _firebasePath: null
        const root = { 
            "End User": { EnName: "End User", Childs: data, _firebasePath: null }
        };
        const rootUl = document.createElement("ul");
        rootUl.className = "tree";
        generateTree(root, rootUl);
        document.getElementById("tree-container").appendChild(rootUl);
    } else {
        console.log("No data found.");
    }
}).catch((error) => {
    console.error("Error fetching data:", error);
});

function generateTree(data, parentElement, path = RootPath) {
    for (let key in data) {
        let node = data[key];

        // Always create a list item for every node
        let listItem = document.createElement("li");

        // If node is not an object, treat as a leaf and display its value
        if (typeof node !== "object" || node === null) {
            listItem.textContent = `${key}: ${node}`;
            parentElement.appendChild(listItem);
            continue;
        }

        // If this is the visual root ("End User"), set _firebasePath to null
        if (key === "End User") {
            node._firebasePath = null;
        } else {
            node._firebasePath = path + "/" + key;
        }

        let span = document.createElement("span");
        span.className = "caret";
        span.textContent = node.EnName || key;
        span.nodeData = node;
        span.onclick = function(event) {
            event.stopPropagation();
            if (node._firebasePath) {
                currentNodePath = node._firebasePath;
                showSubitems(node);
                console.log("Selected node _firebasePath:", node._firebasePath);
            }
            const nested = listItem.querySelector(".nested");
            if (nested) {
                nested.classList.toggle("active");
                span.classList.toggle("caret-down");
            }
        };
        listItem.appendChild(span);

        // Only recurse if node.Childs is an object
        if (node.Childs && typeof node.Childs === "object" && Object.keys(node.Childs).length > 0) {
            let subList = document.createElement("ul");
            subList.classList.add("nested");
            generateTree(
                node.Childs,
                subList,
                node._firebasePath ? node._firebasePath + "/Childs" : path
            );
            listItem.appendChild(subList);
        }

        parentElement.appendChild(listItem);
    }
}

function showSubitems(node) {
    
    const detailsDiv = document.getElementById("item-details");
    let detailsHtml = `
        <h2>Output Item Details</h2>
        <table style="width:100%; border-collapse:collapse;">
            <tr>
                <td style="font-weight:bold; padding:4px; border-bottom:1px solid #ccc;">Output Name (Code):</td>
                <td style="padding:4px; border-bottom:1px solid #ccc;">${node.EnName || ""}</td>
            </tr>
            <tr>
                <td style="font-weight:bold; padding:4px; border-bottom:1px solid #ccc;">Long Description:</td>
                <td style="padding:4px; border-bottom:1px solid #ccc;">${node.EnLong || ""}</td>
            </tr>
            <tr>
                <td style="font-weight:bold; padding:4px;">Arabic Description:</td>
                <td style="padding:4px;">${node.ArLong || ""}</td>
            </tr>
        </table>
    `;
    detailsDiv.innerHTML = detailsHtml;

    // Show sub-items with editable CPQTY (unchanged)
    const subitemsDiv = document.getElementById("subitems");
    if (node.Childs && Object.keys(node.Childs).length > 0) {
        let html = "<h2>Sub-items</h2><ul>";
        for (let key in node.Childs) {
            let child = node.Childs[key];
            html += `<li>
                <strong>${child.EnName || key}</strong>
                <input type="text" value="${child.CPQTY || ''}" 
                    data-key="${key}" 
                    onblur="updateCPQTY(this, '${key}', this.value)">
            </li>`;
        }
        html += "</ul>";
        subitemsDiv.innerHTML = html;
    } else {
        subitemsDiv.innerHTML = "<h2>No sub-items</h2>";
    }
}

// Define the global update function
window.updateCPQTY = function(input, key, value) {
    if (!currentNodePath) {
        alert("No node path found!");
        return;
    }
    const updatePath = `${currentNodePath}/Childs/${key}/CPQTY`;
    console.log("Updating Firebase path:", updatePath, "with", value);
    set(ref(db, updatePath), value)
        .then(() => {
            // Optionally show a success message
        })
        .catch((error) => {
            alert("Update failed: " + error.message);
        });
};