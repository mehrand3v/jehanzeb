import { db } from "./firebase.config.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  getFirestore,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";


if (!sessionStorage.getItem("user")) {
  window.location.replace("login.html");
}
// First verify we have access to the database
console.log("Database initialized:", db);

// Cache DOM elements
const elements = {
  totalCylinders: document.getElementById("totalCylinders"),
  cylindersInShop: document.getElementById("cylindersInShop"),
  cylindersWithCustomers: document.getElementById("cylindersWithCustomers"),
  totalCustomers: document.getElementById("totalCustomers"),
  newTransactionBtn: document.querySelector(".btn-primary"),
  addCustomerBtn: document.querySelector(".btn-secondary"),
  customerList: document.querySelector(".customer-list"),
  fabButton: document.querySelector(".fab-button"),
  bottomNavItems: document.querySelectorAll(".nav-item"),
};

// Verify elements are found
Object.entries(elements).forEach(([key, element]) => {
  console.log(`Element ${key}:`, element);
});

// Initialize the application
async function initializeApp() {
  try {
    console.log("Starting app initialization...");

    // Load initial inventory data
    await loadInventoryData();

    // Load initial customers count
    await loadCustomersCount();

    // Set up real-time listeners
    setupInventoryListener();
    setupRecentCustomersListener();

    // Set up event listeners
    setupEventListeners();

    console.log("App initialization completed");
  } catch (error) {
    console.error("Error initializing app:", error);
    alert(
      "Error loading application data. Please check your connection and console for details."
    );
  }
}

// Load initial inventory data
async function loadInventoryData() {
  try {
    const inventoryRef = doc(db, "inventory", "current");
    const inventoryDoc = await getDoc(inventoryRef);

    if (inventoryDoc.exists()) {
      const data = inventoryDoc.data();
      updateInventoryUI(data);
    } else {
      // Create initial inventory document if it doesn't exist
      await updateDoc(inventoryRef, {
        totalCylinders: 0,
        cylindersWithCustomers: 0,
        cylindersInShop: 0,
        lastUpdated: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error("Error loading inventory:", error);
  }
}

// Load customers count
async function loadCustomersCount() {
  try {
    const customersRef = collection(db, "customers");
    const snapshot = await getDocs(customersRef);
    elements.totalCustomers.textContent = snapshot.size;
  } catch (error) {
    console.error("Error loading customers count:", error);
  }
}

// Real-time inventory listener
function setupInventoryListener() {
  const inventoryRef = doc(db, "inventory", "current");
  onSnapshot(
    inventoryRef,
    (doc) => {
      if (doc.exists()) {
        updateInventoryUI(doc.data());
      }
    },
    (error) => {
      console.error("Error in inventory listener:", error);
    }
  );
}

// Real-time recent customers listener
function setupRecentCustomersListener() {
  try {
    const customersRef = collection(db, "customers");
    const recentCustomersQuery = query(
      customersRef,
      orderBy("updatedAt", "desc"),
      limit(5)
    );

    onSnapshot(
      recentCustomersQuery,
      (snapshot) => {
        updateCustomerListUI(snapshot.docs);
      },
      (error) => {
        console.error("Error in customers listener:", error);
      }
    );
  } catch (error) {
    console.error("Error setting up customers listener:", error);
  }
}

// Update inventory UI
function updateInventoryUI(data) {
  console.log("Updating inventory UI with data:", data);

  if (!data) return;

  elements.totalCylinders.textContent = data.totalCylinders || 0;
  elements.cylindersInShop.textContent = data.cylindersInShop || 0;
  elements.cylindersWithCustomers.textContent =
    data.cylindersWithCustomers || 0;
}

// Update customer list UI
function updateCustomerListUI(customers) {
  console.log("Updating customers UI with:", customers);

  const customerListHTML = customers
    .map((customer) => {
      const data = customer.data();
      return `
            <div class="customer-card" data-customer-id="${customer.id}">
                <div class="customer-info">
                    <h3>${data.name || "No Name"}</h3>
                    <p>${
                      data.cylindersHeld || 0
                    } Cylinders • Last updated: ${formatDate(
        data.updatedAt
      )}</p>
                </div>
                <div class="customer-balance">₹${data.totalBalance || 0}</div>
            </div>
        `;
    })
    .join("");

  const customerListContainer = elements.customerList.querySelector(".card");
  if (customerListContainer) {
    customerListContainer.innerHTML = `
            <h2>Recent Customers</h2>
            ${customerListHTML || "<p>No recent customers</p>"}
        `;
  }
}

// Event listeners setup
function setupEventListeners() {
  console.log("Setting up event listeners...");

  // New Transaction button
  elements.newTransactionBtn?.addEventListener("click", () => {
    console.log("New transaction clicked");
    alert("New Transaction feature coming soon!");
  });



  // FAB button
  elements.fabButton?.addEventListener("click", () => {
    console.log("FAB clicked");
    alert("Quick actions coming soon!");
  });

  // Bottom navigation
  // elements.bottomNavItems.forEach((item) => {
  //   item?.addEventListener("click", (e) => {
  //     e.preventDefault();
  //     console.log(
  //       "Navigation clicked:",
  //       e.currentTarget.querySelector("span")?.textContent
  //     );
  //     alert("Navigation feature coming soon!");
  //   });
  // });

  // Customer card clicks
  elements.customerList?.addEventListener("click", (e) => {
    const customerCard = e.target.closest(".customer-card");
    if (customerCard) {
      const customerId = customerCard.dataset.customerId;
      console.log("Customer clicked:", customerId);
      alert("Customer details coming soon!");
    }
  });
}

// Utility function to format dates
function formatDate(timestamp) {
  if (!timestamp) return "N/A";

  try {
    const date = timestamp.toDate();
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString();
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener("DOMContentLoaded", initializeApp);
